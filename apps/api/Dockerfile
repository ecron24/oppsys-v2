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
# ENV NODE_ENV=prod
# ENV PNPM_HOME="/pnpm"
# ENV PATH="$PNPM_HOME:$PATH"
# RUN corepack enable

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
COPY --from=build --chown=nodejs:nodejs /app /app
# COPY --from=build --chown=nodejs:nodejs /app/apps/api/dist /app/apps/api/dist
# COPY --from=build /app/apps/api/dist /app/apps/api/dist
USER nodejs
EXPOSE 4000
ENV HOSTNAME="0.0.0.0"
# RUN pnpm turbo run build --filter=@oppsys/api
WORKDIR /app/apps/api
# CMD ["ls"]
CMD ["npx", "tsx", "dist/app.js"]
