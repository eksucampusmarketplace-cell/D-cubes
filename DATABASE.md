# Database Recommendation for D Cube's Place

## Overview

Currently, the application uses in-memory storage (JavaScript Maps) which works for development but has significant limitations:
- Data is lost on server restart
- Can't scale across multiple server instances
- No persistent analytics or order history

## Database Recommendation: **Supabase (PostgreSQL)**

### Why Supabase over MongoDB?

| Feature | Supabase (PostgreSQL) | MongoDB |
|---------|----------------------|---------|
| **Free Tier** | 500MB database, 2GB bandwidth | 512MB storage, shared cluster |
| **Pricing After Free** | $25/month for Pro | $57/month for dedicated |
| **Real-time** | Built-in real-time subscriptions | Requires additional setup |
| **Reliability** | 99.9% SLA on paid plans | 99.5% SLA |
| **Ban Risk** | Very low (enterprise-grade) | Moderate (resource limits on free tier) |
| **Data Relationships** | Native SQL joins | Manual lookups |
| **Transactions** | ACID compliant | Limited transaction support |
| **Analytics** | Powerful SQL queries | Aggregation pipeline |

### Why Supabase Won't Ban You

1. **Enterprise Infrastructure**: Built on AWS with proper resource isolation
2. **Fair Use Policy**: Clear limits, no surprise suspensions
3. **Graceful Degradation**: You get warnings before any action
4. **Paid Plan Benefits**: $25/month gives you 8GB database with no rate limits

## Implementation Plan

### 1. Supabase Setup

```bash
npm install @supabase/supabase-js
```

### 2. Database Schema

```sql
-- Tables
CREATE TABLE tables (
  id SERIAL PRIMARY KEY,
  number INTEGER UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  guest_name TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guests (multiple guests per table)
CREATE TABLE guests (
  id TEXT PRIMARY KEY,
  table_number INTEGER REFERENCES tables(number),
  name TEXT NOT NULL,
  socket_id TEXT,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  check_out_time TIMESTAMPTZ
);

-- Orders
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  table_number INTEGER REFERENCES tables(number),
  guest_id TEXT REFERENCES guests(id),
  guest_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  note TEXT,
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'unpaid',
  refund_amount INTEGER,
  refund_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Access Requests
CREATE TABLE access_requests (
  id TEXT PRIMARY KEY,
  table_number INTEGER REFERENCES tables(number),
  guest_name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  table_number INTEGER REFERENCES tables(number),
  sender TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refund Requests
CREATE TABLE refund_requests (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id),
  table_number INTEGER REFERENCES tables(number),
  guest_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (for analytics)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  table_number INTEGER REFERENCES tables(number),
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  guest_count INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX idx_orders_table ON orders(table_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_messages_table ON chat_messages(table_number);
CREATE INDEX idx_sessions_table ON sessions(table_number);
```

### 3. Environment Variables

Add to your `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 4. Migration from In-Memory

The current code stores data in JavaScript Maps. You can migrate incrementally:

1. **Phase 1**: Keep in-memory for active sessions, sync to DB on changes
2. **Phase 2**: Read from DB for historical data, write to both
3. **Phase 3**: Full DB integration with caching

## Cost Estimation

### Expected Usage for a Busy Club

| Metric | Estimate |
|--------|----------|
| Orders per night | 200-500 |
| Average order size | 2KB |
| Daily storage | ~1MB |
| Monthly storage | ~30MB |
| Concurrent users | 50-100 |

### Supabase Pricing

| Plan | Price | Storage | Bandwidth | Best For |
|------|-------|---------|-----------|----------|
| Free | $0 | 500MB | 2GB | Testing, low traffic |
| Pro | $25/mo | 8GB | 50GB | Production clubs |
| Team | $599/mo | 8GB+ | Custom | Multiple venues |

**Recommendation**: Start with Free tier, upgrade to Pro when you hit limits.

## Real-Time Capabilities

Supabase has built-in real-time subscriptions using PostgreSQL's LISTEN/NOTIFY:

```typescript
// Subscribe to new orders
const subscription = supabase
  .channel('orders')
  .on('INSERT', payload => {
    console.log('New order:', payload);
  })
  .subscribe();
```

This can complement or replace Socket.IO for certain features.

## Alternative: PlanetScale (MySQL)

If you prefer MySQL, PlanetScale is another excellent option:
- Generous free tier (1 database, 1 billion row reads/month)
- Branch-based workflow for schema changes
- Serverless-friendly
- $29/month for Pro

## Backup Strategy

With Supabase:
1. **Automatic**: Daily backups on paid plans
2. **Manual**: Export via dashboard or CLI
3. **Disaster Recovery**: Point-in-time recovery available

## Security Best Practices

1. **Row Level Security (RLS)**: Enable RLS on all tables
2. **Service Role Key**: Only use on server-side
3. **Anon Key**: Safe for client-side with RLS
4. **API Rate Limiting**: Built-in protection

## Recommendation Summary

**For D Cube's Place, I strongly recommend Supabase because:**

1. **Won't Get Banned**: Enterprise-grade infrastructure with clear limits
2. **Affordable**: Free tier is generous, $25/mo for production
3. **Real-Time**: Built-in WebSocket support for live updates
4. **Analytics**: SQL is perfect for sales reports, top items, etc.
5. **Reliability**: 99.9% uptime SLA
6. **Scalability**: Can handle 100+ concurrent users easily
7. **Nigerian-Friendly**: Works well with African internet conditions

The only scenario where MongoDB might be better is if you need to store unstructured data, but for a club ordering system, the data is highly structured and relational.

## Getting Started

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL schema above
4. Add environment variables
5. Update the server code to use Supabase client

Need help with implementation? Check the `server/src/database.ts` file for integration code.
