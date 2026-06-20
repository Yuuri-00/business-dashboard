"use server";

import { revalidatePath, updateTag } from "next/cache";
import { archiveAccount, createAccount, updateAccount } from "@/lib/notion/accounts";
import {
  archiveClientProject,
  createClientProject,
  updateClientProject,
} from "@/lib/notion/clientProjects";
import type {
  AccountInput,
  AccountStatus,
  ClientProjectInput,
  ClientProjectStatus,
  Platform,
} from "@/types/notion";

function parseAccountInput(formData: FormData): AccountInput {
  const weeklyGoalRaw = String(formData.get("weeklyGoal") ?? "").trim();
  return {
    name: String(formData.get("name") ?? "").trim(),
    platform: String(formData.get("platform") ?? "") as Platform,
    color: String(formData.get("color") ?? "").trim(),
    handle: String(formData.get("handle") ?? "").trim(),
    status: String(formData.get("status") ?? "") as AccountStatus,
    weeklyGoal: weeklyGoalRaw ? Number(weeklyGoalRaw) : null,
  };
}

export async function createAccountAction(formData: FormData): Promise<void> {
  const input = parseAccountInput(formData);
  if (!input.name || !input.color) return;

  await createAccount(input);
  updateTag("accounts");
  revalidatePath("/settings");
  revalidatePath("/calendar");
}

export async function updateAccountAction(
  id: string,
  formData: FormData
): Promise<void> {
  const input = parseAccountInput(formData);
  if (!input.name || !input.color) return;

  await updateAccount(id, input);
  updateTag("accounts");
  revalidatePath("/settings");
  revalidatePath("/calendar");
}

export async function archiveAccountAction(id: string): Promise<void> {
  await archiveAccount(id);
  updateTag("accounts");
  revalidatePath("/settings");
  revalidatePath("/calendar");
}

function parseClientProjectInput(formData: FormData): ClientProjectInput {
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const deadlineRaw = String(formData.get("deadline") ?? "").trim();
  return {
    name: String(formData.get("name") ?? "").trim(),
    clientName: String(formData.get("clientName") ?? "").trim(),
    status: String(formData.get("status") ?? "") as ClientProjectStatus,
    deadline: deadlineRaw || null,
    amount: amountRaw ? Number(amountRaw) : null,
  };
}

export async function createClientProjectAction(formData: FormData): Promise<void> {
  const input = parseClientProjectInput(formData);
  if (!input.name) return;

  await createClientProject(input);
  updateTag("client-projects");
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function updateClientProjectAction(
  id: string,
  formData: FormData
): Promise<void> {
  const input = parseClientProjectInput(formData);
  if (!input.name) return;

  await updateClientProject(id, input);
  updateTag("client-projects");
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function archiveClientProjectAction(id: string): Promise<void> {
  await archiveClientProject(id);
  updateTag("client-projects");
  revalidatePath("/settings");
  revalidatePath("/");
}
