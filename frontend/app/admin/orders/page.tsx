import { getAdminOrders, updateOrderStatus } from "@/actions/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Process customer orders, review Stripe payment intents, and trigger fulfillment updates.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                <th className="py-3 px-4 font-semibold">Order / Intent</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Destination</th>
                <th className="py-3 px-4 font-semibold">Items</th>
                <th className="py-3 px-4 font-semibold">Total</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Update Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No orders registered in the system yet.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-foreground">
                        {o.id.slice(0, 12)}...
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {o.stripePaymentIntentId || "Direct Mock Intent"}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold">{o.user?.name || "Customer"}</div>
                      <div className="text-[11px] text-muted-foreground">{o.user?.email}</div>
                    </td>

                    <td className="py-3 px-4 max-w-[180px] truncate text-muted-foreground">
                      {o.address}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-medium">{o.items.length} items</span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {formatCurrency(o.totalAmount)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          o.status === "PAID"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : o.status === "SHIPPED"
                            ? "bg-blue-500/10 text-blue-500"
                            : o.status === "DELIVERED"
                            ? "bg-purple-500/10 text-purple-500"
                            : o.status === "CANCELLED"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {o.status === "PAID" && (
                          <form
                            action={async () => {
                              "use server";
                              await updateOrderStatus(o.id, OrderStatus.SHIPPED);
                            }}
                          >
                            <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5">
                              Ship Order
                            </Button>
                          </form>
                        )}

                        {o.status === "SHIPPED" && (
                          <form
                            action={async () => {
                              "use server";
                              await updateOrderStatus(o.id, OrderStatus.DELIVERED);
                            }}
                          >
                            <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5">
                              Mark Delivered
                            </Button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
