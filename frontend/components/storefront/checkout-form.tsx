"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/use-cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Loader2,
  MapPin,
  Phone,
  Truck,
  QrCode,
  Wallet,
  Building2,
  Sparkles,
  CheckCircle2,
  Tag,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowRight,
  Shield,
  Info,
  Check,
  Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function CheckoutForm() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();

  // 1. Delivery Details State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [phone, setPhone] = useState("");

  // 2. Payment Gateway Method State
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "UPI" | "WALLET" | "NETBANKING" | "COD">("CARD");

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  // UPI details
  const [upiId, setUpiId] = useState("");
  const [upiTimer, setUpiTimer] = useState(600); // 10 minutes

  // Netbanking details
  const [selectedBank, setSelectedBank] = useState("chase");

  // Digital Wallet details
  const [selectedWallet, setSelectedWallet] = useState("applepay");

  // Promo code engine
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent?: number; amount?: number } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Order breakdown accordion
  const [showOrderItems, setShowOrderItems] = useState(true);

  // High-Tech 3D Secure / Payment Gateway Modal State
  const [isProcessingModal, setIsProcessingModal] = useState(false);
  const [processingStep, setProcessingStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Calculate pricing
  const subtotal = getSubtotal();
  const discountAmount = appliedDiscount
    ? appliedDiscount.percent
      ? (subtotal * appliedDiscount.percent) / 100
      : (appliedDiscount.amount || 0)
    : 0;

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shipping = discountedSubtotal > 150 || discountedSubtotal === 0 ? 0 : 15;
  const tax = Math.round(discountedSubtotal * 0.08 * 100) / 100;
  const total = discountedSubtotal + shipping + tax;

  // Auto UPI countdown timer
  useEffect(() => {
    if (paymentMethod !== "UPI") return;
    const interval = setInterval(() => {
      setUpiTimer((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentMethod]);

  // Card brand detection based on digits
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    if (/^4/.test(clean)) return { name: "Visa", color: "from-blue-600 to-indigo-800", icon: "VISA" };
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return { name: "Mastercard", color: "from-orange-600 to-rose-700", icon: "MC" };
    if (/^3[47]/.test(clean)) return { name: "Amex", color: "from-emerald-700 to-teal-900", icon: "AMEX" };
    if (/^6(?:011|5)/.test(clean)) return { name: "Discover", color: "from-amber-600 to-orange-700", icon: "DISC" };
    return { name: "E Kart SafeCard", color: "from-slate-900 via-neutral-900 to-zinc-950", icon: "CARD" };
  };

  const cardBrand = getCardBrand(cardNumber);

  // Format Card Number (4-4-4-4)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  // Format CVC
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardCvc(raw);
  };

  // Promo Code Validation
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setTimeout(() => {
      const codeUpper = promoCode.trim().toUpperCase();
      if (codeUpper === "EKART50" || codeUpper === "ECOMM50" || codeUpper === "AESTHETE50") {
        setAppliedDiscount({ code: "EKART50", percent: 50 });
        toast.success("50% Mega Promo applied successfully!");
      } else if (codeUpper === "SAVE10" || codeUpper === "WELCOME10") {
        setAppliedDiscount({ code: "SAVE10", amount: 10 });
        toast.success("$10 Discount applied!");
      } else {
        toast.error("Invalid coupon code. Try 'EKART50' for 50% off!");
      }
      setPromoLoading(false);
    }, 400);
  };

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

    if (paymentMethod === "CARD") {
      if (cardNumber.replace(/\s/g, "").length < 15) {
        toast.error("Please enter a valid 16-digit card number.");
        return;
      }
      if (cardExpiry.length < 5) {
        toast.error("Please enter card expiry in MM/YY format.");
        return;
      }
      if (cardCvc.length < 3) {
        toast.error("Please enter a 3 or 4-digit CVV / CVC.");
        return;
      }
    } else if (paymentMethod === "UPI" && !upiId.includes("@")) {
      toast.error("Please enter a valid UPI ID (e.g. name@okhdfcbank or user@paytm).");
      return;
    }

    // Launch High-Tech 3D Secure / Stripe Gateway Processing Sequence
    setIsProcessingModal(true);
    setProcessingStep(1);
    setLoading(true);

    const fullFormattedAddress = `${fullName ? fullName + ", " : ""}${streetAddress}, ${city} ${postalCode}, ${country}`;

    try {
      // Step 1: Connecting to Secure Banking Gateway (1.2s)
      await new Promise((r) => setTimeout(r, 1200));
      setProcessingStep(2);

      // Step 2: 3D Secure 2.0 Strong Customer Authentication & Fraud Check (1.4s)
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
          paymentMethod: paymentMethod === "COD" ? "COD" : "CARD",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process payment gateway transaction.");
      }

      await new Promise((r) => setTimeout(r, 1000));
      setProcessingStep(3);

      // Step 3: Authorization Success (0.8s)
      await new Promise((r) => setTimeout(r, 800));

      toast.success("Payment authorized! Order placed successfully.");
      clearCart();
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (err: unknown) {
      setIsProcessingModal(false);
      const msg = err instanceof Error ? err.message : "Checkout error";
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Value / Guarantee Banner */}
      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-center text-xs">
        <div className="flex items-center justify-center gap-1.5 font-medium text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>256-Bit SSL Encrypted</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 font-medium text-muted-foreground">
          <Truck className="w-4 h-4 text-primary" />
          <span>Express Tracked Dispatch</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 font-medium text-muted-foreground">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>Zero-Risk Guarantee</span>
        </div>
      </div>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT / MAIN: Address & Gateway Selectors ================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Shipping Address & Contact */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="text-base font-bold tracking-tight">Delivery &amp; Contact Information</h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold">Step 1 of 2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  Full Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  Street Address &amp; Apartment / Suite *
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New York"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 10001"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="United States"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  Mobile Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-mono"
                  />
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Multi-Payment Gateway Selector */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="text-base font-bold tracking-tight">Select Payment Gateway</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                <Lock className="w-3 h-3" />
                <span>PCI-DSS Validated</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === "CARD"
                    ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30 shadow-xs"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <CreditCard className="w-4 h-4 text-primary mb-2" />
                <div>
                  <span className="text-xs font-bold block text-foreground">Credit/Debit Card</span>
                  <span className="text-[10px] text-muted-foreground">Visa, MC, Amex</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === "UPI"
                    ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30 shadow-xs"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <QrCode className="w-4 h-4 text-orange-500 mb-2" />
                <div>
                  <span className="text-xs font-bold block text-foreground">UPI / Scan &amp; Pay</span>
                  <span className="text-[10px] text-muted-foreground">GPay, PhonePe, QR</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("WALLET")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === "WALLET"
                    ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30 shadow-xs"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Wallet className="w-4 h-4 text-blue-500 mb-2" />
                <div>
                  <span className="text-xs font-bold block text-foreground">Digital Wallets</span>
                  <span className="text-[10px] text-muted-foreground">Apple Pay, PayPal</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  paymentMethod === "COD"
                    ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30 shadow-xs"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-500 mb-2" />
                <div>
                  <span className="text-xs font-bold block text-foreground">Pay on Delivery</span>
                  <span className="text-[10px] text-muted-foreground">Cash or Card</span>
                </div>
              </button>
            </div>

            {/* ================= TAB 1: CREDIT / DEBIT CARD ================= */}
            {paymentMethod === "CARD" && (
              <div className="space-y-6 pt-2">
                {/* Visual Interactive Credit Card Display */}
                <div className="relative w-full max-w-sm mx-auto aspect-[1.586/1] rounded-2xl p-6 bg-gradient-to-tr from-slate-900 via-neutral-900 to-zinc-950 text-white shadow-2xl border border-white/10 flex flex-col justify-between overflow-hidden">
                  {/* Glowing background sheen */}
                  <div className="absolute top-0 right-0 w-44 h-44 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

                  {/* Card Header: Chip + Card Brand */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 border border-amber-500/40 flex items-center justify-center shadow-inner">
                        <div className="w-6 h-4 border border-amber-600/30 rounded-xs grid grid-cols-2" />
                      </div>
                      <Smartphone className="w-4 h-4 text-white/50 rotate-90" />
                    </div>
                    <span className="font-mono font-black text-sm tracking-wider uppercase text-white/90">
                      {cardBrand.name}
                    </span>
                  </div>

                  {/* Card Number */}
                  <div className="z-10 tracking-[0.2em] font-mono text-base sm:text-lg font-bold drop-shadow-md">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>

                  {/* Card Footer: Cardholder + Expiry */}
                  <div className="flex items-end justify-between z-10 text-xs uppercase tracking-wider">
                    <div>
                      <span className="text-[9px] text-white/60 block font-sans">Cardholder</span>
                      <span className="font-semibold truncate max-w-[170px] block font-mono">
                        {cardHolder || "YOUR FULL NAME"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-white/60 block font-sans">Expires</span>
                      <span className="font-semibold font-mono">{cardExpiry || "MM/YY"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Input Form */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-foreground/80 block mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground/80 block mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 4242 4242 4242"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      />
                      <CreditCard className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground/80 block mb-1">
                        Expiry Date (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="12/28"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-foreground/80 block">
                          CVV / CVC
                        </label>
                        <span className="text-[10px] text-muted-foreground font-mono">3 or 4 Digits</span>
                      </div>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={handleCvcChange}
                        placeholder="123"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                    />
                    <label htmlFor="saveCard" className="text-xs text-muted-foreground font-medium cursor-pointer">
                      Save card encrypted for 1-click future orders
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: UPI SCAN & PAY ================= */}
            {paymentMethod === "UPI" && (
              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="text-sm font-bold">Instant UPI QR Code</h4>
                      <p className="text-[11px] text-muted-foreground">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">QR Expires In</span>
                    <span className="text-xs font-mono font-bold text-orange-500">
                      {Math.floor(upiTimer / 60)}:{String(upiTimer % 60).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* QR Code Mock Visual */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-border flex items-center justify-center">
                    <div className="w-36 h-36 relative flex items-center justify-center bg-zinc-950 p-2 rounded-xl">
                      <div className="w-full h-full border-4 border-dashed border-white flex flex-col items-center justify-center text-white text-center p-2">
                        <QrCode className="w-16 h-16 text-white" />
                        <span className="text-[9px] font-mono font-black mt-1 uppercase tracking-wider text-orange-400">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div>
                      <label className="text-xs font-bold text-foreground/80 block mb-1">
                        Or enter your UPI Virtual Address (VPA)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank"
                          className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (upiId.includes("@")) {
                              toast.success("UPI ID verified! Click Complete Order to authorize.");
                            } else {
                              toast.error("Please enter a valid UPI address.");
                            }
                          }}
                          className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition shadow-xs"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      A payment request will be sent directly to your UPI mobile app for 1-click confirmation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 3: DIGITAL WALLETS ================= */}
            {paymentMethod === "WALLET" && (
              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Choose Wallet Provider
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "applepay", name: "Apple Pay", sub: "1-Click TouchID" },
                    { id: "gpay", name: "Google Pay", sub: "Fast Google Checkout" },
                    { id: "paypal", name: "PayPal", sub: "PayPal Buyer Protection" },
                    { id: "amazonpay", name: "Amazon Pay", sub: "Amazon 1-Click Pay" },
                  ].map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setSelectedWallet(w.id)}
                      className={`p-3.5 rounded-xl border text-left transition ${
                        selectedWallet === w.id
                          ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30"
                          : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <span className="text-xs font-bold block text-foreground">{w.name}</span>
                      <span className="text-[10px] text-muted-foreground">{w.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 4: CASH ON DELIVERY ================= */}
            {paymentMethod === "COD" && (
              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-2">
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero Upfront Payment Required</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You can inspect the sealed package and pay either with Cash, QR Code, or Card upon delivery at your doorstep.
                </p>
              </div>
            )}

            {/* Trust Footer */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>All payment transmissions are encrypted with TLS 1.3 and 256-bit bank standard SSL.</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: Order Summary & Coupon Engine ================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Order Items Accordion */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
              <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
                <span>Order Summary</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {items.length} {items.length === 1 ? "Item" : "Items"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowOrderItems(!showOrderItems)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold"
              >
                <span>{showOrderItems ? "Collapse" : "Expand"}</span>
                {showOrderItems ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Cart Items List */}
            {showOrderItems && (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">Your cart is currently empty.</p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted/40 border border-border shrink-0">
                          {item.image && (
                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold block truncate text-foreground">{item.title}</span>
                          <span className="text-muted-foreground text-[11px]">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold shrink-0">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Promo Code Input Engine */}
            <div className="pt-2 border-t border-border/60">
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Coupon: ECOMM50"
                    className="w-full pl-8 pr-3 py-2 bg-muted/20 border border-border rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Tag className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={promoLoading || !promoCode.trim()}
                  className="rounded-xl text-xs font-bold h-9"
                >
                  {promoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                </Button>
              </form>

              {appliedDiscount && (
                <div className="flex items-center justify-between mt-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Coupon &apos;{appliedDiscount.code}&apos; Active</span>
                  </span>
                  <span>
                    -{formatCurrency(discountAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* Price Calculations Breakdown */}
            <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500 font-medium">
                  <span>Discount</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Shipping</span>
                <span className="font-mono">{shipping === 0 ? "FREE" : formatCurrency(shipping)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Tax (8%)</span>
                <span className="font-mono">{formatCurrency(tax)}</span>
              </div>

              <div className="border-t border-border pt-3 flex justify-between font-black text-base">
                <span>Total Amount Due</span>
                <span className="font-mono text-primary text-xl">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Complete Order Primary CTA */}
            <Button
              type="submit"
              disabled={loading || items.length === 0}
              size="lg"
              className="w-full h-14 text-base font-black shadow-xl shadow-primary/20 rounded-2xl bg-gradient-to-r from-primary via-orange-600 to-orange-500 hover:from-primary/90 hover:to-orange-500 text-primary-foreground transition-all mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to Stripe Gateway...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Authorize &amp; Pay {formatCurrency(total)}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>

          {/* Money-Back Guarantee & Return policy assurance */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>E Kart Buyer Protection</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Every purchase is protected by our 30-day money-back guarantee and verified merchant escrow.
            </p>
          </div>
        </div>
      </form>

      {/* ================= High-Tech 3D Secure / Stripe Gateway Processing Modal ================= */}
      {isProcessingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 space-y-6 text-center shadow-2xl">
            {/* Animated Gateway Pulse Icon */}
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 text-primary shadow-lg shadow-primary/20">
              {processingStep === 3 ? (
                <Check className="w-8 h-8 text-emerald-500 animate-scale" />
              ) : (
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              )}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black tracking-tight">
                {processingStep === 1 && "Connecting to Stripe Gateway..."}
                {processingStep === 2 && "Authenticating 3D Secure 2.0..."}
                {processingStep === 3 && "Payment Authorized & Confirmed!"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {processingStep === 1 && "Establishing 256-bit encrypted tunnel with banking network..."}
                {processingStep === 2 && "Performing zero-latency fraud analysis and tokenization..."}
                {processingStep === 3 && "Redirecting to your verified order confirmation receipt..."}
              </p>
            </div>

            {/* Stepper Progress Visual */}
            <div className="space-y-2 pt-2 text-left">
              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  processingStep >= 1 ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  ✓
                </div>
                <span className={processingStep >= 1 ? "text-foreground" : "text-muted-foreground"}>
                  Encrypted Handshake (TLS 1.3)
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  processingStep >= 2 ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {processingStep >= 2 ? "✓" : "2"}
                </div>
                <span className={processingStep >= 2 ? "text-foreground" : "text-muted-foreground"}>
                  Stripe PCI-DSS Card Verification
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  processingStep >= 3 ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {processingStep >= 3 ? "✓" : "3"}
                </div>
                <span className={processingStep >= 3 ? "text-foreground" : "text-muted-foreground"}>
                  Order Creation &amp; Inventory Lock
                </span>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground font-mono">
              Do not refresh or close this browser window.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
