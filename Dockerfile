# Multi-stage build for D Cubes Place - Resort & Lounge Ordering System

# Stage 1: Build client
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --omit=dev
COPY client/ ./
RUN npm run build

# Stage 2: Build server
FROM node:18-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built server files
COPY --from=server-build /app/server/package*.json ./server/
COPY --from=server-build /app/server/dist ./server/dist

# Copy production dependencies
COPY --from=server-build /app/server/node_modules ./server/node_modules

# Copy built client from stage 1
COPY --from=client-build /app/client/dist ./client/dist

# Copy root package.json for scripts
COPY package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S dcubes && \
    adduser -S dcubes -u 1001 && \
    chown -R dcubes:dcubes /app

USER dcubes

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start server
CMD ["npm", "start"]
