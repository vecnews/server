import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "dotenv";
import { streams, stories, trends } from "./src/routes";

config();

const app = new Hono();

app.get("/", async (c) => {
  return c.json({
    message: "server is running",
  });
});

app.use("/*", cors());

app.route("/streams", streams);
app.route("/stories", stories);
app.route("/trends", trends);

export default {
  port: process.env.PORT || 5000,
  fetch: app.fetch,
};
