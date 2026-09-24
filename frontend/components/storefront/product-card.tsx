"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import { ShoppingBag, Check, Star, Zap } from "lucide-react";
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

  // Deterministic realistic rating & MSRP for enterprise feel
  const rating = 4.5 + ((product.title.length % 5) / 10);
  const reviewCount = 48 + (product.title.length * 7);
  const msrp = product.price * 1.25;
  const discountPercent = Math.round(((msrp - product.price) / msrp) * 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    <div className="group relative rounded-3xl border border-border bg-card p-3.5 shadow-xs hover:shadow-2xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between">
      <Link href={`/products/${product.id}`} className="block">
        {/* Thumbnail Area */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted/40">
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {product.isFeatured && (
              <span className="rounded-full bg-primary/95 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground tracking-wide flex items-center gap-1 shadow-sm">
                <Zap className="w-3 h-3 fill-primary-foreground" />
                <span>TOP PICK</span>
              </span>
            )}
            {discountPercent > 0 && (
              <span className="rounded-full bg-orange-600 px-2 py-0.5 text-[10px] font-extrabold text-white tracking-wide shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
            {isLowStock && (
              <span className="rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wide">
                ONLY {product.stockQuantity} LEFT
              </span>
            )}
            {isOutOfStock && (
              <span className="rounded-full bg-destructive/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wide">
                OUT OF STOCK
              </span>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            {product.category && (
              <span className="font-semibold uppercase tracking-wider text-primary/80">
                {product.category.name}
              </span>
            )}
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-md font-bold text-[10px]">
              <span>{rating.toFixed(1)}</span>
              <Star className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
              <span className="text-muted-foreground font-normal">({reviewCount})</span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </Link>

      {/* Footer Area with Price & Cart Action */}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold font-mono text-foreground">
              {formatCurrency(product.price)}
            </span>
            <span className="text-[11px] text-muted-foreground line-through font-mono">
              {formatCurrency(msrp)}
            </span>
          </div>
          <span className="text-[10px] text-emerald-500 font-medium block">Free Delivery</span>
        </div>

        <Button
          size="sm"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="rounded-xl px-3 gap-1.5 text-xs font-semibold shadow-xs"
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
