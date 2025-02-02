"use client";

import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { baseSepolia } from "viem/chains";
import { SessionProvider } from "next-auth/react";

export function Providers(props: { children: ReactNode }) {
  return (
    <SessionProvider>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={baseSepolia}
      >
        {props.children}
      </OnchainKitProvider>
    </SessionProvider>
  );
}
