"use client";

import { useRef, useTransition } from "react";
import { quickAddTaskAction } from "@/app/(app)/todo/actions";
import type { Account, ClientProject, Post } from "@/types/notion";

function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface QuickAddFormProps {
  posts: Post[];
  clientProjects: ClientProject[];
  accounts: Account[];
}

export function QuickAddForm({ posts, clientProjects, accounts }: QuickAddFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const sortedPosts = [...posts].sort((a, b) => {
    if (!a.publishDate && !b.publishDate) return 0;
    if (!a.publishDate) return 1;
    if (!b.publishDate) return -1;
    return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
  });

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await quickAddTaskAction(formData);
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          name="title"
          placeholder="タスクを追加してEnter..."
          required
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-50"
        >
          追加
        </button>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <label className="flex items-center gap-1 text-xs text-gray-500">
          期限
          <input
            type="date"
            name="due"
            defaultValue={todayDateString()}
            title="空欄にすると期限未定になります"
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-600"
          />
        </label>
        <select
          name="relatedPostId"
          defaultValue=""
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-600 max-w-[12rem]"
        >
          <option value="">関連投稿なし</option>
          {sortedPosts.map((post) => (
            <option key={post.id} value={post.id}>
              {post.title}
            </option>
          ))}
        </select>
        <select
          name="relatedProjectId"
          defaultValue=""
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-600 max-w-[12rem]"
        >
          <option value="">関連案件なし</option>
          {clientProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <select
          name="relatedAccountId"
          defaultValue=""
          className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-600 max-w-[12rem]"
        >
          <option value="">関連アカウントなし</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
