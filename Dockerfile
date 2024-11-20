FROM node:18-alpine AS base

# 安裝 curl
RUN apk add --no-cache curl

# Install dependencies only when needed
FROM base AS deps
# 添加必要的編譯工具和 Python
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
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

# 創建 next.config.js
RUN echo 'module.exports = { output: "standalone", eslint: { ignoreDuringBuilds: true } }' > next.config.js

ENV NEXT_TELEMETRY_DISABLED=1

# 執行建置
RUN \
  if [ -f yarn.lock ]; then yarn next build; \
  elif [ -f package-lock.json ]; then npm run next build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm next build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 創建必要的目錄
RUN mkdir -p /app/uploads /app/.next && \
    chown -R nextjs:nodejs /app

# 複製必要的檔案與目錄
# COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/tsx ./
COPY --from=builder --chown=nextjs:nodejs /app/db ./db
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "/app/node_modules/.bin/tsx /app/db/migrate.ts && tail -f /dev/null"]