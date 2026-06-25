"use client";

import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/lib/notion/constants";
import type { Account, ClientProject, Post, Task } from "@/types/notion";

interface TaskEditModalProps {
  task: Task;
  posts: Post[];
  clientProjects: ClientProject[];
  accounts: Account[];
  onSubmit: (formData: FormData) => void;
  onClose: () => void;
  onDelete: () => void;
  pending: boolean;
}

export function TaskEditModal({
  task,
  posts,
  clientProjects,
  accounts,
  onSubmit,
  onClose,
  onDelete,
  pending,
}: TaskEditModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border border-gray-200 p-5 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">タスクを編集</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">タイトル</label>
            <input
              name="title"
              type="text"
              defaultValue={task.title}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                期限（空欄で未定）
              </label>
              <input
                name="due"
                type="date"
                defaultValue={task.due ?? ""}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">優先度</label>
              <select
                name="priority"
                defaultValue={task.priority ?? TASK_PRIORITY_OPTIONS[1]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600"
              >
                {TASK_PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">状態</label>
              <select
                name="status"
                defaultValue={task.status ?? TASK_STATUS_OPTIONS[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600"
              >
                {TASK_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">関連投稿</label>
              <select
                name="relatedPostId"
                defaultValue={task.relatedPostId ?? ""}
                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-xs text-gray-600"
              >
                <option value="">なし</option>
                {posts.map((post) => (
                  <option key={post.id} value={post.id}>
                    {post.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">関連案件</label>
              <select
                name="relatedProjectId"
                defaultValue={task.relatedProjectId ?? ""}
                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-xs text-gray-600"
              >
                <option value="">なし</option>
                {clientProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                関連アカウント
              </label>
              <select
                name="relatedAccountId"
                defaultValue={task.relatedAccountId ?? ""}
                className="w-full border border-gray-300 rounded-lg px-2 py-2 text-xs text-gray-600"
              >
                <option value="">なし</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={onDelete}
              className="text-sm text-red-500 hover:underline"
            >
              削除
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-500 text-sm"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
