import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  address: z.string().min(5),
  phone: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required to checkout." },
        { status: 401 }
      );
    }

    const json = await req.json();
    const result = checkoutSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid checkout payload", details: result.error.format() },
        { status: 400 }
      );
    }

    const { items, address, phone } = result.data;

    // Fetch verified products from DB to prevent client price tampering
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isArchived: false },
    });

    if (dbProducts.length !== items.length) {
      return NextResponse.json(
        { error: "One or more selected products are invalid or unavailable." },
        { status: 400 }
      );
    }

    let calculatedTotal = 0;
    const orderItemsData: {
      productId: string;
      quantity: number;
      priceAtPurchase: number;
    }[] = [];

    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      if (!dbProduct) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      if (dbProduct.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${dbProduct.title}". Only ${dbProduct.stockQuantity} left.`,
          },
          { status: 400 }
        );
      }

      const price = Number(dbProduct.price);
      calculatedTotal += price * item.quantity;

      orderItemsData.push({
        productId: dbProduct.id,
        quantity: item.quantity,
        priceAtPurchase: price,
      });
    }

    // Convert to cents for Stripe
    const amountInCents = Math.round(calculatedTotal * 100);

    // Create pending Order in database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount: calculatedTotal,
        status: "PENDING",
        address,
        phone,
        items: {
          create: orderItemsData,
        },
      },
    });

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Save Stripe PaymentIntent ID to the order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      amount: calculatedTotal,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("[CREATE_PAYMENT_INTENT_ERROR]:", message);
    return NextResponse.json(
      { error: "Failed to initiate payment", details: message },
      { status: 500 }
    );
  }
}
