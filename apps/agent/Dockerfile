## NodeJS hono Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

RUN npm i -g turbo

COPY . .

RUN turbo prune --scope=agent --docker

# Stage 2: Deps
FROM node:18-alpine AS deps
WORKDIR /app

RUN npm i -g pnpm turbo

COPY --from=builder /app/out/json/ ./
COPY --from=builder /app/out/pnpm-lock.yaml ./
COPY --from=builder /app/out/pnpm-workspace.yaml ./

# node-gyp and family...
RUN apk add --no-cache python3 make g++

RUN pnpm i --frozen-lockfile

# Now build the project
COPY --from=builder /app/out/full ./
COPY turbo.json ./

RUN pnpm turbo run build --filter=agent

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Add browser dependencies
RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  nodejs \
  yarn

# Create browser folders and set permissions
RUN mkdir -p /home/node/.cache/ms-playwright && \
  chown -R node:node /home/node/.cache

ENV NODE_ENV=production

EXPOSE 3000

# Set the correct permissions
USER node

COPY --from=deps /app .

RUN cd apps/agent && npx playwright install

# Start the application
CMD ["node", "apps/agent/dist/index.js"]
