import { parseEnvironment } from "../src/lib/env/schema.ts";

try {
  const env = parseEnvironment(process.env);
  console.log(`Environment valid. Mode: ${env.APP_MODE}. Database configured: ${Boolean(env.DATABASE_URL)}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Environment validation failed");
  process.exitCode = 1;
}
