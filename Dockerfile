# syntax=docker.io/docker/dockerfile:1

FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN --mount=type=secret,id=DATABASE_URL \
  --mount=type=secret,id=OPENAI_API_KEY \
  --mount=type=secret,id=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
  --mount=type=secret,id=CLERK_SECRET_KEY \
  --mount=type=secret,id=CLERK_WEBHOOK_SIGNING_SECRET \
  --mount=type=secret,id=NEXT_PUBLIC_BASE_URL \
  --mount=type=secret,id=STRIPE_PUBLIC_KEY \
  --mount=type=secret,id=STRIPE_SECRET_KEY \
  --mount=type=secret,id=STRIPE_WEBHOOK_SECRET \
  --mount=type=secret,id=NEXT_PUBLIC_STRIPE_SAVANT_PRICE_ID \
  --mount=type=secret,id=NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID \
  --mount=type=secret,id=NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID \
  --mount=type=secret,id=NEXT_PUBLIC_STRIPE_MANAGE_SUBSCRIPTION_URL \
  --mount=type=secret,id=NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL \
  --mount=type=secret,id=NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL \
  set -a && \
  [ -f /run/secrets/DATABASE_URL ] && export DATABASE_URL=$(cat /run/secrets/DATABASE_URL); \
  [ -f /run/secrets/OPENAI_API_KEY ] && export OPENAI_API_KEY=$(cat /run/secrets/OPENAI_API_KEY); \
  [ -f /run/secrets/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ] && export NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$(cat /run/secrets/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY); \
  [ -f /run/secrets/CLERK_SECRET_KEY ] && export CLERK_SECRET_KEY=$(cat /run/secrets/CLERK_SECRET_KEY); \
  [ -f /run/secrets/CLERK_WEBHOOK_SIGNING_SECRET ] && export CLERK_WEBHOOK_SIGNING_SECRET=$(cat /run/secrets/CLERK_WEBHOOK_SIGNING_SECRET); \
  [ -f /run/secrets/NEXT_PUBLIC_BASE_URL ] && export NEXT_PUBLIC_BASE_URL=$(cat /run/secrets/NEXT_PUBLIC_BASE_URL); \
  [ -f /run/secrets/STRIPE_PUBLIC_KEY ] && export STRIPE_PUBLIC_KEY=$(cat /run/secrets/STRIPE_PUBLIC_KEY); \
  [ -f /run/secrets/STRIPE_SECRET_KEY ] && export STRIPE_SECRET_KEY=$(cat /run/secrets/STRIPE_SECRET_KEY); \
  [ -f /run/secrets/STRIPE_WEBHOOK_SECRET ] && export STRIPE_WEBHOOK_SECRET=$(cat /run/secrets/STRIPE_WEBHOOK_SECRET); \
  [ -f /run/secrets/NEXT_PUBLIC_STRIPE_SAVANT_PRICE_ID ] && export NEXT_PUBLIC_STRIPE_SAVANT_PRICE_ID=$(cat /run/secrets/NEXT_PUBLIC_STRIPE_SAVANT_PRICE_ID); \
  [ -f /run/secrets/NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID ] && export NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID=$(cat /run/secrets/NEXT_PUBLIC_STRIPE_SCHOLAR_PRICE_ID); \
  [ -f /run/secrets/NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ] && export NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=$(cat /run/secrets/NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID); \
  [ -f /run/secrets/NEXT_PUBLIC_STRIPE_MANAGE_SUBSCRIPTION_URL ] && export NEXT_PUBLIC_STRIPE_MANAGE_SUBSCRIPTION_URL=$(cat /run/secrets/NEXT_PUBLIC_STRIPE_MANAGE_SUBSCRIPTION_URL); \
  [ -f /run/secrets/NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL ] && export NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=$(cat /run/secrets/NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL); \
  [ -f /run/secrets/NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL ] && export NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=$(cat /run/secrets/NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL); \
  set +a && \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]