"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { productSchema, type ProductFormValues } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";

export async function getProducts(options?: {
  categoryId?: string;
  search?: string;
  sortBy?: "newest" | "price-asc" | "price-desc";
  featuredOnly?: boolean;
  includeArchived?: boolean;
}) {
  const { categoryId, search, sortBy = "newest", featuredOnly, includeArchived = false } =
    options || {};

  const whereClause: any = {};

  if (!includeArchived) {
    whereClause.isArchived = false;
  }

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (featuredOnly) {
    whereClause.isFeatured = true;
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (sortBy === "price-asc") orderBy = { price: "asc" };
  if (sortBy === "price-desc") orderBy = { price: "desc" };

  const products = await prisma.product.findMany({
    where: whereClause,
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy,
  });

  return products.map((p) => ({
    ...p,
    price: Number(p.price),
  }));
}

export async function createProduct(data: ProductFormValues) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can create products.");
  }

  const validated = productSchema.parse(data);

  const product = await prisma.product.create({
    data: {
      title: validated.title,
      description: validated.description,
      price: validated.price,
      stockQuantity: validated.stockQuantity,
      images: validated.images,
      categoryId: validated.categoryId,
      isFeatured: validated.isFeatured,
      isArchived: validated.isArchived,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return product;
}

export async function updateProduct(id: string, data: ProductFormValues) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can edit products.");
  }

  const validated = productSchema.parse(data);

  const updated = await prisma.product.update({
    where: { id },
    data: {
      title: validated.title,
      description: validated.description,
      price: validated.price,
      stockQuantity: validated.stockQuantity,
      images: validated.images,
      categoryId: validated.categoryId,
      isFeatured: validated.isFeatured,
      isArchived: validated.isArchived,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/products");
  revalidatePath("/");

  return updated;
}

export async function toggleArchiveProduct(id: string, isArchived: boolean) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Only administrators can archive products.");
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { isArchived },
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");

  return updated;
}
