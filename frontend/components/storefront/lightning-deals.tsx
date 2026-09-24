"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Zap, Clock, Star, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/use-cart-store";
import { toast } from "sonner";

interface LightningDealProduct {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  claimedPercent: number;
  stockQuantity: number;
}

export function LightningDealsSection() {
  const { addItem, openCart } = useCartStore();

  // Real-time countdown timer (hours, mins, seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const deals: LightningDealProduct[] = [
    {
      id: "deal_1",
      title: "E Kart Studio Pro Wireless ANC Headphones",
      price: 199.99,
      originalPrice: 349.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      claimedPercent: 84,
      stockQuantity: 4,
    },
    {
      id: "deal_2",
      title: "Ergonomic Mechanical Keyboard RGB Hot-swap",
      price: 89.99,
      originalPrice: 149.99,
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      claimedPercent: 62,
      stockQuantity: 8,
    },
    {
      id: "deal_3",
      title: "Ultra-Fast 65W GaN Compact Travel Charger",
      price: 34.99,
      originalPrice: 59.99,
      image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
      claimedPercent: 91,
      stockQuantity: 2,
    },
    {
      id: "deal_4",
      title: "Minimalist Italian Leather Cardholder & Wallet",
      price: 49.99,
      originalPrice: 85.0,
      image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
      claimedPercent: 45,
      stockQuantity: 12,
    },
  ];

  const handleQuickAdd = (deal: LightningDealProduct) => {
    addItem({
      id: deal.id,
      title: deal.title,
      price: deal.price,
      image: deal.image,
      stockQuantity: deal.stockQuantity,
    });
    toast.success(`Lightning deal added to cart!`);
    openCart();
  };

  return (
    <section className="container mx-auto px-4 sm:px-8">
      <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-card via-card to-orange-500/5 p-6 sm:p-8 shadow-md">
        {/* Section Header with Countdown Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Zap className="w-5 h-5 fill-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Lightning Deals
                </h2>
                <span className="bg-orange-500/10 text-orange-500 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Limited Time
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                High-demand inventory with exclusive flash discounts.
              </p>
            </div>
          </div>

          {/* Real-time Clock Banner */}
          <div className="flex items-center gap-2 bg-muted/60 px-4 py-2 rounded-2xl border border-border/80 self-start sm:self-auto">
            <Clock className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-xs font-semibold text-muted-foreground">Ends in:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-sm text-foreground">
              <span className="bg-background px-2 py-0.5 rounded-lg border border-border shadow-2xs">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="bg-background px-2 py-0.5 rounded-lg border border-border shadow-2xs">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="bg-background px-2 py-0.5 rounded-lg border border-border shadow-2xs text-orange-500">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* Deals Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {deals.map((deal) => {
            const discountPercent = Math.round(
              ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
            );

            return (
              <div
                key={deal.id}
                className="group rounded-2xl border border-border bg-card p-3.5 flex flex-col justify-between hover:shadow-xl hover:border-orange-500/40 transition-all"
              >
                <div>
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted/40 mb-3">
                    <Image
                      src={deal.image}
                      alt={deal.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-orange-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                      {discountPercent}% OFF
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {deal.title}
                  </h3>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg font-black font-mono text-foreground">
                      {formatCurrency(deal.price)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through font-mono">
                      {formatCurrency(deal.originalPrice)}
                    </span>
                  </div>

                  {/* Claim Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                      <span>{deal.claimedPercent}% Claimed</span>
                      <span className="text-orange-500 font-bold">{deal.stockQuantity} left</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                        style={{ width: `${deal.claimedPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickAdd(deal)}
                  className="mt-4 w-full h-9 rounded-xl bg-foreground text-background hover:bg-orange-600 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Claim Deal</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
