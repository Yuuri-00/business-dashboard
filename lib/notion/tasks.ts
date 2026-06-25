import "server-only";
import { unstable_cache } from "next/cache";
import type {
  CreatePageParameters,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getDataSourceId, notion } from "./client";
import { NOTION_DB_ID, TASKS_PROPERTIES } from "./constants";
import {
  getDate,
  getRelationIds,
  getSelectName,
  getTitle,
  isFullPage,
} from "./utils";
import type { Task, TaskInput, TaskPriority, TaskStatus } from "@/types/notion";

function mapPageToTask(page: PageObjectResponse): Task {
  return {
    id: page.id,
    title: getTitle(page, TASKS_PROPERTIES.title),
    due: getDate(page, TASKS_PROPERTIES.due),
    priority: getSelectName(page, TASKS_PROPERTIES.priority) as TaskPriority | null,
    status: getSelectName(page, TASKS_PROPERTIES.status) as TaskStatus | null,
    relatedPostId: getRelationIds(page, TASKS_PROPERTIES.relatedPost)[0] ?? null,
    relatedProjectId: getRelationIds(page, TASKS_PROPERTIES.relatedProject)[0] ?? null,
    relatedAccountId: getRelationIds(page, TASKS_PROPERTIES.relatedAccount)[0] ?? null,
  };
}

function buildTaskProperties(
  input: Partial<TaskInput>
): NonNullable<CreatePageParameters["properties"]> {
  const properties: NonNullable<CreatePageParameters["properties"]> = {};

  if (input.title !== undefined) {
    properties[TASKS_PROPERTIES.title] = {
      title: [{ text: { content: input.title } }],
    };
  }
  if (input.due !== undefined) {
    properties[TASKS_PROPERTIES.due] = {
      date: input.due ? { start: input.due } : null,
    };
  }
  if (input.priority !== undefined) {
    properties[TASKS_PROPERTIES.priority] = { select: { name: input.priority } };
  }
  if (input.status !== undefined) {
    properties[TASKS_PROPERTIES.status] = { select: { name: input.status } };
  }
  if (input.relatedPostId !== undefined) {
    properties[TASKS_PROPERTIES.relatedPost] = {
      relation: input.relatedPostId ? [{ id: input.relatedPostId }] : [],
    };
  }
  if (input.relatedProjectId !== undefined) {
    properties[TASKS_PROPERTIES.relatedProject] = {
      relation: input.relatedProjectId ? [{ id: input.relatedProjectId }] : [],
    };
  }
  if (input.relatedAccountId !== undefined) {
    properties[TASKS_PROPERTIES.relatedAccount] = {
      relation: input.relatedAccountId ? [{ id: input.relatedAccountId }] : [],
    };
  }

  return properties;
}

export async function listTasks(): Promise<Task[]> {
  const dataSourceId = await getDataSourceId(NOTION_DB_ID.tasks);
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: TASKS_PROPERTIES.due, direction: "ascending" }],
  });

  return response.results.filter(isFullPage).map(mapPageToTask);
}

export async function createTask(input: TaskInput): Promise<Task> {
  const page = await notion.pages.create({
    parent: { database_id: NOTION_DB_ID.tasks },
    properties: buildTaskProperties(input),
  });

  return mapPageToTask(page as PageObjectResponse);
}

export async function updateTask(
  id: string,
  input: Partial<TaskInput>
): Promise<Task> {
  const page = await notion.pages.update({
    page_id: id,
    properties: buildTaskProperties(input),
  });

  return mapPageToTask(page as PageObjectResponse);
}

export async function archiveTask(id: string): Promise<void> {
  await notion.pages.update({ page_id: id, archived: true });
}

export const getCachedTasks = unstable_cache(listTasks, ["tasks"], {
  revalidate: 60,
  tags: ["tasks"],
});
