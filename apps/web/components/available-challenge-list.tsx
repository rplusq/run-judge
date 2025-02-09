'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import {
  graphqlClient,
  GET_AVAILABLE_CHALLENGES,
  Challenge,
} from '@/lib/graphql';
import { ChallengeCard } from '@/components/challenge-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WalletConnect } from '@/components/wallet-connect';
import { Timer, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';

type ChallengesResponse = {
  challenges: Challenge[];
};

export function AvailableChallengeList() {
  const { address } = useAccount();
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const { data, isLoading } = useQuery<ChallengesResponse>({
    queryKey: ['available-challenges', address],
    queryFn: async () => {
      if (!address) return { challenges: [] };
      const data = await graphqlClient.request<ChallengesResponse>(
        GET_AVAILABLE_CHALLENGES,
        {
          address: address.toLowerCase(),
        }
      );
      return data;
    },
    enabled: !!address,
  });

  const challenges = data?.challenges ?? [];

  if (!address) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl sm:text-3xl">Connect Wallet</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Connect your wallet to view and join running challenges
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <WalletConnect />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl sm:text-3xl">
            Loading Available Challenges
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Please wait while we fetch available challenges
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!challenges.length) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl sm:text-3xl">
            No Available Challenges
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            There are currently no challenges available to join
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 p-6">
          <p className="text-muted-foreground text-center max-w-md">
            Check back later for new challenges or create your own challenge to
            get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedChallenges = [...challenges].sort((a, b) => {
    const aTime = parseInt(a.startTime);
    const bTime = parseInt(b.startTime);
    return sort === 'newest' ? bTime - aTime : aTime - bTime;
  });

  const totalPrizePool = challenges.reduce(
    (acc, c) => acc + parseFloat(c.totalPrize),
    0
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Available Challenges
            </CardTitle>
            <CardDescription className="text-xl sm:text-2xl font-bold">
              {challenges.length}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Total Prize Pool
            </CardTitle>
            <CardDescription className="text-xl sm:text-2xl font-bold">
              ${parseFloat(formatUnits(BigInt(totalPrizePool), 6)).toFixed(2)}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Select value={sort} onValueChange={setSort as any}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Challenge Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {sortedChallenges.map((challenge) => {
          const status =
            new Date(parseInt(challenge.startTime) * 1000) > new Date()
              ? 'open'
              : 'active';

          return (
            <ChallengeCard
              key={challenge.id}
              challengeId={challenge.id}
              startTime={challenge.startTime}
              distance={challenge.distance}
              entryFee={challenge.entryFee}
              participants={challenge.participants.length}
              status={status}
              creator={challenge.participants[0]?.participant}
              userAddress={address}
              isCancelled={challenge.isCancelled}
            />
          );
        })}
      </div>
    </div>
  );
}
