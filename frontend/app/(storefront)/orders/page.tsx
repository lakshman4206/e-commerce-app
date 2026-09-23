import { getCustomerOrders } from "@/actions/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";

export default async function CustomerOrdersPage() {
  const orders = await getCustomerOrders();

  return (
    <div className="container mx-auto px-4 sm:px-8 py-10 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Order History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your previous acquisitions, receipts, and fulfillment status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold">No orders discovered yet</p>
          <p className="text-xs text-muted-foreground">
            When you purchase items, your receipts and tracking updates appear here.
          </p>
          <Button asChild size="sm">
            <Link href="/products">Explore Catalog</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-border bg-card p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
                <div>
                  <div className="text-xs font-mono text-muted-foreground">
                    Order ID: {order.id}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Placed on {formatDate(order.createdAt)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      order.status === "PAID"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : order.status === "SHIPPED"
                        ? "bg-blue-500/10 text-blue-500"
                        : order.status === "DELIVERED"
                        ? "bg-purple-500/10 text-purple-500"
                        : order.status === "CANCELLED"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="font-mono text-base font-bold text-foreground">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-xs text-muted-foreground"
                  >
                    <span className="text-foreground font-medium">
                      {item.product.title} × {item.quantity}
                    </span>
                    <span className="font-mono">
                      {formatCurrency(item.priceAtPurchase * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
