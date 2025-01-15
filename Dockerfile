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

# 定義構建時參數
ARG NEXT_PUBLIC_API_DOMAIN
ARG DB_USER
ARG DB_HOST
ARG DB_NAME
ARG DB_PASSWORD
ARG OPENAI_API_KEY
ARG NEXTAUTH_SECRET

# 設置環境變數
ENV NEXT_PUBLIC_API_DOMAIN=${NEXT_PUBLIC_API_DOMAIN}
ENV NEXT_TELEMETRY_DISABLED=1
ENV DB_USER=${DB_USER}
ENV DB_HOST=${DB_HOST}
ENV DB_NAME=${DB_NAME}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
ENV POSTGRES_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}

# 設置 next.config.js 忽略 ESLint 和 TypeScript 錯誤
RUN echo 'module.exports = { output: "standalone", eslint: { ignoreDuringBuilds: true }, typescript: { ignoreBuildErrors: true } }' > next.config.js

# 構建
RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# 定義運行時參數
ARG NEXT_PUBLIC_API_DOMAIN
ARG DB_USER
ARG DB_HOST
ARG DB_NAME
ARG DB_PASSWORD
ARG OPENAI_API_KEY
ARG NEXTAUTH_SECRET

# 設置環境變數
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PATH=/app/node_modules/.bin:$PATH
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_PUBLIC_API_DOMAIN=${NEXT_PUBLIC_API_DOMAIN}
ENV DB_USER=${DB_USER}
ENV DB_HOST=${DB_HOST}
ENV DB_NAME=${DB_NAME}
ENV DB_PASSWORD=${DB_PASSWORD}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
ENV POSTGRES_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}

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

# 執行遷移和啟動應用
CMD ["sh", "-c", "tsx /app/db/migrate.ts && node server.js"]