"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { REVENUE_CATEGORY_OPTIONS } from "@/lib/notion/constants";

const CATEGORY_COLORS: Record<string, string> = {
  コンテンツ: "#6366f1",
  受託: "#a5b4fc",
  物販: "#fbbf24",
};

export interface MonthlyRevenuePoint {
  month: string;
  [category: string]: string | number;
}

export function RevenueChart({ data }: { data: MonthlyRevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {REVENUE_CATEGORY_OPTIONS.map((category) => (
          <Bar
            key={category}
            dataKey={category}
            stackId="revenue"
            fill={CATEGORY_COLORS[category]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
