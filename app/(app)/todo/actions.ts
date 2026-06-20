"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createTask, updateTask } from "@/lib/notion/tasks";
import type { TaskStatus } from "@/types/notion";

function todayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function quickAddTaskAction(formData: FormData): Promise<void> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  await createTask({
    title,
    due: todayDateString(),
    priority: "中",
    status: "未着手",
    relatedPostId: null,
    relatedProjectId: null,
  });

  updateTag("tasks");
  revalidatePath("/todo");
  revalidatePath("/");
}

export async function toggleTaskStatusAction(
  id: string,
  status: TaskStatus
): Promise<void> {
  await updateTask(id, { status });

  updateTag("tasks");
  revalidatePath("/todo");
  revalidatePath("/");
}
