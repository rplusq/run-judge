import { serve } from '@hono/node-server';
import { config } from 'dotenv';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Agent } from './agent';
import { capturePageWithCookies } from './browser';
import { compressScreenshot } from './compressScreenshot';
import {
  ActivityResponse,
  AgentAnalyzeInput,
  agentAnalyzeRequestSchema,
} from './types';

// Load environment variables
config();

const app = new Hono();
const agent = new Agent();

// Initialize agent
agent.initialize().catch((error) => {
  console.error('Failed to initialize agent:', error);
  process.exit(1);
});

// Middleware
app.use('*', cors());

// Health check endpoint
app.get('/health', (c) => c.json({ status: 'ok' }));

// Agent endpoint
app.post('/analyze', async (c) => {
  try {
    const body = await c.req.json();
    const parsedBody = agentAnalyzeRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return c.json({ error: 'Invalid input' }, 400);
    }

    const base64Cookies = process.env.AGENT_SCREENSHOT_COOKIES!;
    const strCookies = atob(base64Cookies);
    const parsedCookies = JSON.parse(strCookies);

    const inputToAnalyze: AgentAnalyzeInput[] = [];

    // This takes an actual screentshot of the page... 🤫🤫🤫
    for (const url of parsedBody.data.urls) {
      const screenshot = await capturePageWithCookies(url, parsedCookies);

      const data: AgentAnalyzeInput = {
        base64Image: await compressScreenshot(screenshot),
        // At this point we have validated the URL is valid so we can safely
        // extract the activityId from the URL
        activityId: url.split('/').pop()!,
      };

      inputToAnalyze.push(data);
    }

    const stream = await agent.analyze(inputToAnalyze);

    let chunkAcc: string = '';

    for await (const chunk of stream) {
      if ('agent' in chunk) {
        chunkAcc += chunk.agent.messages[0].content;
      }
    }

    // Sometimes the model returns json markup. We need to remove it
    const cleanedChunk = chunkAcc.replace('```json', '').replace('```', '');
    const parsedResponse: ActivityResponse = JSON.parse(cleanedChunk);

    return c.json(parsedResponse);
  } catch (error) {
    console.error('Error in analyze endpoint:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return c.json(
      {
        error: 'Internal server error',
        details: errorMessage,
        phase: 'analyze',
      },
      500
    );
  }
});

const port = process.env.PORT || 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});
