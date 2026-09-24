import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, HeartHandshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      {/* Value propositions banner */}
      <div className="border-b border-border/60 py-8 bg-muted/20">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-semibold">Complimentary Shipping</h5>
              <p className="text-xs text-muted-foreground">On all orders over $150</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-semibold">Stripe Secure Pay</h5>
              <p className="text-xs text-muted-foreground">256-bit encryption verified</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-semibold">30-Day Guarantee</h5>
              <p className="text-xs text-muted-foreground">Hassle-free return policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-semibold">Concierge Support</h5>
              <p className="text-xs text-muted-foreground">24/7 client care assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer contents */}
      <div className="container mx-auto py-12 px-4 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary via-orange-500 to-amber-500 text-primary-foreground flex items-center justify-center font-black text-xs shadow-sm">
              ECK
            </div>
            <span className="font-extrabold tracking-tight text-lg">E Comm Kart</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Curated electronics, lifestyle objects, and modern apparel. Designed with intention, manufactured with precision.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
            Navigation
          </h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link href="/products" className="hover:text-foreground">All Artifacts</Link></li>
            <li><Link href="/products?category=electronics" className="hover:text-foreground">Electronics</Link></li>
            <li><Link href="/products?category=apparel" className="hover:text-foreground">Apparel</Link></li>
            <li><Link href="/products?category=lifestyle" className="hover:text-foreground">Lifestyle</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
            Platform &amp; Security
          </h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link href="/admin" className="hover:text-foreground">Admin Control Hub</Link></li>
            <li><Link href="/checkout" className="hover:text-foreground">Stripe Checkout Sandbox</Link></li>
            <li><Link href="/orders" className="hover:text-foreground">Order Tracker</Link></li>
            <li><span className="text-emerald-500 font-medium">Stripe Elements Active</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3">
            System Architecture
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Built with Next.js App Router, Prisma ORM, PostgreSQL, NextAuth v5 RBAC, and Stripe Gateway.
          </p>
        </div>
      </div>

      <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} E Comm Kart Inc. All rights reserved. Production-grade architecture.
      </div>
    </footer>
  );
}
