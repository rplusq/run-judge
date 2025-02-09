import { http, createConfig, Config } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';

export const config: Config = createConfig({
  chains: [baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'Run Judge',
    }),
  ],
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
  },
});
