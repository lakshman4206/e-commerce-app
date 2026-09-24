import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const productSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  stockQuantity: z.coerce.number().int().min(0),
  images: z.array(z.string().url()).min(1),
  categoryId: z.string().min(1),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
});

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, sortBy, featured, includeArchived } = req.query;

    const where: any = {};

    if (includeArchived !== "true") {
      where.isArchived = false;
    }

    if (category) {
      where.category = { slug: String(category) };
    }

    if (featured === "true") {
      where.isFeatured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "price-asc") orderBy = { price: "asc" };
    if (sortBy === "price-desc") orderBy = { price: "desc" };

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy,
    });

    return res.json({
      products: products.map((p: any) => ({
        ...p,
        price: Number(p.price),
      })),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to retrieve products." });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    return res.json({
      product: {
        ...product,
        price: Number(product.price),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to fetch product." });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation error", details: parsed.error.format() });
    }

    const product = await prisma.product.create({
      data: parsed.data,
    });

    return res.status(201).json({ product });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to create product." });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation error", details: parsed.error.format() });
    }

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });

    return res.json({ product });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to update product." });
  }
};

export const toggleArchive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { isArchived: Boolean(isArchived) },
    });

    return res.json({ product });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to toggle archive status." });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();
    return res.json({ categories });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to retrieve categories." });
  }
};
