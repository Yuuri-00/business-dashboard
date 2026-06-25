"use client";

import { PostForm } from "./PostForm";
import type { Account, Post } from "@/types/notion";

interface PostFormModalProps {
  accounts: Account[];
  defaultValue?: Post;
  defaultDate?: Date;
  onSubmit: (formData: FormData) => void;
  onClose: () => void;
  onDelete?: () => void;
  submitLabel: string;
  pending: boolean;
  title: string;
}

export function PostFormModal({
  accounts,
  defaultValue,
  defaultDate,
  onSubmit,
  onClose,
  onDelete,
  submitLabel,
  pending,
  title,
}: PostFormModalProps) {
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
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>
        <PostForm
          accounts={accounts}
          defaultValue={defaultValue}
          defaultDate={defaultDate}
          onSubmit={onSubmit}
          onCancel={onClose}
          onDelete={onDelete}
          submitLabel={submitLabel}
          pending={pending}
        />
      </div>
    </div>
  );
}
