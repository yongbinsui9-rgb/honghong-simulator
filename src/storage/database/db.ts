import { getDb } from "coze-coding-dev-sdk";
import * as schema from "./shared/schema";

type AppDatabase = Awaited<ReturnType<typeof getDb<typeof schema>>>;

/** pg v8 对 require/prefer/verify-ca 会打印 SSL 警告，统一改为 verify-full */
function normalizePgDatabaseUrl(): void {
  const raw = process.env.PGDATABASE_URL?.trim();
  if (!raw) return;

  const normalized = raw.replace(
    /([?&])sslmode=(prefer|require|verify-ca)(?=&|$)/gi,
    "$1sslmode=verify-full"
  );

  if (normalized !== raw) {
    process.env.PGDATABASE_URL = normalized;
  }
}

let dbPromise: Promise<AppDatabase> | null = null;

export async function getDatabase(): Promise<AppDatabase> {
  if (!dbPromise) {
    normalizePgDatabaseUrl();
    dbPromise = getDb(schema);
  }
  return dbPromise;
}
