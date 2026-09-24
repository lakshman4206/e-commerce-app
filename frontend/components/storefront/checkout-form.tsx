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
  Check,
  Smartphone,
  X,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function CheckoutForm() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();

  // 1. Delivery Details State (Indian Standard)
  const [fullName, setFullName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Karnataka");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [phone, setPhone] = useState("");

  // 2. Payment Gateway Method State
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY_UPI" | "CARD" | "NETBANKING" | "WALLET" | "COD">("RAZORPAY_UPI");

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  // UPI details
  const [upiId, setUpiId] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [upiTimer, setUpiTimer] = useState(600); // 10 minutes

  // Netbanking details
  const [selectedBank, setSelectedBank] = useState("hdfc");

  // Digital Wallet details
  const [selectedWallet, setSelectedWallet] = useState("amazonpay");

  // Promo code engine
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent?: number; amount?: number } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  // Order breakdown accordion
  const [showOrderItems, setShowOrderItems] = useState(true);

  // Razorpay Gateway Modal State
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [razorpayStep, setRazorpayStep] = useState<"SELECT" | "PROCESSING" | "OTP_VERIFY" | "SUCCESS">("PROCESSING");
  const [otpInput, setOtpInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculate pricing in Indian Rupees
  const subtotal = getSubtotal();
  const discountAmount = appliedDiscount
    ? appliedDiscount.percent
      ? Math.round((subtotal * appliedDiscount.percent) / 100)
      : (appliedDiscount.amount || 0)
    : 0;

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  // Free delivery above ₹999
  const shipping = discountedSubtotal > 999 || discountedSubtotal === 0 ? 0 : 99;
  const tax = Math.round(discountedSubtotal * 0.18); // 18% GST
  const total = discountedSubtotal + shipping + tax;

  // Auto UPI countdown timer
  useEffect(() => {
    if (paymentMethod !== "RAZORPAY_UPI") return;
    const interval = setInterval(() => {
      setUpiTimer((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentMethod]);

  // Card brand detection based on digits (RuPay, Visa, Mastercard, Amex)
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, "");
    if (/^6[05]|^8[12]/.test(clean)) return { name: "RuPay", color: "from-green-700 to-emerald-900", icon: "RUPAY" };
    if (/^4/.test(clean)) return { name: "Visa", color: "from-blue-600 to-indigo-800", icon: "VISA" };
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return { name: "Mastercard", color: "from-orange-600 to-rose-700", icon: "MC" };
    if (/^3[47]/.test(clean)) return { name: "Amex", color: "from-emerald-700 to-teal-900", icon: "AMEX" };
    return { name: "RuPay / Visa SafeCard", color: "from-slate-900 via-neutral-900 to-zinc-950", icon: "CARD" };
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
      if (
        codeUpper === "ECOMWEB50" ||
        codeUpper === "ECOMMKART50" ||
        codeUpper === "EKART50" ||
        codeUpper === "ECOMM50" ||
        codeUpper === "FESTIVE50"
      ) {
        setAppliedDiscount({ code: "ECOMWEB50", percent: 50 });
        toast.success("50% Mega Festive Promo applied successfully!");
      } else if (codeUpper === "FLAT200" || codeUpper === "SAVE200") {
        setAppliedDiscount({ code: "FLAT200", amount: 200 });
        toast.success("₹200 Instant Discount applied!");
      } else {
        toast.error("Invalid coupon code. Try 'ECOMWEB50' for 50% off!");
      }
      setPromoLoading(false);
    }, 400);
  };

  // Initiate Razorpay / Checkout Flow
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (!streetAddress || !city || !phone) {
      toast.error("Please fill in all required delivery address fields.");
      return;
    }

    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
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
        toast.error("Please enter a 3-digit CVV.");
        return;
      }
    } else if (paymentMethod === "RAZORPAY_UPI" && upiId && !upiId.includes("@")) {
      toast.error("Please enter a valid UPI address (e.g. name@oksbi or name@paytm).");
      return;
    }

    // Open Razorpay Standard Checkout Modal
    setIsRazorpayModalOpen(true);
    setLoading(true);

    if (paymentMethod === "COD") {
      // Direct Cash on delivery confirmation
      handleFinalizeOrder("COD");
    } else if (paymentMethod === "CARD") {
      setRazorpayStep("OTP_VERIFY");
      setLoading(false);
    } else {
      setRazorpayStep("PROCESSING");
      // Simulate automatic instant verification in 2 seconds
      setTimeout(() => {
        handleFinalizeOrder("RAZORPAY");
      }, 2200);
    }
  };

  // Complete Order in Database & Redirect
  const handleFinalizeOrder = async (finalMethod: string) => {
    setRazorpayStep("PROCESSING");
    setLoading(true);

    const fullFormattedAddress = `${fullName ? fullName + ", " : ""}${streetAddress}, ${city}, ${stateName} - ${postalCode}, ${country}`;

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
          paymentMethod: finalMethod === "COD" ? "COD" : "RAZORPAY",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process Razorpay payment.");
      }

      setRazorpayStep("SUCCESS");
      await new Promise((r) => setTimeout(r, 1000));

      toast.success("Payment authorized via Razorpay! Order placed successfully.");
      clearCart();
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (err: unknown) {
      setIsRazorpayModalOpen(false);
      const msg = err instanceof Error ? err.message : "Payment error";
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.length < 4) {
      toast.error("Please enter the 6-digit OTP sent to your phone (Demo: 123456)");
      return;
    }
    handleFinalizeOrder("RAZORPAY");
  };

  return (
    <div className="space-y-8">
      {/* Top Value / Guarantee Banner */}
      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-card border border-border/80 text-center text-xs">
        <div className="flex items-center justify-center gap-1.5 font-medium text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Razorpay Verified 256-Bit</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 font-medium text-muted-foreground">
          <Truck className="w-4 h-4 text-primary" />
          <span>Express Tracked Dispatch</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 font-medium text-muted-foreground">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>100% Genuine Guarantee</span>
        </div>
      </div>

      <form onSubmit={handleInitiatePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT / MAIN: Address & Gateway Selectors ================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Shipping Address & Contact */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="text-base font-bold tracking-tight">Delivery Address &amp; Contact</h3>
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
                  placeholder="e.g. Lakshmana Murthy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  Flat, House no., Building, Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. #402, Lotus Heights, 5th Main Road"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  City / District *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  State *
                </label>
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition cursor-pointer"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi NCR</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Rajasthan">Rajasthan</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 560034"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1">
                  Mobile Number (for delivery updates) *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-2.5 text-xs font-bold text-muted-foreground font-mono">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="98765 43210"
                    className="w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-muted/20 border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition font-mono"
                  />
                  <Phone className="w-4 h-4 absolute right-3.5 top-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Razorpay Multi-Payment Gateway Selector */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="text-base font-bold tracking-tight">Payment Method (Razorpay Gateway)</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                <Lock className="w-3 h-3" />
                <span>Razorpay Secure</span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("RAZORPAY_UPI")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === "RAZORPAY_UPI"
                    ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30 shadow-xs"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <QrCode className="w-4 h-4 text-orange-500 mb-2" />
                <div>
                  <span className="text-xs font-bold block text-foreground">UPI / QR Code</span>
                  <span className="text-[10px] text-muted-foreground">GPay, PhonePe, Paytm</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("CARD")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === "CARD"
                    ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30 shadow-xs"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-500 mb-2" />
                <div>
                  <span className="text-xs font-bold block text-foreground">Cards (Debit/Credit)</span>
                  <span className="text-[10px] text-muted-foreground">RuPay, Visa, MC</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("NETBANKING")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === "NETBANKING"
                    ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30 shadow-xs"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-500 mb-2" />
                <div>
                  <span className="text-xs font-bold block text-foreground">NetBanking</span>
                  <span className="text-[10px] text-muted-foreground">HDFC, SBI, ICICI, Axis</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  paymentMethod === "COD"
                    ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30 shadow-xs"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Truck className="w-4 h-4 text-amber-500 mb-2" />
                <div>
                  <span className="text-xs font-bold block text-foreground">Pay on Delivery</span>
                  <span className="text-[10px] text-muted-foreground">Cash / UPI at Doorstep</span>
                </div>
              </button>
            </div>

            {/* ================= TAB 1: UPI SCAN & PAY ================= */}
            {paymentMethod === "RAZORPAY_UPI" && (
              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="text-sm font-bold">Razorpay Fast UPI / Dynamic QR</h4>
                      <p className="text-[11px] text-muted-foreground">Scan with Google Pay, PhonePe, Paytm, CRED or BHIM</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Session Timer</span>
                    <span className="text-xs font-mono font-bold text-orange-500">
                      {Math.floor(upiTimer / 60)}:{String(upiTimer % 60).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* UPI QR & Popular Apps */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-border flex flex-col items-center justify-center text-center">
                    <div className="w-36 h-36 relative flex items-center justify-center bg-zinc-950 p-2 rounded-xl shadow-inner">
                      <div className="w-full h-full border-2 border-dashed border-white/70 flex flex-col items-center justify-center text-white p-2">
                        <QrCode className="w-16 h-16 text-white" />
                        <span className="text-[10px] font-mono font-black mt-1 uppercase tracking-wider text-orange-400">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-800 mt-1.5 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" /> Scan to Pay with Any UPI App
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 w-full">
                    <div>
                      <label className="text-xs font-bold text-foreground/80 block mb-1">
                        Or enter your UPI ID (VPA)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. name@okhdfcbank or 9876543210@paytm"
                          className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (upiId.includes("@")) {
                              toast.success("UPI ID verified! Click Place Order to pay via Razorpay.");
                            } else {
                              toast.error("Please enter a valid UPI address (e.g. name@oksbi).");
                            }
                          }}
                          className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition shadow-xs cursor-pointer"
                        >
                          Verify
                        </button>
                      </div>
                    </div>

                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-muted-foreground block mb-2">
                        Supported UPI Apps:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {["Google Pay", "PhonePe", "Paytm", "BHIM", "CRED"].map((app) => (
                          <span
                            key={app}
                            className="px-2.5 py-1 rounded-lg bg-background border border-border text-[11px] font-medium text-foreground"
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: CREDIT / DEBIT CARD ================= */}
            {paymentMethod === "CARD" && (
              <div className="space-y-6 pt-2">
                {/* Visual Interactive RuPay / Visa Credit Card Display */}
                <div className="relative w-full max-w-sm mx-auto aspect-[1.586/1] rounded-2xl p-6 bg-gradient-to-tr from-slate-900 via-neutral-900 to-zinc-950 text-white shadow-2xl border border-white/10 flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

                  {/* Card Header: Chip + Card Brand */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 border border-amber-500/40 flex items-center justify-center shadow-inner">
                        <div className="w-6 h-4 border border-amber-600/30 rounded-xs grid grid-cols-2" />
                      </div>
                      <Smartphone className="w-4 h-4 text-white/50 rotate-90" />
                    </div>
                    <span className="font-mono font-black text-sm tracking-wider uppercase text-white/90 bg-white/10 px-2 py-0.5 rounded">
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
                        {cardHolder || (fullName ? fullName.toUpperCase() : "CARDHOLDER NAME")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-white/60 block font-sans">Valid Thru</span>
                      <span className="font-semibold font-mono">{cardExpiry || "MM/YY"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Input Form */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-foreground/80 block mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="e.g. Lakshmana Murthy"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground/80 block mb-1">
                      Card Number (RuPay / Visa / MasterCard)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4532 •••• •••• ••••"
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
                        placeholder="08/29"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-foreground/80 block">
                          CVV
                        </label>
                        <span className="text-[10px] text-muted-foreground font-mono">3 Digits</span>
                      </div>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={handleCvcChange}
                        placeholder="•••"
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
                      Save card encrypted via Razorpay Tokenization (RBI Compliant)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 3: NETBANKING ================= */}
            {paymentMethod === "NETBANKING" && (
              <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Select Popular Bank
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "hdfc", name: "HDFC Bank", code: "HDFC" },
                    { id: "sbi", name: "State Bank of India", code: "SBI" },
                    { id: "icici", name: "ICICI Bank", code: "ICICI" },
                    { id: "axis", name: "Axis Bank", code: "AXIS" },
                    { id: "kotak", name: "Kotak Mahindra", code: "KOTAK" },
                    { id: "pnb", name: "Punjab National Bank", code: "PNB" },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBank(b.id)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        selectedBank === b.id
                          ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30"
                          : "border-border bg-background hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <span className="text-xs font-bold block text-foreground">{b.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{b.code}</span>
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
                  You can inspect your package and pay with Cash or UPI QR Code directly to the delivery agent at your doorstep.
                </p>
              </div>
            )}

            {/* Trust Footer */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Razorpay Secured: Encrypted with 256-bit bank standard SSL &amp; RBI Tokenization.</span>
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
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold cursor-pointer"
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
                    placeholder="Coupon: ECOMWEB50"
                    className="w-full pl-8 pr-3 py-2 bg-muted/20 border border-border rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Tag className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={promoLoading || !promoCode.trim()}
                  className="rounded-xl text-xs font-bold h-9 cursor-pointer"
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

            {/* Price Calculations Breakdown in INR */}
            <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500 font-medium">
                  <span>Festival Discount</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Express Delivery</span>
                <span className="font-mono">{shipping === 0 ? "FREE" : formatCurrency(shipping)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>GST (18%)</span>
                <span className="font-mono">{formatCurrency(tax)}</span>
              </div>

              <div className="border-t border-border pt-3 flex justify-between font-black text-base">
                <span>Total Amount</span>
                <span className="font-mono text-primary text-xl">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Razorpay Checkout Primary CTA */}
            <Button
              type="submit"
              disabled={loading || items.length === 0}
              size="lg"
              className="w-full h-14 text-base font-black shadow-xl shadow-primary/20 rounded-2xl bg-gradient-to-r from-primary via-orange-600 to-orange-500 hover:from-primary/90 hover:to-orange-500 text-primary-foreground transition-all mt-2 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to Razorpay...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Pay {formatCurrency(total)} via Razorpay</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>

          {/* Money-Back Guarantee & Return policy assurance */}
          <div className="rounded-2xl border border-border bg-muted/20 p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>E Com Web Buyer Protection</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Every order is protected with Razorpay secure escrow, hassle-free returns, and 100% verified authentic goods.
            </p>
          </div>
        </div>
      </form>

      {/* ================= Interactive Razorpay Payment Modal Dialog ================= */}
      {isRazorpayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-blue-500/30 bg-[#07162c] text-white shadow-2xl overflow-hidden">
            
            {/* Razorpay Brand Header */}
            <div className="bg-[#0c2340] px-6 py-4 flex items-center justify-between border-b border-blue-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xs shadow-md">
                  R
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm tracking-tight text-white">Razorpay</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-1.5 py-0.2 rounded">
                      Trusted
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-200/70 block">E Com Web Marketplace</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-blue-300/60 uppercase block">Amount</span>
                <span className="font-mono font-black text-base text-white">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Modal Body Based on Status */}
            <div className="p-6 space-y-6 text-center">
              {razorpayStep === "PROCESSING" && (
                <div className="py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">Processing Razorpay Payment...</h4>
                    <p className="text-xs text-blue-200/70">
                      Communicating securely with banking gateway &amp; NPCI...
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[11px] text-blue-300/60 font-mono">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span>256-Bit Bank Grade Encryption</span>
                  </div>
                </div>
              )}

              {razorpayStep === "OTP_VERIFY" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">3D Secure 2.0 OTP Verification</h4>
                      <p className="text-xs text-blue-200/70">Enter OTP sent to registered mobile ending in {phone.slice(-4) || "XXXX"}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-950/50 rounded-xl border border-blue-800/40 text-xs text-blue-200">
                    <span>Demo OTP: </span>
                    <span className="font-mono font-bold text-white bg-blue-600/40 px-1.5 py-0.5 rounded">123456</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-blue-200 block mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="123456"
                      className="w-full text-center text-lg font-mono tracking-[0.3em] font-bold py-2.5 rounded-xl bg-slate-900 border border-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsRazorpayModalOpen(false)}
                      className="flex-1 rounded-xl border-blue-800 text-blue-200 hover:bg-blue-900/50 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                    >
                      Authorize {formatCurrency(total)}
                    </Button>
                  </div>
                </form>
              )}

              {razorpayStep === "SUCCESS" && (
                <div className="py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                    <Check className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white">Payment Authorized!</h4>
                    <p className="text-xs text-blue-200/70">
                      Your order has been recorded. Redirecting to invoice...
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Razorpay Modal Footer */}
            <div className="bg-[#05101f] px-6 py-3 border-t border-blue-950 flex items-center justify-between text-[11px] text-blue-300/60">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Powered by Razorpay
              </span>
              <span>PCI-DSS Level 1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
