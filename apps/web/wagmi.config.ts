import { defineConfig, Config } from '@wagmi/cli';
import { foundry, react } from '@wagmi/cli/plugins';
import { baseSepolia } from 'wagmi/chains';

export default defineConfig({
  out: 'lib/wagmi/generated.ts',
  plugins: [
    foundry({
      project: '../../packages/contracts',
      deployments: {
        ERC20: {
          [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        },
        RunJudge: {
          [baseSepolia.id]: '0xbabeC3dF164f14672c08AA277Af9936532c283Ba',
        },
      },
    }),
    react(),
  ],
}) as Config;
