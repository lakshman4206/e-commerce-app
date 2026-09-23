import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[STRIPE_WEBHOOK] STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json(
      { error: "Webhook secret not configured on server" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error(`[STRIPE_WEBHOOK_ERROR] Signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentIntentId = paymentIntent.id;

        // Find associated order
        const order = await prisma.order.findUnique({
          where: { stripePaymentIntentId: paymentIntentId },
          include: { items: true },
        });

        if (!order) {
          console.warn(`[STRIPE_WEBHOOK] Order not found for PaymentIntent: ${paymentIntentId}`);
          return NextResponse.json({ received: true });
        }

        // Idempotency: skip if already processed
        if (order.status === "PAID") {
          return NextResponse.json({ received: true });
        }

        // Atomic transaction: update order, decrement stock, and clear cart
        await prisma.$transaction(async (tx) => {
          // 1. Mark order as PAID
          await tx.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
          });

          // 2. Decrement stock for each item purchased
          for (const item of order.items) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });

            if (!product) {
              throw new Error(`Product not found: ${item.productId}`);
            }

            if (product.stockQuantity < item.quantity) {
              console.warn(
                `[INVENTORY_DEFICIT] Product ${product.id} stock (${product.stockQuantity}) < ordered (${item.quantity})`
              );
            }

            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: {
                  decrement: item.quantity,
                },
              },
            });
          }

          // 3. Clear user's active cart items
          if (order.userId) {
            const userCart = await tx.cart.findUnique({
              where: { userId: order.userId },
            });
            if (userCart) {
              await tx.cartItem.deleteMany({
                where: { cartId: userCart.id },
              });
            }
          }
        });

        console.info(`[STRIPE_WEBHOOK] Successfully processed order ${order.id}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentIntentId = paymentIntent.id;

        await prisma.order.updateMany({
          where: {
            stripePaymentIntentId: paymentIntentId,
            status: "PENDING",
          },
          data: {
            status: "CANCELLED",
          },
        });

        console.info(`[STRIPE_WEBHOOK] Payment failed for intent: ${paymentIntentId}. Order cancelled.`);
        break;
      }

      default:
        // Acknowledge unhandled event gracefully
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal processing error";
    console.error(`[STRIPE_WEBHOOK_HANDLER_ERROR]: ${errorMsg}`);
    return NextResponse.json(
      { error: "Webhook processing failure", details: errorMsg },
      { status: 500 }
    );
  }
}
