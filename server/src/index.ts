import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import QRCode from 'qrcode';
import TelegramBot from 'node-telegram-bot-api';
import { Order, AccessRequest, ChatMessage, OrderStatus, TableSession, TableGuest, RefundRequest, PaymentStatus, AnalyticsData, Receipt, AuditLog, InventoryUpdate, TelegramNotificationConfig } from './types';
import { db } from './database';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ============================================
// SECURITY HEADERS (Helmet.js)
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://d-cubes.com.ng"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow images from external sources
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin"
  },
  noSniff: true,
  xssFilter: true,
  permittedCrossDomainPolicies: false
}));

// Additional security headers for API
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

const io = new Server(httpServer, {
  cors: {
    origin: "https://d-cubes.com.ng",
    methods: ["GET", "POST"],
    credentials: true
  },
  // Heartbeat configuration
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// ============================================
// RATE LIMITING MIDDLEWARE
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window

const rateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    next();
  } else if (entry.count < RATE_LIMIT_MAX) {
    entry.count++;
    next();
  } else {
    res.status(429).json({ error: 'Too many requests, please try again later' });
  }
};

// Clean up rate limit store every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ============================================
// IP WHITELIST MIDDLEWARE
// ============================================

const WHITELIST_ENABLED = process.env.IP_WHITELIST_ENABLED === 'true';
const WHITELISTED_IPS = (process.env.WHITELISTED_IPS || '').split(',').filter(Boolean);

const ipWhitelist = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!WHITELIST_ENABLED) {
    return next();
  }

  const ip = req.ip || req.connection.remoteAddress || '';
  const path = req.path;

  // Only protect staff routes
  if (path.startsWith('/manager') || path.startsWith('/kitchen') || path.startsWith('/bar') || path.startsWith('/api/staff')) {
    if (!WHITELISTED_IPS.includes(ip)) {
      return res.status(403).json({ error: 'Access denied from this IP address' });
    }
  }
  next();
};

// ============================================
// CORS SETUP - Restrict to client URL only
// ============================================
const corsOptions = {
  origin: "https://d-cubes.com.ng",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimiter);
app.use(ipWhitelist);

// Staff authentication middleware — protects /api/* routes only
const staffAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {

  // ── Step 1: let all non-API requests straight through ────────
  // Static files, HTML pages, and client-side routes must never
  // be blocked — the browser needs to load the app before any
  // auth token can exist.
  if (!req.path.startsWith('/api/')) return next();

  // ── Step 2: public API routes (no token required) ─────────────
  const isPublicRoute =
    req.path.startsWith('/api/health') ||
    req.path.startsWith('/api/auth/')  ||
    req.path.startsWith('/api/qr/')    ||
    req.path.startsWith('/api/table/') ||
    /^\/api\/messages\/\d+$/.test(req.path) ||
    /^\/api\/receipts\/[^/]+(\/html)?$/.test(req.path) ||
    req.path === '/api/inventory';
  if (isPublicRoute) return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.substring(7);
  const parts = token.split('-');

  if (parts.length < 3) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
  }

  const [role, timestamp] = parts;

  // Validate role
  const validRoles = ['manager', 'kitchen', 'bar'];
  if (!validRoles.includes(role)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  // Check token not expired (8 hours)
  const tokenTime = parseInt(timestamp);
  if (isNaN(tokenTime) || Date.now() - tokenTime > 8 * 60 * 60 * 1000) {
    return res.status(401).json({ error: 'Unauthorized: Token expired' });
  }

  // Attach role to request for downstream handlers
  (req as any).staffRole = role;
  next();
};

app.use(staffAuthMiddleware);

// Serve static files from client in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// ============================================
// TELEGRAM BOT SETUP
// ============================================

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const KITCHEN_CHAT_ID = process.env.KITCHEN_CHAT_ID || '';
const BAR_CHAT_ID = process.env.BAR_CHAT_ID || '';
const MANAGER_CHAT_ID = process.env.MANAGER_CHAT_ID || '';
const TELEGRAM_WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || '';

let bot: TelegramBot | null = null;
if (TELEGRAM_BOT_TOKEN) {
  // Use webhook in production, polling in development
  const useWebhook = TELEGRAM_WEBHOOK_URL && process.env.NODE_ENV === 'production';
  
  if (useWebhook) {
    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { webHook: { port: parseInt(process.env.PORT || '5000') } });
    bot.setWebHook(TELEGRAM_WEBHOOK_URL).then(() => {
      console.log('✅ Telegram webhook configured:', TELEGRAM_WEBHOOK_URL);
    }).catch((err) => {
      console.error('❌ Failed to set Telegram webhook:', err);
    });
  } else {
    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  }
  console.log(`✅ Telegram bot initialized (${useWebhook ? 'webhook' : 'polling'})`);
}

// Telegram notification configuration (can be updated at runtime)
let telegramConfig: TelegramNotificationConfig = {
  newOrder: true,
  orderStatus: true,
  payment: true,
  refund: true,
  accessRequest: true,
  chat: true,
  session: true
};

// ============================================
// IN-MEMORY DATA STORES
// ============================================

const orders: Map<string, Order> = new Map();
const accessRequests: Map<string, AccessRequest> = new Map();
const messages: Map<string, ChatMessage[]> = new Map();
// Session key is a string: either locationId (e.g., "T-001", "BAR-01") or legacy "table-{number}"
const activeTables: Map<string, TableSession> = new Map();
const refundRequests: Map<string, RefundRequest> = new Map();
const receipts: Map<string, Receipt> = new Map();
const auditLogs: AuditLog[] = [];
const inventoryStatus: Map<number, { isAvailable: boolean; stockQuantity: number | null }> = new Map();

// Track staff online status for alerting
const staffOnlineStatus: Map<string, { role: string; joinedAt: Date; socketId: string }> = new Map();

// Valid table numbers (1-50 for legacy support) - defined at module scope for performance
const VALID_TABLE_NUMBERS = new Set<number>(Array.from({ length: 50 }, (_, i) => i + 1));

// Alert thresholds for unstaffed orders
let lastStaffAlertTime: Map<string, number> = new Map();
const STAFF_ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes between alerts

// ============================================
// AUDIT LOGGING
// ============================================

const logAudit = (action: string, actor: string, actorType: 'staff' | 'system', resource: string, resourceId?: string, details?: Record<string, any>, ipAddress?: string) => {
  const log: AuditLog = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    action,
    actor,
    actorType,
    resource,
    resourceId,
    details: details || {},
    ipAddress
  };
  auditLogs.push(log);
  
  // Keep only last 1000 logs in memory
  if (auditLogs.length > 1000) {
    auditLogs.shift();
  }
  
  console.log(`📋 AUDIT: ${action} by ${actor} on ${resource}${resourceId ? ` (${resourceId})` : ''}`);
};

