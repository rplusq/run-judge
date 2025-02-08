import { useReadContract, useWriteContract } from 'wagmi';
import { RUNJUDGE_ABI, RUNJUDGE_ADDRESS } from '../contracts';

export function useCreateChallenge() {
  const { writeContract, isPending } = useWriteContract();

  return {
    createChallenge: async (date: Date, distance: number, entryFee: bigint) => {
      const startTime = BigInt(Math.floor(date.getTime() / 1000));
      return writeContract({
        address: RUNJUDGE_ADDRESS,
        abi: RUNJUDGE_ABI,
        functionName: 'createChallenge',
        args: [Number(startTime), Number(distance), entryFee],
      });
    },
    isPending,
  };
}

export function useJoinChallenge() {
  const { writeContract, isPending } = useWriteContract();

  return {
    joinChallenge: async (challengeId: bigint) => {
      return writeContract({
        address: RUNJUDGE_ADDRESS,
        abi: RUNJUDGE_ABI,
        functionName: 'joinChallenge',
        args: [challengeId],
      });
    },
    isPending,
  };
}

export function useSubmitResult() {
  const { writeContract, isPending } = useWriteContract();

  return {
    submitResult: async (challengeId: bigint, stravaActivityId: bigint) => {
      return writeContract({
        address: RUNJUDGE_ADDRESS,
        abi: RUNJUDGE_ABI,
        functionName: 'submitResult',
        args: [challengeId, stravaActivityId],
      });
    },
    isPending,
  };
}

export function useChallenge(challengeId: bigint) {
  return useReadContract({
    address: RUNJUDGE_ADDRESS,
    abi: RUNJUDGE_ABI,
    functionName: 'challenges',
    args: [challengeId],
  });
}
