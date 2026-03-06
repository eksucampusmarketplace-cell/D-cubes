# Multi-stage build for D Cubes Place - Resort & Lounge Ordering System
# Production-ready with security hardening

# ============================================
# Stage 1: Build client
# ============================================
FROM node:20-alpine AS client-build
WORKDIR /app/client

# Copy package files
COPY client/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy source and build
COPY client/ ./
RUN npm run build

# ============================================
# Stage 2: Build server
# ============================================
FROM node:20-alpine AS server-build
WORKDIR /app/server

# Copy package files
COPY server/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy source and build
COPY server/ ./
RUN npm run build

# ============================================
# Stage 3: Production image
# ============================================
FROM node:20-alpine AS production

# Install security updates and dumb-init
RUN apk update && \
    apk upgrade && \
    apk add --no-cache dumb-init ca-certificates && \
    rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy built artifacts from previous stages
COPY --from=server-build /app/server/package*.json ./server/
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=server-build /app/server/node_modules ./server/node_modules
COPY --from=client-build /app/client/dist ./client/dist
COPY package*.json ./

# Create non-root user with minimal permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Security: Don't run as root
# Health check with proper timeout
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
      timeout: 3000
    };
    const req = http.request(options, (res) => {
      process.exit(res.statusCode === 200 ? 0 : 1);
    });
    req.on('error', () => process.exit(1));
    req.on('timeout', () => { req.destroy(); process.exit(1); });
    req.end();
  "

# Use dumb-init to handle signals properly (PID 1 problem)
ENTRYPOINT ["dumb-init", "--"]

# Start server
CMD ["node", "server/dist/index.js"]

# ============================================
# Security Labels
# ============================================
LABEL maintainer="D Cube's Place <admin@dcubesplace.com>"
LABEL description="D Cube's Place Ordering System"
LABEL version="1.0.0"
LABEL org.opencontainers.image.source="https://github.com/your-org/dcubes-place"
