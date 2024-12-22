import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { testsMap } from "./tests.js";
import { cors } from "hono/cors";
import { hasOwn } from "./utils/hasOwn.js";

const app = new Hono();

app.use(cors());

app.get("/typing-tests", (ctx) => {
  return ctx.json(Object.keys(testsMap));
});

app.get("/typing-tests/:type", (ctx) => {
  const type = ctx.req.param("type");

  if (!hasOwn(testsMap, type)) {
    return ctx.json(
      {
        message: "Invalid type",
      },
      404
    );
  }

  return ctx.json(testsMap[type]);
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
