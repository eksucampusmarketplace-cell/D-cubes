-- Supabase Database Schema for D Cubes Place Ordering System
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  table_number INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  guest_id TEXT,
  session_id TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  note TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  refund_amount INTEGER,
  refund_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Access Requests table
CREATE TABLE IF NOT EXISTS access_requests (
  id TEXT PRIMARY KEY,
  table_number INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_requests_table_number ON access_requests(table_number);
CREATE INDEX IF NOT EXISTS idx_access_requests_timestamp ON access_requests(timestamp DESC);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  table_number INTEGER NOT NULL,
  sender TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_table_number ON messages(table_number);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);

-- Table Sessions table
CREATE TABLE IF NOT EXISTS table_sessions (
  id TEXT PRIMARY KEY,
  table_number INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_table_sessions_table_number ON table_sessions(table_number);
CREATE INDEX IF NOT EXISTS idx_table_sessions_is_active ON table_sessions(is_active);

-- Refund Requests table
CREATE TABLE IF NOT EXISTS refund_requests (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  table_number INTEGER NOT NULL,
  guest_name TEXT NOT NULL,
  item_ids JSONB NOT NULL DEFAULT '[]',
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_refund_requests_table_number ON refund_requests(table_number);
CREATE INDEX IF NOT EXISTS idx_refund_requests_timestamp ON refund_requests(timestamp DESC);

-- Enable Row Level Security (optional - uncomment if needed)
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Policy to allow anonymous read/write (for development)
-- CREATE POLICY "Allow all for orders" ON orders FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all for access_requests" ON access_requests FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all for messages" ON messages FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all for table_sessions" ON table_sessions FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all for refund_requests" ON refund_requests FOR ALL USING (true) WITH CHECK (true);

-- Add comments to tables
COMMENT ON TABLE orders IS 'Customer orders with items and payment status';
COMMENT ON TABLE access_requests IS 'Access requests (pool, lounge, VIP, call waiter, etc.)';
COMMENT ON TABLE messages IS 'Chat messages between guests and staff';
COMMENT ON TABLE table_sessions IS 'Active table sessions tracking guest visits';
COMMENT ON TABLE refund_requests IS 'Refund requests from customers';

-- Add created_at and updated_at columns for better tracking (optional)
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
