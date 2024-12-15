import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { testsMap } from "./tests.js";
import { getTSCodeTokens } from "./utils/getTSCodeTokens.js";
import { getTSCodeWords } from "./utils/getTSCodeWords.js";

const app = new Hono();

app.get("/typing-test/:type", (ctx) => {
  const type = ctx.req.param("type");
  if (!(type in testsMap)) {
    return ctx.json(
      {
        message: "Invalid type",
      },
      404
    );
  }

  if (type === "typescript") {
    return ctx.json({
      type,
      text: testsMap[type],
      words: getTSCodeWords(testsMap[type]),
    });
  }

  return ctx.json({
    type,
    text: testsMap[type],
    words: [],
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
