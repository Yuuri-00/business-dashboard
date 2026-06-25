"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getCachedAccounts } from "@/lib/notion/accounts";
import { archivePost, createPost, updatePost } from "@/lib/notion/posts";
import type { PostStatus } from "@/types/notion";

interface ParsedPostInput {
  title: string;
  accountId: string;
  status: PostStatus;
  publishDate: string | null;
  url: string | null;
}

function parsePostInput(formData: FormData): ParsedPostInput {
  return {
    title: String(formData.get("title") ?? "").trim(),
    accountId: String(formData.get("accountId") ?? "").trim(),
    status: String(formData.get("status") ?? "") as PostStatus,
    publishDate: String(formData.get("publishDate") ?? "").trim() || null,
    url: String(formData.get("url") ?? "").trim() || null,
  };
}

export async function createPostAction(formData: FormData): Promise<void> {
  const input = parsePostInput(formData);
  if (!input.title || !input.accountId) return;

  const accounts = await getCachedAccounts();
  const account = accounts.find((a) => a.id === input.accountId);
  if (!account) return;

  await createPost({
    title: input.title,
    accountName: account.name,
    accountId: account.id,
    status: input.status,
    publishDate: input.publishDate,
    url: input.url,
  });

  updateTag("posts");
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function updatePostAction(id: string, formData: FormData): Promise<void> {
  const input = parsePostInput(formData);
  if (!input.title || !input.accountId) return;

  const accounts = await getCachedAccounts();
  const account = accounts.find((a) => a.id === input.accountId);
  if (!account) return;

  await updatePost(id, {
    title: input.title,
    accountName: account.name,
    accountId: account.id,
    status: input.status,
    publishDate: input.publishDate,
    url: input.url,
  });

  updateTag("posts");
  revalidatePath("/calendar");
  revalidatePath("/");
}

export async function archivePostAction(id: string): Promise<void> {
  await archivePost(id);
  updateTag("posts");
  revalidatePath("/calendar");
  revalidatePath("/");
}
