FROM node:18-alpine AS builder

LABEL fly_launch_runtime="Next.js"

WORKDIR /app

RUN npm i -g turbo

COPY . .

RUN turbo prune --scope=web --docker

# Stage 2: Deps
FROM node:18-alpine AS deps
WORKDIR /app

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SUBGRAPH_URL="https://api.studio.thegraph.com/query/103746/run-judge/version/latest"

RUN npm i -g pnpm turbo

COPY --from=builder /app/out/json/ ./
COPY --from=builder /app/out/pnpm-lock.yaml ./
COPY --from=builder /app/out/pnpm-workspace.yaml ./

# Install SQLite and build dependencies
RUN apk add --no-cache python3 make g++ sqlite

RUN pnpm i --no-frozen-lockfile

# Now build the project
COPY --from=builder /app/out/full ./
COPY turbo.json ./

# Generate Prisma Client
RUN cd apps/web && npx prisma generate

RUN pnpm turbo run build --filter=web

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install SQLite
RUN apk add --no-cache sqlite

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create SQLite data directory and set permissions
RUN mkdir -p /data
RUN chown nextjs:nodejs /data

# Copy built assets
COPY --from=deps /app/apps/web/next.config.js ./
COPY --from=deps /app/apps/web/package.json ./
COPY --from=deps /app/apps/web/prisma ./prisma/

# Copy the standalone build
COPY --from=deps --chown=nextjs:nodejs /app/apps/web/.next/standalone ./

# Create the public directory
RUN mkdir -p /app/apps/web/.next/static
COPY --from=deps --chown=nextjs:nodejs /app/apps/web/.next/static /app/apps/web/.next/static

# Copy public assets if they exist
COPY --from=deps --chown=nextjs:nodejs /app/apps/web/public /app/apps/web/public

# Set the correct permissions
USER nextjs

# Expose port
EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Initialize database on startup
CMD npx prisma db push && node apps/web/server.js
