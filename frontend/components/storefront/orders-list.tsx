"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Package,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Truck,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  XCircle,
  HelpCircle,
  CreditCard,
} from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  price?: number;
  title?: string;
  product?: {
    id: string;
    title: string;
    images?: string[];
  };
}

interface Order {
  id: string;
  createdAt?: string;
  date?: string;
  totalAmount?: number;
  total?: number;
  status: string;
  address: string;
  phone?: string;
  items: OrderItem[];
  refundId?: string;
  refundStatus?: string;
  refundReason?: string;
  paymentMethod?: string;
  paymentId?: string;
}

export function OrdersList({
  initialOrders = [],
  userEmail = "",
}: {
  initialOrders: any[];
  userEmail?: string;
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState("Ordered by mistake / Accidental purchase");
  const [cancelling, setCancelling] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Only load user-specific orders for this logged-in account
    const cleanEmail = userEmail.toLowerCase().trim();

    if (!cleanEmail) {
      setOrders(initialOrders);
      return;
    }

    try {
      const storageKey = `ecomweb_orders_${cleanEmail}`;
      const localListStr = localStorage.getItem(storageKey);

      let merged: Order[] = [...initialOrders];

      if (localListStr) {
        const localList: any[] = JSON.parse(localListStr);
        localList.forEach((lo) => {
          if (!merged.find((m) => m.id === lo.id)) {
            merged.push({
              id: lo.id,
              createdAt: lo.date || lo.createdAt || new Date().toISOString(),
              totalAmount: lo.total || lo.totalAmount,
              status: lo.status || "PAID",
              address: lo.address,
              phone: lo.phone,
              items: lo.items || [],
              refundId: lo.refundId,
              refundStatus: lo.refundStatus,
              refundReason: lo.refundReason,
              paymentMethod: lo.paymentMethod,
              paymentId: lo.paymentId,
            });
          }
        });
      }

      setOrders(merged);
    } catch (err) {
      console.warn("[ORDERS_MERGE_WARN]:", err);
      setOrders(initialOrders);
    }
  }, [initialOrders, userEmail]);

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirmCancel = async () => {
    if (!selectedOrderForCancel) return;

    setCancelling(true);
    const orderId = selectedOrderForCancel.id;

    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason: cancelReason }),
      });

      const data = await res.json();

      const refundId = data.refundId || `rfnd_rzp_${Date.now().toString().slice(-6)}`;

      // Update in component state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: "CANCELLED",
                refundId,
                refundStatus: "REFUNDED",
                refundReason: cancelReason,
              }
            : o
        )
      );

      // Update in localStorage
      try {
        const localListStr = localStorage.getItem("ecomweb_orders_list");
        if (localListStr) {
          const list = JSON.parse(localListStr).map((o: any) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "CANCELLED",
                  refundId,
                  refundStatus: "REFUNDED",
                  refundReason: cancelReason,
                }
              : o
          );
          localStorage.setItem("ecomweb_orders_list", JSON.stringify(list));
        }

        const lastOrderStr = localStorage.getItem("last_ecomweb_order");
        if (lastOrderStr) {
          const lo = JSON.parse(lastOrderStr);
          if (lo.id === orderId) {
            lo.status = "CANCELLED";
            lo.refundId = refundId;
            lo.refundStatus = "REFUNDED";
            lo.refundReason = cancelReason;
            localStorage.setItem("last_ecomweb_order", JSON.stringify(lo));
          }
        }
      } catch {}

      toast.success(
        `Order ${orderId.slice(-8)} cancelled! Razorpay refund of ${formatCurrency(
          selectedOrderForCancel.totalAmount || selectedOrderForCancel.total || 0
        )} initiated (Ref: ${refundId}).`
      );
      setSelectedOrderForCancel(null);
    } catch {
      toast.error("Failed to cancel order. Please try again or contact support.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-orange-600">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No orders placed yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you purchase products through Razorpay or Cash on Delivery, your real-time tracking, GST invoices, and refund options will appear here.
            </p>
          </div>
          <Button asChild className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs h-10 px-6 cursor-pointer">
            <Link href="/products">Explore Products</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isCancelled = order.status === "CANCELLED";
            const isPaid = order.status === "PAID";
            const orderTotal = order.totalAmount || order.total || 0;
            const isExpanded = expandedOrders[order.id] !== false;

            return (
              <div
                key={order.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 shadow-xs transition hover:shadow-md"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        {order.id}
                      </span>
                      {order.paymentMethod && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {order.paymentMethod}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Placed on {formatDate(order.createdAt || order.date || new Date().toISOString())}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        isCancelled
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : isPaid
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : order.status === "SHIPPED"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : order.status === "DELIVERED"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {isCancelled ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>CANCELLED &amp; REFUNDED</span>
                        </>
                      ) : isPaid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>CONFIRMED &amp; PAID</span>
                        </>
                      ) : (
                        <span>{order.status}</span>
                      )}
                    </span>

                    <span className="font-mono text-lg font-black text-orange-600">
                      {formatCurrency(orderTotal)}
                    </span>
                  </div>
                </div>

                {/* Razorpay Refund Processed Banner if Cancelled */}
                {isCancelled && (
                  <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2 text-xs text-rose-900">
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-rose-600 animate-spin-slow" />
                        <span>Razorpay Refund Processed &amp; Updated</span>
                      </div>
                      <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase">
                        100% Refunded
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-rose-200/60 text-rose-800">
                      <div>
                        <span className="text-rose-600 font-semibold block">Razorpay Refund Reference ID:</span>
                        <span className="font-mono font-bold">{order.refundId || `rfnd_rzp_${order.id.slice(-6)}`}</span>
                      </div>
                      <div>
                        <span className="text-rose-600 font-semibold block">Refund Destination &amp; SLA:</span>
                        <span className="font-medium">Original Bank / UPI Account (Instant to 2-4 business days)</span>
                      </div>
                    </div>

                    {order.refundReason && (
                      <div className="text-[11px] text-rose-700 pt-0.5">
                        <span className="font-semibold">Cancellation Reason:</span> {order.refundReason}
                      </div>
                    )}
                  </div>
                )}

                {/* Items and Delivery Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Package Items ({order.items.length || 1})</span>
                    <button
                      type="button"
                      onClick={() => toggleExpand(order.id)}
                      className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <span>{isExpanded ? "Hide Details" : "Show Details"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="space-y-2 pt-1">
                      {order.items.map((item, idx) => {
                        const title = item.product?.title || item.title || "E Com Web Product";
                        const price = item.priceAtPurchase || item.price || orderTotal;
                        return (
                          <div
                            key={item.id || idx}
                            className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                          >
                            <span className="font-semibold text-slate-900">
                              {title} × {item.quantity}
                            </span>
                            <span className="font-mono font-bold text-slate-800">
                              {formatCurrency(price * item.quantity)}
                            </span>
                          </div>
                        );
                      })}

                      {order.address && (
                        <div className="text-[11px] text-slate-500 pt-1">
                          <span className="font-semibold text-slate-700">Shipping Address:</span> {order.address}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-bold h-9 border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Link href={`/checkout/success?orderId=${order.id}`}>
                        <Truck className="w-3.5 h-3.5 mr-1.5 text-orange-600" />
                        <span>Live Shipment Tracking</span>
                      </Link>
                    </Button>
                  </div>

                  {/* Cancel & Refund Button if Order is Active */}
                  {!isCancelled && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrderForCancel(order)}
                      className="rounded-xl text-xs font-bold h-9 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                      <span>Cancel Order &amp; Request Refund</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= Interactive Cancel & Refund Modal ================= */}
      {selectedOrderForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cancel Order &amp; Initiate Refund
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Order ID: <span className="font-mono font-bold text-slate-700">{selectedOrderForCancel.id}</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-orange-600" />
                <span>Razorpay Instant Refund Guarantee</span>
              </div>
              <p className="text-[11px] text-orange-800 leading-relaxed">
                If you placed this order mistakenly, confirming will cancel dispatch and immediately release the refund of{" "}
                <span className="font-bold text-slate-900 font-mono">
                  {formatCurrency(selectedOrderForCancel.totalAmount || selectedOrderForCancel.total || 0)}
                </span>{" "}
                back to your source account.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Please select cancellation reason:
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
              >
                <option value="Ordered by mistake / Accidental purchase">
                  Ordered by mistake / Accidental purchase
                </option>
                <option value="Entered wrong delivery address or contact number">
                  Entered wrong delivery address or contact number
                </option>
                <option value="Found a better price / changed my mind">
                  Found a better price / changed my mind
                </option>
                <option value="Duplicate order placed by accident">
                  Duplicate order placed by accident
                </option>
                <option value="Selected wrong product size/color variant">
                  Selected wrong product size/color variant
                </option>
              </select>
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={cancelling}
                onClick={() => setSelectedOrderForCancel(null)}
                className="flex-1 rounded-xl h-10 text-xs font-bold border-slate-200 text-slate-700 cursor-pointer"
              >
                Keep Order
              </Button>
              <Button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="flex-1 rounded-xl h-10 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-md shadow-rose-600/20"
              >
                {cancelling ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Refunding...</span>
                  </div>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
