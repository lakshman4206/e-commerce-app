import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const getDashboardAnalytics = async (_req: AuthRequest, res: Response) => {
  try {
    const validPaidStatuses = ["PAID", "SHIPPED", "DELIVERED"] as const;

    const [
      revenueAgg,
      totalSales,
      totalCustomers,
      lowStockCount,
      paidOrders,
      recentOrdersData,
    ] = await Promise.all([
      // 1. Gross revenue
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { in: [...validPaidStatuses] } },
      }),

      // 2. Paid orders count
      prisma.order.count({
        where: { status: { in: [...validPaidStatuses] } },
      }),

      // 3. Customers count
      prisma.user.count({
        where: { role: "CUSTOMER" },
      }),

      // 4. Low stock products count
      prisma.product.count({
        where: {
          isArchived: false,
          stockQuantity: { lte: 5 },
        },
      }),

      // 5. Orders for monthly & category breakdown
      prisma.order.findMany({
        where: { status: { in: [...validPaidStatuses] } },
        select: {
          totalAmount: true,
          createdAt: true,
          items: {
            select: {
              quantity: true,
              priceAtPurchase: true,
              product: {
                select: {
                  category: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      }),

      // 6. Recent 5 orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    // Aggregate monthly revenue for current year
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap: Record<number, { revenue: number; orderCount: number }> = {};
    for (let i = 0; i < 12; i++) monthlyMap[i] = { revenue: 0, orderCount: 0 };

    const currentYear = new Date().getFullYear();

    for (const order of paidOrders) {
      const orderDate = new Date(order.createdAt);
      if (orderDate.getFullYear() === currentYear) {
        const monthIdx = orderDate.getMonth();
        monthlyMap[monthIdx].revenue += Number(order.totalAmount);
        monthlyMap[monthIdx].orderCount += 1;
      }
    }

    const monthlyRevenue = monthNames.map((name, index) => ({
      month: name,
      revenue: Math.round(monthlyMap[index].revenue * 100) / 100,
      orderCount: monthlyMap[index].orderCount,
    }));

    // Aggregate category revenue
    const categoryRevenueMap: Record<string, number> = {};
    let totalCategoryVolume = 0;

    for (const order of paidOrders) {
      for (const item of order.items) {
        const catName = item.product.category?.name || "Uncategorized";
        const itemSubtotal = Number(item.priceAtPurchase) * item.quantity;
        categoryRevenueMap[catName] = (categoryRevenueMap[catName] || 0) + itemSubtotal;
        totalCategoryVolume += itemSubtotal;
      }
    }

    const salesByCategory = Object.entries(categoryRevenueMap).map(([categoryName, revenue]) => ({
      categoryName,
      totalSales: Math.round(revenue * 100) / 100,
      percentage: totalCategoryVolume > 0 ? Math.round((revenue / totalCategoryVolume) * 100) : 0,
    }));

    // Format recent orders
    const recentOrders = recentOrdersData.map((order) => ({
      id: order.id,
      customerName: order.user?.name || "Customer",
      customerEmail: order.user?.email || "N/A",
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    }));

    return res.json({
      summary: {
        totalRevenue: Number(revenueAgg._sum.totalAmount || 0),
        totalSales,
        totalCustomers,
        lowStockCount,
      },
      monthlyRevenue,
      salesByCategory,
      recentOrders,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to generate dashboard analytics." });
  }
};
