import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  var __scaffoldPool: Pool | undefined;
  var __scaffoldDb: NodePgDatabase<typeof schema> | undefined;
}

function connect(): NodePgDatabase<typeof schema> {
  if (globalThis.__scaffoldDb) return globalThis.__scaffoldDb;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const pool =
    globalThis.__scaffoldPool ??
    new Pool({
      connectionString,
      ssl:
        process.env.DATABASE_SSL === "false"
          ? false
          : connectionString.includes("localhost") ||
              connectionString.includes("127.0.0.1")
            ? false
            : { rejectUnauthorized: false },
      max: 10,
    });
  globalThis.__scaffoldPool = pool;
  const instance = drizzle(pool, { schema });
  globalThis.__scaffoldDb = instance;
  return instance;
}

// Lazy proxy: importing this module does NOT connect; the connection happens
// only when a property is actually accessed. This keeps `next build` (which
// imports route modules for page-data collection) from requiring DATABASE_URL.
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(connect() as object, prop, receiver);
  },
});

export { schema };
