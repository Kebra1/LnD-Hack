import "server-only";
import { createDatabaseConnection } from "./connection";
import { getServerEnvironment } from "../env/server";

const databaseGlobal = globalThis as typeof globalThis & {
  databaseConnection?: ReturnType<typeof createDatabaseConnection>;
};

export function getDatabase() {
  databaseGlobal.databaseConnection ??= createDatabaseConnection(getServerEnvironment());
  return databaseGlobal.databaseConnection.db;
}
