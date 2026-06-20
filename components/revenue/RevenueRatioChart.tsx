"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  コンテンツ: "#6366f1",
  受託: "#a5b4fc",
  物販: "#fbbf24",
};

export interface RatioDatum {
  name: string;
  value: number;
}

export function RevenueRatioChart({ data }: { data: RatioDatum[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-400 h-full flex items-center justify-center">
        データがありません
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? "#9ca3af"} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
