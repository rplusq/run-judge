import { AgentKit, ViemWalletProvider } from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import { createWalletClient, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { AgentConfig, AgentInit } from "./types";

dotenv.config({ path: "../../.env" });

async function initAgent(): Promise<AgentInit> {
  const llm = new ChatOpenAI({
    model: "qwen/qwen-turbo",
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    },
  });

  const agentAccount = privateKeyToAccount(
    process.env.AGENT_PRIVATE_KEY as Hex,
  );
  const walletClient = createWalletClient({
    account: agentAccount,
    transport: http("https://rpc.ankr.com/base_sepolia"),
    chain: baseSepolia,
  });

  const walletProvider = new ViemWalletProvider(walletClient);

  const agentKit = await AgentKit.from({ walletProvider });

  console.log("Agent initialized");

  const tools = await getLangChainTools(agentKit);

  const memory = new MemorySaver();
  const agentCfg: AgentConfig = { configurable: { thread_id: "RunJudge Agent" } };

  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
  })

  return {
    agent,
    config: agentCfg,
  }
}

initAgent();
