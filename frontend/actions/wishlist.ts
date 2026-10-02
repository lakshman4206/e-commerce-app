"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ─── Get Full Wishlist ────────────────────────────────────────────────────────
export async function getWishlist() {
  const session = await auth();
  if (!session?.user?.id) return { items: [] };

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  const items = (wishlist?.items || []).map((item) => ({
    id: item.id,
    addedAt: item.addedAt,
    product: {
      ...item.product,
      price: Number(item.product.price),
    },
  }));

  return { items };
}

// ─── Get wishlist product IDs (for quick lookup on product cards) ─────────────
export async function getWishlistProductIds(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
    select: {
      items: { select: { productId: true } },
    },
  });

  return (wishlist?.items || []).map((i) => i.productId);
}

// ─── Toggle Wishlist Item ─────────────────────────────────────────────────────
export async function toggleWishlist(productId: string): Promise<{ isWishlisted: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Please sign in to save items to your wishlist.");
  }

  // Upsert wishlist
  const wishlist = await prisma.wishlist.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  // Check if already wishlisted
  const existing = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: { wishlistId: wishlist.id, productId },
    },
  });

  if (existing) {
    // Remove from wishlist
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/wishlist");
    return { isWishlisted: false };
  } else {
    // Add to wishlist
    await prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId },
    });
    revalidatePath("/wishlist");
    return { isWishlisted: true };
  }
}

// ─── Remove item from wishlist ────────────────────────────────────────────────
export async function removeFromWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: session.user.id },
  });
  if (!wishlist) return;

  await prisma.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id, productId },
  });

  revalidatePath("/wishlist");
}
