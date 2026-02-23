# Multi-stage build for VELOUR - Luxury Club Table Ordering System

# Stage 1: Build client
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Stage 2: Build server
FROM node:18-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
RUN npm run build

# Stage 3: Production image
FROM node:18-alpine
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy server files
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production
COPY server/ ./server/
RUN cd server && npm run build

# Copy built client from stage 1
COPY --from=client-build /app/client/dist ./client/dist

# Copy root package.json for scripts
COPY package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S velour && \
    adduser -S velour -u 1001 && \
    chown -R velour:velour /app

USER velour

# Expose ports
EXPOSE 3000 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start both client and server
CMD ["node", "-e", "require('child_process').spawn('npm', ['start', '--', '--prefix', 'server'], {stdio: 'inherit'}).on('close', code => process.exit(code))"]
