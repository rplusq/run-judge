import '@coinbase/onchainkit/styles.css';
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Header } from '@/components/header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'RunJudge - Challenge friends to run together',
  description:
    'Create running challenges with friends, set a prize pool, and let our AI judge verify the winner through Strava.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
