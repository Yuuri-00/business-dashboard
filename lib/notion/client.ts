import "server-only";
import { Client } from "@notionhq/client";

let client: Client | undefined;

function getClient(): Client {
  if (!client) {
    if (!process.env.NOTION_API_KEY) {
      throw new Error("NOTION_API_KEY is not set");
    }
    client = new Client({ auth: process.env.NOTION_API_KEY });
  }
  return client;
}

// 実際に呼び出されるまでクライアント生成を遅延させる（モジュール読み込み時点では
// 環境変数が未設定でもビルドのページデータ収集フェーズを通過できるようにするため）
export const notion = new Proxy({} as Client, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});

const dataSourceIdCache = new Map<string, string>();

// Notion API 2025-09-03+ ではquery系APIがdatabase_idではなくdata_source_idを要求するため、
// .envに設定したdatabase_idから解決してキャッシュする（個人用DBはデータソース1個が前提）
export async function getDataSourceId(databaseId: string): Promise<string> {
  const cached = dataSourceIdCache.get(databaseId);
  if (cached) return cached;

  const database = await notion.databases.retrieve({ database_id: databaseId });
  if (!("data_sources" in database)) {
    throw new Error(`Could not resolve data source for database ${databaseId}`);
  }
  const dataSourceId = database.data_sources[0].id;
  dataSourceIdCache.set(databaseId, dataSourceId);
  return dataSourceId;
}