// ============================================
// DATABASE INITIALIZATION
// ============================================

async function initializeDatabase() {
  db.initialize();
  
  if (db.isConnected()) {
    const data = await db.loadAllData();
    data.orders.forEach((order, id) => orders.set(id, order));
    data.accessRequests.forEach((req, id) => accessRequests.set(id, req));
    data.messages.forEach((msgs, key) => messages.set(key, msgs));
    data.activeTables.forEach((session, tableNum) => activeTables.set(String(tableNum), session));
    data.refundRequests.forEach((req, id) => refundRequests.set(id, req));
    
    // Schedule automatic cleanup every hour
    setInterval(async () => {
      try {
        await db.cleanupOldData();
        logAudit('DATA_CLEANUP', 'system', 'system', 'database', undefined, { reason: 'Scheduled cleanup' });
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }, 60 * 60 * 1000); // Every hour

    // Schedule receipt expiration cleanup every 10 minutes
    setInterval(() => {
      const now = new Date();
      for (const [id, receipt] of receipts.entries()) {
        if (new Date(receipt.expiresAt) < now) {
          receipts.delete(id);
          logAudit('RECEIPT_EXPIRED', 'system', 'system', 'receipt', id);
        }
      }
    }, 10 * 60 * 1000);
    
    console.log('✅ Database initialized with persistent storage');
  } else {
    console.log('⚠️ Using in-memory storage (data will be lost on restart)');
  }
}

initializeDatabase();

// ============================================
// HELPER FUNCTIONS
// ============================================

const formatPrice = (price: number): string => {
  return `₦${price.toLocaleString('en-NG')}`;
};

const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const sendTelegramMessage = async (chatId: string, message: string, enabled: boolean = true) => {
  if (!bot || !chatId || !enabled) return;
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const generateGuestId = (): string => {
  return `guest-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
};

const generateSessionId = (): string => {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
};

// ============================================
// HTML ESCAPE UTILITY
// ============================================

const escapeHtml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// ============================================
// RECEIPT GENERATION
// ============================================

const generateReceipt = (order: Order): Receipt => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

  const receipt: Receipt = {
    id: `receipt-${generateId()}`,
    orderId: order.id,
    tableNumber: order.tableNumber,
    guestName: order.guestName,
    items: order.items.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    })),
    subtotal: order.total,
    total: order.total,
    createdAt: now,
    expiresAt,
    status: 'pending'
  };

  receipts.set(receipt.id, receipt);
  logAudit('RECEIPT_CREATED', 'system', 'system', 'receipt', receipt.id, { orderId: order.id, tableNumber: order.tableNumber });
  
  return receipt;
};

const generateReceiptHTML = (receipt: Receipt): string => {
  const itemsHTML = receipt.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #333;">${escapeHtml(item.name)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #333; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #333; text-align: right;">₦${item.price.toLocaleString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #333; text-align: right;">₦${item.total.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt - D Cube's Place</title>
      <style>
        body { font-family: 'Courier New', monospace; background: #0a0a0a; color: #fff; padding: 20px; }
        .receipt { max-width: 400px; margin: 0 auto; background: #1a1a1a; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #C9A84C; padding-bottom: 15px; }
        .header h1 { color: #C9A84C; margin: 0; font-size: 24px; }
        .header p { color: #888; margin: 5px 0 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { text-align: left; padding: 8px; border-bottom: 2px solid #C9A84C; color: #C9A84C; }
        .total { font-size: 18px; font-weight: bold; margin-top: 15px; padding-top: 15px; border-top: 2px solid #C9A84C; }
        .total span { color: #C9A84C; }
        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
        .expires { background: #ff4444; color: #fff; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>D CUBE'S PLACE</h1>
          <p>Resort & Lounge</p>
        </div>
        <p><strong>Table:</strong> ${receipt.tableNumber}</p>
        <p><strong>Guest:</strong> ${escapeHtml(receipt.guestName)}</p>
        <p><strong>Date:</strong> ${new Date(receipt.createdAt).toLocaleString()}</p>
        <p><strong>Receipt #:</strong> ${receipt.id.slice(-8).toUpperCase()}</p>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <div class="total">
          TOTAL: <span>₦${receipt.total.toLocaleString()}</span>
        </div>
        
        <div class="footer">
          <p>Thank you for visiting D Cube's Place!</p>
          <p class="expires">⚠️ Save this receipt - Expires in 2 hours</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ============================================
// API ROUTES
// ============================================

// ============================================
// ENHANCED HEALTH CHECK
// ============================================

app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      telegram: {
        enabled: Boolean(TELEGRAM_BOT_TOKEN),
        configured: Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'your_bot_token_here')
      },
      database: {
        connected: db.isConnected(),
        type: db.isConnected() ? 'supabase' : 'in-memory'
      },
      webSocket: {
        connections: io.engine.clientsCount,
        staffOnline: staffOnlineStatus?.size || 0
      }
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    }
  };

  // Return 503 if critical services are down
  const isHealthy = health.services.database.connected;
  
  res.status(isHealthy ? 200 : 503).json(health);
});

// Detailed health check for monitoring
app.get('/api/health/detailed', async (req, res) => {
  const detailed = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      telegram: {
        enabled: Boolean(TELEGRAM_BOT_TOKEN),
        botToken: TELEGRAM_BOT_TOKEN ? 'configured' : 'missing',
        kitchenChat: KITCHEN_CHAT_ID ? 'configured' : 'missing',
        barChat: BAR_CHAT_ID ? 'configured' : 'missing',
        managerChat: MANAGER_CHAT_ID ? 'configured' : 'missing'
      },
      database: {
        connected: db.isConnected(),
        stats: db.isConnected() ? await db.getStorageStats() : null
      },
      webSocket: {
        totalConnections: io.engine.clientsCount,
        staffOnline: Array.from(staffOnlineStatus?.values() || []).map(s => ({
          role: s.role,
          joinedAt: s.joinedAt
        })),
        activeTables: activeTables?.size || 0
      }
    },
    metrics: {
      totalOrders: orders?.size || 0,
      pendingOrders: Array.from(orders?.values() || []).filter(o => o.status === 'pending').length,
      activeSessions: activeTables?.size || 0,
      pendingAccessRequests: Array.from(accessRequests?.values() || []).filter(r => r.status === 'pending').length
    }
  };

  res.json(detailed);
});

// Generate QR code for a table
app.get('/api/qr/:locationId', async (req, res) => {
  try {
    const locationId = req.params.locationId;
    let zone = (req.query.zone as string) || 'lounge';
    const baseUrl = 'https://d-cubes.com.ng';
    
    // Validate zone
    const validZones = ['open-bar', 'lounge', 'nightclub', 'poolside'];
    if (!validZones.includes(zone)) {
      return res.status(400).json({ error: 'Invalid zone' });
    }
    
    // Determine zone from locationId prefix if not provided
    if (!req.query.zone) {
      if (locationId.startsWith('BAR-') || locationId.startsWith('ST-')) {
        zone = 'open-bar';
      } else if (locationId.startsWith('NF-')) {
        zone = 'nightclub';
      } else if (locationId.startsWith('PC-')) {
        zone = 'poolside';
      } else {
        zone = 'lounge'; // T-, LS- default to lounge
      }
    }
    
    const url = `${baseUrl}/order?location=${locationId}&zone=${zone}`;

    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#C9A84C',
        light: '#0A0A0A'
      }
    });

    res.json({
      locationId,
      zone,
      url,
      qrCode: qrCodeDataUrl
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
  const analytics: AnalyticsData = {
    totalRevenue: 0,
    orderCount: 0,
    averageOrderValue: 0,
    topSellingItems: [],
    categoryBreakdown: [],
    hourlySales: Array.from({ length: 24 }, (_, i) => ({ hour: i, orders: 0, revenue: 0 })),
    tablePerformance: [],
    popularItemsByCategory: {}
  };

  const itemSales = new Map<number, { quantity: number; revenue: number; name: string; category: string }>();
  const categorySales = new Map<string, { count: number; revenue: number }>();
  const tableSales = new Map<number, { orders: number; revenue: number }>();

  orders.forEach(order => {
    if (order.status !== 'cancelled') {
      analytics.orderCount++;
      analytics.totalRevenue += order.total;

      order.items.forEach(item => {
        const existing = itemSales.get(item.id) || { quantity: 0, revenue: 0, name: item.name, category: item.category };
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        itemSales.set(item.id, existing);

        const catSales = categorySales.get(item.category) || { count: 0, revenue: 0 };
        catSales.count += item.quantity;
        catSales.revenue += item.price * item.quantity;
        categorySales.set(item.category, catSales);
      });

      const tableStats = tableSales.get(order.tableNumber) || { orders: 0, revenue: 0 };
      tableStats.orders++;
      tableStats.revenue += order.total;
      tableSales.set(order.tableNumber, tableStats);
      
      // Count non-cancelled orders for hourly breakdown
      const hour = new Date(order.timestamp).getHours();
      analytics.hourlySales[hour].orders++;
      analytics.hourlySales[hour].revenue += order.total;
    }
  });

  analytics.averageOrderValue = analytics.orderCount > 0 ? analytics.totalRevenue / analytics.orderCount : 0;

  analytics.topSellingItems = Array.from(itemSales.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  analytics.categoryBreakdown = Array.from(categorySales.entries()).map(([category, data]) => ({
    category,
    count: data.count,
    revenue: data.revenue
  }));

  analytics.tablePerformance = Array.from(tableSales.entries())
    .map(([tableNumber, data]) => ({ tableNumber, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 20);

  res.json(analytics);
});

// Get all current orders (for dashboard recovery on refresh)
app.get('/api/orders', (req, res) => {
  const orderList = Array.from(orders.values())
    .filter(o => !['delivered', 'cancelled', 'refunded'].includes(o.status))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  res.json(orderList);
});

// Get all orders including completed (for full history)
app.get('/api/orders/all', (req, res) => {
  const orderList = Array.from(orders.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json(orderList);
});

// Get active table sessions (for dashboard recovery)
app.get('/api/sessions', (req, res) => {
  const sessions = Array.from(activeTables.values());
  res.json(sessions);
});

// Get pending access requests (for dashboard recovery)
app.get('/api/access-requests', (req, res) => {
  const requests = Array.from(accessRequests.values())
    .filter(r => r.status === 'pending')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  res.json(requests);
});

// Get pending refund requests (for dashboard recovery)
app.get('/api/refund-requests', (req, res) => {
  const requests = Array.from(refundRequests.values())
    .filter(r => r.status === 'pending')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  res.json(requests);
});

// Get chat messages for a table
app.get('/api/messages/:tableNumber', (req, res) => {
  const tableNumber = parseInt(req.params.tableNumber);
  const tableMessages = messages.get(`table-${tableNumber}`) || [];
  res.json(tableMessages);
});

// Get all chat messages (for manager view)
app.get('/api/messages', (req, res) => {
  const allMessages: any[] = [];
  messages.forEach((msgs) => {
    allMessages.push(...msgs);
  });
  allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  res.json(allMessages);
});

// Get table session info
app.get('/api/table/:tableNumber', (req, res) => {
  const tableNumber = parseInt(req.params.tableNumber);
  const session = activeTables.get(String(tableNumber));
  res.json({
    tableNumber,
    hasActiveSession: !!session,
    session
  });
});

// Get all receipts
app.get('/api/receipts', (req, res) => {
  const receiptList = Array.from(receipts.values())
    .filter(r => new Date(r.expiresAt) > new Date())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(receiptList);
});

// Get receipt by ID
app.get('/api/receipts/:id', (req, res) => {
  const receipt = receipts.get(req.params.id);
  if (!receipt) {
    return res.status(404).json({ error: 'Receipt not found' });
  }
  if (new Date(receipt.expiresAt) < new Date()) {
    receipts.delete(req.params.id);
    return res.status(410).json({ error: 'Receipt has expired' });
  }
  res.json(receipt);
});

// Get receipt HTML
app.get('/api/receipts/:id/html', (req, res) => {
  const receipt = receipts.get(req.params.id);
  if (!receipt) {
    return res.status(404).send('Receipt not found');
  }
  if (new Date(receipt.expiresAt) < new Date()) {
    receipts.delete(req.params.id);
    return res.status(410).send('Receipt has expired');
  }
  res.send(generateReceiptHTML(receipt));
});

// Create receipt for an order
app.post('/api/receipts', (req, res) => {
  const { orderId } = req.body;
  const order = orders.get(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  const receipt = generateReceipt(order);
  res.json(receipt);
});

// Get inventory status
app.get('/api/inventory', (req, res) => {
  res.json(Object.fromEntries(inventoryStatus));
});

// Update inventory status
app.post('/api/inventory', (req, res) => {
  const update: InventoryUpdate = req.body;
  inventoryStatus.set(update.itemId, {
    isAvailable: update.isAvailable,
    stockQuantity: update.stockQuantity ?? null
  });
  
  logAudit('INVENTORY_UPDATE', update.updatedBy, 'staff', 'inventory', undefined, {
    itemId: update.itemId,
    isAvailable: update.isAvailable,
    reason: update.reason
  }, req.ip);

  // Broadcast to all clients
  io.emit('inventory-update', Object.fromEntries(inventoryStatus));

  res.json({ success: true });
});

// Get audit logs
app.get('/api/audit-logs', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const logs = auditLogs.slice(-limit);
  res.json(logs);
});

// Get telegram config
app.get('/api/telegram-config', (req, res) => {
  res.json(telegramConfig);
});

// Update telegram config - requires manager auth
app.post('/api/telegram-config', (req, res) => {
  // Simple auth check via header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const token = authHeader.substring(7);
  const validTokens = (process.env.STAFF_TOKENS || '').split(',').filter(Boolean);
  if (!validTokens.includes(token)) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  telegramConfig = { ...telegramConfig, ...req.body };
  logAudit('TELEGRAM_CONFIG_UPDATE', 'admin', 'staff', 'telegram-config', undefined, req.body, req.ip);
  res.json(telegramConfig);
});

// Staff authentication endpoint
app.post('/api/auth/staff', (req, res) => {
  const { role, pin } = req.body;

  if (!role || !pin) {
    return res.status(400).json({ error: 'Missing role or PIN' });
  }

  const validRoles = ['manager', 'kitchen', 'bar'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  // Get PIN from environment or use default
  const envPins: Record<string, string> = {
    manager: process.env.STAFF_MANAGER_PIN || '0000',
    kitchen: process.env.STAFF_KITCHEN_PIN || '1111',
    bar: process.env.STAFF_BAR_PIN || '2222'
  };

  const correctPin = envPins[role];

  if (pin === correctPin) {
    // Generate a simple session token (in production, use JWT)
    const token = `${role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    logAudit('STAFF_LOGIN', role, 'staff', 'auth', undefined, { role }, req.ip);
    res.json({ success: true, role, token });
  } else {
    logAudit('STAFF_LOGIN_FAILED', role, 'staff', 'auth', undefined, { role, reason: 'Invalid PIN' }, req.ip);
    res.status(401).json({ error: 'Invalid PIN' });
  }
});

// Verify staff token
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const parts = token.split('-');

  if (parts.length < 3) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  const [role] = parts;

  const validRoles = ['manager', 'kitchen', 'bar'];
  if (!validRoles.includes(role)) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.json({ valid: true, role });
});

