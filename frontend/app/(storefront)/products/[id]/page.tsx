import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/storefront/product-detail-view";
import { Metadata } from "next";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    return {
      title: "Product Not Found | E Comm Kart",
    };
  }

  return {
    title: `${product.title} | E Comm Kart Marketplace`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
    },
  });

  if (!product || product.isArchived) {
    notFound();
  }

  const serializableProduct = {
    ...product,
    price: Number(product.price),
  };

  return <ProductDetailView product={serializableProduct} />;
}
