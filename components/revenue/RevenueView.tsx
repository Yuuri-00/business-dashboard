"use client";

import { useMemo, useState } from "react";
import { REVENUE_CATEGORY_OPTIONS } from "@/lib/notion/constants";
import { formatYen } from "@/lib/format";
import { RevenueRatioChart } from "./RevenueRatioChart";
import type { Revenue, RevenueCategory } from "@/types/notion";

export interface RevenueRecordItem {
  revenue: Revenue;
  linkedLabel: string | null;
}

type Period = "月次" | "四半期" | "年次";
type CategoryFilter = "すべて" | RevenueCategory;

const PERIODS: Period[] = ["月次", "四半期", "年次"];

function getPeriodRange(period: Period, now: Date): [Date, Date] {
  if (period === "月次") {
    return [
      new Date(now.getFullYear(), now.getMonth(), 1),
      new Date(now.getFullYear(), now.getMonth() + 1, 1),
    ];
  }
  if (period === "四半期") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    return [
      new Date(now.getFullYear(), quarterStartMonth, 1),
      new Date(now.getFullYear(), quarterStartMonth + 3, 1),
    ];
  }
  return [new Date(now.getFullYear(), 0, 1), new Date(now.getFullYear() + 1, 0, 1)];
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function RevenueView({ records }: { records: RevenueRecordItem[] }) {
  const [period, setPeriod] = useState<Period>("月次");
  const [category, setCategory] = useState<CategoryFilter>("すべて");

  const now = useMemo(() => new Date(), []);
  const [periodStart, periodEnd] = useMemo(
    () => getPeriodRange(period, now),
    [period, now]
  );

  const filtered = useMemo(
    () =>
      records.filter(({ revenue }) => {
        if (!revenue.date) return false;
        const d = new Date(revenue.date);
        if (d < periodStart || d >= periodEnd) return false;
        if (category !== "すべて" && revenue.category !== category) return false;
        return true;
      }),
    [records, periodStart, periodEnd, category]
  );

  const totalForPeriod = filtered.reduce(
    (sum, { revenue }) => sum + (revenue.amount ?? 0),
    0
  );

  const unpaidRecords = records.filter(({ revenue }) => revenue.paymentStatus === "未収");
  const unpaidTotal = unpaidRecords.reduce(
    (sum, { revenue }) => sum + (revenue.amount ?? 0),
    0
  );

  const ratioData = REVENUE_CATEGORY_OPTIONS.map((c) => ({
    name: c,
    value: filtered
      .filter(({ revenue }) => revenue.category === c)
      .reduce((sum, { revenue }) => sum + (revenue.amount ?? 0), 0),
  })).filter((d) => d.value > 0);

  function handleExportCsv() {
    const year = now.getFullYear();
    const yearRecords = records.filter(
      ({ revenue }) => revenue.date && new Date(revenue.date).getFullYear() === year
    );
    const rows: string[][] = [["カテゴリ", "金額"]];
    for (const c of REVENUE_CATEGORY_OPTIONS) {
      const total = yearRecords
        .filter(({ revenue }) => revenue.category === c)
        .reduce((sum, { revenue }) => sum + (revenue.amount ?? 0), 0);
      rows.push([c, String(total)]);
    }
    const grandTotal = yearRecords.reduce(
      (sum, { revenue }) => sum + (revenue.amount ?? 0),
      0
    );
    rows.push(["合計", String(grandTotal)]);
    downloadCsv(`revenue-${year}.csv`, rows);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs">
          {PERIODS.map((p, i) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={[
                "px-3 py-1.5",
                i > 0 ? "border-l border-gray-300" : "",
                p === period ? "bg-indigo-600 text-white font-medium" : "text-gray-500",
              ].join(" ")}
            >
              {p}
            </button>
          ))}
        </div>

        <span className="w-px h-5 bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={() => setCategory("すべて")}
          className={
            category === "すべて"
              ? "text-xs px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-medium"
              : "text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-500"
          }
        >
          すべて
        </button>
        {REVENUE_CATEGORY_OPTIONS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={
              category === c
                ? "text-xs px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 font-medium"
                : "text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-500"
            }
          >
            {c}収益
          </button>
        ))}

        <button
          type="button"
          onClick={handleExportCsv}
          title="今年のカテゴリ別合計をCSVで出力します（表示中の絞り込みとは無関係に年間集計）"
          className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-100"
        >
          CSV出力（年間集計）
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
          <p className="text-xs text-amber-600">未収（入金待ち）合計</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{formatYen(unpaidTotal)}</p>
          <p className="text-xs text-amber-500 mt-1">{unpaidRecords.length}件</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400">{period}の合計収益</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatYen(totalForPeriod)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 row-span-2 flex flex-col">
          <p className="text-xs text-gray-400 mb-2">カテゴリ別比率</p>
          <RevenueRatioChart data={ratioData} />
        </div>

        <div className="col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-400">
              <tr>
                <th className="text-left font-medium px-4 py-2">日付</th>
                <th className="text-left font-medium px-4 py-2">金額</th>
                <th className="text-left font-medium px-4 py-2">カテゴリ</th>
                <th className="text-left font-medium px-4 py-2">紐付け先</th>
                <th className="text-left font-medium px-4 py-2">入金状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    対象期間のデータはありません
                  </td>
                </tr>
              ) : (
                filtered
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.revenue.date ?? 0).getTime() -
                      new Date(a.revenue.date ?? 0).getTime()
                  )
                  .map(({ revenue, linkedLabel }) => (
                    <tr key={revenue.id}>
                      <td className="px-4 py-2.5 text-gray-500">{revenue.date}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">
                        {formatYen(revenue.amount ?? 0)}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{revenue.category}</td>
                      <td className="px-4 py-2.5 text-gray-600">{linkedLabel ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={
                            revenue.paymentStatus === "入金済み"
                              ? "text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-600 font-medium"
                              : "text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-600 font-medium"
                          }
                        >
                          {revenue.paymentStatus}
                        </span>
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
