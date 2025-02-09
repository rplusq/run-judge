import { ChallengeDetails } from '@/components/challenge-details';
import { Metadata } from 'next';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: 'Challenge Details',
};

export default async function ChallengePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <main className="container max-w-lg py-12">
      <ChallengeDetails challengeId={id} />
    </main>
  );
}
