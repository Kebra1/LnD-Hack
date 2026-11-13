import { sql } from "drizzle-orm";
import { parseEnvironment } from "../src/lib/env/schema.ts";
import { createDatabaseConnection } from "../src/lib/db/connection.ts";

async function main() {
  const { db, pool } = createDatabaseConnection(parseEnvironment(process.env));
  try {
    const result = await db.transaction(async (transaction) => {
      await transaction.execute(sql`set local time zone 'UTC'`);
      return transaction.execute(sql`select 1 as connected, current_setting('TimeZone') as timezone`);
    });
    const row = result.rows[0];
    if (row?.connected !== 1 || row.timezone !== "UTC") {
      throw new Error("Unexpected database response");
    }
    console.log("PostgreSQL connection and Drizzle transaction verified. Session timezone: UTC.");
  } finally {
    await pool.end();
  }
}

main().catch(() => {
  console.error("Database check failed. Verify DATABASE_URL, credentials and PostgreSQL availability.");
  process.exitCode = 1;
});
