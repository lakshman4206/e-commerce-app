import { getAdminOrders, updateOrderStatus, cancelAndRefundOrder } from "@/actions/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { RotateCcw, Truck, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  let orders: any[] = [];
  try {
    orders = await getAdminOrders();
  } catch (e) {
    console.warn("[ADMIN_ORDERS_PAGE_WARN]:", e);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order &amp; Refund Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Process customer orders, review Razorpay payment IDs, trigger 1-click Razorpay refunds, and update fulfillment.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Razorpay Connected: rzp_test_Tfspe4VRbIAaRx</span>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="py-3.5 px-4 font-bold">Order / Razorpay ID</th>
                <th className="py-3.5 px-4 font-bold">Customer</th>
                <th className="py-3.5 px-4 font-bold">Delivery Address</th>
                <th className="py-3.5 px-4 font-bold">Items</th>
                <th className="py-3.5 px-4 font-bold">Total</th>
                <th className="py-3.5 px-4 font-bold">Current Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions &amp; Refunds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No orders registered in the system yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isCancelled = o.status === "CANCELLED";
                  const isPaid = o.status === "PAID";

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          {o.id.slice(0, 14)}...
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {o.stripePaymentIntentId || "Razorpay Direct"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatDate(o.createdAt)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{o.user?.name || "Customer"}</div>
                        <div className="text-[11px] text-slate-500">{o.user?.email || "customer@ecomweb.store"}</div>
                        {o.phone && <div className="text-[10px] font-mono text-slate-400">{o.phone}</div>}
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-600">
                        {o.address}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{o.items.length} items</span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-orange-600 text-sm">
                        {formatCurrency(o.totalAmount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                            isCancelled
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : o.status === "SHIPPED"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : o.status === "DELIVERED"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {isCancelled ? (
                            <>
                              <XCircle className="w-3 h-3" />
                              <span>REFUNDED</span>
                            </>
                          ) : isPaid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>PAID</span>
                            </>
                          ) : (
                            <span>{o.status}</span>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Ship Order */}
                          {o.status === "PAID" && (
                            <form
                              action={async () => {
                                "use server";
                                await updateOrderStatus(o.id, OrderStatus.SHIPPED);
                              }}
                            >
                              <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5 rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer">
                                <Truck className="w-3 h-3 mr-1" />
                                <span>Ship</span>
                              </Button>
                            </form>
                          )}

                          {/* Mark Delivered */}
                          {o.status === "SHIPPED" && (
                            <form
                              action={async () => {
                                "use server";
                                await updateOrderStatus(o.id, OrderStatus.DELIVERED);
                              }}
                            >
                              <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                <span>Delivered</span>
                              </Button>
                            </form>
                          )}

                          {/* Process Razorpay Refund button for Admin */}
                          {!isCancelled && (
                            <form
                              action={async () => {
                                "use server";
                                await cancelAndRefundOrder(o.id, "Admin initiated Razorpay refund");
                              }}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[11px] h-7 px-2.5 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer font-semibold"
                              >
                                <RotateCcw className="w-3 h-3 mr-1 text-rose-600" />
                                <span>Process Refund</span>
                              </Button>
                            </form>
                          )}

                          {isCancelled && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Refund Settled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
