# RunJudge 🏃‍♂️

An AI-powered judge for social fitness challenges that verifies Strava runs while funds are staked. Think of it as a decentralized fitness escrow with a sassy personality that won't let you get away with taking the bus. 🏃‍♂️🚌

[Live Demo](https://runjudge-web.fly.dev/)

## What is RunJudge?

Running challenges with friends should be fun, fair, and rewarding. RunJudge makes it happen by combining Strava activities, AI verification, and USDC prizes on Base.

Create a challenge, set a distance and prize pool in USDC, and let our AI judge analyze Strava activities to determine the winner - all without needing any crypto knowledge!

## Key Features

- 🤖 AI-powered verification of Strava activities
- 💰 USDC prize pools on Base
- ❤️ Heart rate data verification
- 🏃 Pace analysis and normalization
- 🔐 Gasless transactions via Base Paymaster
- 🌐 No crypto knowledge required!

## Repository Structure

```
apps/
  ├── web/               # Next.js frontend application
  ├── agent/            # AI verification service using Coinbase Agent Kit
  └── subgraph/         # The Graph indexing service
packages/
  ├── contracts/        # Solidity smart contracts
  └── shared/           # Shared TypeScript utilities
```

## Smart Contract Deployments (Base Sepolia)

- RunJudge: [`0x80eb5478b64BcF13cA45b555f7AfF1e67b1f48F0`](https://sepolia.basescan.org/address/0x80eb5478b64BcF13cA45b555f7AfF1e67b1f48F0)
- USDC: [`0x036CbD53842c5426634e7929541eC2318f3dCF7e`](https://sepolia.basescan.org/address/0x036CbD53842c5426634e7929541eC2318f3dCF7e)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Strava account
- Base Sepolia USDC (get test tokens from [Circle Faucet](https://faucet.circle.com/))

### Development

1. Install dependencies:

```bash
pnpm install
```

2. Start the development server:

```bash
pnpm dev
```

## Technical Stack

### Smart Contracts

- Solidity smart contracts on Base
- Challenge creation with USDC staking
- Participant management
- Automated prize distribution

### AI Verification (Coinbase Agent Kit)

- LangChain with Gemini Pro
- Heart rate data verification
- Pace normalization
- Automated winner declaration

### Frontend

- Next.js 15 with App Router
- Coinbase OnchainKit
- Viem/Wagmi
- shadcn/ui + Tailwind CSS

### Backend & Data

- The Graph for challenge indexing
- Lifetime earnings tracking
- Challenge discovery
- Participant statistics

## Contributing

We welcome contributions! Please check our issues page or submit a pull request.

## License

MIT

---

Built with ❤️ by [aguxez](https://github.com/aguxez) and [rplusq](https://github.com/rplusq) for [ETHGlobal Agentic Ethereum 2025](https://ethglobal.com/events/agents)
