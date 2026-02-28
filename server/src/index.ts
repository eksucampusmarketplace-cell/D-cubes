import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import QRCode from 'qrcode';
import TelegramBot from 'node-telegram-bot-api';
import { Order, AccessRequest, ChatMessage, OrderStatus, TableSession, TableGuest, RefundRequest, PaymentStatus, AnalyticsData, Receipt, AuditLog, InventoryUpdate, TelegramNotificationConfig } from './types';
import { db } from './database';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
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

app.use(cors());
app.use(express.json());
app.use(rateLimiter);
app.use(ipWhitelist);

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

let bot: TelegramBot | null = null;
if (TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  console.log('✅ Telegram bot initialized');
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
const activeTables: Map<number, TableSession> = new Map();
const refundRequests: Map<string, RefundRequest> = new Map();
const receipts: Map<string, Receipt> = new Map();
const auditLogs: AuditLog[] = [];
const inventoryStatus: Map<number, { isAvailable: boolean; stockQuantity: number | null }> = new Map();

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
    data.activeTables.forEach((session, tableNum) => activeTables.set(tableNum, session));
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
      <td style="padding: 8px; border-bottom: 1px solid #333;">${item.name}</td>
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
        <p><strong>Guest:</strong> ${receipt.guestName}</p>
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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    telegramEnabled: Boolean(TELEGRAM_BOT_TOKEN),
    databaseConnected: db.isConnected()
  });
});

