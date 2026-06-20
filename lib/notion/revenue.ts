import "server-only";
import { unstable_cache } from "next/cache";
import type {
  CreatePageParameters,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getDataSourceId, notion } from "./client";
import { NOTION_DB_ID, REVENUE_PROPERTIES } from "./constants";
import { getDate, getNumber, getRelationIds, getSelectName, isFullPage } from "./utils";
import type { PaymentStatus, Revenue, RevenueCategory, RevenueInput } from "@/types/notion";

function mapPageToRevenue(page: PageObjectResponse): Revenue {
  return {
    id: page.id,
    date: getDate(page, REVENUE_PROPERTIES.date),
    amount: getNumber(page, REVENUE_PROPERTIES.amount),
    category: getSelectName(page, REVENUE_PROPERTIES.category) as RevenueCategory | null,
    paymentStatus: getSelectName(page, REVENUE_PROPERTIES.paymentStatus) as PaymentStatus | null,
    relatedPostId: getRelationIds(page, REVENUE_PROPERTIES.relatedPost)[0] ?? null,
    relatedProjectId: getRelationIds(page, REVENUE_PROPERTIES.relatedProject)[0] ?? null,
  };
}

function buildRevenueProperties(
  input: Partial<RevenueInput>
): NonNullable<CreatePageParameters["properties"]> {
  const properties: NonNullable<CreatePageParameters["properties"]> = {};

  if (input.date !== undefined) {
    properties[REVENUE_PROPERTIES.date] = { date: { start: input.date } };
  }
  if (input.amount !== undefined) {
    properties[REVENUE_PROPERTIES.amount] = { number: input.amount };
  }
  if (input.category !== undefined) {
    properties[REVENUE_PROPERTIES.category] = { select: { name: input.category } };
  }
  if (input.paymentStatus !== undefined) {
    properties[REVENUE_PROPERTIES.paymentStatus] = {
      select: { name: input.paymentStatus },
    };
  }
  if (input.relatedPostId !== undefined) {
    properties[REVENUE_PROPERTIES.relatedPost] = {
      relation: input.relatedPostId ? [{ id: input.relatedPostId }] : [],
    };
  }
  if (input.relatedProjectId !== undefined) {
    properties[REVENUE_PROPERTIES.relatedProject] = {
      relation: input.relatedProjectId ? [{ id: input.relatedProjectId }] : [],
    };
  }

  return properties;
}

export async function listRevenue(): Promise<Revenue[]> {
  const dataSourceId = await getDataSourceId(NOTION_DB_ID.revenue);
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: REVENUE_PROPERTIES.date, direction: "descending" }],
  });

  return response.results.filter(isFullPage).map(mapPageToRevenue);
}

export async function createRevenue(input: RevenueInput): Promise<Revenue> {
  const page = await notion.pages.create({
    parent: { database_id: NOTION_DB_ID.revenue },
    properties: buildRevenueProperties(input),
  });

  return mapPageToRevenue(page as PageObjectResponse);
}

export async function updateRevenue(
  id: string,
  input: Partial<RevenueInput>
): Promise<Revenue> {
  const page = await notion.pages.update({
    page_id: id,
    properties: buildRevenueProperties(input),
  });

  return mapPageToRevenue(page as PageObjectResponse);
}

export async function archiveRevenue(id: string): Promise<void> {
  await notion.pages.update({ page_id: id, archived: true });
}

export const getCachedRevenue = unstable_cache(listRevenue, ["revenue"], {
  revalidate: 300,
  tags: ["revenue"],
});
