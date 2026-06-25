"use client";

import { useMemo, useState, useTransition } from "react";
import {
  archivePostAction,
  createPostAction,
  updatePostAction,
} from "@/app/(app)/calendar/actions";
import type { Account, Post } from "@/types/notion";
import { AccountFilterChips } from "./AccountFilterChips";
import { MonthGrid } from "./MonthGrid";
import { PostFormModal } from "./PostFormModal";
import { WeekGrid } from "./WeekGrid";

type View = "month" | "week";
type ModalState = { mode: "create"; date: Date } | { mode: "edit"; post: Post };

function getWeekStart(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

interface CalendarViewProps {
  accounts: Account[];
  posts: Post[];
}

export function CalendarView({ accounts, posts }: CalendarViewProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(accounts.map((a) => a.name))
  );
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      await createPostAction(formData);
      setModalState(null);
    });
  }

  function handleUpdate(id: string, formData: FormData) {
    startTransition(async () => {
      await updatePostAction(id, formData);
      setModalState(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("この投稿を削除しますか？")) return;
    startTransition(async () => {
      await archivePostAction(id);
      setModalState(null);
    });
  }

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

  function goToPrevious() {
    setCursor((prev) => {
      if (view === "month") {
        return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      }
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  }

  function goToNext() {
    setCursor((prev) => {
      if (view === "month") {
        return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      }
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  }

  const weekStart = getWeekStart(cursor);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const headerLabel =
    view === "month"
      ? `${cursor.getFullYear()}年${cursor.getMonth() + 1}月`
      : `${weekStart.getFullYear()}年${weekStart.getMonth() + 1}月${weekStart.getDate()}日 〜 ${
          weekEnd.getMonth() + 1
        }月${weekEnd.getDate()}日`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
            onClick={() => setView("month")}
            className={
              view === "month"
                ? "text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium"
                : "text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-500"
            }
          >
            月表示
          </button>
          <button
            type="button"
            onClick={() => setView("week")}
            className={
              view === "week"
                ? "text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium"
                : "text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-500"
            }
          >
            週表示
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
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
            onClick={goToPrevious}
            className="text-gray-400 hover:text-gray-700"
          >
            ←
          </button>
          <h2 className="font-semibold text-gray-800">{headerLabel}</h2>
          <button
            type="button"
            onClick={goToNext}
            className="text-gray-400 hover:text-gray-700"
          >
            →
          </button>
        </div>

        {view === "month" ? (
          <MonthGrid
            year={cursor.getFullYear()}
            month={cursor.getMonth()}
            posts={visiblePosts}
            onDayClick={(date) => setModalState({ mode: "create", date })}
            onPostClick={(post) => setModalState({ mode: "edit", post })}
          />
        ) : (
          <WeekGrid
            weekStart={weekStart}
            posts={visiblePosts}
            onDayClick={(date) => setModalState({ mode: "create", date })}
            onPostClick={(post) => setModalState({ mode: "edit", post })}
          />
        )}
      </div>

      {modalState && (
        <PostFormModal
          accounts={accounts}
          title={modalState.mode === "create" ? "投稿を追加" : "投稿を編集"}
          defaultValue={modalState.mode === "edit" ? modalState.post : undefined}
          defaultDate={modalState.mode === "create" ? modalState.date : undefined}
          onSubmit={(formData) =>
            modalState.mode === "create"
              ? handleCreate(formData)
              : handleUpdate(modalState.post.id, formData)
          }
          onClose={() => setModalState(null)}
          onDelete={
            modalState.mode === "edit"
              ? () => handleDelete(modalState.post.id)
              : undefined
          }
          submitLabel={modalState.mode === "create" ? "追加する" : "保存"}
          pending={isPending}
        />
      )}
    </div>
  );
}
