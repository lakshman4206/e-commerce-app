"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getAdminOrders(statusFilter?: OrderStatus) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin privileges required.");
  }

  const whereClause = statusFilter ? { status: statusFilter } : {};

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
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

  return orders.map((o) => ({
    ...o,
    totalAmount: Number(o.totalAmount),
    items: o.items.map((i) => ({
      ...i,
      priceAtPurchase: Number(i.priceAtPurchase),
    })),
  }));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin privileges required.");
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  return order;
}

export async function getCustomerOrders() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please log in to view your orders.");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
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

  return orders.map((o) => ({
    ...o,
    totalAmount: Number(o.totalAmount),
    items: o.items.map((i) => ({
      ...i,
      priceAtPurchase: Number(i.priceAtPurchase),
    })),
  }));
}
