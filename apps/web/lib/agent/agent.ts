import { AgentKit, ViemWalletProvider } from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { IterableReadableStream } from "@langchain/core/utils/stream";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { PregelOutputType } from "@langchain/langgraph/pregel";
import { ChatOpenAI } from "@langchain/openai";
import { createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import type { AgentConfig, Agent as AgentType } from "./types";

export class Agent {
  private agent: AgentType | null;
  private config: AgentConfig;

  constructor() {
    this.config = {
      configurable: { thread_id: "RunJudge Agent" }
    };

    this.agent = null;
  }

  async initialize(): Promise<void> {
    try {
      const llm = new ChatOpenAI({
        model: "qwen/qwen-turbo",
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: process.env.OPENROUTER_API_KEY,
        },
      });

      console.log("Creating wallet client...");
      const agentAccount = privateKeyToAccount(
        process.env.AGENT_PRIVATE_KEY as Hex,
      );
      const walletClient = createWalletClient({
        account: agentAccount,
        transport: http("https://rpc.ankr.com/base_sepolia"),
        chain: baseSepolia,
      });

      const walletProvider = new ViemWalletProvider(walletClient)
      console.log("Creating AgentKit...");
      const agentKit = await AgentKit.from({
        walletProvider,
        actionProviders: [],
      });

      console.log("Getting LangChain tools...");
      const tools = await getLangChainTools(agentKit);

      const memory = new MemorySaver();

      const systemMsg = new SystemMessage({
        name: "RunJudge",
        content: `
          You are a helpful agent that assists with data analysis and interpretation
          for fitness activities. You understand and make judgements based on the
          output of running challenges which result in on-chain transactions in
          in the Base Sepolia testnet.

          You are given input data you need to make sense by your own.
          If something is not clear you WILL analyze another snippet of the same
          data more closely.

          Refrain from restarting your tools' descriptions
          `,
      });

      console.log("Creating React agent...");
      this.agent = createReactAgent({
        llm,
        tools,
        checkpointSaver: memory,
        stateModifier: systemMsg,
      });

      console.log("Agent initialization complete");
    } catch (error) {
      console.error("Error initializing agent:", error);
      throw error;
    }
  }

  async agentAnalyzeImpl(agent: AgentType, config: AgentConfig): Promise<IterableReadableStream<PregelOutputType>> {
    try {
      console.log("Starting agent analysis with config:", config);

      const stream = await agent.stream({
        messages: [
          new HumanMessage("Hello, tell me a fact about the Base Sepolia testnet"),
        ]
      }, config);

      console.log("Stream created successfully");
      return stream;
    } catch (error) {
      console.error("Error in agentAnalyze:", error);
      throw error;
    }
  }
}
