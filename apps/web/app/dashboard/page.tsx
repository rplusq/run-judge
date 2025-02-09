import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChallengeList } from '@/components/challenge-list';
import { PlusCircle, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <main className="container py-6 sm:py-12">
      <div className="mb-6 sm:mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Running Challenges
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage your running challenges and track your progress
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/join">
                <Users className="mr-2 h-4 w-4" />
                Join Challenge
              </Link>
            </Button>
            <Button className="w-full sm:w-auto" asChild>
              <Link href="/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Challenge
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <ChallengeList />
    </main>
  );
}
