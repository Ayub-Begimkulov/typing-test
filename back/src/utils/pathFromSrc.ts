import path from "path";
import { fileURLToPath } from "url";

export function pathFromSrc(...parts: string[]) {
  return path.resolve(fileURLToPath(import.meta.url), "../..", ...parts);
}
