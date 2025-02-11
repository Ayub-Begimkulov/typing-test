import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { testTypes } from "./tests.js";
import { cors } from "hono/cors";
import english from "./tests/english/english-200.json" assert { type: "json" };
import { shuffle } from "./utils/shuffle.js";
import { getWordsRange } from "./utils/getWordsRange.js";
import fsPromises from "fs/promises";
import fs from "fs";
import path from "path";
import { pathFromSrc } from "./utils/pathFromSrc.js";
import { random } from "./utils/random.js";
import { stream } from "hono/streaming";
import { Readable } from "stream";

const app = new Hono();

app.use(cors());

app.get("/typing-tests", (ctx) => {
  return ctx.json(testTypes);
});

app.get("/typing-tests/english", async (ctx) => {
  const randomOrder = shuffle(english);

  return ctx.json({
    type: "english",
    text: randomOrder.join(" "),
    words: getWordsRange(randomOrder),
  });
});

app.get("/typing-tests/:type", async (ctx) => {
  const type = ctx.req.param("type");

  if (!testTypes.includes(type)) {
    return ctx.json(
      {
        message: "Invalid type",
      },
      404
    );
  }

  const testsDir = pathFromSrc("./tests/", type);
  const items = await fsPromises.readdir(testsDir);
  const randomTest = items[random(0, items.length)]!;
  const randomTestStream = fs.createReadStream(
    path.resolve(testsDir, randomTest)
  );

  ctx.header("Content-Type", "application/json");
  return stream(ctx, async (stream) => {
    await stream.pipe(Readable.toWeb(randomTestStream));
  });
});

app.get("/health-check", (c) => {
  return c.text("Success");
});

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
