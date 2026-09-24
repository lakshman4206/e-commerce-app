"use client";

import { useState } from "react";
import { useCartStore } from "@/store/use-cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, ShieldCheck, Lock, Loader2, MapPin, Phone, Truck } from "lucide-react";
import { useRouter } from "next/navigation";

export function CheckoutForm() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();

  // Delivery details
  const [fullName, setFullName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [phone, setPhone] = useState("");

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "COD">("CARD");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = getSubtotal();
  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + shipping;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (!streetAddress || !city || !phone) {
      toast.error("Please fill in all required shipping address fields.");
      return;
    }

    const fullFormattedAddress = `${fullName ? fullName + ", " : ""}${streetAddress}, ${city} ${postalCode}, ${country}`;

    setLoading(true);

    try {
      const res = await fetch("/api/checkout/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
          })),
          address: fullFormattedAddress,
          phone,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process checkout");
      }

      toast.success("Order confirmed successfully! Thank you for your purchase.");
      clearCart();
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Checkout error";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="space-y-6">
      {/* 1. Shipping Address & Contact */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold">1. Shipping &amp; Contact Details</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Recipient Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full px-3.5 py-2 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Street Address *
            </label>
            <input
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
              className="w-full px-3.5 py-2 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              City *
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. New York"
              className="w-full px-3.5 py-2 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Postal / ZIP Code
            </label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g. 10001"
              className="w-full px-3.5 py-2 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Country
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United States"
              className="w-full px-3.5 py-2 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-muted/30 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Phone className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Payment Method */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <h3 className="text-base font-semibold">2. Payment Method</h3>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">256-Bit SSL Encrypted</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod("CARD")}
            className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition ${
              paymentMethod === "CARD"
                ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Credit / Debit Card</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Visa, Mastercard, Amex, Stripe</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("COD")}
            className={`p-3.5 rounded-2xl border text-left flex flex-col gap-1 transition ${
              paymentMethod === "COD"
                ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs">
              <Truck className="w-4 h-4 text-emerald-500" />
              <span>Pay on Delivery</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Pay cash or card upon arrival</span>
          </button>
        </div>

        {paymentMethod === "CARD" && (
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 •••• •••• 4242"
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Expiry (MM/YY)
                </label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="12/28"
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  CVC / CVV
                </label>
                <input
                  type="text"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  placeholder="123"
                  className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Your payment is guaranteed secure and protected against fraud.</span>
        </div>
      </div>

      {/* 3. Order Summary & Complete Button */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Cart Subtotal</span>
          <span className="font-mono">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Estimated Shipping</span>
          <span className="font-mono">{shipping === 0 ? "FREE" : formatCurrency(shipping)}</span>
        </div>
        <div className="border-t border-border/60 pt-3 flex justify-between font-bold text-base">
          <span>Order Total</span>
          <span className="font-mono text-primary">{formatCurrency(total)}</span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || items.length === 0}
        size="lg"
        className="w-full h-12 text-base font-semibold shadow-md"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Your Order...</span>
          </div>
        ) : (
          `Complete Order (${formatCurrency(total)})`
        )}
      </Button>
    </form>
  );
}
