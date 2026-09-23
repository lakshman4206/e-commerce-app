import { getDashboardAnalytics } from "@/actions/analytics";
import { AnalyticsCards } from "@/components/admin/analytics-cards";
import { MonthlyRevenueChart } from "@/components/admin/monthly-revenue-chart";
import { CategorySalesChart } from "@/components/admin/category-sales-chart";
import { RecentOrdersTable } from "@/components/admin/recent-orders-table";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const analytics = await getDashboardAnalytics();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Executive Control Plane</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Platform Analytics</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time transaction telemetry, inventory reserves, and customer growth.
          </p>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <AnalyticsCards summary={analytics.summary} />

      {/* Two Column Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyRevenueChart data={analytics.monthlyRevenue} />
        </div>
        <div className="lg:col-span-1">
          <CategorySalesChart data={analytics.salesByCategory} />
        </div>
      </div>

      {/* Recent Orders Table */}
      <RecentOrdersTable orders={analytics.recentOrders} />
    </div>
  );
}
