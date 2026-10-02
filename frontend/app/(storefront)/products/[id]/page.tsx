import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { ProductDetailView } from "@/components/storefront/product-detail-view";
import { ReviewsSection } from "@/components/storefront/reviews-section";
import { getProductReviews, getMyReview } from "@/actions/reviews";
import { getWishlistProductIds } from "@/actions/wishlist";
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
      title: "Product Not Found | E Com Web",
    };
  }

  return {
    title: `${product.title} | E Com Web Marketplace`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const [product, session] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    }),
    auth(),
  ]);

  if (!product || product.isArchived) {
    notFound();
  }

  // Fetch reviews, user's own review, and wishlist status in parallel
  const [reviewData, myReview, wishlistIds] = await Promise.all([
    getProductReviews(params.id),
    session?.user?.id ? getMyReview(params.id) : Promise.resolve(null),
    session?.user?.id ? getWishlistProductIds() : Promise.resolve([]),
  ]);

  const serializableProduct = {
    ...product,
    price: Number(product.price),
  };

  // Serialize review dates for client component
  const serializedReviews = reviewData.reviews.map((r) => ({
    ...r,
    createdAt: r.createdAt,
    updatedAt: (r as any).updatedAt,
  }));

  const serializedMyReview = myReview
    ? {
        id: myReview.id,
        rating: myReview.rating,
        title: myReview.title,
        comment: myReview.comment,
      }
    : null;

  return (
    <>
      <ProductDetailView
        product={serializableProduct}
        initiallyWishlisted={wishlistIds.includes(params.id)}
      />
      <div className="container mx-auto px-4 sm:px-8 pb-20">
        <ReviewsSection
          productId={params.id}
          initialReviews={serializedReviews as any}
          summary={reviewData.summary}
          myReview={serializedMyReview}
          currentUserId={session?.user?.id || null}
        />
      </div>
    </>
  );
}
