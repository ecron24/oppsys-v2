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
COPY --from=builder /app/out/full/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@oppsys/api

FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=prod
COPY --from=build /app .
EXPOSE 4441
ENV HOSTNAME="0.0.0.0"
WORKDIR /app/apps/api
CMD ["npm", "run", "start"]
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:4441/health || exit 1
