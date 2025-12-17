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
RUN turbo prune @oppsys/admin --docker
 
FROM base AS build

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_ADMIN_EMAIL
ARG VITE_ADMIN_API_URL
ARG VITE_DEMO_MODE

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_ADMIN_EMAIL=$VITE_ADMIN_EMAIL
ENV VITE_ADMIN_API_URL=$VITE_ADMIN_API_URL
ENV VITE_DEMO_MODE=$VITE_DEMO_MODE

WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/full/ .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@oppsys/admin

FROM nginx:1.29.2-alpine AS prod
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
