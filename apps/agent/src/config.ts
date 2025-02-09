import { Hex } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { AppConfig } from './types';

// we would not normally load the env like this but this helps us
// typecheck it and it's faster
const environment: 'development' | 'production' =
  process.env.ENVIRONMENT === 'production' ? 'production' : 'development';

export const loadAppConfig: () => AppConfig = () => {
  const cdpApiKeyB64 = process.env.CDP_API_KEY_PRIVATE_KEY_B64!;
  const cdpApiKeyPrivateKey = Buffer.from(cdpApiKeyB64, 'base64')
    .toString('utf-8')
    .replace(/\\n/g, '\n');

  console.log(cdpApiKeyPrivateKey);

  return {
    environment,
    contractAddress:
      environment === 'production'
        ? '0x80eb5478b64BcF13cA45b555f7AfF1e67b1f48F0'
        : '0xbabeC3dF164f14672c08AA277Af9936532c283Ba',
    chain: environment === 'production' ? base : baseSepolia,
    cdp: {
      apiKeyName: process.env.CDP_API_KEY_NAME!,
      apiKeyPrivateKey: cdpApiKeyPrivateKey as Hex,
      mnemonicPhrase: process.env.CDP_MNEMONIC_PHRASE!,
    },
    rpcUrl:
      environment === 'production'
        ? 'https://rpc.ankr.com/base'
        : 'https://rpc.ankr.com/base_sepolia',
  };
};
