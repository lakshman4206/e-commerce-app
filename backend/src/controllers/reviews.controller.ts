import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().min(10).max(2000),
});

// ─── Get Product Reviews ──────────────────────────────────────────────────────
export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { page = "1", limit = "10" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total, ratingAgg] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.review.count({ where: { productId } }),
      prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    // Rating distribution breakdown
    const distribution = await prisma.review.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { rating: true },
    });

    const ratingMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const d of distribution) {
      ratingMap[d.rating] = d._count.rating;
    }

    return res.json({
      reviews,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      summary: {
        averageRating: Number((ratingAgg._avg.rating || 0).toFixed(1)),
        totalReviews: ratingAgg._count.rating,
        distribution: ratingMap,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch reviews." });
  }
};

// ─── Create / Update Review ───────────────────────────────────────────────────
export const upsertReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { productId } = req.params;
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation error", details: parsed.error.format() });
    }

    const { rating, title, comment } = parsed.data;

    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Product not found." });

    // Check if user purchased this product (for "verified purchase" badge)
    const purchasedOrder = await prisma.order.findFirst({
      where: {
        userId: req.user.id,
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
        items: { some: { productId } },
      },
    });

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      create: {
        userId: req.user.id,
        productId,
        rating,
        title: title || null,
        comment,
        verified: !!purchasedOrder,
      },
      update: {
        rating,
        title: title || null,
        comment,
        verified: !!purchasedOrder,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return res.json({ review });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to save review." });
  }
};

// ─── Delete Review ────────────────────────────────────────────────────────────
export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { productId } = req.params;

    await prisma.review.deleteMany({
      where: { userId: req.user.id, productId },
    });

    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to delete review." });
  }
};

// ─── Get User's Own Review for a Product ─────────────────────────────────────
export const getMyReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.json({ review: null });

    const { productId } = req.params;

    const review = await prisma.review.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    return res.json({ review });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch review." });
  }
};
