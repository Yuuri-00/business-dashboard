import "server-only";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export function isFullPage(
  page: PageObjectResponse | { id: string }
): page is PageObjectResponse {
  return "properties" in page;
}

export function getTitle(page: PageObjectResponse, property: string): string {
  const prop = page.properties[property];
  if (prop?.type !== "title") return "";
  return prop.title.map((t) => t.plain_text).join("");
}

export function getRichText(page: PageObjectResponse, property: string): string {
  const prop = page.properties[property];
  if (prop?.type !== "rich_text") return "";
  return prop.rich_text.map((t) => t.plain_text).join("");
}

export function getSelectName(
  page: PageObjectResponse,
  property: string
): string | null {
  const prop = page.properties[property];
  if (prop?.type !== "select") return null;
  return prop.select?.name ?? null;
}

export function getSelectColor(
  page: PageObjectResponse,
  property: string
): string | null {
  const prop = page.properties[property];
  if (prop?.type !== "select") return null;
  return prop.select?.color ?? null;
}

export function getNumber(
  page: PageObjectResponse,
  property: string
): number | null {
  const prop = page.properties[property];
  if (prop?.type !== "number") return null;
  return prop.number;
}

export function getDate(
  page: PageObjectResponse,
  property: string
): string | null {
  const prop = page.properties[property];
  if (prop?.type !== "date") return null;
  return prop.date?.start ?? null;
}

export function getUrl(
  page: PageObjectResponse,
  property: string
): string | null {
  const prop = page.properties[property];
  if (prop?.type !== "url") return null;
  return prop.url;
}

export function getRelationIds(
  page: PageObjectResponse,
  property: string
): string[] {
  const prop = page.properties[property];
  if (prop?.type !== "relation") return [];
  return prop.relation.map((r) => r.id);
}

export function getMultiSelectNames(
  page: PageObjectResponse,
  property: string
): string[] {
  const prop = page.properties[property];
  if (prop?.type !== "multi_select") return [];
  return prop.multi_select.map((o) => o.name);
}
