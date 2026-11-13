import { describe, expect, it } from "vitest";
import { parseEnvironment, requireDatabaseUrl } from "../src/lib/env/schema";

describe("environment configuration", () => {
  it("starts demo without a database or external credentials", () => {
    const env = parseEnvironment({});
    expect(env.APP_MODE).toBe("demo");
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.AI_EXTRACTION_ENABLED).toBe(false);
    expect(env.DOCUMENT_UPLOAD_ENABLED).toBe(false);
  });

  it("parses false as false rather than a truthy string", () => {
    expect(parseEnvironment({ AI_EXTRACTION_ENABLED: "false" }).AI_EXTRACTION_ENABLED).toBe(false);
    expect(parseEnvironment({ AI_EXTRACTION_ENABLED: "true" }).AI_EXTRACTION_ENABLED).toBe(true);
  });

  it.each(["yes", "1", "FALSE", ""])("rejects invalid boolean %j", (value) => {
    expect(() => parseEnvironment({ AI_EXTRACTION_ENABLED: value })).toThrow("AI_EXTRACTION_ENABLED");
  });

  it("requires a PostgreSQL connection for pilot", () => {
    expect(() => parseEnvironment({ APP_MODE: "pilot" })).toThrow("DATABASE_URL");
  });

  it.each(["postgresql://user:secret@localhost:5432/family", "postgres://localhost/family"])("accepts PostgreSQL URL", (url) => {
    const env = parseEnvironment({ APP_MODE: "pilot", DATABASE_URL: url });
    expect(requireDatabaseUrl(env)).toBe(url);
  });

  it.each(["https://localhost/db", "postgresql://localhost", "bad-secret-value"])("rejects an invalid database URL without exposing its value", (url) => {
    let message = "";
    try { parseEnvironment({ DATABASE_URL: url }); } catch (error) {
      message = error instanceof Error ? error.message : "";
    }
    expect(message).toContain("DATABASE_URL");
    expect(message).not.toContain(url);
  });

  it("keeps real document upload unavailable in demo", () => {
    expect(() => parseEnvironment({ DOCUMENT_UPLOAD_ENABLED: "true" })).toThrow("DOCUMENT_UPLOAD_ENABLED");
  });

  it.each(["0", "21", "2.5", "NaN"])("rejects an invalid connection pool size %j", (value) => {
    expect(() => parseEnvironment({ DATABASE_POOL_MAX: value })).toThrow("DATABASE_POOL_MAX");
  });

  it("requires an explicit URL for database commands, including demo mode", () => {
    expect(() => requireDatabaseUrl(parseEnvironment({}))).toThrow("DATABASE_URL");
  });
});
