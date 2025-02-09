import { base, baseSepolia } from 'viem/chains';
import { AppConfig } from './types';

// we would not normally load the env like this but this helps us
// typecheck it
const environment: 'development' | 'production' =
  process.env.ENVIRONMENT === 'production' ? 'production' : 'development';

export const appConfig: AppConfig = {
  environment,
  chain: environment === 'production' ? base : baseSepolia,
  rpcUrl:
    environment === 'production'
      ? 'https://rpc.ankr.com/base'
      : 'https://rpc.ankr.com/base_sepolia',
};
