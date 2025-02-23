import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "dotenv";
import { streams, stories, trends } from "./src/routes";
import prisma from "./src/services/prisma";
config();

const app = new Hono();

app.get("/", async (c) => {
  return c.json({
    message: "server is running",
  });
});

export async function resetDatabase() {
  await prisma.caption.deleteMany();
  await prisma.stream.deleteMany();
  await prisma.story.deleteMany();
  await prisma.googleTrend.deleteMany();
  await prisma.development.deleteMany();
  await prisma.image.deleteMany();
  await prisma.source.deleteMany();
}

app.get('/reset', async (c) => {
  await resetDatabase();
  return c.json({
    message: "database reset",
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
