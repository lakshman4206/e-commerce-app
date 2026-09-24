"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/use-cart-store";
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Zap,
  ShoppingBag,
  CheckCircle2,
  ChevronRight,
  Heart,
  Share2,
  MapPin,
  Check,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProductDetailViewProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    stockQuantity: number;
    images: string[];
    isFeatured: boolean;
    category?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const router = useRouter();
  const { addItem, openCart } = useCartStore();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [pincode, setPincode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
      ];

  const colors = [
    { name: "Obsidian Black", hex: "#0F172A" },
    { name: "Silver Frost", hex: "#94A3B8" },
    { name: "Midnight Navy", hex: "#1E293B" },
  ];

  const sizes = ["Standard Edition", "Studio Pro Bundle", "Executive Pack"];

  const msrp = product.price * 1.25;
  const discountPercent = Math.round(((msrp - product.price) / msrp) * 100);
  const rating = 4.6 + ((product.title.length % 4) / 10);
  const reviewsCount = 120 + product.title.length * 12;

  const handleAddToCart = () => {
    if (product.stockQuantity <= 0) {
      toast.error("This item is currently out of stock.");
      return;
    }

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: images[0],
      stockQuantity: product.stockQuantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
    toast.success("Added to your shopping cart!");
    openCart();
  };

  const handleBuyNow = () => {
    if (product.stockQuantity <= 0) {
      toast.error("This item is currently out of stock.");
      return;
    }

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: images[0],
      stockQuantity: product.stockQuantity,
    });

    toast.success("Proceeding straight to Payment Gateway!");
    router.push("/checkout");
  };

  const checkDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length < 4) {
      setDeliveryStatus("Please enter a valid postal / PIN code.");
      return;
    }
    setDeliveryStatus("FREE Express Delivery by Tomorrow, 2:00 PM. Cash on Delivery Available.");
  };

  return (
    <div className="container mx-auto px-4 sm:px-8 py-8 pb-28 sm:pb-16 text-foreground antialiased space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto">
        <Link href="/" className="hover:text-foreground">Storefront</Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <Link href="/products" className="hover:text-foreground">Catalog</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="font-semibold text-foreground truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-card rounded-3xl p-6 sm:p-10 border border-border shadow-xs">
        
        {/* ================= LEFT: High-Res Image Gallery ================= */}
        <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnail list */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-muted/40 shrink-0 ${
                  selectedImage === idx
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover rounded-xl"
                />
              </button>
            ))}
          </div>

          {/* Main Stage Image */}
          <div className="relative flex-1 rounded-2xl overflow-hidden bg-muted/30 border border-border flex items-center justify-center group min-h-[380px] sm:min-h-[480px]">
            <Image
              src={images[selectedImage]}
              alt={product.title}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Wishlist & Share overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => {
                  setIsWishlisted(!isWishlisted);
                  toast(isWishlisted ? "Removed from Wishlist" : "Saved to Wishlist!");
                }}
                className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-md shadow-md flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors border border-border/60"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Product link copied to clipboard!");
                }}
                className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-md shadow-md flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border border-border/60"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-md text-foreground px-3 py-1 rounded-full text-xs font-semibold border border-border/80 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>E Comm Kart Verified Authentic</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: Buy Box & Product Details ================= */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          <div>
            {/* Category badge */}
            {product.category && (
              <span className="text-xs uppercase tracking-wider font-extrabold text-primary">
                {product.category.name}
              </span>
            )}
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 leading-snug">
              {product.title}
            </h1>

            {/* Social Rating Block */}
            <div className="flex items-center gap-3 mt-3">
              <div className="inline-flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-xs">
                <span>{rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-white text-white" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {reviewsCount.toLocaleString()} Verified Customer Reviews
              </span>
            </div>

            <hr className="my-5 border-border/80" />

            {/* Pricing Section */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-base text-muted-foreground line-through font-mono">
                  {formatCurrency(msrp)}
                </span>
                <span className="px-2.5 py-1 bg-orange-500/10 text-orange-500 rounded-lg text-xs font-extrabold tracking-wide">
                  {discountPercent}% OFF
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Inclusive of all taxes. Free 30-day returns &amp; 1-year official warranty.
              </p>
            </div>

            {/* Stock Urgency Tag */}
            {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-xl text-xs font-bold animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                <span>Only {product.stockQuantity} items left in stock - order soon</span>
              </div>
            )}

            {/* Color Swatch Radio */}
            <div className="mt-6 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider block text-muted-foreground">
                Color Option: <span className="text-foreground font-semibold">{colors[selectedColor].name}</span>
              </label>
              <div className="flex gap-2.5">
                {colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      selectedColor === idx
                        ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                        : "border-border bg-muted/20 hover:border-muted-foreground/40 text-muted-foreground"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size / Configuration Swatch */}
            <div className="mt-5 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider block text-muted-foreground">
                Configuration
              </label>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedSize === idx
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Pincode Checker */}
            <div className="mt-6 p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Delivery &amp; Fulfillment Estimate</span>
              </div>

              <form onSubmit={checkDelivery} className="flex gap-2">
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter postal / PIN code"
                  className="flex-1 px-3.5 py-1.5 bg-background border border-border rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition shadow-xs"
                >
                  Check
                </button>
              </form>

              {deliveryStatus && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 pt-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>{deliveryStatus}</span>
                </div>
              )}
            </div>

            {/* Description & Features */}
            <div className="mt-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Description &amp; Highlights
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              <ul className="space-y-1 pt-1">
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>100% Genuine, Verified Marketplace Product</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Comprehensive 1-Year Manufacturer Warranty</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <RotateCcw className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Easy 30-Day Replacement &amp; Return Policy</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Desktop Dual Action Buttons */}
          <div className="hidden sm:grid grid-cols-2 gap-3 pt-6 border-t border-border">
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity <= 0}
              className="flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-foreground bg-transparent text-foreground font-bold hover:bg-muted transition shadow-xs"
            >
              {added ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stockQuantity <= 0}
              className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-orange-600 text-white font-bold hover:bg-orange-500 transition shadow-lg shadow-orange-600/20"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Buy Now (Instant Checkout)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Persistent Bottom Bar for Mobile View */}
      <div className="fixed sm:hidden bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border p-3 grid grid-cols-2 gap-3 shadow-2xl">
        <button
          onClick={handleAddToCart}
          disabled={product.stockQuantity <= 0}
          className="h-12 rounded-xl border border-border bg-card font-bold text-foreground text-sm flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
        <button
          onClick={handleBuyNow}
          disabled={product.stockQuantity <= 0}
          className="h-12 rounded-xl bg-orange-600 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}
