'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { parseUnits, formatUnits, type Hash } from 'viem';
import { useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useWaitForTransactionReceipt } from 'wagmi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { FundCard } from '@coinbase/onchainkit/fund';
import {
  useWriteRunJudgeJoinChallenge,
  useWriteErc20Approve,
  useReadErc20Allowance,
  useReadErc20BalanceOf,
  runJudgeAddress,
  useSimulateRunJudgeJoinChallenge,
  useSimulateErc20Approve,
} from '@/lib/wagmi/generated';
import { baseSepolia } from 'viem/chains';
import { toast } from 'sonner';

interface JoinChallengeButtonProps {
  challengeId: string;
  entryFee: string;
}

export function JoinChallengeButton({
  challengeId,
  entryFee,
}: JoinChallengeButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { writeContractAsync: joinChallenge, isPending: isJoinPending } =
    useWriteRunJudgeJoinChallenge();
  const { writeContractAsync: approve, isPending: isApprovePending } =
    useWriteErc20Approve();
  const { data: allowance } = useReadErc20Allowance({
    args: address && [address, runJudgeAddress[baseSepolia.id]],
  });
  const { data: usdcBalance } = useReadErc20BalanceOf({
    args: address && [address],
  });

  // Add simulation hooks
  const { data: joinSimulation } = useSimulateRunJudgeJoinChallenge({
    args: [BigInt(challengeId)],
    chainId: baseSepolia.id,
  });

  const { data: approveSimulation } = useSimulateErc20Approve({
    args: [
      runJudgeAddress[baseSepolia.id],
      BigInt(2) ** BigInt(256) - BigInt(1),
    ],
    chainId: baseSepolia.id,
  });

  const [showFundDialog, setShowFundDialog] = useState(false);
  const [approveTxHash, setApproveTxHash] = useState<Hash>();
  const [joinTxHash, setJoinTxHash] = useState<Hash>();
  const [toastId, setToastId] = useState<string>();

  // Transaction receipt hooks
  const { isSuccess: isApproveSuccess, isError: isApproveError } =
    useWaitForTransactionReceipt({
      hash: approveTxHash,
      chainId: baseSepolia.id,
    });

  const { isSuccess: isJoinSuccess, isError: isJoinError } =
    useWaitForTransactionReceipt({
      hash: joinTxHash,
      chainId: baseSepolia.id,
    });

  // Handle transaction states
  useEffect(() => {
    if (approveTxHash) {
      if (isApproveSuccess) {
        toast.success('USDC approved successfully', { id: toastId });
        // Add delay to allow subgraph to index
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['readErc20Allowance'],
          });
          handleJoin();
        }, 3000); // Wait 3 seconds for subgraph indexing
        setApproveTxHash(undefined);
      } else if (isApproveError) {
        toast.error('USDC approval failed', { id: toastId });
        setApproveTxHash(undefined);
      }
    }
  }, [isApproveSuccess, isApproveError, approveTxHash, queryClient, toastId]);

  useEffect(() => {
    if (joinTxHash) {
      if (isJoinSuccess) {
        toast.success('Successfully joined challenge!', { id: toastId });
        // Add delay to allow subgraph to index
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['readErc20BalanceOf'],
          });
          queryClient.invalidateQueries({
            queryKey: ['readRunJudgeChallenges'],
          });
          queryClient.invalidateQueries({
            queryKey: ['userChallenges'],
          });
          queryClient.invalidateQueries({
            queryKey: ['available-challenges'],
          });
          // Invalidate the specific challenge query
          queryClient.invalidateQueries({
            queryKey: ['challenge', challengeId],
          });
          router.refresh();
        }, 3000); // Wait 3 seconds for subgraph indexing
        setJoinTxHash(undefined);
      } else if (isJoinError) {
        toast.error('Failed to join challenge', { id: toastId });
        setJoinTxHash(undefined);
      }
    }
  }, [
    isJoinSuccess,
    isJoinError,
    joinTxHash,
    queryClient,
    router,
    toastId,
    challengeId,
  ]);

  const handleJoin = async () => {
    if (!address || !entryFee) return;

    try {
      const entryFeeAmount = parseUnits(entryFee, 6); // USDC has 6 decimals

      // Check if we need approval
      if (!allowance || allowance < entryFeeAmount) {
        // Simulate approval first
        if (!approveSimulation?.request) {
          toast.error('Failed to simulate USDC approval');
          return;
        }

        // Approve max uint256 to save gas on future transactions
        const txHash = await approve({
          args: [
            runJudgeAddress[baseSepolia.id],
            BigInt(2) ** BigInt(256) - BigInt(1),
          ],
          chainId: baseSepolia.id,
        });

        const id = toast.loading('Approving USDC...').toString();
        setToastId(id);
        setApproveTxHash(txHash as Hash);
        return;
      }

      // Simulate join challenge
      if (!joinSimulation?.request) {
        toast.error('Failed to simulate joining challenge');
        return;
      }

      // Join challenge
      const txHash = await joinChallenge({
        args: [BigInt(challengeId)],
        chainId: baseSepolia.id,
      });

      const id = toast.loading('Joining challenge...').toString();
      setToastId(id);
      setJoinTxHash(txHash as Hash);
    } catch (error) {
      console.error('Failed to join challenge:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to join challenge'
      );
    }
  };

  const isPending = isJoinPending || isApprovePending;
  const hasEnoughBalance =
    usdcBalance && entryFee
      ? BigInt(usdcBalance) >= parseUnits(entryFee, 6)
      : false;

  const formattedBalance = usdcBalance
    ? parseFloat(formatUnits(usdcBalance, 6)).toFixed(2)
    : '0.00';

  if (!address) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Entry Fee: {entryFee} USDC</span>
        <span>Balance: {formattedBalance} USDC</span>
      </div>

      {!hasEnoughBalance ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-yellow-500">
            <AlertTriangle className="h-4 w-4" />
            <span>You need {entryFee} USDC to join this challenge</span>
          </div>
          <Dialog open={showFundDialog} onOpenChange={setShowFundDialog}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="w-full">
                Get USDC with Coinbase 💳
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Get USDC</DialogTitle>
                <DialogDescription>
                  Purchase USDC directly with your preferred payment method
                </DialogDescription>
              </DialogHeader>
              <FundCard
                assetSymbol="USDC"
                country="US"
                currency="USD"
                headerText="Get USDC for Challenge"
                buttonText="Purchase USDC"
                presetAmountInputs={[entryFee, '20', '50']}
                onSuccess={() => {
                  setTimeout(() => {
                    queryClient.invalidateQueries({
                      queryKey: ['readErc20BalanceOf'],
                    });
                    setShowFundDialog(false);
                  }, 2000);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Button
          onClick={handleJoin}
          disabled={isPending || !hasEnoughBalance}
          className="w-full"
        >
          {isApprovePending
            ? 'Approving USDC...'
            : isJoinPending
              ? 'Joining...'
              : !hasEnoughBalance
                ? 'Insufficient USDC Balance'
                : 'Join Challenge 🏃‍♂️'}
        </Button>
      )}
    </div>
  );
}
