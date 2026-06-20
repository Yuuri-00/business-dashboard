import "server-only";
import { unstable_cache } from "next/cache";
import type {
  CreatePageParameters,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getDataSourceId, notion } from "./client";
import { CLIENT_PROJECTS_PROPERTIES, NOTION_DB_ID } from "./constants";
import { getDate, getNumber, getRichText, getSelectName, getTitle, isFullPage } from "./utils";
import type {
  ClientProject,
  ClientProjectInput,
  ClientProjectStatus,
} from "@/types/notion";

function mapPageToClientProject(page: PageObjectResponse): ClientProject {
  return {
    id: page.id,
    name: getTitle(page, CLIENT_PROJECTS_PROPERTIES.name),
    clientName: getRichText(page, CLIENT_PROJECTS_PROPERTIES.clientName),
    status: getSelectName(page, CLIENT_PROJECTS_PROPERTIES.status) as ClientProjectStatus | null,
    deadline: getDate(page, CLIENT_PROJECTS_PROPERTIES.deadline),
    amount: getNumber(page, CLIENT_PROJECTS_PROPERTIES.amount),
  };
}

function buildClientProjectProperties(
  input: Partial<ClientProjectInput>
): NonNullable<CreatePageParameters["properties"]> {
  const properties: NonNullable<CreatePageParameters["properties"]> = {};

  if (input.name !== undefined) {
    properties[CLIENT_PROJECTS_PROPERTIES.name] = {
      title: [{ text: { content: input.name } }],
    };
  }
  if (input.clientName !== undefined) {
    properties[CLIENT_PROJECTS_PROPERTIES.clientName] = {
      rich_text: [{ text: { content: input.clientName } }],
    };
  }
  if (input.status !== undefined) {
    properties[CLIENT_PROJECTS_PROPERTIES.status] = { select: { name: input.status } };
  }
  if (input.deadline !== undefined) {
    properties[CLIENT_PROJECTS_PROPERTIES.deadline] = {
      date: input.deadline ? { start: input.deadline } : null,
    };
  }
  if (input.amount !== undefined) {
    properties[CLIENT_PROJECTS_PROPERTIES.amount] = { number: input.amount };
  }

  return properties;
}

export async function listClientProjects(): Promise<ClientProject[]> {
  const dataSourceId = await getDataSourceId(NOTION_DB_ID.clientProjects);
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: CLIENT_PROJECTS_PROPERTIES.deadline, direction: "ascending" }],
  });

  return response.results.filter(isFullPage).map(mapPageToClientProject);
}

export async function createClientProject(
  input: ClientProjectInput
): Promise<ClientProject> {
  const page = await notion.pages.create({
    parent: { database_id: NOTION_DB_ID.clientProjects },
    properties: buildClientProjectProperties(input),
  });

  return mapPageToClientProject(page as PageObjectResponse);
}

export async function updateClientProject(
  id: string,
  input: Partial<ClientProjectInput>
): Promise<ClientProject> {
  const page = await notion.pages.update({
    page_id: id,
    properties: buildClientProjectProperties(input),
  });

  return mapPageToClientProject(page as PageObjectResponse);
}

export async function archiveClientProject(id: string): Promise<void> {
  await notion.pages.update({ page_id: id, archived: true });
}

export const getCachedClientProjects = unstable_cache(
  listClientProjects,
  ["client-projects"],
  { revalidate: 300, tags: ["client-projects"] }
);
