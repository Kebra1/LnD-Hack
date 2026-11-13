import "server-only";
import { parseEnvironment } from "./schema";

export function getServerEnvironment() {
  return parseEnvironment(process.env);
}
