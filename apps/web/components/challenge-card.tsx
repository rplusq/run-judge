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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{distanceKm}km Challenge</CardTitle>
          <Badge
            variant={
              status === 'completed'
                ? 'secondary'
                : status === 'active'
                  ? 'default'
                  : 'outline'
            }
          >
            {status}
          </Badge>
        </div>
        <CardDescription>
          {date.toLocaleDateString()} at {date.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Entry Fee</span>
            <span>${entryFeeUSD}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Participants</span>
            <span>{participants}</span>
          </div>
          {winner && (
            <div className="flex justify-between text-sm">
              <span>Winner</span>
              <span className="font-mono">{`${winner.slice(0, 6)}...${winner.slice(
                -4
              )}`}</span>
            </div>
          )}
          {status === 'open' && onJoin && (
            <Button onClick={onJoin} className="w-full">
              Join Challenge
            </Button>
          )}
          {status === 'active' && onSubmit && (
            <Button onClick={onSubmit} className="w-full">
              Submit Run
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
