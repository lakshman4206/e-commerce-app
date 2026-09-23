import { getProducts } from "@/actions/products";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { ProductCard } from "@/components/storefront/product-card";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default async function HomePage() {
  // Query featured products and categories concurrently
  const [featuredProducts, categories] = await Promise.all([
    getProducts({ featuredOnly: true }),
    prisma.category.findMany({ take: 6 }),
  ]);

  return (
    <div className="space-y-16 pb-20">
      <HeroBanner />

      {/* Category Pills Navigation */}
      <section className="container mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">Curated Categories</h2>
          <Link
            href="/products"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-all shadow-xs"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </span>
              <h3 className="text-lg font-bold mt-1 text-foreground group-hover:text-primary transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {cat.description || "Discover premium objects in this class."}
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">
                <span>Browse Category</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="container mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Signature Releases</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Featured Hardware &amp; Artifacts
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 group"
          >
            <span>Complete Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No featured products currently in stock. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