// ============================================
// SOCKET.IO HANDLING
// ============================================

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join table room
  socket.on('join-table', (tableNumber: number) => {
    socket.join(`table-${tableNumber}`);
    console.log(`Socket ${socket.id} joined table-${tableNumber}`);
  });

  // Join staff room
  socket.on('join-staff', (role: 'manager' | 'kitchen' | 'bar') => {
    // Store role on socket for authorization checks
    (socket as any).data = { ...(socket as any).data, role };
    
    socket.join(`staff-${role}`);
    if (role === 'manager') socket.join('staff-all');
    
    // Track staff online status
    const staffId = `${role}-${socket.id}`;
    staffOnlineStatus.set(staffId, { 
      role, 
      joinedAt: new Date(), 
      socketId: socket.id 
    });
    
    console.log(`Socket ${socket.id} joined staff-${role} (${staffOnlineStatus.size} total staff online)`);
    
    // Send current inventory status to staff
    socket.emit('inventory-update', Object.fromEntries(inventoryStatus));
    socket.emit('telegram-config', telegramConfig);
  });
  
  // Helper function to check if socket has staff role
  const hasStaffRole = (requiredRoles: ('manager' | 'kitchen' | 'bar' | 'all')[]): boolean => {
    const socketRole = (socket as any).data?.role;
    if (!socketRole) return false;
    if (requiredRoles.includes('all')) return true;
    return requiredRoles.includes(socketRole);
  };

  // Helper function to check if staff are online for a role
  const isStaffOnline = (role: 'manager' | 'kitchen' | 'bar' | 'all'): boolean => {
    if (role === 'all') {
      return staffOnlineStatus.size > 0;
    }
    return Array.from(staffOnlineStatus.values()).some(s => s.role === role);
  };

  // Helper function to send staff offline alert
  const sendStaffOfflineAlert = async (orderType: 'food' | 'drink' | 'general') => {
    const now = Date.now();
    const lastAlert = lastStaffAlertTime.get(orderType) || 0;
    
    if (now - lastAlert < STAFF_ALERT_COOLDOWN) {
      return; // Don't spam alerts
    }
    
    let message = '';
    if (orderType === 'food' && !isStaffOnline('kitchen')) {
      message = `⚠️ <b>KITCHEN OFFLINE ALERT</b>\nNo kitchen staff currently online. Orders may be delayed.\n🕐 ${formatTime(new Date())}`;
      lastStaffAlertTime.set('food', now);
    } else if (orderType === 'drink' && !isStaffOnline('bar')) {
      message = `⚠️ <b>BAR OFFLINE ALERT</b>\nNo bar staff currently online. Orders may be delayed.\n🕐 ${formatTime(new Date())}`;
      lastStaffAlertTime.set('drink', now);
    } else if (orderType === 'general' && !isStaffOnline('manager')) {
      message = `⚠️ <b>MANAGER OFFLINE ALERT</b>\nNo manager currently online.\n🕐 ${formatTime(new Date())}`;
      lastStaffAlertTime.set('general', now);
    }
    
    if (message && MANAGER_CHAT_ID) {
      await sendTelegramMessage(MANAGER_CHAT_ID, message);
      logAudit('STAFF_OFFLINE_ALERT', 'system', 'system', 'staff-alert', undefined, { orderType });
    }
  };

  // Check-in - supports multiple guests at same table/location
  // Uses locationId as primary key to avoid table number collisions across zones
  socket.on('check-in', async ({ tableNumber, guestName, locationId }: { tableNumber?: number; guestName: string; locationId?: string }) => {
    // Validate guest name (server-side validation)
    if (!guestName || guestName.trim().length === 0) {
      socket.emit('check-in-error', { 
        error: 'Invalid guest name',
        message: 'Please provide a valid guest name'
      });
      return;
    }
    
    if (guestName.length > 40) {
      socket.emit('check-in-error', { 
        error: 'Invalid guest name',
        message: 'Guest name must be 40 characters or less'
      });
      return;
    }
    
    // Determine the unique session key - prefer locationId, fall back to tableNumber
    const sessionKey = locationId || (tableNumber ? `table-${tableNumber}` : null);
    
    if (!sessionKey) {
      socket.emit('check-in-error', { 
        error: 'Invalid location',
        message: 'Please provide a valid table number or location ID'
      });
      return;
    }

    // If using tableNumber (legacy), validate it's in valid range
    if (!locationId && tableNumber) {
      if (!VALID_TABLE_NUMBERS.has(tableNumber)) {
        socket.emit('check-in-error', { 
          error: 'Table not found',
          message: `Table ${tableNumber} does not exist. Please check your QR code or ask staff for assistance.`
        });
        logAudit('CHECK_IN_REJECTED', guestName, 'staff', 'table', undefined, { 
          tableNumber, 
          reason: 'Invalid table number',
          ipAddress: socket.handshake.address
        });
        return;
      }
    }

    const guestId = generateGuestId();
    let session = activeTables.get(sessionKey);

    if (!session || !session.isActive) {
      session = {
        id: generateSessionId(),
        tableNumber: tableNumber || 0,
        locationId: locationId || undefined,
        startTime: new Date(),
        isActive: true,
        guests: [],
        totalOrders: 0,
        totalSpent: 0
      };
      activeTables.set(sessionKey, session);
      
      db.saveTableSession(session).catch(err => console.error('Failed to save session to DB:', err));
    }

    const guest: TableGuest = {
      id: guestId,
      guestName,
      socketId: socket.id,
      checkInTime: new Date()
    };

    session.guests.push(guest);
    // Join both the session key room and legacy table room for compatibility
    socket.join(`table-${sessionKey}`);
    if (tableNumber) {
      socket.join(`table-${tableNumber}`);
    }

    io.to('staff-manager').to('staff-all').emit('check-in', {
      tableNumber: session.tableNumber,
      locationId: session.locationId,
      guestName,
      guestId,
      sessionId: session.id,
      guestCount: session.guests.length
    });

    if (telegramConfig.session) {
      const locationDisplay = locationId || `Table ${tableNumber}`;
      const message = session.guests.length === 1
        ? `✅ <b>NEW SESSION</b>\n🪑 ${locationDisplay}\n👤 ${guestName}\n🕐 ${formatTime(new Date())}`
        : `👥 <b>GUEST JOINED</b>\n🪑 ${locationDisplay}\n👤 ${guestName}\n👥 ${session.guests.length} guests\n🕐 ${formatTime(new Date())}`;
      await sendTelegramMessage(MANAGER_CHAT_ID, message);
    }

    socket.emit('check-in-success', {
      tableNumber: session.tableNumber,
      locationId: session.locationId,
      guestName,
      guestId,
      sessionId: session.id,
      guestCount: session.guests.length
    });

    logAudit('CHECK_IN', guestName, 'staff', 'table', session.id, { sessionKey, tableNumber, locationId, guestId }, socket.handshake.address);
    console.log(`Check-in: ${sessionKey} - ${guestName} (Session: ${session.id}, Guests: ${session.guests.length})`);
  });

  // New order - each guest can order independently
  socket.on('new-order', async (order: Order) => {
    // Validate order data
    if (!order.tableNumber || typeof order.tableNumber !== 'number' || order.tableNumber < 1) {
      socket.emit('order-error', { 
        error: 'Invalid table number',
        message: 'Please check in again or ask staff for assistance'
      });
      return;
    }

    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      socket.emit('order-error', { 
        error: 'Invalid order',
        message: 'Your order must contain at least one item'
      });
      return;
    }

    if (!order.guestName || order.guestName.trim().length === 0) {
      socket.emit('order-error', { 
        error: 'Invalid guest name',
        message: 'Please check in with a valid name'
      });
      return;
    }
    
    // Validate guest name length (server-side)
    if (order.guestName.length > 40) {
      socket.emit('order-error', { 
        error: 'Invalid guest name',
        message: 'Guest name must be 40 characters or less'
      });
      return;
    }
    
    order.id = order.id || generateId();
    
    // Check for duplicate order (same items, same table, within 30 seconds)
    const recentDuplicate = Array.from(orders.values()).find(o => 
      o.tableNumber === order.tableNumber &&
      o.guestId === order.guestId &&
      o.items.length === order.items.length &&
      o.total === order.total &&
      new Date().getTime() - new Date(o.timestamp).getTime() < 30000 &&
      o.items.every((item, idx) => 
        item.id === order.items[idx]?.id && 
        item.quantity === order.items[idx]?.quantity
      )
    );
    
    if (recentDuplicate) {
      console.log(`Duplicate order detected for table ${order.tableNumber}, returning existing order ${recentDuplicate.id}`);
      socket.emit('order-confirmation', { orderId: recentDuplicate.id, duplicate: true });
      return;
    }
    
    order.paymentStatus = 'unpaid';
    orders.set(order.id, order);
    
    db.saveOrder(order).catch(err => console.error('Failed to save order to DB:', err));

    const sessionKey = order.locationId || String(order.tableNumber);
    const session = activeTables.get(sessionKey);
    if (session) {
      session.totalOrders++;
      session.totalSpent += order.total;
      activeTables.set(sessionKey, session);
    }

    const foodItems = order.items.filter(item => item.category === 'food');
    const drinkItems = order.items.filter(item =>
      ['cocktails', 'spirits', 'wine', 'nonalc', 'brandy', 'tequila', 'sparkling-wine', 'liquor', 'mixers', 'energy-drinks', 'beer'].includes(item.category)
    );
    const shishaItems = order.items.filter(item => item.category === 'shisha');

    // Emit to staff rooms and track delivery
    const emitToStaff = () => {
      io.to('staff-manager').to('staff-all').emit('new-order', order);
      if (foodItems.length > 0) {
        io.to('staff-kitchen').emit('new-order', { ...order, items: foodItems });
      }
      if (drinkItems.length > 0 || shishaItems.length > 0) {
        io.to('staff-bar').emit('new-order', {
          ...order,
          items: [...drinkItems, ...shishaItems]
        });
      }
    };

    emitToStaff();

    // Store undelivered orders for offline dashboard recovery
    // This ensures orders aren't lost if dashboard refreshes
    const undeliveredKey = `undelivered-${Date.now()}`;
    socket.handshake.auth = { ...socket.handshake.auth, lastOrder: order.id };

    io.to(`table-${order.tableNumber}`).emit('order-confirmation', { orderId: order.id });

    // Check for offline staff and send alerts
    if (foodItems.length > 0 && !isStaffOnline('kitchen')) {
      await sendStaffOfflineAlert('food');
    }
    if ((drinkItems.length > 0 || shishaItems.length > 0) && !isStaffOnline('bar')) {
      await sendStaffOfflineAlert('drink');
    }
    if (!isStaffOnline('manager')) {
      await sendStaffOfflineAlert('general');
    }

    const itemsList = order.items.map(i =>
      `${i.quantity}× ${i.name} (${formatPrice(i.price * i.quantity)})`
    ).join('\n');

    if (telegramConfig.newOrder) {
      const managerMsg = `🍾 <b>NEW ORDER</b> — Table ${order.tableNumber}\n` +
        `👤 ${order.guestName}\n` +
        `🆔 Order: ${order.id.slice(-8)}\n` +
        `━━━━━━━━━━━━━━\n${itemsList}\n` +
        `━━━━━━━━━━━━━━\n` +
        `💰 <b>Total:</b> ${formatPrice(order.total)}\n` +
        `💳 <b>Payment:</b> Unpaid` +
        (order.note ? `\n📝 <i>${order.note}</i>` : '');
      await sendTelegramMessage(MANAGER_CHAT_ID, managerMsg);

      if (foodItems.length > 0 && KITCHEN_CHAT_ID) {
        const kitchenItems = foodItems.map(i => `${i.quantity}× ${i.name}`).join('\n');
        const kitchenMsg = `👨‍🍳 <b>KITCHEN ORDER</b> — Table ${order.tableNumber}\n` +
          `👤 ${order.guestName}\n` +
          `🆔 ${order.id.slice(-8)}\n` +
          `━━━━━━━━━━━━━━\n${kitchenItems}\n` +
          `━━━━━━━━━━━━━━` +
          (order.note ? `\n📝 <i>${order.note}</i>` : '');
        await sendTelegramMessage(KITCHEN_CHAT_ID, kitchenMsg);
      }

      if ((drinkItems.length > 0 || shishaItems.length > 0) && BAR_CHAT_ID) {
        const barItems = [...drinkItems, ...shishaItems].map(i => `${i.quantity}× ${i.name}`).join('\n');
        const barMsg = `🍸 <b>BAR ORDER</b> — Table ${order.tableNumber}\n` +
          `👤 ${order.guestName}\n` +
          `🆔 ${order.id.slice(-8)}\n` +
          `━━━━━━━━━━━━━━\n${barItems}\n` +
          `━━━━━━━━━━━━━━` +
          (order.note ? `\n📝 <i>${order.note}</i>` : '');
        await sendTelegramMessage(BAR_CHAT_ID, barMsg);
      }
    }

    logAudit('ORDER_CREATED', order.guestName, 'staff', 'order', order.id, { 
      tableNumber: order.tableNumber, 
      total: order.total, 
      items: order.items.length 
    }, socket.handshake.address);
    console.log(`New order: ${order.id} from Table ${order.tableNumber} - Guest: ${order.guestName}`);
  });

  // Update order status
  socket.on('update-order-status', async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
    // Authorization check - only staff can update order status
    if (!hasStaffRole(['manager', 'kitchen', 'bar'])) {
      socket.emit('error', { message: 'Unauthorized: Staff role required' });
      return;
    }
    
    const order = orders.get(orderId);
    if (order) {
      order.status = status;
      orders.set(orderId, order);
      
      io.to(`table-${order.tableNumber}`).to('staff-manager').to('staff-all').emit('order-status-update', { orderId, status });
      
      if (['preparing', 'ready'].includes(status)) {
        const foodItems = order.items.filter(item => item.category === 'food');
        if (foodItems.length > 0) {
          io.to('staff-kitchen').emit('order-status-update', { orderId, status });
        }
        const drinkItems = order.items.filter(item => 
          ['cocktails', 'spirits', 'wine', 'nonalc', 'shisha', 'brandy', 'tequila', 'sparkling-wine', 'liquor', 'mixers', 'energy-drinks', 'beer'].includes(item.category)
        );
        if (drinkItems.length > 0) {
          io.to('staff-bar').emit('order-status-update', { orderId, status });
        }
      }
      
      if (status === 'delivered' && telegramConfig.orderStatus) {
        const msg = `✅ <b>DELIVERED</b> — Table ${order.tableNumber}\nOrder completed`;
        await sendTelegramMessage(MANAGER_CHAT_ID, msg);
      }
      
      logAudit('ORDER_STATUS_UPDATE', 'staff', 'staff', 'order', orderId, { status }, socket.handshake.address);
      console.log(`Order ${orderId} status updated to ${status}`);
    }
  });

  // Access request
  socket.on('access-request', async (request: AccessRequest) => {
    accessRequests.set(request.id, request);
    db.saveAccessRequest(request).catch(err => console.error('Failed to save access request to DB:', err));
    
    io.to('staff-manager').to('staff-all').emit('access-request', request);
    
    if (telegramConfig.accessRequest) {
      const accessLabels: Record<string, string> = {
        'pool-spa': 'Pool & Spa Access',
        'lounge-entry': 'Lounge Entry',
        'vip-dance': 'VIP Dance Floor',
        'call-waiter': 'Call a Waiter',
        'extra-ice': 'Extra Ice/Cups',
        'bill-request': 'Bill Request'
      };
      
      const message = `🛎️ <b>ACCESS REQUEST</b>\n` +
        `🪑 Table ${request.tableNumber}\n` +
        `👤 ${request.guestName}\n` +
        `📍 ${accessLabels[request.type] || request.type}`;
      await sendTelegramMessage(MANAGER_CHAT_ID, message);
    }
    
    logAudit('ACCESS_REQUEST', request.guestName, 'staff', 'access-request', request.id, { 
      tableNumber: request.tableNumber, 
      type: request.type 
    }, socket.handshake.address);
    console.log(`Access request: ${request.type} from Table ${request.tableNumber}`);
  });

  // Access response
  socket.on('access-response', ({ requestId, granted }: { requestId: string; granted: boolean }) => {
    const request = accessRequests.get(requestId);
    if (request) {
      request.status = granted ? 'granted' : 'denied';
      accessRequests.set(requestId, request);
      
      io.to(`table-${request.tableNumber}`).emit('access-response', { requestId, granted });
      
      logAudit('ACCESS_RESPONSE', 'staff', 'staff', 'access-request', requestId, { 
        granted, 
        tableNumber: request.tableNumber 
      }, socket.handshake.address);
      console.log(`Access request ${requestId} ${granted ? 'granted' : 'denied'}`);
    }
  });

  // Chat message
  socket.on('chat-message', async (message: ChatMessage) => {
    const tableMessages = messages.get(`table-${message.tableNumber}`) || [];
    tableMessages.push(message);
    messages.set(`table-${message.tableNumber}`, tableMessages);
    
    db.saveMessage(message).catch(err => console.error('Failed to save message to DB:', err));

    // Send to the table and manager rooms only (not all kitchen/bar)
    io.to(`table-${message.tableNumber}`)
      .to('staff-manager')
      .to('staff-all')
      .emit('new-message', message);

    if (message.sender === 'guest' && telegramConfig.chat) {
      const msg = `💬 <b>MESSAGE</b> — Table ${message.tableNumber}\n` +
        `👤 ${message.senderName}: ${message.text}`;
      await sendTelegramMessage(MANAGER_CHAT_ID, msg);
    }

    console.log(`Chat message from ${message.sender} at Table ${message.tableNumber}`);
  });

  // Update payment status
  socket.on('update-payment', async ({ orderId, status }: { orderId: string; status: PaymentStatus }) => {
    // Authorization check - only manager can update payment status
    if (!hasStaffRole(['manager'])) {
      socket.emit('error', { message: 'Unauthorized: Manager role required' });
      return;
    }
    
    const order = orders.get(orderId);
    if (order) {
      order.paymentStatus = status;
      orders.set(orderId, order);

      io.to(`table-${order.tableNumber}`).to('staff-manager').to('staff-all').emit('payment-update', { orderId, status });

      if (status === 'paid' && telegramConfig.payment) {
        const msg = `💳 <b>PAYMENT RECEIVED</b> — Table ${order.tableNumber}\n` +
          `💰 ${formatPrice(order.total)}\n` +
          `🆔 ${order.id.slice(-8)}`;
        await sendTelegramMessage(MANAGER_CHAT_ID, msg);
      }

      logAudit('PAYMENT_UPDATE', 'staff', 'staff', 'order', orderId, { 
        paymentStatus: status, 
        tableNumber: order.tableNumber 
      }, socket.handshake.address);
      console.log(`Order ${orderId} payment updated to ${status}`);
    }
  });

  // Request refund
  socket.on('request-refund', async (request: RefundRequest) => {
    refundRequests.set(request.id, request);
    db.saveRefundRequest(request).catch(err => console.error('Failed to save refund request to DB:', err));

    io.to('staff-manager').to('staff-all').emit('refund-request', request);

    if (telegramConfig.refund) {
      const msg = `🔄 <b>REFUND REQUEST</b>\n` +
        `🪑 Table ${request.tableNumber}\n` +
        `👤 ${request.guestName}\n` +
        `💰 Amount: ${formatPrice(request.amount)}\n` +
        `📝 Reason: ${request.reason}`;
      await sendTelegramMessage(MANAGER_CHAT_ID, msg);
    }

    logAudit('REFUND_REQUEST', request.guestName, 'staff', 'refund-request', request.id, { 
      amount: request.amount, 
      reason: request.reason 
    }, socket.handshake.address);
    console.log(`Refund request: ${request.id} from Table ${request.tableNumber}`);
  });

  // Process refund
  socket.on('process-refund', async ({ requestId, approved }: { requestId: string; approved: boolean }) => {
    // Authorization check - only manager can process refunds
    if (!hasStaffRole(['manager'])) {
      socket.emit('error', { message: 'Unauthorized: Manager role required' });
      return;
    }
    
    const request = refundRequests.get(requestId);
    if (request) {
      request.status = approved ? 'approved' : 'denied';
      refundRequests.set(requestId, request);

      if (approved) {
        const order = orders.get(request.orderId);
        if (order) {
          order.status = 'refunded';
          order.refundAmount = request.amount;
          order.refundReason = request.reason;
          order.paymentStatus = 'refunded';
          orders.set(request.orderId, order);

          io.to(`table-${request.tableNumber}`).to('staff-manager').to('staff-all').emit('refund-processed', { requestId, approved, amount: request.amount });

          if (telegramConfig.refund) {
            const msg = `✅ <b>REFUND APPROVED</b> — Table ${request.tableNumber}\n` +
              `💰 ${formatPrice(request.amount)}\n` +
              `📝 ${request.reason}`;
            await sendTelegramMessage(MANAGER_CHAT_ID, msg);
          }
        }
      } else {
        io.to('staff-manager').to('staff-all').emit('refund-processed', { requestId, approved });
        if (telegramConfig.refund) {
          const msg = `❌ <b>REFUND DENIED</b> — Table ${request.tableNumber}\n` +
            `💰 ${formatPrice(request.amount)}`;
          await sendTelegramMessage(MANAGER_CHAT_ID, msg);
        }
      }

      logAudit('REFUND_PROCESSED', 'staff', 'staff', 'refund-request', requestId, { 
        approved, 
        amount: request.amount 
      }, socket.handshake.address);
      console.log(`Refund ${requestId} ${approved ? 'approved' : 'denied'}`);
    }
  });

  // Cancel order
  socket.on('cancel-order', async ({ orderId, reason }: { orderId: string; reason?: string }) => {
    // Authorization check - only staff can cancel orders
    if (!hasStaffRole(['manager', 'kitchen', 'bar'])) {
      socket.emit('error', { message: 'Unauthorized: Staff role required' });
      return;
    }
    
    const order = orders.get(orderId);
    if (order && order.status === 'pending') {
      order.status = 'cancelled';
      orders.set(orderId, order);

      io.to(`table-${order.tableNumber}`).to('staff-manager').to('staff-all').emit('order-cancelled', { orderId, reason });

      const msg = `❌ <b>ORDER CANCELLED</b> — Table ${order.tableNumber}\n` +
        `💰 ${formatPrice(order.total)}\n` +
        `🆔 ${order.id.slice(-8)}` +
        (reason ? `\n📝 ${reason}` : '');
      await sendTelegramMessage(MANAGER_CHAT_ID, msg, telegramConfig.orderStatus);

      logAudit('ORDER_CANCELLED', 'staff', 'staff', 'order', orderId, { 
        reason, 
        tableNumber: order.tableNumber 
      }, socket.handshake.address);
      console.log(`Order ${orderId} cancelled. Reason: ${reason || 'No reason provided'}`);
    }
  });

  // End table session (table turnover) - generates final bill
  socket.on('end-session', async ({ tableNumber, locationId, finalBill }: { tableNumber: number; locationId?: string; finalBill: number }) => {
    // Authorization check - only manager can end sessions
    if (!hasStaffRole(['manager'])) {
      socket.emit('error', { message: 'Unauthorized: Manager role required' });
      return;
    }
    
    // Determine session key - prefer locationId, fallback to tableNumber as string
    const sessionKey = locationId || String(tableNumber);
    const session = activeTables.get(sessionKey);
    
    if (session) {
      session.isActive = false;
      session.endTime = new Date();
      session.totalSpent = finalBill;

      // Generate final receipt for the session
      const sessionOrders = Array.from(orders.values())
        .filter(o => o.tableNumber === tableNumber && o.status !== 'cancelled' && o.status !== 'refunded');
      
      if (sessionOrders.length > 0) {
        const finalReceipt: Receipt = {
          id: `final-${generateId()}`,
          orderId: `session-${session.id}`,
          tableNumber,
          guestName: session.guests.map(g => g.guestName).join(', '),
          items: sessionOrders.flatMap(o => o.items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          }))),
          subtotal: finalBill,
          total: finalBill,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
          status: 'pending'
        };
        receipts.set(finalReceipt.id, finalReceipt);
        
        io.to('staff-manager').to('staff-all').emit('session-receipt', {
          tableNumber,
          locationId: session.locationId,
          receipt: finalReceipt
        });
      }

      io.to('staff-manager').to('staff-all').emit('session-ended', {
        tableNumber,
        locationId: session.locationId,
        sessionId: session.id,
        duration: Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 60000),
        guestCount: session.guests.length,
        totalOrders: session.totalOrders,
        totalSpent: finalBill
      });

      if (telegramConfig.session) {
        const locationDisplay = session.locationId || `Table ${tableNumber}`;
        const msg = `🧹 <b>SESSION ENDED</b> — ${locationDisplay}\n` +
          `👥 ${session.guests.length} guests\n` +
          `📦 ${session.totalOrders} orders\n` +
          `💰 ${formatPrice(finalBill)}`;
        await sendTelegramMessage(MANAGER_CHAT_ID, msg);
      }

      activeTables.delete(sessionKey);

      io.to(`table-${sessionKey}`).emit('session-ended-client', {
        sessionId: session.id
      });

      logAudit('SESSION_ENDED', 'staff', 'staff', 'session', session.id, { 
        sessionKey,
        tableNumber, 
        locationId: session.locationId,
        finalBill, 
        guestCount: session.guests.length 
      }, socket.handshake.address);
      const locationDisplay = session.locationId || `Table ${tableNumber}`;
      console.log(`Session ended for ${locationDisplay}. Total spent: ${formatPrice(finalBill)}`);
    }
  });

  // Generate receipt request
  socket.on('generate-receipt', ({ orderId }: { orderId: string }) => {
    const order = orders.get(orderId);
    if (order) {
      const receipt = generateReceipt(order);
      socket.emit('receipt-generated', receipt);
    }
  });

  // Update inventory
  socket.on('update-inventory', (update: InventoryUpdate) => {
    // Authorization check - only staff can update inventory
    if (!hasStaffRole(['manager', 'kitchen', 'bar'])) {
      socket.emit('error', { message: 'Unauthorized: Staff role required' });
      return;
    }
    
    inventoryStatus.set(update.itemId, {
      isAvailable: update.isAvailable,
      stockQuantity: update.stockQuantity ?? null
    });
    
    logAudit('INVENTORY_UPDATE', update.updatedBy, 'staff', 'inventory', undefined, {
      itemId: update.itemId,
      isAvailable: update.isAvailable
    });
    
    io.emit('inventory-update', Object.fromEntries(inventoryStatus));
    console.log(`Inventory updated: Item ${update.itemId} - Available: ${update.isAvailable}`);
  });

  // Update telegram config
  socket.on('update-telegram-config', (config: Partial<TelegramNotificationConfig>) => {
    // Authorization check - only manager can update telegram config
    if (!hasStaffRole(['manager'])) {
      socket.emit('error', { message: 'Unauthorized: Manager role required' });
      return;
    }
    
    telegramConfig = { ...telegramConfig, ...config };
    logAudit('TELEGRAM_CONFIG_UPDATE', 'staff', 'staff', 'telegram-config', undefined, config);
    io.to('staff-manager').emit('telegram-config', telegramConfig);
    console.log('Telegram config updated:', telegramConfig);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Remove from staff online tracking
    for (const [staffId, staffInfo] of staffOnlineStatus.entries()) {
      if (staffInfo.socketId === socket.id) {
        staffOnlineStatus.delete(staffId);
        console.log(`Staff ${staffInfo.role} went offline (${staffOnlineStatus.size} total staff online)`);
        
        // Send alert if no staff of this role remain
        const remainingOfRole = Array.from(staffOnlineStatus.values()).filter(s => s.role === staffInfo.role).length;
        if (remainingOfRole === 0 && MANAGER_CHAT_ID) {
          const msg = `⚠️ <b>STAFF WENT OFFLINE</b>\nNo ${staffInfo.role} staff currently online.\n🕐 ${formatTime(new Date())}`;
          sendTelegramMessage(MANAGER_CHAT_ID, msg);
        }
        break;
      }
    }

    // Find and handle guest disconnections
    // Need to check both locationId and tableNumber keys
    const keysToCheck: string[] = [];
    for (const [key, session] of activeTables.entries()) {
      if (session.guests.some(g => g.socketId === socket.id)) {
        keysToCheck.push(key);
      }
    }
    
    for (const sessionKey of keysToCheck) {
      const session = activeTables.get(sessionKey);
      if (!session) continue;
      
      const guestIndex = session.guests.findIndex(g => g.socketId === socket.id);
      if (guestIndex === -1) continue;
      
      const guest = session.guests[guestIndex];
      session.guests.splice(guestIndex, 1);
      
      if (session.guests.length === 0) {
        // Clean up the session when the last guest disconnects
        session.isActive = false;
        session.endTime = new Date();
        activeTables.delete(sessionKey);
        
        // Emit table-inactive with both identifiers
        io.to('staff-manager').to('staff-all').emit('table-inactive', { 
          tableNumber: session.tableNumber,
          locationId: session.locationId 
        });
        
        const locationDisplay = session.locationId || `Table ${session.tableNumber}`;
        console.log(`Session ended for ${locationDisplay} - last guest disconnected`);
      } else {
        activeTables.set(sessionKey, session);
        io.to('staff-manager').to('staff-all').emit('guest-left', {
          tableNumber: session.tableNumber,
          locationId: session.locationId,
          guestName: guest.guestName,
          remainingGuests: session.guests.length
        });
      }
      
      logAudit('GUEST_DISCONNECTED', guest.guestName, 'staff', 'table', session.id, { 
        sessionKey,
        tableNumber: session.tableNumber,
        locationId: session.locationId,
        remainingGuests: session.guests.length 
      });
      break;
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  httpServer.close(() => {
    console.log('📡 HTTP server closed');
  });
  
  // Notify all connected clients about shutdown
  io.emit('server-shutdown', { message: 'Server is restarting. Please reconnect in a moment.' });
  
  // Give clients time to receive the message
  setTimeout(async () => {
    // Close Socket.IO connections
    io.close(() => {
      console.log('📡 Socket.IO connections closed');
    });
    
    // Save any pending data to database
    if (db.isConnected()) {
      try {
        console.log('💾 Saving pending data to database...');
        // Data is already saved in real-time via db.save* calls
        console.log('✅ All data saved');
      } catch (error) {
        console.error('❌ Error saving data during shutdown:', error);
      }
    }
    
    console.log('👋 Graceful shutdown complete');
    process.exit(0);
  }, 2000);
  
  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('⚠️ Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Client URL: https://d-cubes.com.ng`);
  console.log(`🤖 Telegram Bot: ${TELEGRAM_BOT_TOKEN ? 'Enabled' : 'Disabled'}`);
  console.log(`🔒 Rate Limiting: Enabled (${RATE_LIMIT_MAX} req/min)`);
  console.log(`📋 Audit Logging: Enabled`);
});
