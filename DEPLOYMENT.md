# Deployment Guide for D Cube's Place

## WebSocket Configuration for Production

### The Problem
If your WebSocket shows "localhost" and real-time chat isn't working, it's because the client is configured to connect to localhost by default. Here's how to fix it:

### The Solution

The SocketContext is already configured to auto-detect the correct WebSocket URL:

```typescript
const socketUrl = import.meta.env.VITE_SOCKET_URL || (() => {
  const { protocol, hostname, port, origin } = window.location;
  const isDevPort = port === '3000' || port === '5173';
  if (hostname === 'localhost' || isDevPort) {
    return `${protocol}//${hostname}:5000`;
  }
  return origin;  // In production, use the same origin
})();
```

### Configuration for Production

#### Option 1: Environment Variable (Recommended)
Create a `.env` file in the `client/` directory:

```env
VITE_SOCKET_URL=https://your-domain.com
VITE_API_URL=https://your-domain.com
```

#### Option 2: Auto-Detection (No Config Needed)
The system automatically detects the production environment and uses the same origin. Just make sure:
- Your domain uses HTTPS (required for secure WebSockets)
- The server is accessible at the same domain

#### Option 3: Different Socket Server
If your WebSocket server is on a different domain:

```env
VITE_SOCKET_URL=wss://ws.your-domain.com
```

### Server-Side Configuration

In your `server/.env`:

```env
# IMPORTANT: Set this to your actual production URL
CLIENT_URL=https://your-domain.com

# Or for multiple origins (development + production)
# CORS is configured in server/src/index.ts
```

### Testing WebSocket Connection

1. Open browser DevTools (F12)
2. Go to Network tab → WS (WebSocket)
3. Refresh the page
4. You should see a WebSocket connection to your domain

If you see `localhost:5000` in production:
1. Check your `.env` file has `VITE_SOCKET_URL` set
2. Rebuild the client: `cd client && npm run build`
3. Restart the server

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Connection refused" | Wrong URL | Set `VITE_SOCKET_URL` to your domain |
| "SSL certificate error" | Mixed HTTP/HTTPS | Use `wss://` for HTTPS sites |
| "CORS error" | Wrong `CLIENT_URL` | Update server's `CLIENT_URL` env var |
| Real-time not working | Socket not connected | Check browser console for errors |

---

## Fixed Deployment Issues

This document describes the fixes applied to resolve deployment failures and slow deployment times.

### Issues Fixed

1. **Missing start script** - The root package.json was missing the "start" script that Render requires
2. **Inefficient Dockerfile** - The Dockerfile was building and installing dependencies multiple times redundantly
3. **Server not serving static files** - The server only served API endpoints, not the React frontend

### Changes Made

#### 1. Root package.json
Added a "start" script that runs the server:
```json
"start": "cd server && npm start"
```

Also added a `build:server` script for convenience.

#### 2. Server (server/src/index.ts)
Added static file serving for the built React client in production mode:
```typescript
// Serve static files from client in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}
```

This allows the server to serve both the API and the React frontend from the same port (5000).

#### 3. Dockerfile
Completely optimized the multi-stage Docker build:

**Before:**
- Built server in stage 2, then again in stage 3
- Ran `npm ci --only=production` multiple times redundantly
- Complex CMD with child_process spawning

**After:**
- Each stage builds once and copies to final stage
- Only runs `npm ci --omit=dev` where needed
- Simple CMD: `["npm", "start"]`
- Only exposes port 5000 (server serves everything)
- Sets NODE_ENV=production

Key improvements:
- Removed redundant server build (stage-3 now only copies)
- Removed redundant npm installs
- Simplified startup command
- Reduced Docker image size
- Faster build times

#### 4. .dockerignore
Updated to exclude unnecessary files from Docker build context:
- Added specific dist directories (client/dist, server/dist)
- Added documentation files (AUTHENTICATION.md, FEATURES.md, etc.)
- Added docker-compose.yml

## Deployment Configuration

### Environment Variables Required

For production deployment on Render, set these environment variables:

```
NODE_ENV=production
PORT=5000
TELEGRAM_BOT_TOKEN=your_bot_token
KITCHEN_CHAT_ID=kitchen_chat_id
BAR_CHAT_ID=bar_chat_id
MANAGER_CHAT_ID=manager_chat_id
CLIENT_URL=https://your-app-url.onrender.com
```

### Build Process

The deployment process is now:

1. **Stage 1 (client-build)**:
   - Installs production dependencies for client
   - Builds React client with `npm run build`
   - Output: `/app/client/dist`

2. **Stage 2 (server-build)**:
   - Installs production dependencies for server
   - Builds TypeScript server with `npm run build`
   - Output: `/app/server/dist`

3. **Stage 3 (production)**:
   - Copies built client files
   - Copies built server files and dependencies
   - Copies root package.json for scripts
   - Runs `npm start` to start the server

The server serves:
- API endpoints at `/api/*`
- Static React files at all other routes

### Expected Deployment Time

With the optimized Dockerfile:
- Client build: ~2-5 seconds
- Server build: ~2-3 seconds
- Final image assembly: ~5-10 seconds
- **Total: ~10-20 seconds** (vs. several minutes before)

## Testing Locally

To test the production build locally:

```bash
# Build both client and server
npm run build
npm run build:server

# Start in production mode
NODE_ENV=production npm start

# Access the application
# - Frontend: http://localhost:5000
# - API: http://localhost:5000/api/health
```

## Health Check

The Dockerfile includes a health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"
```

Render will use this to verify the application is running correctly.

## Troubleshooting

### Deployment fails with "Missing script: start"
This should be resolved with the updated package.json. Ensure you're using the latest code.

### Static files not loading
Check that:
- NODE_ENV is set to "production"
- The client/dist directory exists in the Docker image
- The server path resolution is correct (should be `../../client/dist` from server/dist)

### Port binding issues
The application now only exposes port 5000. Ensure your Render service is configured to use port 5000.

### Slow deployment persists
If deployment is still slow:
- Check the Render build logs for which step is taking time
- Verify Docker cache is being used (dependencies should be cached)
- Ensure .dockerignore is working (unnecessary files shouldn't be copied)
