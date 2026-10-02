import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

// ─── Get Wishlist ────────────────────────────────────────────────────────────
export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
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

    return res.json({ items });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch wishlist." });
  }
};

// ─── Add to Wishlist ─────────────────────────────────────────────────────────
export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { productId } = z.object({ productId: z.string().min(1) }).parse(req.body);

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId, isArchived: false },
    });
    if (!product) return res.status(404).json({ error: "Product not found." });

    // Upsert wishlist (create if doesn't exist)
    const wishlist = await prisma.wishlist.upsert({
      where: { userId: req.user.id },
      create: { userId: req.user.id },
      update: {},
    });

    // Add item (ignore if already exists via unique constraint)
    try {
      await prisma.wishlistItem.create({
        data: { wishlistId: wishlist.id, productId },
      });
    } catch {
      // P2002 = unique constraint violation (item already in wishlist)
    }

    return res.json({ success: true, message: "Added to wishlist." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to add to wishlist." });
  }
};

// ─── Remove from Wishlist ─────────────────────────────────────────────────────
export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const { productId } = req.params;

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
    });
    if (!wishlist) return res.json({ success: true });

    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId },
    });

    return res.json({ success: true, message: "Removed from wishlist." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to remove from wishlist." });
  }
};

// ─── Check if product is wishlisted ─────────────────────────────────────────
export const checkWishlistStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.json({ isWishlisted: false });

    const { productId } = req.params;

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
    });
    if (!wishlist) return res.json({ isWishlisted: false });

    const item = await prisma.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });

    return res.json({ isWishlisted: !!item });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to check wishlist." });
  }
};
