FROM node:22-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm fetch

FROM base AS build
COPY --from=deps /pnpm /pnpm
COPY . .
RUN pnpm install -r --offline
RUN pnpm --filter=client build

FROM nginx:1.29.2-alpine AS prod
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
