'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useUserChallenges } from '@/lib/hooks/use-subgraph';
import { ChallengeCard } from '@/components/challenge-card';
import { Button } from '@/components/ui/button';
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
import { useWriteRunJudgeCancelChallenge } from '@/lib/wagmi/generated';
import { Trophy, Timer, Ban } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const getChallengeStatus = (challenge: {
  isCancelled: boolean;
  winner: string | null;
  startTime: string;
}) => {
  if (challenge.isCancelled) return 'cancelled';
  if (challenge.winner) return 'completed';
  return new Date(parseInt(challenge.startTime) * 1000) > new Date()
    ? 'open'
    : 'active';
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'cancelled':
      return { label: 'Cancelled', color: 'text-destructive', Icon: Ban };
    case 'completed':
      return { label: 'Completed', color: 'text-green-500', Icon: Trophy };
    case 'open':
      return { label: 'Open to Join', color: 'text-primary', Icon: Timer };
    case 'active':
      return { label: 'In Progress', color: 'text-yellow-500', Icon: Timer };
    default:
      return { label: status, color: 'text-muted-foreground', Icon: Timer };
  }
};

export function ChallengeList() {
  const router = useRouter();
  const { address } = useAccount();
  const { data: challenges, isLoading } = useUserChallenges(address);
  const { writeContractAsync: cancelChallenge } =
    useWriteRunJudgeCancelChallenge();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [showCancelled, setShowCancelled] = useState(false);

  if (!address) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl sm:text-3xl">Connect Wallet</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Connect your wallet to view and manage your running challenges
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
            Loading Your Challenges
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Please wait while we fetch your running challenges
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!challenges?.length) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl sm:text-3xl">
            Start Your First Challenge
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Create or join a running challenge to compete with others and earn
            rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 p-6">
          <p className="text-muted-foreground text-center max-w-md">
            Running challenges are a fun way to stay motivated and compete with
            others. Create your first challenge or join an existing one to get
            started.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push('/join')}>
              Join a Challenge
            </Button>
            <Button onClick={() => router.push('/create')}>
              Create Your First Challenge
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeChallenges = challenges.filter(
    (c) => getChallengeStatus(c.challenge) === 'active'
  );
  const completedChallenges = challenges.filter(
    (c) => getChallengeStatus(c.challenge) === 'completed'
  );
  const totalEarned = challenges.reduce(
    (acc, c) =>
      c.challenge.winner === address
        ? acc + parseFloat(c.challenge.entryFee)
        : acc,
    0
  );

  const filteredChallenges = challenges
    .filter((challenge) => {
      if (!showCancelled && challenge.challenge.isCancelled) return false;
      if (filter === 'all') return true;
      const status = getChallengeStatus(challenge.challenge);
      return status === filter;
    })
    .sort((a, b) => {
      if (a.challenge.isCancelled && !b.challenge.isCancelled) return 1;
      if (!a.challenge.isCancelled && b.challenge.isCancelled) return -1;

      const aTime = parseInt(a.challenge.startTime);
      const bTime = parseInt(b.challenge.startTime);
      return sort === 'newest' ? bTime - aTime : aTime - bTime;
    });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              Active Challenges
            </CardTitle>
            <CardDescription className="text-xl sm:text-2xl font-bold">
              {activeChallenges.length}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              Completed
            </CardTitle>
            <CardDescription className="text-xl sm:text-2xl font-bold">
              {completedChallenges.length}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Total Earned
            </CardTitle>
            <CardDescription className="text-xl sm:text-2xl font-bold">
              {totalEarned.toFixed(2)} USDC
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <Select value={filter} onValueChange={setFilter as any}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter challenges" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Challenges</SelectItem>
              {['active', 'open', 'completed'].map((status) => {
                const { Icon, label } = getStatusLabel(status);
                return (
                  <SelectItem key={status} value={status}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

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

        <div className="flex items-center space-x-2">
          <Switch
            id="show-cancelled"
            checked={showCancelled}
            onCheckedChange={setShowCancelled}
          />
          <Label htmlFor="show-cancelled" className="text-sm">
            Show Cancelled
          </Label>
        </div>
      </div>

      {/* Challenge Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {filteredChallenges.map((challenge) => (
          <div
            key={challenge.challenge.id}
            className={cn(
              'transition-opacity',
              challenge.challenge.isCancelled && 'opacity-60'
            )}
          >
            <ChallengeCard
              challengeId={challenge.challenge.id}
              startTime={challenge.challenge.startTime}
              distance={challenge.challenge.distance}
              entryFee={challenge.challenge.entryFee}
              participants={challenge.challenge.participants.length}
              participantsLength={challenge.challenge.participantsLength}
              status={getChallengeStatus(challenge.challenge)}
              creator={challenge.challenge.participants[0]?.participant}
              userAddress={address}
              isCancelled={challenge.challenge.isCancelled}
              onCancel={() => {
                cancelChallenge({
                  args: [BigInt(challenge.challenge.id)],
                });
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
