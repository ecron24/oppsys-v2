FROM node:22-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm add -g turbo
WORKDIR /app
COPY . .
RUN turbo prune @oppsys/api --docker
 
FROM base AS build
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=@oppsys/api

FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json .
EXPOSE 4441
ENV HOSTNAME="0.0.0.0"
CMD ["node", "dist/index.js"]
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:4441/health || exit 1
