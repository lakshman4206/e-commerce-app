"use client";

import { useCartStore } from "@/store/use-cart-store";
import { formatCurrency } from "@/lib/utils";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } =
    useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const subtotal = getSubtotal();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border p-6 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Your Cart</h2>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-mono">
                {items.length}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-base font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Discover our premium catalog and find something tailored for you.
                </p>
                <Button variant="outline" onClick={closeCart} asChild className="mt-2">
                  <Link href="/products">Explore Products</Link>
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl bg-muted/40 border border-border/50 items-center justify-between"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-sm font-semibold truncate leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">
                      {formatCurrency(item.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center bg-background border border-border text-foreground hover:bg-muted"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-medium w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stockQuantity}
                        className="w-6 h-6 rounded flex items-center justify-center bg-background border border-border text-foreground hover:bg-muted disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between self-stretch">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold font-mono">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="border-t border-border pt-4 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping & Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-border/60 pt-2">
                  <span>Estimated Total</span>
                  <span className="font-mono text-primary">{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full h-11 text-base font-semibold group flex items-center justify-center gap-2"
                  onClick={closeCart}
                  asChild
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-xs text-muted-foreground"
                  onClick={closeCart}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