// Generate QR code for a table
app.get('/api/qr/:tableNumber', async (req, res) => {
  try {
    const tableNumber = parseInt(req.params.tableNumber);
    const zone = (req.query.zone as string) || 'lounge';
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const locationId = `T-${String(tableNumber).padStart(3, '0')}`;
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
      tableNumber,
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

      const hour = new Date(order.timestamp).getHours();
      analytics.hourlySales[hour].orders++;
      analytics.hourlySales[hour].revenue += order.total;

      const tableStats = tableSales.get(order.tableNumber) || { orders: 0, revenue: 0 };
      tableStats.orders++;
      tableStats.revenue += order.total;
      tableSales.set(order.tableNumber, tableStats);
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
  const session = activeTables.get(tableNumber);
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

// Update telegram config
app.post('/api/telegram-config', (req, res) => {
  telegramConfig = { ...telegramConfig, ...req.body };
  logAudit('TELEGRAM_CONFIG_UPDATE', 'admin', 'staff', 'telegram-config', undefined, req.body, req.ip);
  res.json(telegramConfig);
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
    socket.join(`staff-${role}`);
    if (role === 'manager') socket.join('staff-all');
    console.log(`Socket ${socket.id} joined staff-${role}`);
    
    // Send current inventory status to staff
    socket.emit('inventory-update', Object.fromEntries(inventoryStatus));
    socket.emit('telegram-config', telegramConfig);
  });

  // Check-in - supports multiple guests at same table
  socket.on('check-in', async ({ tableNumber, guestName }: { tableNumber: number; guestName: string }) => {
    const guestId = generateGuestId();
    let session = activeTables.get(tableNumber);

    if (!session || !session.isActive) {
      session = {
        id: generateSessionId(),
        tableNumber,
        startTime: new Date(),
        isActive: true,
        guests: [],
        totalOrders: 0,
        totalSpent: 0
      };
      activeTables.set(tableNumber, session);
      
      db.saveTableSession(session).catch(err => console.error('Failed to save session to DB:', err));
    }

    const guest: TableGuest = {
      id: guestId,
      guestName,
      socketId: socket.id,
      checkInTime: new Date()
    };

    session.guests.push(guest);
    socket.join(`table-${tableNumber}`);

    io.to('staff-manager').to('staff-all').emit('check-in', {
      tableNumber,
      guestName,
      guestId,
      sessionId: session.id,
      guestCount: session.guests.length
    });

    if (telegramConfig.session) {
      const message = session.guests.length === 1
        ? `✅ <b>NEW SESSION</b>\n🪑 Table ${tableNumber}\n👤 ${guestName}\n🕐 ${formatTime(new Date())}`
        : `👥 <b>GUEST JOINED</b>\n🪑 Table ${tableNumber}\n👤 ${guestName}\n👥 ${session.guests.length} guests\n🕐 ${formatTime(new Date())}`;
      await sendTelegramMessage(MANAGER_CHAT_ID, message);
    }

    socket.emit('check-in-success', {
      tableNumber,
      guestName,
      guestId,
      sessionId: session.id,
      guestCount: session.guests.length
    });

    logAudit('CHECK_IN', guestName, 'staff', 'table', session.id, { tableNumber, guestId }, socket.handshake.address);
    console.log(`Check-in: Table ${tableNumber} - ${guestName} (Session: ${session.id}, Guests: ${session.guests.length})`);
  });

  // New order - each guest can order independently
  socket.on('new-order', async (order: Order) => {
    order.id = order.id || generateId();
    order.paymentStatus = 'unpaid';
    orders.set(order.id, order);
    
    db.saveOrder(order).catch(err => console.error('Failed to save order to DB:', err));

    const session = activeTables.get(order.tableNumber);
    if (session) {
      session.totalOrders++;
      session.totalSpent += order.total;
      activeTables.set(order.tableNumber, session);
    }

    const foodItems = order.items.filter(item => item.category === 'food');
    const drinkItems = order.items.filter(item =>
      ['cocktails', 'spirits', 'wine', 'nonalc', 'brandy', 'tequila', 'sparkling-wine', 'liquor', 'mixers', 'energy-drinks', 'beer'].includes(item.category)
    );
    const shishaItems = order.items.filter(item => item.category === 'shisha');

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

    io.to(`table-${order.tableNumber}`).emit('order-confirmation', { orderId: order.id });

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

    io.to(`table-${message.tableNumber}`)
      .to('staff-manager')
      .to('staff-all')
      .to('staff-kitchen')
      .to('staff-bar')
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
  socket.on('end-session', async ({ tableNumber, finalBill }: { tableNumber: number; finalBill: number }) => {
    const session = activeTables.get(tableNumber);
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
          receipt: finalReceipt
        });
      }

      io.to('staff-manager').to('staff-all').emit('session-ended', {
        tableNumber,
        sessionId: session.id,
        duration: Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 60000),
        guestCount: session.guests.length,
        totalOrders: session.totalOrders,
        totalSpent: finalBill
      });

      if (telegramConfig.session) {
        const msg = `🧹 <b>SESSION ENDED</b> — Table ${tableNumber}\n` +
          `👥 ${session.guests.length} guests\n` +
          `📦 ${session.totalOrders} orders\n` +
          `💰 ${formatPrice(finalBill)}`;
        await sendTelegramMessage(MANAGER_CHAT_ID, msg);
      }

      activeTables.delete(tableNumber);

      io.to(`table-${tableNumber}`).emit('session-ended-client', {
        sessionId: session.id
      });

      logAudit('SESSION_ENDED', 'staff', 'staff', 'session', session.id, { 
        tableNumber, 
        finalBill, 
        guestCount: session.guests.length 
      }, socket.handshake.address);
      console.log(`Session ended for Table ${tableNumber}. Total spent: ${formatPrice(finalBill)}`);
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
    telegramConfig = { ...telegramConfig, ...config };
    logAudit('TELEGRAM_CONFIG_UPDATE', 'staff', 'staff', 'telegram-config', undefined, config);
    io.to('staff-manager').emit('telegram-config', telegramConfig);
    console.log('Telegram config updated:', telegramConfig);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    for (const [tableNum, session] of activeTables.entries()) {
      const guestIndex = session.guests.findIndex(g => g.socketId === socket.id);
      if (guestIndex !== -1) {
        const guest = session.guests[guestIndex];
        session.guests.splice(guestIndex, 1);
        activeTables.set(tableNum, session);

        if (session.guests.length === 0) {
          io.to('staff-manager').to('staff-all').emit('table-inactive', tableNum);
        } else {
          io.to('staff-manager').to('staff-all').emit('guest-left', {
            tableNumber: tableNum,
            guestName: guest.guestName,
            remainingGuests: session.guests.length
          });
        }
        
        logAudit('GUEST_DISCONNECTED', guest.guestName, 'staff', 'table', session.id, { 
          tableNumber: tableNum, 
          remainingGuests: session.guests.length 
        });
        break;
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log(`🤖 Telegram Bot: ${TELEGRAM_BOT_TOKEN ? 'Enabled' : 'Disabled'}`);
  console.log(`🔒 Rate Limiting: Enabled (${RATE_LIMIT_MAX} req/min)`);
  console.log(`📋 Audit Logging: Enabled`);
});
