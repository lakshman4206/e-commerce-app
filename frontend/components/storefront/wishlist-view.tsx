"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight, PackageSearch } from "lucide-react";
import { toast } from "sonner";
import { removeFromWishlist } from "@/actions/wishlist";
import { useCartStore } from "@/store/use-cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WishlistProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  stockQuantity: number;
  images: string[];
  isFeatured: boolean;
  category?: { id: string; name: string; slug: string } | null;
}

interface WishlistItemData {
  id: string;
  addedAt: Date;
  product: WishlistProduct;
}

interface WishlistViewProps {
  initialItems: WishlistItemData[];
}

export function WishlistView({ initialItems }: WishlistViewProps) {
  const [items, setItems] = useState(initialItems);
  const [isPending, startTransition] = useTransition();
  const { addItem, openCart } = useCartStore();

  const handleRemove = (productId: string, productTitle: string) => {
    startTransition(async () => {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      toast.success(`"${productTitle}" removed from wishlist.`);
    });
  };

  const handleAddToCart = (product: WishlistProduct) => {
    if (product.stockQuantity <= 0) {
      toast.error("This product is out of stock.");
      return;
    }
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0] || "",
      stockQuantity: product.stockQuantity,
    });
    openCart();
    toast.success(`"${product.title}" added to cart!`);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-muted/60 flex items-center justify-center">
          <Heart className="w-10 h-10 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xl font-bold">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground mt-1">
            Browse products and tap the heart icon to save your favourites here.
          </p>
        </div>
        <Button asChild className="rounded-xl gap-2">
          <Link href="/products">
            <PackageSearch className="w-4 h-4" />
            Browse Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {items.map(({ product }) => {
        const primaryImage =
          product.images[0] ||
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80";
        const msrp = product.price * 1.25;
        const discountPercent = Math.round(((msrp - product.price) / msrp) * 100);
        const isOutOfStock = product.stockQuantity <= 0;
        const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;

        return (
          <div
            key={product.id}
            className="group relative rounded-3xl border border-border bg-card p-3.5 shadow-xs hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col"
          >
            {/* Remove button */}
            <button
              onClick={() => handleRemove(product.id, product.title)}
              disabled={isPending}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border border-border/60 flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition shadow-sm"
              title="Remove from wishlist"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <Link href={`/products/${product.id}`} className="block">
              {/* Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/40">
                <Image
                  src={primaryImage}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                  {discountPercent > 0 && (
                    <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      {discountPercent}% OFF
                    </span>
                  )}
                  {isLowStock && (
                    <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      ONLY {product.stockQuantity} LEFT
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="rounded-full bg-destructive/90 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      OUT OF STOCK
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="mt-3 space-y-1">
                {product.category && (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-primary/80">
                    {product.category.name}
                  </span>
                )}
                <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-base font-extrabold font-mono">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through font-mono">
                    {formatCurrency(msrp)}
                  </span>
                </div>
              </div>
            </Link>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-border/60 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddToCart(product)}
                disabled={isOutOfStock}
                className="flex-1 rounded-xl text-xs gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </Button>
              <Button size="sm" asChild className="rounded-xl px-3">
                <Link href={`/products/${product.id}`}>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
