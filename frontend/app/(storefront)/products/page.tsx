import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/storefront/product-card";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Filter, Star, CheckCircle2, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";

interface ProductsPageProps {
  searchParams: {
    category?: string;
    search?: string;
    sortBy?: "newest" | "price-asc" | "price-desc";
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
  };
}

export default async function ProductsCatalogPage({
  searchParams,
}: ProductsPageProps) {
  const { category: categorySlug, search, sortBy, minPrice, maxPrice } = searchParams;

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
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    }),
    prisma.category.findMany(),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Breadcrumb & Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {categorySlug
              ? `${categorySlug.toUpperCase()} Catalog`
              : search
              ? `Results for "${search}"`
              : "All Products & Artifacts"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Showing {products.length} curated products matching your criteria
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-muted-foreground">Sort By:</span>
          <div className="flex gap-1.5">
            <Link
              href={`/products?${new URLSearchParams({ ...searchParams, sortBy: "newest" })}`}
              className={`px-3 py-1.5 rounded-xl border font-medium transition ${
                !sortBy || sortBy === "newest"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Newest
            </Link>
            <Link
              href={`/products?${new URLSearchParams({ ...searchParams, sortBy: "price-asc" })}`}
              className={`px-3 py-1.5 rounded-xl border font-medium transition ${
                sortBy === "price-asc"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Price: Low to High
            </Link>
            <Link
              href={`/products?${new URLSearchParams({ ...searchParams, sortBy: "price-desc" })}`}
              className={`px-3 py-1.5 rounded-xl border font-medium transition ${
                sortBy === "price-desc"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              Price: High to Low
            </Link>
          </div>
        </div>
      </div>

      {/* Main PLP 2-Column Faceted Filtering Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT: Faceted Filters Sidebar ================= */}
        <aside className="lg:col-span-3 rounded-3xl border border-border bg-card p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Filter className="w-4 h-4 text-primary" />
              <span>Faceted Filters</span>
            </div>
            <Link
              href="/products"
              className="text-xs text-muted-foreground hover:text-primary underline"
            >
              Clear All
            </Link>
          </div>

          {/* 1. Category Filter List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Categories
            </h3>
            <div className="space-y-1">
              <Link
                href="/products"
                className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  !categorySlug
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>All Departments</span>
                <span>{products.length}</span>
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/products?category=${c.slug}`}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    categorySlug === c.slug
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span>{c.name}</span>
                  <span className="text-[11px] opacity-70">→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* 2. Customer Rating Filter */}
          <div className="space-y-2.5 pt-4 border-t border-border/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Customer Rating
            </h3>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {[4, 3, 2].map((stars) => (
                <div key={stars} className="flex items-center gap-2 hover:text-foreground cursor-pointer">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < stars ? "fill-amber-500 text-amber-500" : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                  <span>{stars}★ &amp; Above</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Delivery Speed & Assurance */}
          <div className="space-y-2.5 pt-4 border-t border-border/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Delivery Speed
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
                <span>Next-Day Express Eligible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
                <span>In Stock &amp; Ready to Ship</span>
              </label>
            </div>
          </div>
        </aside>

        {/* ================= RIGHT: Products Grid ================= */}
        <main className="lg:col-span-9">
          {products.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-16 text-center space-y-4">
              <p className="text-lg font-bold">No products match your filters</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Try selecting different category filters or clearing your search keywords.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl inline-block shadow-sm"
                >
                  Reset All Filters
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
