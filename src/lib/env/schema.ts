import { z } from "zod";

const flag = z.enum(["true", "false"]).default("false").transform((value) => value === "true");

const postgresUrl = z.string().url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return ["postgres:", "postgresql:"].includes(url.protocol) && url.hostname.length > 0 && url.pathname.length > 1;
});

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_MODE: z.enum(["demo", "pilot"]).default("demo"),
  DATABASE_URL: postgresUrl.optional(),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(20).default(5),
  DOCUMENT_UPLOAD_ENABLED: flag,
  AI_EXTRACTION_ENABLED: flag,
  PDF_EXPORT_ENABLED: flag,
  PROVIDER_SELF_SERVICE_ENABLED: flag,
}).superRefine((env, context) => {
  if (env.APP_MODE === "pilot" && !env.DATABASE_URL) {
    context.addIssue({ code: "custom", path: ["DATABASE_URL"], message: "Required in pilot mode" });
  }
  if (env.APP_MODE === "demo" && env.DOCUMENT_UPLOAD_ENABLED) {
    context.addIssue({ code: "custom", path: ["DOCUMENT_UPLOAD_ENABLED"], message: "Real upload is unavailable in demo mode" });
  }
});

export type Environment = z.infer<typeof environmentSchema>;

export function parseEnvironment(input: Record<string, string | undefined>): Environment {
  const result = environmentSchema.safeParse(input);
  if (!result.success) {
    const fields = [...new Set(result.error.issues.map((issue) => issue.path.join(".")))];
    throw new Error(`Invalid environment variables: ${fields.join(", ")}`);
  }
  return result.data;
}

export function requireDatabaseUrl(env: Environment): string {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for database operations");
  }
  return env.DATABASE_URL;
}
