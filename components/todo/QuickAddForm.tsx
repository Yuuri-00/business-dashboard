"use client";

import { useRef, useTransition } from "react";
import { quickAddTaskAction } from "@/app/(app)/todo/actions";

export function QuickAddForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await quickAddTaskAction(formData);
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="flex gap-2">
      <input
        type="text"
        name="title"
        placeholder="タスクを追加してEnter..."
        required
        className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-50"
      >
        追加
      </button>
    </form>
  );
}
