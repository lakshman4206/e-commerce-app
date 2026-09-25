"use client";

import Link from "next/link";
import { useCartStore } from "@/store/use-cart-store";
import {
  ShoppingBag,
  User,
  Shield,
  LogOut,
  Search,
  Heart,
  Zap,
  Sparkles,
  Package,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const { openCart, getTotalItems, syncUserCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    setMounted(true);
    syncUserCart(user?.email || null);
  }, [user, syncUserCart]);

  const totalItems = mounted ? getTotalItems() : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    router.push(`/products?${params.toString()}`);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-all">
      {/* 1. Top Alert / Promo Notification Bar */}
      <div className="bg-gradient-to-r from-primary/95 via-primary to-orange-600 text-primary-foreground py-1.5 px-4 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-2">
        <span className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
          <span>SPRING MEGA DEAL:</span>
        </span>
        <span>Up to 50% OFF Top Electronics &amp; Fashion + FREE Express Shipping over ₹999</span>
        <span className="hidden md:inline-block font-mono bg-black/20 px-2 py-0.5 rounded text-[11px]">
          CODE: ECOMWEB50
        </span>
      </div>

      {/* 2. Main Navigation Header */}
      <header className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary via-orange-500 to-amber-500 flex items-center justify-center text-primary-foreground font-black tracking-tight text-base shadow-md group-hover:scale-105 transition-transform">
              ECW
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
                E Com Web
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold -mt-1">
                Official Marketplace
              </span>
            </div>
          </Link>
        </div>

        {/* 3. Search Bar with Category Dropdown */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-xl items-center relative rounded-2xl border border-border bg-muted/30 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all overflow-hidden"
        >
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent text-xs font-semibold text-muted-foreground border-r border-border px-3 py-2 outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="apparel">Apparel</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="accessories">Accessories</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search millions of products, brands, and categories..."
            className="flex-1 bg-transparent px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none"
          />

          <button
            type="submit"
            aria-label="Search"
            className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* 4. Right Utility Icons & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Admin Hub Link */}
          {user?.role === "ADMIN" && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-primary/30 text-primary font-semibold hover:bg-primary/10 flex items-center gap-1.5 rounded-xl h-9"
            >
              <Link href="/admin">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Admin Hub</span>
              </Link>
            </Button>
          )}

          {/* User Account / Auth Dropdown */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/orders"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-1.5 px-3 rounded-xl border border-border/60 hover:bg-muted transition"
              >
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="max-w-[100px] truncate font-medium">{user.name || "My Orders"}</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-xs text-muted-foreground hover:text-destructive h-9 px-2"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" asChild className="text-xs font-medium h-9">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="text-xs font-semibold hidden sm:inline-flex rounded-xl h-9 px-3.5">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Wishlist Link */}
          <Link
            href="/orders"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted transition"
            title="Track Orders"
          >
            <Package className="w-4 h-4" />
          </Link>

          {/* Dynamic Cart Drawer Trigger */}
          <button
            onClick={openCart}
            className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-muted/60 hover:bg-muted text-foreground transition border border-border/60 shadow-xs"
            aria-label="Open shopping cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground shadow-md animate-scale">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 3. Category Sub-Bar Navigation (Amazon / Flipkart Style) */}
      <div className="border-t border-border/40 bg-muted/10 hidden sm:block">
        <div className="container mx-auto flex items-center gap-6 px-4 sm:px-8 py-2 text-xs font-medium text-muted-foreground overflow-x-auto">
          <Link href="/products" className="hover:text-foreground transition font-semibold text-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>All Departments</span>
          </Link>
          <Link href="/products?category=electronics" className="hover:text-foreground transition">
            Electronics &amp; Smart Tech
          </Link>
          <Link href="/products?category=apparel" className="hover:text-foreground transition">
            Fashion &amp; Apparel
          </Link>
          <Link href="/products?category=lifestyle" className="hover:text-foreground transition">
            Home &amp; Lifestyle
          </Link>
          <Link href="/products?category=accessories" className="hover:text-foreground transition">
            Accessories &amp; Audio
          </Link>
          <Link href="/checkout" className="ml-auto text-orange-500 font-semibold hover:underline">
            ⚡ Express Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
