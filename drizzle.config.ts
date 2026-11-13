import { defineConfig } from "drizzle-kit";
import { parseEnvironment, requireDatabaseUrl } from "./src/lib/env/schema";

const env = parseEnvironment(process.env);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url: requireDatabaseUrl(env) },
  strict: true,
  verbose: false,
});
