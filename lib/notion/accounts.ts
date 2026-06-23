import "server-only";
import { unstable_cache } from "next/cache";
import type {
  CreatePageParameters,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getDataSourceId, notion } from "./client";
import {
  ACCOUNTS_PROPERTIES,
  NOTION_DB_ID,
  NOTION_SELECT_COLOR_HEX,
} from "./constants";
import {
  getNumber,
  getRichText,
  getSelectColor,
  getSelectName,
  getTitle,
  getUrl,
  isFullPage,
} from "./utils";
import type { Account, AccountInput, AccountStatus, Platform } from "@/types/notion";

function mapPageToAccount(page: PageObjectResponse): Account {
  const colorName = getSelectColor(page, ACCOUNTS_PROPERTIES.color) ?? "default";
  return {
    id: page.id,
    name: getTitle(page, ACCOUNTS_PROPERTIES.name),
    platform: getSelectName(page, ACCOUNTS_PROPERTIES.platform) as Platform | null,
    color: NOTION_SELECT_COLOR_HEX[colorName] ?? NOTION_SELECT_COLOR_HEX.default,
    handle: getRichText(page, ACCOUNTS_PROPERTIES.handle),
    status: getSelectName(page, ACCOUNTS_PROPERTIES.status) as AccountStatus | null,
    weeklyGoal: getNumber(page, ACCOUNTS_PROPERTIES.weeklyGoal),
    profileUrl: getUrl(page, ACCOUNTS_PROPERTIES.profileUrl),
    toolUrl: getUrl(page, ACCOUNTS_PROPERTIES.toolUrl),
    otherUrl: getUrl(page, ACCOUNTS_PROPERTIES.otherUrl),
  };
}

function buildAccountProperties(
  input: Partial<AccountInput>
): NonNullable<CreatePageParameters["properties"]> {
  const properties: NonNullable<CreatePageParameters["properties"]> = {};

  if (input.name !== undefined) {
    properties[ACCOUNTS_PROPERTIES.name] = {
      title: [{ text: { content: input.name } }],
    };
  }
  if (input.platform !== undefined) {
    properties[ACCOUNTS_PROPERTIES.platform] = { select: { name: input.platform } };
  }
  if (input.color !== undefined) {
    properties[ACCOUNTS_PROPERTIES.color] = { select: { name: input.color } };
  }
  if (input.handle !== undefined) {
    properties[ACCOUNTS_PROPERTIES.handle] = {
      rich_text: [{ text: { content: input.handle } }],
    };
  }
  if (input.status !== undefined) {
    properties[ACCOUNTS_PROPERTIES.status] = { select: { name: input.status } };
  }
  if (input.weeklyGoal !== undefined) {
    properties[ACCOUNTS_PROPERTIES.weeklyGoal] = { number: input.weeklyGoal };
  }
  if (input.profileUrl !== undefined) {
    properties[ACCOUNTS_PROPERTIES.profileUrl] = { url: input.profileUrl };
  }
  if (input.toolUrl !== undefined) {
    properties[ACCOUNTS_PROPERTIES.toolUrl] = { url: input.toolUrl };
  }
  if (input.otherUrl !== undefined) {
    properties[ACCOUNTS_PROPERTIES.otherUrl] = { url: input.otherUrl };
  }

  return properties;
}

export async function listAccounts(): Promise<Account[]> {
  const dataSourceId = await getDataSourceId(NOTION_DB_ID.accounts);
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: ACCOUNTS_PROPERTIES.name, direction: "ascending" }],
  });

  return response.results.filter(isFullPage).map(mapPageToAccount);
}

export async function createAccount(input: AccountInput): Promise<Account> {
  const page = await notion.pages.create({
    parent: { database_id: NOTION_DB_ID.accounts },
    properties: buildAccountProperties(input),
  });

  return mapPageToAccount(page as PageObjectResponse);
}

export async function updateAccount(
  id: string,
  input: Partial<AccountInput>
): Promise<Account> {
  const page = await notion.pages.update({
    page_id: id,
    properties: buildAccountProperties(input),
  });

  return mapPageToAccount(page as PageObjectResponse);
}

export async function archiveAccount(id: string): Promise<void> {
  await notion.pages.update({ page_id: id, archived: true });
}

export interface ColorOption {
  name: string;
  color: string;
}

// Accounts DBの「カラー」selectプロパティに実際に定義済みのオプションを取得する。
// アプリ側でNotionの色名を決め打ちせず、Notion側のスキーマを単一の正とするため。
export async function getAccountColorOptions(): Promise<ColorOption[]> {
  const dataSourceId = await getDataSourceId(NOTION_DB_ID.accounts);
  const dataSource = await notion.dataSources.retrieve({
    data_source_id: dataSourceId,
  });
  if (!("properties" in dataSource)) return [];

  const colorProperty = dataSource.properties[ACCOUNTS_PROPERTIES.color];
  if (colorProperty?.type !== "select") return [];

  return colorProperty.select.options.map((option) => ({
    name: option.name,
    color: NOTION_SELECT_COLOR_HEX[option.color] ?? NOTION_SELECT_COLOR_HEX.default,
  }));
}

export const getCachedAccounts = unstable_cache(listAccounts, ["accounts"], {
  revalidate: 3600,
  tags: ["accounts"],
});

export const getCachedAccountColorOptions = unstable_cache(
  getAccountColorOptions,
  ["account-color-options"],
  { revalidate: 3600, tags: ["accounts"] }
);
