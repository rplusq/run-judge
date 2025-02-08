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
      configurable: { thread_id: "RunJudge Agent" },
    };

    this.agent = null;
  }

  async initialize(): Promise<void> {
    try {
      const llm = new ChatOpenAI({
        model: "google/gemini-2.0-flash-001",
        configuration: {
          baseURL: "https://openrouter.ai/api/v1",
          apiKey: process.env.OPENROUTER_API_KEY,
        },
      });

      console.log("Creating wallet client...");
      const agentAccount = privateKeyToAccount(
        process.env.AGENT_PRIVATE_KEY as Hex
      );
      const walletClient = createWalletClient({
        account: agentAccount,
        transport: http("https://rpc.ankr.com/base_sepolia"),
        chain: baseSepolia,
      });

      const walletProvider = new ViemWalletProvider(walletClient);
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

  async analyze(
    base64Image: string
  ): Promise<IterableReadableStream<PregelOutputType>> {
    if (!this.agent) {
      throw new Error("Agent not initialized");
    }

    if (!base64Image) {
      throw new Error("No image data provided");
    }

    try {
      console.log("Starting agent analysis with image length:", base64Image.length);
      console.log("Creating message content...");

      console.log("Preparing image content...");
      const message = new HumanMessage({
        content: [
          {
            type: "text",
            text: `Analyze this image from Strava and deduce whether or not any
                  manipulation was done. Reply in this JSON format and only in this
                  format.

                  {
                    "valid": boolean,
                    "message": string
                  }

                  Where "valid" means whether or not the image was manipulated and
                  "message" is a brief summary of your analysis. The "message" field
                  needs to be done in a sassy and funny way. Try to keep it to max
                  150 characters.

                  ALWAYS reply in the JSON format. DO NOT output anything else
                  `
          },
          {
            type: "image_url",
            image_url: `data:image/png;base64,${base64Image}`
          }
        ]
      });

      console.log("Sending to model...");
      const stream = await this.agent.stream(
        {
          messages: [message]
        },
        this.config
      );
      console.log("Stream received from model");
      return stream;
    } catch (error) {
      console.error("Error in agentAnalyze:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      }
      throw error;
    }
  }
}
