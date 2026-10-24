# ==============================================================================
# SoundSphere Multi-Stage Production Dockerfile
# Optimized for minimal image footprint, security (non-root), and performance
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Front-End Builder
# ------------------------------------------------------------------------------
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy root package files for client build
COPY package*.json ./
RUN npm ci

# Copy client source code and assets
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src

# Build optimized production bundle to /app/dist
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Server Runtime
# ------------------------------------------------------------------------------
FROM node:22-bookworm-slim AS runner

# Install curl for container health check probes
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001
ENV DB_PATH=/app/server/data/soundsphere.db

# Copy backend package files and install production dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Return to /app
WORKDIR /app

# Copy server application code
COPY server ./server

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Create persistent database directory and grant permissions to 'node' user
RUN mkdir -p /app/server/data && chown -R node:node /app

# Switch to non-root secure user
USER node

# Expose internal HTTP port
EXPOSE 5001

# Liveness and Readiness probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5001/api/v1/health || exit 1

# Launch production server
CMD ["node", "server/server.js"]
