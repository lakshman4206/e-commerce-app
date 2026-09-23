import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/50 via-background to-background py-16 sm:py-24">
      {/* Background glow aesthetics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative mx-auto px-4 sm:px-8 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-1 text-xs font-medium text-foreground backdrop-blur-md mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>New Season Curations Now Live</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          Curated Hardware &amp; Apparel for{" "}
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Modern Living.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Engineered for minimalists, developers, and creators. Explore our limited-batch mechanical keyboards, studio acoustic gear, and technical garments.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild className="h-12 px-7 text-sm font-semibold group shadow-md">
            <Link href="/products" className="flex items-center gap-2">
              Browse Collection
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>

          <Button variant="outline" size="lg" asChild className="h-12 px-7 text-sm font-semibold">
            <Link href="/products?category=electronics">
              Explore Electronics
            </Link>
          </Button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Stripe Verified Checkout</span>
          </div>
          <span>•</span>
          <div>Zero Counterfeits Guarantee</div>
          <span>•</span>
          <div>Carbon Neutral Shipping</div>
        </div>
      </div>
    </section>
  );
}
