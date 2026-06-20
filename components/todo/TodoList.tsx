"use client";

import { useOptimistic, useTransition } from "react";
import { toggleTaskStatusAction } from "@/app/(app)/todo/actions";
import type { Task, TaskStatus } from "@/types/notion";

export interface TodoItem {
  task: Task;
  relatedLabel: string | null;
  relatedColor: string | null;
}

function dueBadge(due: string | null, todayStart: Date) {
  if (!due) return null;
  const dueDate = new Date(due);
  if (dueDate < todayStart) {
    return { text: "期限切れ", className: "bg-red-100 text-red-600" };
  }
  if (dueDate.getTime() === todayStart.getTime()) {
    return { text: "今日", className: "bg-amber-100 text-amber-600" };
  }
  return {
    text: `${dueDate.getMonth() + 1}/${dueDate.getDate()}まで`,
    className: "bg-indigo-50 text-gray-500",
  };
}

function TaskRow({
  item,
  todayStart,
  onToggle,
}: {
  item: TodoItem;
  todayStart: Date;
  onToggle: (item: TodoItem) => void;
}) {
  const { task, relatedLabel, relatedColor } = item;
  const isDone = task.status === "完了";
  const badge = dueBadge(task.due, todayStart);

  return (
    <li className={`flex items-center gap-3 px-4 py-3 ${isDone ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        checked={isDone}
        onChange={() => onToggle(item)}
        className="w-4 h-4 accent-indigo-600"
      />
      <span
        className={`flex-1 text-sm text-gray-700 ${isDone ? "line-through text-gray-500" : ""}`}
      >
        {task.title}
      </span>
      {badge && (
        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${badge.className}`}>
          {badge.text}
        </span>
      )}
      {relatedLabel && (
        <span
          className="text-[10px] px-2 py-0.5 rounded font-medium"
          style={
            relatedColor
              ? { background: relatedColor, color: "#fff" }
              : { background: "#f3f4f6", color: "#6b7280" }
          }
        >
          {relatedLabel}
        </span>
      )}
    </li>
  );
}

export function TodoList({ items }: { items: TodoItem[] }) {
  const [optimisticItems, applyOptimisticUpdate] = useOptimistic(
    items,
    (state, update: { id: string; status: TaskStatus }) =>
      state.map((item) =>
        item.task.id === update.id
          ? { ...item, task: { ...item.task, status: update.status } }
          : item
      )
  );
  const [, startTransition] = useTransition();

  function handleToggle(item: TodoItem) {
    const nextStatus: TaskStatus = item.task.status === "完了" ? "未着手" : "完了";
    startTransition(async () => {
      applyOptimisticUpdate({ id: item.task.id, status: nextStatus });
      await toggleTaskStatusAction(item.task.id, nextStatus);
    });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const urgentIds = new Set(
    optimisticItems
      .filter(
        (item) =>
          item.task.status !== "完了" &&
          item.task.due &&
          new Date(item.task.due) <= todayStart
      )
      .map((item) => item.task.id)
  );
  const urgent = optimisticItems.filter((item) => urgentIds.has(item.task.id));
  const rest = optimisticItems.filter((item) => !urgentIds.has(item.task.id));

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xs font-semibold text-red-500 uppercase mb-2">
          期限切れ・今日
        </h2>
        {urgent.length === 0 ? (
          <p className="text-sm text-gray-400">期限切れ・今日のタスクはありません</p>
        ) : (
          <ul className="bg-white rounded-xl border border-red-200 divide-y divide-gray-100">
            {urgent.map((item) => (
              <TaskRow
                key={item.task.id}
                item={item}
                todayStart={todayStart}
                onToggle={handleToggle}
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase mb-2">
          それ以外
        </h2>
        {rest.length === 0 ? (
          <p className="text-sm text-gray-400">タスクはありません</p>
        ) : (
          <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {rest.map((item) => (
              <TaskRow
                key={item.task.id}
                item={item}
                todayStart={todayStart}
                onToggle={handleToggle}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
