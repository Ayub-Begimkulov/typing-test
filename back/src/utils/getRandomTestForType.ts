import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { pathFromSrc } from "./pathFromSrc.js";
import { random } from "./random.js";

// quick and dirty solution to avoid
// reading files on each request
const cache = new Map<string, string[]>();

export async function getRandomTestForType(type: string) {
  const testsDir = pathFromSrc("./tests/", type);

  let items = cache.get(type);
  if (!items) {
    try {
      items = await fsPromises.readdir(testsDir);
      cache.set(type, items);
    } catch (error) {
      return {
        status: 404,
        message: "Not found",
      } as const;
    }
  }

  const randomTest = items[random(0, items.length)]!;

  const randomTestStream = fs.createReadStream(
    path.resolve(testsDir, randomTest)
  );

  return randomTestStream;
}
