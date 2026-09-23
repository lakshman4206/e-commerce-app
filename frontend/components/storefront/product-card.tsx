"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { ShoppingBag, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    stockQuantity: number;
    images: string[];
    isFeatured: boolean;
    category?: {
      name: string;
      slug: string;
    };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const [added, setAdded] = useState(false);

  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5;
  const isOutOfStock = product.stockQuantity <= 0;
  const primaryImage =
    product.images[0] ||
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: primaryImage,
      stockQuantity: product.stockQuantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    openCart();
  };

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-3 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Thumbnail Area */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.isFeatured && (
              <span className="rounded-full bg-primary/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground tracking-wide">
                FEATURED
              </span>
            )}
            {isLowStock && (
              <span className="rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white tracking-wide">
                ONLY {product.stockQuantity} LEFT
              </span>
            )}
            {isOutOfStock && (
              <span className="rounded-full bg-destructive/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white tracking-wide">
                SOLD OUT
              </span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-3.5 space-y-1">
          {product.category && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {product.category.name}
            </span>
          )}
          <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer Area with Price & Cart Action */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-muted-foreground block">Price</span>
          <span className="text-base font-bold font-mono text-foreground">
            {formatCurrency(product.price)}
          </span>
        </div>

        <Button
          size="sm"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="rounded-xl px-3.5 gap-1.5 transition-all"
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
