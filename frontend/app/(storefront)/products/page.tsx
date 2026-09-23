import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/storefront/product-card";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Filter, SlidersHorizontal } from "lucide-react";

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sortBy?: "newest" | "price-asc" | "price-desc";
  };
}

export default async function ProductsCatalogPage({
  searchParams,
}: ProductsPageProps) {
  const { category: categorySlug, search, sortBy } = searchParams;

  // Resolve category slug to ID if provided
  let categoryId: string | undefined;
  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });
    if (category) categoryId = category.id;
  }

  const [products, categories] = await Promise.all([
    getProducts({
      categoryId,
      search,
      sortBy,
    }),
    prisma.category.findMany(),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Product Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Displaying {products.length} crafted products
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/products"
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              !categorySlug
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
            }`}
          >
            All Categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                categorySlug === c.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center space-y-3">
          <p className="text-base font-semibold">No products found</p>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search criteria or explore other categories.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="text-xs underline text-primary underline-offset-4"
            >
              Reset Filters
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
