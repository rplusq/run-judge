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
  yarn \
  dbus \
  fontconfig

# Copy built app and setup permissions
COPY --from=deps /app .
RUN mkdir -p /home/node/.cache/ms-playwright /dev/shm && \
  chown -R node:node /home/node /dev/shm && \
  chmod -R 777 /home/node/.cache /dev/shm

ENV NODE_ENV=production \
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
  PLAYWRIGHT_BROWSERS_PATH=/usr/lib/chromium \
  CHROME_PATH=/usr/bin/chromium-browser \
  NODE_OPTIONS="--max-old-space-size=768"

EXPOSE 3000

# Switch to non-root user
USER node

# Start the application
CMD ["node", "apps/agent/dist/index.js"]
