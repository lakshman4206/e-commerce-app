"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().min(10, "Review must be at least 10 characters.").max(2000),
});

// ─── Get Product Reviews ──────────────────────────────────────────────────────
export async function getProductReviews(
  productId: string,
  page = 1,
  limit = 8
) {
  const skip = (page - 1) * limit;

  const [reviews, total, ratingAgg] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { productId } }),
    prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  // Rating distribution
  const distribution = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: { rating: true },
  });

  const ratingMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const d of distribution) {
    ratingMap[d.rating] = d._count.rating;
  }

  return {
    reviews,
    total,
    totalPages: Math.ceil(total / limit),
    summary: {
      averageRating: Number((ratingAgg._avg.rating || 0).toFixed(1)),
      totalReviews: ratingAgg._count.rating,
      distribution: ratingMap,
    },
  };
}

// ─── Get Current User's Review ────────────────────────────────────────────────
export async function getMyReview(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.review.findUnique({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
  });
}

// ─── Submit / Update Review ───────────────────────────────────────────────────
export async function submitReview(
  productId: string,
  data: { rating: number; title?: string; comment: string }
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Please sign in to leave a review.");
  }

  const validated = reviewSchema.parse(data);

  // Check if user purchased (verified purchase)
  const purchasedOrder = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      items: { some: { productId } },
    },
  });

  const review = await prisma.review.upsert({
    where: {
      userId_productId: { userId: session.user.id, productId },
    },
    create: {
      userId: session.user.id,
      productId,
      rating: validated.rating,
      title: validated.title || null,
      comment: validated.comment,
      verified: !!purchasedOrder,
    },
    update: {
      rating: validated.rating,
      title: validated.title || null,
      comment: validated.comment,
      verified: !!purchasedOrder,
    },
  });

  revalidatePath(`/products/${productId}`);
  return review;
}

// ─── Delete Review ────────────────────────────────────────────────────────────
export async function deleteReview(productId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized.");

  await prisma.review.deleteMany({
    where: { userId: session.user.id, productId },
  });

  revalidatePath(`/products/${productId}`);
}
