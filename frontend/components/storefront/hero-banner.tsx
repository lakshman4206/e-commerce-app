import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Star, Flame, ShoppingBag } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-16 sm:py-24">
      {/* Background dynamic ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-primary/15 via-orange-500/10 to-amber-500/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-10 right-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative mx-auto px-4 sm:px-8 text-center max-w-4xl">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-foreground backdrop-blur-md mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Welcome to E Com Web — Season 2026 Mega Store
          </span>
          <span className="bg-orange-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full ml-1">
            50% OFF
          </span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.12]">
          Shop Next-Gen Tech, Apparel &amp; Lifestyle at{" "}
          <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-400 bg-clip-text text-transparent">
            E Com Web.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Premium electronic peripherals, audiophile sound systems, minimalist workspaces, and designer apparel with verified buyer warranty and express delivery.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="h-13 px-8 text-sm font-bold group shadow-xl shadow-primary/20 bg-gradient-to-r from-primary via-orange-600 to-orange-500 hover:from-primary/90 hover:to-orange-500 text-primary-foreground rounded-2xl transition-all"
          >
            <Link href="/products" className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            asChild
            className="h-13 px-7 text-sm font-bold border-border bg-card/60 backdrop-blur-sm hover:bg-muted/80 rounded-2xl shadow-xs"
          >
            <Link href="/products?category=electronics" className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span>Flash Electronics</span>
            </Link>
          </Button>
        </div>

        {/* Live Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground pt-4 border-t border-border/40">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Razorpay Verified 256-Bit Gateway</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Instant Dispatch in 24 Hrs</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>4.9 / 5 Customer Rating</span>
          </div>
        </div>
      </div>
    </section>
  );
}
