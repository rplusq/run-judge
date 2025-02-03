import { createReactAgent } from "@langchain/langgraph/prebuilt";

export type AgentConfig = {
  configurable: {
    thread_id: string;
  };
};

export type AgentInit = {
  agent: ReturnType<typeof createReactAgent>;
  config: AgentConfig;
}
