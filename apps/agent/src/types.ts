import { createReactAgent } from "@langchain/langgraph/prebuilt";

export type AgentConfig = {
  configurable: {
    thread_id: string;
  };
};

export type Agent = ReturnType<typeof createReactAgent>;

export type ActivityResponse = {
  valid: boolean;
  message: string;
}
