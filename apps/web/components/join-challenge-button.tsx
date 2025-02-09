'use client';

import { formatEther } from 'viem';
import { useWriteRunJudgeJoinChallenge } from '@/lib/wagmi/generated';
import { Button } from '@/components/ui/button';

interface JoinChallengeButtonProps {
  challengeId: string;
  entryFee: string;
}

export function JoinChallengeButton({
  challengeId,
  entryFee,
}: JoinChallengeButtonProps) {
  const { writeContractAsync: joinChallenge, isPending } =
    useWriteRunJudgeJoinChallenge();
  const entryFeeUSD = parseFloat(formatEther(BigInt(entryFee))) * 1;

  const handleJoin = async () => {
    try {
      await joinChallenge({
        args: [BigInt(challengeId)],
      });
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  return (
    <Button onClick={handleJoin} disabled={isPending} className="w-full">
      {isPending ? 'Joining...' : `Join Challenge ($${entryFeeUSD})`}
    </Button>
  );
}
