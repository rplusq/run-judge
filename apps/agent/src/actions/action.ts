import { customActionProvider, EvmWalletProvider } from '@coinbase/agentkit';
import { encodeFunctionData } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { z } from 'zod';
import { AppConfig } from '../types';
import { runJudgeABI } from './abi';
import { DeclareWinnerSchema } from './schemas';

export const runJudgeActionProvider = (appConfig: AppConfig) =>
  customActionProvider<EvmWalletProvider>({
    name: 'declare_winner',
    description: `
    This action will declare a winner of a challenge on-chain in the
    runjudge contract.

    It takes two parameters:
    - challengeId: The ID of the challenge
    - stravaActivityId: The ID of the Strava activity of the winner

    We only need to have enough funds to pay for the gas fees.
    `,
    schema: DeclareWinnerSchema,
    invoke: async (
      walletProvider: EvmWalletProvider,
      args: z.infer<typeof DeclareWinnerSchema>
    ) => {
      validateEnvAndChain(walletProvider, appConfig);

      // Send transaction to the RunJudge contract to deeclare the winner of the challenge
      const data = encodeFunctionData({
        abi: runJudgeABI,
        functionName: 'declareWinner',
        args: [BigInt(args.challengeId), BigInt(args.stravaActivityId)],
      });

      try {
        const txHash = await walletProvider.sendTransaction({
          to: appConfig.contractAddress,
          data,
        });

        await walletProvider.waitForTransactionReceipt(txHash);

        return txHash;
      } catch (error: unknown) {
        console.error('Error declaring winner:', error);
        throw error;
      }
    },
  });

// Simply validates env and network before sending a transaction
const validateEnvAndChain = (
  walletProvider: EvmWalletProvider,
  appConfig: AppConfig
) => {
  const network = walletProvider.getNetwork();

  if (
    appConfig.environment === 'production' &&
    network.chainId?.toString() !== base.id.toString()
  ) {
    throw new Error(
      `Invalid chain ID for env production. Got ${network.chainId}, expected ${base.id.toString()}`
    );
  }

  if (
    appConfig.environment === 'development' &&
    network.chainId?.toString() !== baseSepolia.id.toString()
  ) {
    throw new Error(
      `Invalid chain ID for env development. Got ${network.chainId}, expected ${baseSepolia.id.toString()}`
    );
  }
};
