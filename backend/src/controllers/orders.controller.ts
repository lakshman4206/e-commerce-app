import { Response } from "express";
import { OrderStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, title: true, images: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      orders: orders.map((o: any) => ({
        ...o,
        totalAmount: Number(o.totalAmount),
        items: o.items.map((i: any) => ({
          ...i,
          priceAtPurchase: Number(i.priceAtPurchase),
        })),
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch orders." });
  }
};

export const getAdminOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};

    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      where.status = status as OrderStatus;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { id: true, title: true, images: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      orders: orders.map((o) => ({
        ...o,
        totalAmount: Number(o.totalAmount),
        items: o.items.map((i) => ({
          ...i,
          priceAtPurchase: Number(i.priceAtPurchase),
        })),
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch admin orders." });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ error: "Invalid order status value." });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return res.json({ order });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update order status." });
  }
};
