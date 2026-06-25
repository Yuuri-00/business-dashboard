"use server";

import { revalidatePath, updateTag } from "next/cache";
import { archiveTask, createTask, updateTask } from "@/lib/notion/tasks";
import type { TaskInput, TaskPriority, TaskStatus } from "@/types/notion";

function parseTaskInput(formData: FormData): TaskInput {
  return {
    title: String(formData.get("title") ?? "").trim(),
    due: String(formData.get("due") ?? "").trim() || null,
    priority: String(formData.get("priority") ?? "中") as TaskPriority,
    status: String(formData.get("status") ?? "未着手") as TaskStatus,
    relatedPostId: String(formData.get("relatedPostId") ?? "").trim() || null,
    relatedProjectId: String(formData.get("relatedProjectId") ?? "").trim() || null,
    relatedAccountId: String(formData.get("relatedAccountId") ?? "").trim() || null,
  };
}

export async function quickAddTaskAction(formData: FormData): Promise<void> {
  const input = parseTaskInput(formData);
  if (!input.title) return;

  await createTask(input);

  updateTag("tasks");
  revalidatePath("/todo");
  revalidatePath("/");
}

export async function updateTaskAction(id: string, formData: FormData): Promise<void> {
  const input = parseTaskInput(formData);
  if (!input.title) return;

  await updateTask(id, input);

  updateTag("tasks");
  revalidatePath("/todo");
  revalidatePath("/");
}

export async function deleteTaskAction(id: string): Promise<void> {
  await archiveTask(id);

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
