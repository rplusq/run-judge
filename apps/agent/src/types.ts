import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { Address, Chain, Hex } from 'viem';
import { z } from 'zod';

export type AgentConfig = {
  configurable: {
    thread_id: string;
  };
};

export type Agent = ReturnType<typeof createReactAgent>;

type ActivityAnalysis = {
  valid: boolean;
  message: string;
  activityId: number;
};

export type ActivityResponse = {
  analysis: ActivityAnalysis[];
  analysisOutcome: string;
  winnerActivityId: number;
};

export type AgentAnalyzeInput = {
  base64Image: string;
  activityId: string;
};

export const agentAnalyzeRequestSchema = z.object({
  challengeId: z.number().describe('The ID of the challenge'),
  // For now we have capable of analyzing two activities only
  activityIds: z.array(z.number()).length(2),
});

export type AgentAnalyzeRequest = z.infer<typeof agentAnalyzeRequestSchema>;

export type AppConfig = {
  chain: Chain;
  rpcUrl: string;
  environment: 'development' | 'production';
  contractAddress: Address;
  cdp: {
    apiKeyName: string;
    apiKeyPrivateKey: Hex;
    mnemonicPhrase: string;
  };
};
