import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface RecentOrdersTableProps {
  orders: {
    id: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold tracking-tight">Recent Transactions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Latest purchase events captured via Stripe Webhooks
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>View All Orders</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/80 text-muted-foreground">
              <th className="pb-3 font-semibold">Order ID</th>
              <th className="pb-3 font-semibold">Customer</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Total</th>
              <th className="pb-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  No orders recorded yet. Complete a checkout to populate.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-mono font-medium truncate max-w-[120px]">
                    {o.id}
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-foreground">{o.customerName}</div>
                    <div className="text-[11px] text-muted-foreground">{o.customerEmail}</div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        o.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : o.status === "SHIPPED"
                          ? "bg-blue-500/10 text-blue-500"
                          : o.status === "DELIVERED"
                          ? "bg-purple-500/10 text-purple-500"
                          : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-semibold text-foreground">
                    {formatCurrency(o.totalAmount)}
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
