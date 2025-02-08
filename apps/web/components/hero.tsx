import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Challenge friends to run together, winner takes all
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Create running challenges with friends, set a prize pool, and let
            our AI judge verify the winner through Strava. It's that simple!
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/create">Challenge a Friend</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">View My Challenges</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
