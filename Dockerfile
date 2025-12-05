# ========================================
# Dockerfile para Next.js 15 + Prisma
# Optimizado para CPU antiguo (Pentium T4200)
# Node 16 + Debian Bullseye
# ========================================

# ========================================
# Stage 1: Base
# ========================================
FROM node:16-bullseye-slim AS base

# ========================================
# Stage 2: Dependencies
# ========================================
FROM base AS deps

# Instalar dependencias necesarias para Prisma
RUN apt-get update && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias de producción
RUN npm ci --only=production && \
    cp -R node_modules /tmp/prod_node_modules

# Instalar todas las dependencias (para build)
RUN npm ci

# ========================================
# Stage 3: Builder
# ========================================
FROM base AS builder

WORKDIR /app

# Instalar OpenSSL completo para Prisma
RUN apt-get update && \
    apt-get install -y openssl libssl3 libssl-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copiar node_modules del stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Variables de entorno para build
ENV NEXT_TELEMETRY_DISABLED=1
# DATABASE_URL dummy para validación de Prisma (no se usa)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
# API URL para build
ENV NEXT_PUBLIC_API_URL="http://localhost:3000"
# Deshabilitar generación estática
ENV SKIP_BUILD_STATIC_GENERATION=1

# Generar Prisma Client con binarios correctos
RUN npx prisma generate

# Build Next.js
# Con Node 16 y configuración sin static generation
RUN npm run build

# ========================================
# Stage 4: Runner (Production)
# ========================================
FROM base AS runner

WORKDIR /app

# Instalar OpenSSL para runtime de Prisma
RUN apt-get update && \
    apt-get install -y openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Variables de entorno de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/public ./public

# Copiar build de Next.js (standalone)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copiar Prisma schema y binarios generados
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copiar binarios de node_modules necesarios para comandos
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

# Cambiar ownership a nextjs
RUN chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando por defecto (puede ser sobrescrito en docker-compose)
CMD ["node", "server.js"]
