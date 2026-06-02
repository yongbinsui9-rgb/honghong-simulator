import { getDb } from "coze-coding-dev-sdk";
import * as schema from "./shared/schema";

type AppDatabase = Awaited<ReturnType<typeof getDb<typeof schema>>>;

let dbPromise: Promise<AppDatabase> | null = null;

export async function getDatabase(): Promise<AppDatabase> {
  if (!dbPromise) {
    dbPromise = getDb(schema);
  }
  return dbPromise;
}
