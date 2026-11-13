import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index.ts";
import { requireDatabaseUrl, type Environment } from "../env/schema.ts";

export function createDatabaseConnection(env: Environment) {
  const pool = new Pool({
    connectionString: requireDatabaseUrl(env),
    max: env.DATABASE_POOL_MAX,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
  });
  pool.on("error", () => {
    // Never log connection strings or driver error objects containing credentials.
    console.error("An idle PostgreSQL connection failed");
  });
  return { pool, db: drizzle(pool, { schema }) };
}
