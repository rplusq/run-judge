import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { formatUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Timer,
  Ban,
  Users,
  DollarSign,
  Crown,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ChallengeCardProps {
  startTime: string;
  distance: string;
  entryFee: string;
  participants: number;
  participantsLength: string;
  status: 'open' | 'active' | 'completed' | 'cancelled';
  winner?: string;
  creator?: string;
  userAddress?: string;
  challengeId: string;
  isCancelled: boolean;
  onJoin?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
}

const getStatusConfig = (status: ChallengeCardProps['status']) => {
  switch (status) {
    case 'cancelled':
      return {
        label: 'Cancelled',
        Icon: Ban,
        variant: 'destructive' as const,
        iconClass: 'text-destructive',
      };
    case 'completed':
      return {
        label: 'Completed',
        Icon: Trophy,
        variant: 'secondary' as const,
        iconClass: 'text-green-500',
      };
    case 'open':
      return {
        label: 'Open',
        Icon: Timer,
        variant: 'outline' as const,
        iconClass: 'text-primary',
      };
    case 'active':
      return {
        label: 'Active',
        Icon: Timer,
        variant: 'default' as const,
        iconClass: 'text-yellow-500',
      };
  }
};

export function ChallengeCard({
  startTime,
  distance,
  entryFee,
  participants,
  participantsLength,
  status,
  winner,
  creator,
  userAddress,
  challengeId,
  onJoin,
  onSubmit,
  onCancel,
  isCancelled,
}: ChallengeCardProps) {
  const date = new Date(parseInt(startTime) * 1000);
  const distanceKm = parseInt(distance) / 1000;
  const entryFeeUSD = Number(formatUnits(BigInt(entryFee), 6)).toFixed(2);
  const isCreator =
    creator &&
    userAddress &&
    creator.toLowerCase() === userAddress.toLowerCase();
  const canCancel =
    isCreator && !isCancelled && parseInt(participantsLength) === 1 && onCancel;

  const statusConfig = getStatusConfig(status);

  return (
    <div className="w-full">
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  {distanceKm}km Challenge
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-sm">
                  <Calendar className="h-4 w-4" />
                  {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                </CardDescription>
              </div>
              <Badge
                variant={statusConfig.variant}
                className={cn(
                  'inline-flex items-center whitespace-nowrap gap-1 text-xs px-2 py-0.5 font-medium',
                  status === 'open' && 'border-primary text-primary'
                )}
              >
                <statusConfig.Icon className="h-3 w-3 shrink-0" />
                {statusConfig.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4" />
                  Entry Fee
                </span>
                <p className="font-medium">${entryFeeUSD}</p>
              </div>
              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Participants
                </span>
                <p className="font-medium">{participantsLength}</p>
              </div>
            </div>

            {winner && (
              <div className="space-y-1.5 border rounded-lg p-3 bg-muted/50">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  Winner
                </span>
                <p className="font-mono text-sm">
                  {`${winner.slice(0, 6)}...${winner.slice(-4)}`}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/challenge/${challengeId}`}
                  className="flex items-center justify-center gap-2"
                >
                  View Details
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              {status === 'open' && !winner && (
                <>
                  {onJoin && (
                    <Button onClick={onJoin} className="w-full" size="lg">
                      Join Challenge
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      onClick={onCancel}
                      variant="destructive"
                      className="w-full"
                      size="lg"
                    >
                      Cancel Challenge
                    </Button>
                  )}
                </>
              )}
              {status === 'active' && onSubmit && (
                <Button onClick={onSubmit} className="w-full" size="lg">
                  Submit Run
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
