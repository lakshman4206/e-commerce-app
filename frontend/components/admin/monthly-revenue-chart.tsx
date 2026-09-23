"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface MonthlyRevenueChartProps {
  data: {
    month: string;
    revenue: number;
    orderCount: number;
  }[];
}

export function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold tracking-tight">Revenue Trajectory</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gross revenue generated per month in current calendar year
          </p>
        </div>
        <span className="text-xs font-mono bg-muted text-muted-foreground px-2.5 py-1 rounded-full">
          FY {new Date().getFullYear()}
        </span>
      </div>

      <div className="h-[280px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" opacity={0.3} />
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-border bg-card p-3 shadow-lg space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground">
                        {d.month}
                      </p>
                      <p className="text-sm font-bold font-mono text-primary">
                        {formatCurrency(d.revenue)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {d.orderCount} orders completed
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="revenue"
              fill="currentColor"
              className="fill-primary"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
