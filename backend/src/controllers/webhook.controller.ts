import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";
import { prisma } from "../lib/prisma";

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[STRIPE_WEBHOOK] STRIPE_WEBHOOK_SECRET is not configured.");
    return res.status(500).json({ error: "Webhook secret missing on server" });
  }

  let event: Stripe.Event;

  try {
    // req.body is a raw Buffer because of express.raw({ type: "application/json" })
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`[STRIPE_WEBHOOK_ERROR] Signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentIntentId = paymentIntent.id;

        const order = await prisma.order.findUnique({
          where: { stripePaymentIntentId: paymentIntentId },
          include: { items: true },
        });

        if (!order) {
          console.warn(`[STRIPE_WEBHOOK] No order matching PaymentIntent: ${paymentIntentId}`);
          return res.json({ received: true });
        }

        if (order.status === "PAID") {
          return res.json({ received: true });
        }

        // Atomic transaction: mark PAID, decrement stock, and clear cart
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
          });

          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: {
                  decrement: item.quantity,
                },
              },
            });
          }

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

        console.info(`[STRIPE_WEBHOOK] Order ${order.id} paid and inventory decremented.`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await prisma.order.updateMany({
          where: {
            stripePaymentIntentId: paymentIntent.id,
            status: "PENDING",
          },
          data: { status: "CANCELLED" },
        });
        break;
      }

      default:
        break;
    }

    return res.json({ received: true });
  } catch (error: any) {
    console.error(`[STRIPE_WEBHOOK_HANDLER_ERROR]:`, error.message);
    return res.status(500).json({ error: "Webhook execution failure" });
  }
};
