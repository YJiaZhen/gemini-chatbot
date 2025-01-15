FROM node:18-alpine AS base

# 安裝 curl
RUN apk add --no-cache curl

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# 先啟用 pnpm
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g tsx

# 使用 --frozen-lockfile 確保版本一致性
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 添加預設環境變數
ENV NEXT_PUBLIC_API_DOMAIN=http://localhost:3001
ENV NEXT_TELEMETRY_DISABLED=1

# 設置 next.config.js 忽略 ESLint 和 TypeScript 錯誤
RUN echo 'module.exports = { output: "standalone", eslint: { ignoreDuringBuilds: true }, typescript: { ignoreBuildErrors: true } }' > next.config.js

# 構建
RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PATH=/app/node_modules/.bin:$PATH
ENV NEXT_PUBLIC_API_DOMAIN=http://localhost:3001

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p /app && chown -R nextjs:nodejs /app

# 複製構建文件
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/db ./db
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/node_modules ./node_modules

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 執行遷移和啟動應用
CMD ["sh", "-c", "tsx /app/db/migrate.ts && node server.js"]