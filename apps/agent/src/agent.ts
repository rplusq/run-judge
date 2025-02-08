import { AgentKit, ViemWalletProvider } from '@coinbase/agentkit';
import { getLangChainTools } from '@coinbase/agentkit-langchain';
import {
  HumanMessage,
  MessageContent,
  MessageContentComplex,
} from '@langchain/core/messages';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { PregelOutputType } from '@langchain/langgraph/pregel';
import { ChatOpenAI } from '@langchain/openai';
import { createWalletClient, http, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import type {
  AgentAnalyzeInput,
  AgentConfig,
  Agent as AgentType,
} from './types';

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

      console.log('Creating wallet client...');
      const agentAccount = privateKeyToAccount(
        process.env.AGENT_PRIVATE_KEY as Hex
      );
      const walletClient = createWalletClient({
        account: agentAccount,
        transport: http('https://rpc.ankr.com/base_sepolia'),
        chain: baseSepolia,
      });

      const walletProvider = new ViemWalletProvider(walletClient);
      console.log('Creating AgentKit...');
      const agentKit = await AgentKit.from({
        walletProvider,
        actionProviders: [],
      });

      console.log('Getting LangChain tools...');
      const tools = await getLangChainTools(agentKit);

      const memory = new MemorySaver();

      console.log('Creating React agent...');
      this.agent = createReactAgent({
        llm,
        tools,
        checkpointSaver: memory,
      });

      console.log('Agent initialization complete');
    } catch (error) {
      console.error('Error initializing agent:', error);
      throw error;
    }
  }

  async analyze(
    inputs: AgentAnalyzeInput[]
  ): Promise<IterableReadableStream<PregelOutputType>> {
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
        text: `Analyze these images from Strava and deduce whether or not any
                  manipulation was done. The idea is that you take in consideration
                  the fact these two activities are for a challenge so we need to
                  ensure that they were properly recorded with the images as proof
                  and that all the data presented records a steady and senseful
                  progression of the runner in whatever activity they were doing.

                  Use the smallest distance of the activities presented to you and
                  use that as the base to determine who could win the challenge. For example,
                  if you get one for 2km and one for 5km, try to determine what would have
                  been the data of the 5km one at if it had run for 2km as well to ensure
                  a fair and balanced outcome.

                  Reply in this JSON format and only in this
                  format.

                  {
                    "analysis": [{
                      "valid": boolean,
                      "message": string,
                      "activityId": string
                    }],
                    "winnerActivityId": string,
                    "analysisOutcome": string
                  }

                  Where "valid" means whether or not the image was manipulated and
                  "message" is a brief summary of your analysis. The "message" field
                  needs to be done in a sassy, funny and roasty. Try to keep it to max
                  250 characters. "activityId" is the ID of the activity that was
                  analyzed based on the input you received.

                  "winnerActivityId" is the winner of the challenge according to the analysis
                  you just performed. Similar to "activityId" this is the ID of the
                  activity that was analyzed based on the input you received.

                  "analysisOutcome" is a brief summary of the outcome of the analysis
                  you just performed. Why do you think the winner was the one that
                  was chosen? Keep this to max 500 characters.

                  ALWAYS reply in the JSON format. DO NOT output anything else
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
      console.log('Stream received from model');
      return stream;
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
}
