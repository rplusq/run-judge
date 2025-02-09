import { AgentKit, ViemWalletProvider } from '@coinbase/agentkit';
import { getLangChainTools } from '@coinbase/agentkit-langchain';
import {
  HumanMessage,
  MessageContent,
  MessageContentComplex,
} from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { createWalletClient, http, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { runJudgeActionProvider } from './actions';
import { loadAppConfig } from './config';
import type {
  ActivityResponse,
  AgentAnalyzeInput,
  AgentConfig,
  Agent as AgentType,
} from './types';

const appConfig = loadAppConfig();

export class Agent {
  private agent: AgentType | null;
  private config: AgentConfig;

  constructor() {
    this.config = {
      configurable: { thread_id: 'RunJudge Agent' },
    };

    this.agent = null;
  }

  async initialize(): Promise<void> {
    try {
      const llm = new ChatOpenAI({
        model: 'google/gemini-2.0-flash-001',
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey: process.env.OPENROUTER_API_KEY,
        },
      });

      const agentAccount = privateKeyToAccount(
        process.env.AGENT_PRIVATE_KEY as Hex
      );
      const walletClient = createWalletClient({
        account: agentAccount,
        transport: http(appConfig.rpcUrl),
        chain: appConfig.chain,
      });

      const walletProvider = new ViemWalletProvider(walletClient);
      const agentKit = await AgentKit.from({
        walletProvider,
        actionProviders: [runJudgeActionProvider],
      });

      const tools = await getLangChainTools(agentKit);

      this.agent = createReactAgent({
        llm,
        tools,
        // Taken from the quickstart guide in the CDP docs as we do not need
        // any state modifier specific for our on-chain use case
        stateModifier: `
        You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit.
        You are empowered to interact onchain using your tools. If you ever need funds, you can request
        them from the faucet if you are on network ID 'base-sepolia'.
        You can execute requests in either base-sepolia and base mainnet. Of course, you do not have
        a faucet for mainnet.
        `,
      });

      console.log('Agent initialization complete');
    } catch (error) {
      console.error('Error initializing agent:', error);
      throw error;
    }
  }

  async analyze(
    inputs: AgentAnalyzeInput[],
    challengeDistance: number
  ): Promise<string> {
    if (!this.agent) {
      throw new Error('Agent not initialized');
    }

    const imageInput: MessageContent = inputs.flatMap((input) => {
      return [
        {
          type: 'text',
          text: `the following image ID is ${input.activityId}`,
        },
        {
          type: 'image_url',
          image_url: `data:image/png;base64,${input.base64Image}`,
        },
      ];
    });

    const messageContent: MessageContentComplex[] = [
      {
        type: 'text',
        text: `
        Analyze the provided Strava activities to determine a valid challenge winner. Each activity will be validated and compared following these strict rules:

        VALIDATION RULES:
          Activity is INVALID if ANY of these are true:
          - If you cannot identify heart rate in the image please mark is as invalid.
            The heart rate data is usually a toggle at the end of the image you are given. We only want to validate
            whether this toggle is present or not, it does not need to be turned ON as this indicates there is availability
            of heart rate data which is the important bit. Only rely on whether or not you identify the string "Heart Rate"
            in the image.
          - Sudden pace changes (>3 min/km or mile variation)
          - Non-natural progression in speed/distance
          - Activity MUST be running, no cycling or walking
          - Strava sometimes flags activities as invalid on their UI. Ensure that if you identify an area
            saying "This activity has been flagged" in red, mark it as invalid automatically.
            This is EXTREMELY important as it is the most obvious way to identify invalid activities and save you processing
            time.

        COMPARISON RULES:
        1. Use shortest activity distance as benchmark
        2. Scale longer activity to benchmark distance using average pace
        3. Compare scaled times for valid activities
        4. If times are equal, lower average heart rate wins
        5. If both activities invalid, no winner declared
        6. The challenge distance IS ${challengeDistance} meters so consider this as the base distance

        Response must be JSON with this structure:
        {
          "analysis": [
            {
              "valid": boolean, // Whether the activity was manipulated or failed any of the constraints set above
              "message": string, // Sassy, funny and roasty message, max 250 chars
              "activityId": number
            }
          ],
          "winnerActivityId": number | null, // null if no valid winner
          "analysisOutcome": string // Clear explanation
        }

          Output MUST be valid JSON. No additional text or explanations outside JSON structure.
          DO NOT OUTPUT anything else than does not comfort the structure you were provided.
          `,
      },
    ];

    messageContent.push(...imageInput);

    try {
      const message = new HumanMessage({
        content: messageContent,
      });

      console.log('🧠 Sending to model...');

      const stream = await this.agent.stream(
        {
          messages: [message],
        },
        this.config
      );

      let chunkAcc: string = '';

      for await (const chunk of stream) {
        if ('agent' in chunk) {
          chunkAcc += chunk.agent.messages[0].content;
        }
      }

      console.debug('🧠 Post analysis chunk:', chunkAcc);

      return chunkAcc;
    } catch (error) {
      console.error('Error in agentAnalyze:', error);

      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
      throw error;
    }
  }

  async analyzeActivityOutcome(
    challengeId: number,
    activityOutcome: ActivityResponse
  ): Promise<string> {
    if (!this.agent) {
      throw new Error('Agent not initialized');
    }

    const message = new HumanMessage({
      content: `
        Based on the activity outcome, declare the winner of the challenge ${challengeId}.
        The winner is the activity with the ID ${activityOutcome.winnerActivityId}.
      `,
    });

    console.log('🧠 Sending analysis outcome to model...');
    const stream = await this.agent.stream(
      {
        messages: [message],
      },
      this.config
    );

    let chunkAcc: string = '';

    for await (const chunk of stream) {
      if ('agent' in chunk) {
        chunkAcc += chunk.agent.messages[0].content;
      } else if ('tools' in chunk) {
        chunkAcc += chunk.tools.messages[0].content;
      }
    }

    console.log('Post analysis chunk:', chunkAcc);

    return chunkAcc;
  }
}
