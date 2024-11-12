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

# 創建臨時的 next.config.js 來禁用 ESLint
RUN echo 'module.exports = {eslint: {ignoreDuringBuilds: true}}' > next.config.js

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

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
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 創建上傳目錄並設置權限
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

COPY --from=builder /app/public ./public

# 複製必要的運行時檔案
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# 複製資料庫遷移檔案
COPY --from=builder --chown=nextjs:nodejs /app/db ./db

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
ENV HOSTNAME="0.0.0.0"

# 修改啟動命令，先執行資料庫遷移再啟動服務
CMD tsx db/migrate && node server.js