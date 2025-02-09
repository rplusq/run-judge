import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatEther } from 'viem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChallengeCardProps {
  startTime: string;
  distance: string;
  entryFee: string;
  participants: number;
  status: 'open' | 'active' | 'completed';
  winner?: string;
  onJoin?: () => void;
  onSubmit?: () => void;
}

export function ChallengeCard({
  startTime,
  distance,
  entryFee,
  participants,
  status,
  winner,
  onJoin,
  onSubmit,
}: ChallengeCardProps) {
  const date = new Date(parseInt(startTime) * 1000);
  const distanceKm = parseInt(distance) / 1000;
  const entryFeeUSD = parseFloat(formatEther(BigInt(entryFee))) * 1; // Assuming 1 USDC = $1

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
          <CardTitle className="text-xl sm:text-2xl">
            {distanceKm}km Challenge
          </CardTitle>
          <Badge
            variant={
              status === 'completed'
                ? 'secondary'
                : status === 'active'
                  ? 'default'
                  : 'outline'
            }
            className="w-fit text-xs sm:text-sm px-2 py-1"
          >
            {status}
          </Badge>
        </div>
        <CardDescription className="text-sm sm:text-base">
          {date.toLocaleDateString()} at {date.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-muted-foreground">Entry Fee</span>
              <span className="font-medium">${entryFeeUSD}</span>
            </div>
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-muted-foreground">Participants</span>
              <span className="font-medium">{participants}</span>
            </div>
            {winner && (
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-muted-foreground">Winner</span>
                <span className="font-mono font-medium">{`${winner.slice(0, 6)}...${winner.slice(
                  -4
                )}`}</span>
              </div>
            )}
          </div>
          {status === 'open' && onJoin && (
            <Button
              onClick={onJoin}
              className="w-full py-5 text-sm sm:text-base"
            >
              Join Challenge
            </Button>
          )}
          {status === 'active' && onSubmit && (
            <Button
              onClick={onSubmit}
              className="w-full py-5 text-sm sm:text-base"
            >
              Submit Run
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
