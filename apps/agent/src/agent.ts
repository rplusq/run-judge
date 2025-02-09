import {
  AgentKit,
  CdpWalletProvider,
  type CdpWalletProviderConfig,
} from '@coinbase/agentkit';
import { getLangChainTools } from '@coinbase/agentkit-langchain';
import {
  HumanMessage,
  MessageContent,
  MessageContentComplex,
} from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { runJudgeActionProvider } from './actions';
import type {
  ActivityResponse,
  AgentAnalyzeInput,
  AgentConfig,
  Agent as AgentType,
  AppConfig,
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

  async initialize(appConfig: AppConfig): Promise<void> {
    try {
      const llm = new ChatOpenAI({
        model: 'google/gemini-2.0-flash-001',
        configuration: {
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey: process.env.OPENROUTER_API_KEY,
        },
      });

      const walletProviderCfg: CdpWalletProviderConfig = {
        apiKeyName: appConfig.cdp.apiKeyName,
        apiKeyPrivateKey: appConfig.cdp.apiKeyPrivateKey,
        network: appConfig.chain,
      };

      const walletProvider =
        await CdpWalletProvider.configureWithWallet(walletProviderCfg);

      console.debug(
        '🔑 Wallet provider configured for address ',
        walletProvider.getAddress()
      );

      // const walletProvider = new ViemWalletProvider(walletClient);
      const agentKit = await AgentKit.from({
        walletProvider,
        actionProviders: [runJudgeActionProvider(appConfig)],
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

  async analyze(inputs: AgentAnalyzeInput[]): Promise<string> {
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
                  a fair and balanced outcome. An activity is considered invalid if there
                  is not sign of heart rate being recorded.

                  Reply in this JSON format and only in this
                  format.

                  {
                    "analysis": [{
                      "valid": boolean,
                      "message": string,
                      "activityId": number
                    }],
                    "winnerActivityId": number,
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

      let chunkAcc: string = '';

      for await (const chunk of stream) {
        if ('agent' in chunk) {
          chunkAcc += chunk.agent.messages[0].content;
        }
      }

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
