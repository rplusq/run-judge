import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { z } from 'zod';

export type AgentConfig = {
  configurable: {
    thread_id: string;
  };
};

export type Agent = ReturnType<typeof createReactAgent>;

export type ActivityResponse = {
  valid: boolean;
  message: string;
};

export type AgentAnalyzeInput = {
  base64Image: string;
  activityId: string;
};

export const agentAnalyzeRequestSchema = z.object({
  // For now we have capable of analyzing two activities only
  urls: z.array(z.string().url()).length(2),
});

export type AgentAnalyzeRequest = z.infer<typeof agentAnalyzeRequestSchema>;
