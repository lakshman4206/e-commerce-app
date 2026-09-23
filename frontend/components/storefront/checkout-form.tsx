"use client";

import { useState } from "react";
import { useCartStore } from "@/store/use-cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, ShieldCheck, Lock, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export function CheckoutForm() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [address, setAddress] = useState("100 Innovation Way, Suite 400, San Francisco, CA 94105");
  const [phone, setPhone] = useState("+1 (555) 234-5678");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [loading, setLoading] = useState(false);

  const subtotal = getSubtotal();

  const handleTestCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      // 1. Call server to create order and Stripe PaymentIntent
      const res = await fetch("/api/checkout/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.id,
            quantity: i.quantity,
          })),
          address,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process checkout");
      }

      toast.success("Payment authorized successfully! Redirecting...");
      clearCart();
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Checkout error";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillMockCard = () => {
    setCardNumber("4242 •••• •••• 4242");
    setExpiry("12/28");
    setCvc("123");
    toast.info("Stripe 4242 test card details prefilled!");
  };

  return (
    <form onSubmit={handleTestCheckout} className="space-y-6">
      {/* Shipping Address */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-base font-semibold">1. Delivery Address &amp; Contact</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Full Shipping Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Mobile Phone
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-muted/40 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Stripe Payment Element Simulation */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <h3 className="text-base font-semibold">2. Payment Method (Stripe Elements)</h3>
          </div>
          <button
            type="button"
            onClick={fillMockCard}
            className="text-xs text-primary hover:underline flex items-center gap-1 font-mono"
          >
            <Sparkles className="w-3 h-3" />
            Prefill Test Card
          </button>
        </div>

        <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-2">
            <span>Stripe Sandbox / Test Environment</span>
            <span className="font-mono">Ready</span>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                readOnly
                value={cardNumber}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-background border border-border text-sm font-mono"
              />
              <CreditCard className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                readOnly
                value={expiry}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                CVC
              </label>
              <input
                type="text"
                readOnly
                value={cvc}
                className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-sm font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Encrypted with 256-bit SSL via Stripe API</span>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading || items.length === 0}
        size="lg"
        className="w-full h-12 text-base font-semibold"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Order...</span>
          </div>
        ) : (
          `Pay ${formatCurrency(subtotal)} with Stripe`
        )}
      </Button>
    </form>
  );
}
