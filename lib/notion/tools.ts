import "server-only";
import { unstable_cache } from "next/cache";
import type {
  CreatePageParameters,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getDataSourceId, notion } from "./client";
import { NOTION_DB_ID, TOOLS_PROPERTIES } from "./constants";
import {
  getMultiSelectNames,
  getRichText,
  getTitle,
  getUrl,
  isFullPage,
} from "./utils";
import type { Platform, Tool, ToolInput } from "@/types/notion";

function mapPageToTool(page: PageObjectResponse): Tool {
  return {
    id: page.id,
    name: getTitle(page, TOOLS_PROPERTIES.name),
    url: getUrl(page, TOOLS_PROPERTIES.url),
    paramKey: getRichText(page, TOOLS_PROPERTIES.paramKey) || null,
    platforms: getMultiSelectNames(page, TOOLS_PROPERTIES.platforms) as Platform[],
  };
}

function buildToolProperties(
  input: Partial<ToolInput>
): NonNullable<CreatePageParameters["properties"]> {
  const properties: NonNullable<CreatePageParameters["properties"]> = {};

  if (input.name !== undefined) {
    properties[TOOLS_PROPERTIES.name] = {
      title: [{ text: { content: input.name } }],
    };
  }
  if (input.url !== undefined) {
    properties[TOOLS_PROPERTIES.url] = { url: input.url };
  }
  if (input.paramKey !== undefined) {
    properties[TOOLS_PROPERTIES.paramKey] = {
      rich_text: [{ text: { content: input.paramKey ?? "" } }],
    };
  }
  if (input.platforms !== undefined) {
    properties[TOOLS_PROPERTIES.platforms] = {
      multi_select: input.platforms.map((name) => ({ name })),
    };
  }

  return properties;
}

export async function listTools(): Promise<Tool[]> {
  if (!NOTION_DB_ID.tools) return [];
  const dataSourceId = await getDataSourceId(NOTION_DB_ID.tools);
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: TOOLS_PROPERTIES.name, direction: "ascending" }],
  });

  return response.results.filter(isFullPage).map(mapPageToTool);
}

export async function createTool(input: ToolInput): Promise<Tool> {
  const page = await notion.pages.create({
    parent: { database_id: NOTION_DB_ID.tools },
    properties: buildToolProperties(input),
  });

  return mapPageToTool(page as PageObjectResponse);
}

export async function updateTool(
  id: string,
  input: Partial<ToolInput>
): Promise<Tool> {
  const page = await notion.pages.update({
    page_id: id,
    properties: buildToolProperties(input),
  });

  return mapPageToTool(page as PageObjectResponse);
}

export async function archiveTool(id: string): Promise<void> {
  await notion.pages.update({ page_id: id, archived: true });
}

export const getCachedTools = unstable_cache(listTools, ["tools"], {
  revalidate: 3600,
  tags: ["tools"],
});
