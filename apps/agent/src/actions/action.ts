import { customActionProvider, ViemWalletProvider } from '@coinbase/agentkit';
import { encodeFunctionData } from 'viem';
import { z } from 'zod';
import { runJudgeABI } from './abi';
import { DeclareWinnerSchema } from './schemas';

const RUN_JUDGE_ADDRESS = '0x80eb5478b64BcF13cA45b555f7AfF1e67b1f48F0';

export const runJudgeActionProvider = customActionProvider<ViemWalletProvider>({
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
    walletProvider: ViemWalletProvider,
    args: z.infer<typeof DeclareWinnerSchema>
  ) => {
    // Send transaction to the RunJudge contract to deeclare the winner of the challenge
    const data = encodeFunctionData({
      abi: runJudgeABI,
      functionName: 'declareWinner',
      args: [BigInt(args.challengeId), BigInt(args.stravaActivityId)],
    });

    try {
      const txHash = await walletProvider.sendTransaction({
        to: RUN_JUDGE_ADDRESS,
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
