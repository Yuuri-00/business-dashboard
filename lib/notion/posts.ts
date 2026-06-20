import "server-only";
import { unstable_cache } from "next/cache";
import type {
  CreatePageParameters,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getDataSourceId, notion } from "./client";
import { NOTION_DB_ID, NOTION_SELECT_COLOR_HEX, POSTS_PROPERTIES } from "./constants";
import {
  getDate,
  getRelationIds,
  getSelectColor,
  getSelectName,
  getTitle,
  getUrl,
  isFullPage,
} from "./utils";
import type { Post, PostInput, PostStatus } from "@/types/notion";

function mapPageToPost(page: PageObjectResponse): Post {
  const colorName = getSelectColor(page, POSTS_PROPERTIES.accountSelect) ?? "default";
  const accountIds = getRelationIds(page, POSTS_PROPERTIES.accountRelation);

  return {
    id: page.id,
    title: getTitle(page, POSTS_PROPERTIES.title),
    accountName: getSelectName(page, POSTS_PROPERTIES.accountSelect),
    accountColor: NOTION_SELECT_COLOR_HEX[colorName] ?? NOTION_SELECT_COLOR_HEX.default,
    accountId: accountIds[0] ?? null,
    status: getSelectName(page, POSTS_PROPERTIES.status) as PostStatus | null,
    publishDate: getDate(page, POSTS_PROPERTIES.publishDate),
    url: getUrl(page, POSTS_PROPERTIES.url),
  };
}

function buildPostProperties(
  input: Partial<PostInput>
): NonNullable<CreatePageParameters["properties"]> {
  const properties: NonNullable<CreatePageParameters["properties"]> = {};

  if (input.title !== undefined) {
    properties[POSTS_PROPERTIES.title] = {
      title: [{ text: { content: input.title } }],
    };
  }
  if (input.accountName !== undefined) {
    properties[POSTS_PROPERTIES.accountSelect] = {
      select: { name: input.accountName },
    };
  }
  if (input.accountId !== undefined) {
    properties[POSTS_PROPERTIES.accountRelation] = {
      relation: [{ id: input.accountId }],
    };
  }
  if (input.status !== undefined) {
    properties[POSTS_PROPERTIES.status] = { select: { name: input.status } };
  }
  if (input.publishDate !== undefined) {
    properties[POSTS_PROPERTIES.publishDate] = {
      date: input.publishDate ? { start: input.publishDate } : null,
    };
  }
  if (input.url !== undefined) {
    properties[POSTS_PROPERTIES.url] = { url: input.url };
  }

  return properties;
}

export async function listPosts(): Promise<Post[]> {
  const dataSourceId = await getDataSourceId(NOTION_DB_ID.posts);
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: POSTS_PROPERTIES.publishDate, direction: "ascending" }],
  });

  return response.results.filter(isFullPage).map(mapPageToPost);
}

export async function createPost(input: PostInput): Promise<Post> {
  const page = await notion.pages.create({
    parent: { database_id: NOTION_DB_ID.posts },
    properties: buildPostProperties(input),
  });

  return mapPageToPost(page as PageObjectResponse);
}

export async function updatePost(
  id: string,
  input: Partial<PostInput>
): Promise<Post> {
  const page = await notion.pages.update({
    page_id: id,
    properties: buildPostProperties(input),
  });

  return mapPageToPost(page as PageObjectResponse);
}

export async function archivePost(id: string): Promise<void> {
  await notion.pages.update({ page_id: id, archived: true });
}

export const getCachedPosts = unstable_cache(listPosts, ["posts"], {
  revalidate: 300,
  tags: ["posts"],
});
