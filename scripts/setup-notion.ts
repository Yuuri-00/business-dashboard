import { config } from "dotenv";
import { Client } from "@notionhq/client";

// Next.jsの規約に合わせ、.envではなく.env.localから読み込む
config({ path: ".env.local" });
import type { PropertyConfigurationRequest } from "@notionhq/client/build/src/api-endpoints";
import {
  ACCOUNTS_PROPERTIES,
  ACCOUNT_STATUS_OPTIONS,
  CLIENT_PROJECTS_PROPERTIES,
  CLIENT_PROJECT_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  PLATFORM_OPTIONS,
  POSTS_PROPERTIES,
  POST_STATUS_OPTIONS,
  REVENUE_CATEGORY_OPTIONS,
  REVENUE_PROPERTIES,
  TASKS_PROPERTIES,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  TOOLS_PROPERTIES,
} from "../lib/notion/constants";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} が未設定です。`);
  return value;
}

const notion = new Client({ auth: requiredEnv("NOTION_API_KEY") });

function selectOptions(names: readonly string[]) {
  return names.map((name) => ({ name }));
}

function relationTo(dataSourceId: string): PropertyConfigurationRequest {
  return {
    relation: {
      data_source_id: dataSourceId,
      type: "single_property",
      single_property: {},
    },
  };
}

type DbKey = "clientProjects" | "tools" | "accounts" | "posts" | "tasks" | "revenue";

interface DbSpec {
  key: DbKey;
  envVar: string;
  title: string;
  deps: DbKey[];
  buildProperties: (deps: Record<DbKey, string>) => Record<string, PropertyConfigurationRequest>;
}

// relationの依存関係に沿った順序（依存先が先に解決されている必要がある）
const DB_SPECS: DbSpec[] = [
  {
    key: "clientProjects",
    envVar: "NOTION_DB_CLIENT_PROJECTS",
    title: "ClientProjects",
    deps: [],
    buildProperties: () => ({
      [CLIENT_PROJECTS_PROPERTIES.name]: { title: {} },
      [CLIENT_PROJECTS_PROPERTIES.clientName]: { rich_text: {} },
      [CLIENT_PROJECTS_PROPERTIES.status]: {
        select: { options: selectOptions(CLIENT_PROJECT_STATUS_OPTIONS) },
      },
      [CLIENT_PROJECTS_PROPERTIES.deadline]: { date: {} },
      [CLIENT_PROJECTS_PROPERTIES.amount]: { number: {} },
    }),
  },
  {
    key: "tools",
    envVar: "NOTION_DB_TOOLS",
    title: "Tools",
    deps: [],
    buildProperties: () => ({
      [TOOLS_PROPERTIES.name]: { title: {} },
      [TOOLS_PROPERTIES.url]: { url: {} },
      [TOOLS_PROPERTIES.paramKey]: { rich_text: {} },
      [TOOLS_PROPERTIES.platforms]: {
        multi_select: { options: selectOptions(PLATFORM_OPTIONS) },
      },
    }),
  },
  {
    key: "accounts",
    envVar: "NOTION_DB_ACCOUNTS",
    title: "Accounts",
    deps: ["tools"],
    buildProperties: (deps) => ({
      [ACCOUNTS_PROPERTIES.name]: { title: {} },
      [ACCOUNTS_PROPERTIES.platform]: {
        select: { options: selectOptions(PLATFORM_OPTIONS) },
      },
      // 「カラー」は運用者がNotion UI側で自由に追加する想定のため選択肢を決め打ちしない
      [ACCOUNTS_PROPERTIES.color]: { select: { options: [] } },
      [ACCOUNTS_PROPERTIES.handle]: { rich_text: {} },
      [ACCOUNTS_PROPERTIES.status]: {
        select: { options: selectOptions(ACCOUNT_STATUS_OPTIONS) },
      },
      [ACCOUNTS_PROPERTIES.weeklyGoal]: { number: {} },
      [ACCOUNTS_PROPERTIES.profileUrl]: { url: {} },
      [ACCOUNTS_PROPERTIES.toolUrl]: { url: {} },
      [ACCOUNTS_PROPERTIES.otherUrl]: { url: {} },
      [ACCOUNTS_PROPERTIES.externalKey]: { rich_text: {} },
      [ACCOUNTS_PROPERTIES.tool]: relationTo(deps.tools),
    }),
  },
  {
    key: "posts",
    envVar: "NOTION_DB_POSTS",
    title: "Posts",
    deps: ["accounts"],
    buildProperties: (deps) => ({
      [POSTS_PROPERTIES.title]: { title: {} },
      // アカウント名のミラー。Notionのカレンダービューがrelationで色分けできないための回避策で、
      // Account名と同じ値が書き込まれる前提（選択肢はNotion側の自動追加に任せる）
      [POSTS_PROPERTIES.accountSelect]: { select: { options: [] } },
      [POSTS_PROPERTIES.accountRelation]: relationTo(deps.accounts),
      [POSTS_PROPERTIES.status]: {
        select: { options: selectOptions(POST_STATUS_OPTIONS) },
      },
      [POSTS_PROPERTIES.publishDate]: { date: {} },
      [POSTS_PROPERTIES.url]: { url: {} },
    }),
  },
  {
    key: "tasks",
    envVar: "NOTION_DB_TASKS",
    title: "Tasks",
    deps: ["posts", "clientProjects", "accounts"],
    buildProperties: (deps) => ({
      [TASKS_PROPERTIES.title]: { title: {} },
      [TASKS_PROPERTIES.due]: { date: {} },
      [TASKS_PROPERTIES.priority]: {
        select: { options: selectOptions(TASK_PRIORITY_OPTIONS) },
      },
      [TASKS_PROPERTIES.status]: {
        select: { options: selectOptions(TASK_STATUS_OPTIONS) },
      },
      [TASKS_PROPERTIES.relatedPost]: relationTo(deps.posts),
      [TASKS_PROPERTIES.relatedProject]: relationTo(deps.clientProjects),
      [TASKS_PROPERTIES.relatedAccount]: relationTo(deps.accounts),
    }),
  },
  {
    key: "revenue",
    envVar: "NOTION_DB_REVENUE",
    title: "Revenue",
    deps: ["posts", "clientProjects"],
    buildProperties: (deps) => ({
      [REVENUE_PROPERTIES.date]: { date: {} },
      [REVENUE_PROPERTIES.amount]: { number: {} },
      [REVENUE_PROPERTIES.category]: {
        select: { options: selectOptions(REVENUE_CATEGORY_OPTIONS) },
      },
      [REVENUE_PROPERTIES.paymentStatus]: {
        select: { options: selectOptions(PAYMENT_STATUS_OPTIONS) },
      },
      [REVENUE_PROPERTIES.relatedPost]: relationTo(deps.posts),
      [REVENUE_PROPERTIES.relatedProject]: relationTo(deps.clientProjects),
    }),
  },
];

async function resolveDataSourceId(databaseId: string): Promise<string> {
  const database = await notion.databases.retrieve({ database_id: databaseId });
  if (!("data_sources" in database) || database.data_sources.length === 0) {
    throw new Error(`データベース ${databaseId} のデータソースが見つかりません。`);
  }
  return database.data_sources[0].id;
}

async function createDb(spec: DbSpec, properties: Record<string, PropertyConfigurationRequest>) {
  const parentPageId = requiredEnv("NOTION_PARENT_PAGE_ID");
  const database = await notion.databases.create({
    parent: { type: "page_id", page_id: parentPageId },
    title: [{ text: { content: spec.title } }],
    initial_data_source: { properties },
  });
  const dataSourceId = await resolveDataSourceId(database.id);
  console.log(`✓ ${spec.title} を新規作成しました: ${database.id}`);
  console.log(`  .envに追記してください: ${spec.envVar}=${database.id}`);
  return { databaseId: database.id, dataSourceId };
}

// dataSources.updateのproperties型はCreate用のPropertyConfigurationRequestとは別の
// （ほぼ同形だが個別にinlineされた）型のため、ここで明示的にキャストする。
// buildPropertiesが生成する形（title/rich_text/url/number/date/select/multi_select/relation）は
// Create・Updateの両方で有効な形であることを確認済み。
type UpdateDataSourceProperties = NonNullable<
  Parameters<typeof notion.dataSources.update>[0]["properties"]
>;

async function patchDb(spec: DbSpec, databaseId: string, properties: Record<string, PropertyConfigurationRequest>) {
  const dataSourceId = await resolveDataSourceId(databaseId);
  const dataSource = await notion.dataSources.retrieve({ data_source_id: dataSourceId });
  const existingNames = new Set(
    "properties" in dataSource ? Object.keys(dataSource.properties) : []
  );

  const missing = Object.fromEntries(
    Object.entries(properties).filter(([name]) => !existingNames.has(name))
  );

  if (Object.keys(missing).length === 0) {
    console.log(`- ${spec.title}: 不足プロパティなし`);
  } else {
    await notion.dataSources.update({
      data_source_id: dataSourceId,
      properties: missing as UpdateDataSourceProperties,
    });
    console.log(`✓ ${spec.title} に追加: ${Object.keys(missing).join(", ")}`);
  }

  return { databaseId, dataSourceId };
}

async function main() {
  const dataSourceIds = {} as Record<DbKey, string>;
  const newlyCreated: { envVar: string; databaseId: string }[] = [];

  for (const spec of DB_SPECS) {
    const properties = spec.buildProperties(dataSourceIds);
    const existingDatabaseId = process.env[spec.envVar];

    const result = existingDatabaseId
      ? await patchDb(spec, existingDatabaseId, properties)
      : await createDb(spec, properties);

    if (!existingDatabaseId) {
      newlyCreated.push({ envVar: spec.envVar, databaseId: result.databaseId });
    }
    dataSourceIds[spec.key] = result.dataSourceId;
  }

  if (newlyCreated.length > 0) {
    console.log("\n新規作成したDBを.envに追記してください:");
    for (const { envVar, databaseId } of newlyCreated) {
      console.log(`${envVar}=${databaseId}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
