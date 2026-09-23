import { formatCurrency } from "@/lib/utils";
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp } from "lucide-react";

interface AnalyticsCardsProps {
  summary: {
    totalRevenue: number;
    totalSales: number;
    totalCustomers: number;
    lowStockCount: number;
  };
}

export function AnalyticsCards({ summary }: AnalyticsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Gross Revenue */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Revenue
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {formatCurrency(summary.totalRevenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2% from previous cycle</span>
          </div>
        </div>
      </div>

      {/* Total Orders */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Completed Sales
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {summary.totalSales}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Verified Stripe transactions
          </div>
        </div>
      </div>

      {/* Total Customers */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Active Customers
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {summary.totalCustomers}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            Registered customer accounts
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Low Stock Alerts
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              summary.lowStockCount > 0
                ? "bg-amber-500/10 text-amber-500"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tracking-tight">
            {summary.lowStockCount}
          </div>
          <div
            className={`text-[11px] mt-1 font-medium ${
              summary.lowStockCount > 0 ? "text-amber-500" : "text-muted-foreground"
            }`}
          >
            {summary.lowStockCount > 0
              ? "SKUs requiring replenishment (< 5 units)"
              : "Inventory levels optimal"}
          </div>
        </div>
      </div>
    </div>
  );
}
