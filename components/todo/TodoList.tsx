"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  deleteTaskAction,
  toggleTaskStatusAction,
  updateTaskAction,
} from "@/app/(app)/todo/actions";
import { TaskEditModal } from "./TaskEditModal";
import type { Account, ClientProject, Post, Task, TaskStatus } from "@/types/notion";

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
  onEdit,
}: {
  item: TodoItem;
  todayStart: Date;
  onToggle: (item: TodoItem) => void;
  onEdit: (task: Task) => void;
}) {
  const { task, relatedLabel, relatedColor } = item;
  const isDone = task.status === "完了";
  const badge = dueBadge(task.due, todayStart);

  return (
    <li className={`flex flex-wrap items-center gap-3 px-4 py-3 ${isDone ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        checked={isDone}
        onChange={() => onToggle(item)}
        className="w-4 h-4 accent-indigo-600"
      />
      <span
        className={`flex-1 min-w-0 text-sm text-gray-700 ${isDone ? "line-through text-gray-500" : ""}`}
      >
        {task.title}
      </span>
      {!task.due && (
        <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-gray-100 text-gray-400">
          未定
        </span>
      )}
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
      <button
        type="button"
        onClick={() => onEdit(task)}
        className="text-gray-400 hover:text-gray-700"
        aria-label="編集"
      >
        ✎
      </button>
    </li>
  );
}

interface TodoListProps {
  items: TodoItem[];
  posts: Post[];
  clientProjects: ClientProject[];
  accounts: Account[];
}

export function TodoList({ items, posts, clientProjects, accounts }: TodoListProps) {
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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditPending, startEditTransition] = useTransition();

  function handleToggle(item: TodoItem) {
    const nextStatus: TaskStatus = item.task.status === "完了" ? "未着手" : "完了";
    startTransition(async () => {
      applyOptimisticUpdate({ id: item.task.id, status: nextStatus });
      await toggleTaskStatusAction(item.task.id, nextStatus);
    });
  }

  function handleUpdate(formData: FormData) {
    if (!editingTask) return;
    startEditTransition(async () => {
      await updateTaskAction(editingTask.id, formData);
      setEditingTask(null);
    });
  }

  function handleDelete() {
    if (!editingTask) return;
    if (!confirm("このタスクを削除しますか？")) return;
    startEditTransition(async () => {
      await deleteTaskAction(editingTask.id);
      setEditingTask(null);
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
                onEdit={setEditingTask}
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
                onEdit={setEditingTask}
              />
            ))}
          </ul>
        )}
      </section>

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          posts={posts}
          clientProjects={clientProjects}
          accounts={accounts}
          onSubmit={handleUpdate}
          onClose={() => setEditingTask(null)}
          onDelete={handleDelete}
          pending={isEditPending}
        />
      )}
    </div>
  );
}
