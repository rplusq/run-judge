import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChallengeList } from '@/components/challenge-list';

export default function DashboardPage() {
  return (
    <main className="container max-w-lg py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Challenges</h1>
        <Button asChild>
          <Link href="/create">Create Challenge</Link>
        </Button>
      </div>
      <ChallengeList />
    </main>
  );
}
