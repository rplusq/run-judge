import { ChallengeDetails } from '@/components/challenge-details';
import { Metadata } from 'next';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export const metadata: Metadata = {
  title: 'Challenge Details',
};

export default async function ChallengePage({ params }: Props) {
  return (
    <main className="container max-w-lg py-12">
      <ChallengeDetails challengeId={params.id} />
    </main>
  );
}
