# D Cube's Place - Production Deployment Guide

## Quick Start (Render.com)

### 1. Create Supabase Project
```bash
# 1. Go to https://supabase.com and create a new project
# 2. Run the SQL schema from server/supabase-schema.sql in the SQL editor
# 3. Get your project URL and service role key from Settings > API
```

### 2. Deploy to Render
```bash
# 1. Fork/push this repository to GitHub
# 2. Go to https://render.com and create a new Web Service
# 3. Connect your GitHub repository
# 4. Use these settings:
#    - Build Command: (none, uses Dockerfile)
#    - Start Command: (none, uses Dockerfile)
# 5. Add environment variables (see below)
# 6. Deploy!
```

### 3. Required Environment Variables

```bash
# Database (CRITICAL - Get from Supabase)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... # Service role, NOT anon key!
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Security (CRITICAL - Generate strong random values)
JWT_SECRET=your-32-character-random-secret-here
BCRYPT_ROUNDS=12

# Application
NODE_ENV=production
CLIENT_URL=https://your-domain.com  # Your deployed URL
PORT=5000

# Telegram Notifications (Optional but recommended)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
KITCHEN_CHAT_ID=-1001234567890
BAR_CHAT_ID=-1001234567891
MANAGER_CHAT_ID=-1001234567892

# Staff PINs (Change from defaults!)
STAFF_MANAGER_PIN=1234
STAFF_KITCHEN_PIN=5678
STAFF_BAR_PIN=9012

# IP Whitelisting (HIGHLY RECOMMENDED)
IP_WHITELIST_ENABLED=true
WHITELISTED_IPS=your-office-ip,your-home-ip
```

## Security Checklist

Before going live, ensure:

- [ ] Supabase configured with service role key
- [ ] JWT_SECRET is a 32+ character random string
- [ ] Staff PINs changed from defaults (0000, 1111, 2222)
- [ ] IP whitelisting enabled for staff routes
- [ ] HTTPS enforced (Render does this automatically)
- [ ] Rate limiting enabled
- [ ] Data retention policy set
- [ ] Telegram notifications configured

## Health Check Endpoints

After deployment, verify:

```bash
# Basic health check
curl https://your-domain.com/api/health

# Detailed health check (includes metrics)
curl https://your-domain.com/api/health/detailed
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "services": {
    "telegram": {
      "enabled": true,
      "configured": true
    },
    "database": {
      "connected": true,
      "type": "supabase"
    },
    "webSocket": {
      "connections": 5,
      "staffOnline": 2
    }
  },
  "memory": {
    "used": 45,
    "total": 128,
    "unit": "MB"
  }
}
```

## Monitoring

### View Logs
```bash
# Render dashboard
# Go to your service > Logs tab

# Or via CLI
render logs --service=dcubes-app
```

### Set up Sentry (Recommended)
```bash
# 1. Create account at https://sentry.io
# 2. Create a new project
# 3. Add SENTRY_DSN to environment variables
# 4. Errors will be automatically tracked
```

## Backup & Recovery

### Automated Backups (Supabase)
```bash
# Supabase provides daily backups for Pro tier
# Configure in Supabase Dashboard > Settings > Database

# Manual backup via API
curl -X POST https://api.supabase.com/v1/projects/YOUR_REF/backups \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Disaster Recovery
```bash
# If server crashes:
# 1. Data is safe in Supabase (not lost)
# 2. Restart the Render service
# 3. All orders/sessions will be recovered from database
```

## Troubleshooting

### Issue: "Database not connected"
```bash
# Check environment variables
# Ensure SUPABASE_SERVICE_ROLE_KEY is set (not anon key)
# Verify SUPABASE_URL is correct
```

### Issue: "WebSocket connection failed"
```bash
# Check CLIENT_URL matches your actual domain
# Verify no firewall blocking WebSocket (port 5000)
# Check Render Web Service has WebSocket support enabled
```

### Issue: "Orders not appearing in dashboard"
```bash
# Check browser console for errors
# Verify staff dashboard is online (check Telegram alerts)
# Check /api/health/detailed for staff online status
```

## Scaling

### Horizontal Scaling (Multiple Instances)
```yaml
# docker-compose.prod.yml
deploy:
  replicas: 3
  update_config:
    parallelism: 1
    delay: 10s
```

**Note:** Requires Redis adapter for Socket.IO to share state between instances.

### Vertical Scaling
```bash
# Upgrade Render plan for more RAM/CPU
# Or adjust in docker-compose.prod.yml:
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 1G
```

## Performance Optimization

### Database Indexing
```sql
-- Add these indexes for common queries
CREATE INDEX idx_orders_table_number ON orders(table_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_timestamp ON orders(timestamp DESC);
CREATE INDEX idx_messages_table ON messages(table_number);
```

### Connection Pooling
```bash
# Supabase Pro provides connection pooling
# Configure in Supabase Dashboard > Database > Connection Pooling
# Use port 6543 instead of 5432 for pooled connections
```

## SSL/TLS Configuration

Render automatically provides SSL certificates. For custom domains:

```bash
# Add custom domain in Render dashboard
# SSL certificate is provisioned automatically
# Update CLIENT_URL to use HTTPS
```

## Support

For issues:
1. Check logs in Render dashboard
2. Review /api/health/detailed endpoint
3. Check Telegram notifications
4. File issue on GitHub with logs
