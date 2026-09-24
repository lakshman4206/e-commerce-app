import { getProducts } from "@/actions/products";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { ProductCard } from "@/components/storefront/product-card";
import { LightningDealsSection } from "@/components/storefront/lightning-deals";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Laptop,
  Shirt,
  Armchair,
  Watch,
  Headphones,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
} from "lucide-react";

export default async function HomePage() {
  // Query featured products and categories concurrently
  const [featuredProducts, allProducts, categories] = await Promise.all([
    getProducts({ featuredOnly: true }),
    getProducts({ limit: 8 }),
    prisma.category.findMany({ take: 6 }),
  ]);

  const categoryIcons: Record<string, any> = {
    electronics: Laptop,
    apparel: Shirt,
    lifestyle: Armchair,
    accessories: Watch,
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Deals Carousel Banner */}
      <HeroBanner />

      {/* 2. Trust & Guarantee Assurance Bar */}
      <section className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-3xl bg-card border border-border/80 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block text-foreground">Free Next-Day Delivery</span>
              <span className="text-muted-foreground text-[11px]">On orders exceeding ₹999</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block text-foreground">100% Genuine Guarantee</span>
              <span className="text-muted-foreground text-[11px]">Direct brand verified warranty</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block text-foreground">Hassle-Free 30-Day Returns</span>
              <span className="text-muted-foreground text-[11px]">Instant refunds &amp; pickups</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold block text-foreground">Secure Express Gateway</span>
              <span className="text-muted-foreground text-[11px]">256-bit encrypted checkout</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Icon Grid (Amazon / Flipkart Visual Department Hub) */}
      <section className="container mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider font-extrabold text-primary">
              Browse Departments
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-0.5">Shop By Category</h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {categories.map((cat) => {
            const IconComponent = categoryIcons[cat.slug] || Headphones;

            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative flex flex-col items-center justify-center text-center p-5 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-muted/60 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center text-foreground transition-colors mb-3">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-muted-foreground mt-0.5">Explore →</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Lightning Deals Flash Countdown Block */}
      <LightningDealsSection />

      {/* 5. Signature Featured Releases */}
      <section className="container mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Signature Collection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              Trending Releases &amp; Top Rated
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 group"
          >
            <span>Complete Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No featured products currently in stock. Explore all catalog products.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Recommended for You Grid */}
      <section className="container mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
              Personalized Picks
            </span>
            <h2 className="text-2xl font-black tracking-tight mt-0.5">Recommended For You</h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
