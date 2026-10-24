# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 — build the frontend (-> dist) and the server (-> server)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# Install all dependencies (including dev) from the lockfile for a
# reproducible build.
COPY package.json package-lock.json ./
RUN npm ci

# Build both the Vue frontend and the TypeScript server.
#   npm run build  ->  vue-tsc + vite build  (outputs ./dist)
#                  ->  tsc                    (outputs ./server)
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 — minimal runtime image
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled server code.
COPY --from=builder /app/server ./server
# Built frontend. In prod the server serves static files from ./public
# (see src_server/utils/Config.ts -> PUBLIC_PATH).
COPY --from=builder /app/dist ./public

# Tell the server's Config to use the production environment.
RUN printf 'prod' > env.conf

EXPOSE 3007

# Run as the unprivileged user shipped with the node image.
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:3007/ || exit 1

CMD ["node", "server/bootstrap.js"]
