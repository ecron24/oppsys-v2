# Étape de base
FROM node:22-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Étape to prepare builder
FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm add -g turbo
WORKDIR /app
COPY . .
RUN turbo prune @oppsys/website --docker

# Étape de build
FROM base AS build
WORKDIR /app

# Déclaration des variables d'environnement pour Next.js
ARG NODE_ENV=production
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ADMIN_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# Conversion en ENV pour le build Next.js
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_ADMIN_URL=${NEXT_PUBLIC_ADMIN_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/full/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@oppsys/website

# Étape de production
FROM base AS prod
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Configuration des permissions
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/.next && \
    chown nextjs:nodejs /app/.next

# Copie des fichiers de production
COPY --from=build /app/apps/website/public ./apps/website/public
# .next/standalone contains /apps/websiite
COPY --from=build --chown=nextjs:nodejs /app/apps/website/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/website/.next/static ./apps/website/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/website/server.js"]
