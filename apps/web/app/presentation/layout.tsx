import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RunJudge Presentation',
};

export default function PresentationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="!min-h-screen !p-0 !m-0" suppressHydrationWarning>
      {children}
    </div>
  );
}
