"use client";

import Link from "next/link";
import { useCartStore } from "@/store/use-cart-store";
import { ShoppingBag, User, Shield, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const { openCart, getTotalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted ? getTotalItems() : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold tracking-tighter text-lg shadow-sm group-hover:scale-105 transition-transform">
              Æ
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
              AESTHETE
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link
              href="/products"
              className="hover:text-foreground transition-colors"
            >
              All Products
            </Link>
            <Link
              href="/products?category=electronics"
              className="hover:text-foreground transition-colors"
            >
              Electronics
            </Link>
            <Link
              href="/products?category=apparel"
              className="hover:text-foreground transition-colors"
            >
              Apparel
            </Link>
            <Link
              href="/products?category=lifestyle"
              className="hover:text-foreground transition-colors"
            >
              Lifestyle
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user?.role === "ADMIN" && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-primary/20 text-primary font-semibold hover:bg-primary/5 flex items-center gap-1.5"
            >
              <Link href="/admin">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>Admin Hub</span>
              </Link>
            </Button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/orders"
                className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-1 px-2 rounded-md hover:bg-muted transition"
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">{user.name || "Orders"}</span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                <Link href="/api/auth/signout">
                  <LogOut className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          {/* Cart Drawer Trigger */}
          <button
            onClick={openCart}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-muted/60 hover:bg-muted text-foreground transition border border-border/40"
            aria-label="Open shopping cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground shadow-sm">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
