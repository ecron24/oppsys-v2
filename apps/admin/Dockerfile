# Build simple sans TailwindCSS
FROM node:22-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration
COPY apps/admin/package.json ./apps/admin/

# Installer les dépendances
RUN pnpm i

# Copier le code source
COPY apps/admin/ ./apps/admin/

# Build
WORKDIR /app/apps/admin

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

RUN npm run build

# Stage production
FROM nginx:alpine

COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        access_log off; \
        return 200 "healthy\n"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
