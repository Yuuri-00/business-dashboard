"use client";

import { POST_STATUS_OPTIONS } from "@/lib/notion/constants";
import type { Account, Post } from "@/types/notion";

function toDateInputValue(date: string | null): string {
  if (!date) return "";
  return date.slice(0, 10);
}

interface PostFormProps {
  accounts: Account[];
  defaultValue?: Post;
  defaultDate?: Date;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel: string;
  pending: boolean;
}

export function PostForm({
  accounts,
  defaultValue,
  defaultDate,
  onSubmit,
  onCancel,
  onDelete,
  submitLabel,
  pending,
}: PostFormProps) {
  const defaultPublishDate = defaultValue
    ? toDateInputValue(defaultValue.publishDate)
    : defaultDate
      ? `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, "0")}-${String(defaultDate.getDate()).padStart(2, "0")}`
      : "";

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-gray-500 block mb-1">タイトル</label>
        <input
          name="title"
          type="text"
          defaultValue={defaultValue?.title}
          placeholder="例：新作リリース告知"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">アカウント</label>
          <select
            name="accountId"
            defaultValue={defaultValue?.accountId ?? accounts[0]?.id ?? ""}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">状態</label>
          <select
            name="status"
            defaultValue={defaultValue?.status ?? POST_STATUS_OPTIONS[0]}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600"
          >
            {POST_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">公開日時</label>
          <input
            name="publishDate"
            type="date"
            defaultValue={defaultPublishDate}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">URL（任意）</label>
          <input
            name="url"
            type="url"
            defaultValue={defaultValue?.url ?? undefined}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>
      <div className="flex justify-between items-center pt-2">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="text-sm text-red-500 hover:underline"
          >
            削除
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-500 text-sm"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
