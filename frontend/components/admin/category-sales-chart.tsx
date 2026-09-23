"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CategorySalesChartProps {
  data: {
    categoryName: string;
    totalSales: number;
    percentage: number;
  }[];
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

export function CategorySalesChart({ data }: CategorySalesChartProps) {
  const chartData = data.length > 0 ? data : [
    { categoryName: "Electronics", totalSales: 349, percentage: 65 },
    { categoryName: "Apparel", totalSales: 110, percentage: 20 },
    { categoryName: "Lifestyle", totalSales: 78, percentage: 15 },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
      <div>
        <h3 className="text-base font-bold tracking-tight">Sales by Category</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Proportional revenue generation across departments
        </p>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-border bg-card p-2.5 shadow-lg space-y-1">
                      <p className="text-xs font-semibold">{d.categoryName}</p>
                      <p className="text-xs font-mono font-bold text-primary">
                        {formatCurrency(d.totalSales)} ({d.percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="totalSales"
              nameKey="categoryName"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        {chartData.map((item, index) => (
          <div key={item.categoryName} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-muted-foreground">{item.categoryName}</span>
            <span className="font-mono font-semibold text-foreground">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
