# Dockerfile for Next.js App
FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps
# Instalar dependencias necesarias para Prisma y build
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Instalar OpenSSL y dependencias para Prisma
RUN apt-get update && \
    apt-get install -y openssl libssl3 libssl-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para evitar problemas de compilación
ENV NEXT_TELEMETRY_DISABLED=1
# DATABASE_URL dummy para build (Prisma necesita validar el schema)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
# API URL dummy para build
ENV NEXT_PUBLIC_API_URL="http://localhost:3000"
# Deshabilitar generación estática (la BD no está disponible durante build)
ENV SKIP_BUILD_STATIC_GENERATION=1
# Forzar a Prisma a usar el binario correcto para Debian
ENV PRISMA_CLI_BINARY_TARGETS="debian-openssl-3.0.x"

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js (versión 15 usa webpack por defecto, no Turbopack)
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package.json y package-lock.json para poder ejecutar npx
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

# Cambiar permisos para que nextjs pueda ejecutar comandos
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
