import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { stripe } from "../lib/stripe";
import { AuthRequest } from "../middleware/auth.middleware";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  address: z.string().min(5),
  phone: z.string().min(6),
});

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required to checkout." });
    }

    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid checkout request", details: parsed.error.format() });
    }

    const { items, address, phone } = parsed.data;

    // Verify products and compute prices server-side
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isArchived: false },
    });

    if (dbProducts.length !== items.length) {
      return res.status(400).json({ error: "One or more requested products are unavailable." });
    }

    let calculatedTotal = 0;
    const orderItemsData: { productId: string; quantity: number; priceAtPurchase: number }[] = [];

    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      if (!dbProduct) {
        return res.status(400).json({ error: `Product not found: ${item.productId}` });
      }

      if (dbProduct.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for "${dbProduct.title}". Only ${dbProduct.stockQuantity} remaining.`,
        });
      }

      const price = Number(dbProduct.price);
      calculatedTotal += price * item.quantity;

      orderItemsData.push({
        productId: dbProduct.id,
        quantity: item.quantity,
        priceAtPurchase: price,
      });
    }

    // Create pending Order in database
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount: calculatedTotal,
        status: "PENDING",
        address,
        phone,
        items: {
          create: orderItemsData,
        },
      },
    });

    // Create Stripe PaymentIntent in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(calculatedTotal * 100),
      currency: "usd",
      metadata: {
        orderId: order.id,
        userId: req.user.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Attach Stripe PaymentIntent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      amount: calculatedTotal,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to initialize payment." });
  }
};
