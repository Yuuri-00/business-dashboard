"use client";

import { useMemo, useState } from "react";
import type { Account, Post } from "@/types/notion";
import { AccountFilterChips } from "./AccountFilterChips";
import { MonthGrid } from "./MonthGrid";

interface CalendarViewProps {
  accounts: Account[];
  posts: Post[];
}

export function CalendarView({ accounts, posts }: CalendarViewProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(accounts.map((a) => a.name))
  );
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const visiblePosts = useMemo(
    () => posts.filter((post) => post.accountName && selected.has(post.accountName)),
    [posts, selected]
  );

  function toggleAccount(accountName: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(accountName)) {
        next.delete(accountName);
      } else {
        next.add(accountName);
      }
      return next;
    });
  }

  function goToPreviousMonth() {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <AccountFilterChips
          accounts={accounts}
          selected={selected}
          onToggle={toggleAccount}
          onSelectAll={() => setSelected(new Set(accounts.map((a) => a.name)))}
          onDeselectAll={() => setSelected(new Set())}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium"
          >
            月表示
          </button>
          <button
            type="button"
            disabled
            title="週表示は未実装です"
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-400 cursor-not-allowed"
          >
            週表示
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full border-2 border-dashed border-gray-400 inline-block" />
          企画中
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full border-2 border-gray-400 inline-block" />
          制作中
        </span>
        <span className="flex items-center gap-1">🕒 予約済</span>
        <span className="flex items-center gap-1">✓ 公開済</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className="text-gray-400 hover:text-gray-700"
          >
            ←
          </button>
          <h2 className="font-semibold text-gray-800">
            {cursor.getFullYear()}年{cursor.getMonth() + 1}月
          </h2>
          <button
            type="button"
            onClick={goToNextMonth}
            className="text-gray-400 hover:text-gray-700"
          >
            →
          </button>
        </div>

        <MonthGrid
          year={cursor.getFullYear()}
          month={cursor.getMonth()}
          posts={visiblePosts}
        />
      </div>
    </div>
  );
}
