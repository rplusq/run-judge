import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Agent } from "./agent";
import { config } from "dotenv";

// Load environment variables
config();

const app = new Hono();
const agent = new Agent();

// Initialize agent
agent.initialize().catch((error) => {
  console.error("Failed to initialize agent:", error);
  process.exit(1);
});

// Middleware
app.use("*", cors());

// Health check endpoint
app.get("/health", (c) => c.json({ status: "ok" }));

// Agent endpoint
app.post("/analyze", async (c) => {
  try {
    const body = await c.req.json();
    const { input } = body;

    if (!input || typeof input !== "string") {
      return c.json({ error: "Invalid input" }, 400);
    }

    const stream = await agent.analyze(input);

    // Convert the stream to response
    const response = new Response(stream as any);
    return response;
  } catch (error) {
    console.error("Error in analyze endpoint:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

const port = process.env.PORT || 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});
