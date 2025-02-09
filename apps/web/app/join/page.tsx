import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AvailableChallengeList } from '@/components/available-challenge-list';
import { Users } from 'lucide-react';

export default function JoinPage() {
  return (
    <main className="container py-6 sm:py-12">
      <div className="mb-6 sm:mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Join a Challenge
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Browse and join available running challenges
            </p>
          </div>
        </div>
      </div>
      <AvailableChallengeList />
    </main>
  );
}
