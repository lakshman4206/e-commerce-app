"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  Download,
  ShieldCheck,
  Building2,
  Phone,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

function TrackingContent() {
  const searchParams = useSearchParams();
  const rawOrderId = searchParams.get("orderId") || `ORD-${Date.now()}`;

  // Live Tracking Stage (1 to 4)
  const [trackingStage, setTrackingStage] = useState(2);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    // Check localStorage for saved order or load details
    try {
      const saved = localStorage.getItem("last_ecomweb_order");
      if (saved) {
        setOrderData(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleSimulateCourierProgress = () => {
    setTrackingStage((prev) => (prev < 4 ? prev + 1 : 1));
    toast.success("Courier tracking updated live!");
  };

  const handleDownloadInvoice = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 sm:px-8 py-12 max-w-3xl space-y-8">
      {/* Top Success Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 sm:p-8 text-center space-y-3 shadow-lg">
        <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Order Confirmed &amp; Payment Successful!
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
          Thank you for shopping at <span className="text-foreground font-bold">E Com Web</span>. Your payment was verified through Razorpay and your package is being prioritized for express dispatch.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <span className="px-3 py-1 rounded-full bg-card border border-border text-xs font-mono font-bold text-primary shadow-xs">
            Order #{rawOrderId}
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Verified
          </span>
        </div>
      </div>

      {/* Live Order Tracking Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-black tracking-tight">Live Shipment Tracking</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Courier Partner: <span className="text-foreground font-bold">BlueDart Express Air</span> (AWB: <span className="font-mono text-primary font-bold">BD-{rawOrderId.slice(-7)}IN</span>)
            </p>
          </div>

          <button
            type="button"
            onClick={handleSimulateCourierProgress}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 hover:bg-muted text-foreground text-xs font-bold rounded-xl border border-border transition self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
            <span>Simulate Live Movement</span>
          </button>
        </div>

        {/* Tracking Timeline Stepper */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {/* Step 1: Order Placed */}
          <div className="relative flex items-start gap-4">
            <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-emerald-500/30">
              ✓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">Order Placed &amp; Payment Authorized</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full">
                  Completed
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Instant confirmation received via Razorpay 256-bit gateway.
              </p>
            </div>
          </div>

          {/* Step 2: Quality Check & Packed */}
          <div className="relative flex items-start gap-4">
            <div
              className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                trackingStage >= 2
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {trackingStage >= 2 ? "✓" : "2"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">Packed &amp; Sealed at Warehouse Hub</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    trackingStage >= 2
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {trackingStage >= 2 ? "Processed" : "Pending"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Multi-point barcode scan &amp; tamper-proof packaging completed.
              </p>
            </div>
          </div>

          {/* Step 3: In Transit */}
          <div className="relative flex items-start gap-4">
            <div
              className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                trackingStage >= 3
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                  : trackingStage === 2
                  ? "bg-primary text-primary-foreground animate-pulse"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {trackingStage >= 3 ? "✓" : "3"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">In Transit via BlueDart Express Air</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    trackingStage >= 3
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-primary/10 text-primary font-extrabold"
                  }`}
                >
                  {trackingStage >= 3 ? "In Transit" : "In Progress"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Departed Regional Logistics Hub. On track for next-day doorstep delivery.
              </p>
            </div>
          </div>

          {/* Step 4: Out for Delivery */}
          <div className="relative flex items-start gap-4">
            <div
              className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                trackingStage >= 4
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {trackingStage >= 4 ? "✓" : "4"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">Out for Delivery to Your Address</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    trackingStage >= 4
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {trackingStage >= 4 ? "Out for Delivery" : "Estimated Tomorrow"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Delivery partner will contact your mobile before arrival.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 text-left shadow-md">
        <div className="flex justify-between items-center border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold">Package &amp; Delivery Summary</h3>
          </div>
          <span className="text-xs font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
            PAID &bull; RAZORPAY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border space-y-1">
            <span className="text-muted-foreground font-semibold block">Delivery Destination:</span>
            <p className="font-bold text-foreground leading-relaxed">
              {orderData?.address || "SBI Colony, Anantapur, Andhra Pradesh - 515004, India"}
            </p>
            <p className="text-muted-foreground font-mono">
              Phone: {orderData?.phone || "+91 9876543210"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-muted/20 border border-border space-y-1">
            <span className="text-muted-foreground font-semibold block">Estimated Delivery Date:</span>
            <p className="font-black text-foreground text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Tomorrow by 6:00 PM</span>
            </p>
            <span className="text-[11px] text-emerald-500 font-semibold block">
              Free Express Air Shipping Included
            </span>
          </div>
        </div>

        {/* Download & Actions Bar */}
        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-primary" />
            <span>Download Official GST Tax Invoice (PDF)</span>
          </button>

          <div className="flex items-center gap-3">
            <Button variant="outline" asChild size="sm" className="rounded-xl text-xs font-bold">
              <Link href="/orders">View All Orders</Link>
            </Button>
            <Button asChild size="sm" className="rounded-xl text-xs font-bold bg-gradient-to-r from-primary to-orange-600 text-primary-foreground">
              <Link href="/products" className="flex items-center gap-1.5">
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
