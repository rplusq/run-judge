import "@coinbase/onchainkit/styles.css";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import type React from "react"; // Import React
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "RunJudge - Fair Play for Fitness Bets",
  description:
    "Synchronized Saturday runs, verified by AI, winner takes the yield-generating prize pool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          inter.className,
          "bg-gray-900 text-gray-100 min-h-screen"
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
