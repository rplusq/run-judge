# RunJudge Agent Service

This is a standalone service that handles the AI agent functionality for RunJudge. It's built with Hono and uses LangChain for AI capabilities.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create a `.env` file based on `.env.example` and fill in the required values:

- `PORT`: The port number for the service (default: 3001)
- `OPENROUTER_API_KEY`: Your OpenRouter API key
- `AGENT_PRIVATE_KEY`: Private key for the agent's wallet

## Development

Run the development server:

```bash
pnpm dev
```

## Build

Build the project:

```bash
pnpm build
```

## Production

Start the production server:

```bash
pnpm start
```

## API Endpoints

### Health Check

- `GET /health`
- Returns the service status

### Analyze

- `POST /analyze`
- Body: `{ "input": "string" }`
- Returns a stream of agent responses
