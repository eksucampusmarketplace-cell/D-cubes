import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import QRCode from 'qrcode';
import TelegramBot from 'node-telegram-bot-api';
import { Order, AccessRequest, ChatMessage, OrderStatus } from './types';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Telegram Bot Setup
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const KITCHEN_CHAT_ID = process.env.KITCHEN_CHAT_ID || '';
const BAR_CHAT_ID = process.env.BAR_CHAT_ID || '';
const MANAGER_CHAT_ID = process.env.MANAGER_CHAT_ID || '';

let bot: TelegramBot | null = null;
if (TELEGRAM_BOT_TOKEN) {
  bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
  console.log('✅ Telegram bot initialized');
}

// Store orders, requests, and messages in memory (use Redis for production)
const orders: Map<string, Order> = new Map();
const accessRequests: Map<string, AccessRequest> = new Map();
const messages: Map<string, ChatMessage[]> = new Map();
const activeTables: Map<number, { guestName: string; socketId: string }> = new Map();

// Helper functions
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

const sendTelegramMessage = async (chatId: string, message: string) => {
  if (!bot || !chatId) return;
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate QR code for a table
app.get('/api/qr/:tableNumber', async (req, res) => {
  try {
    const tableNumber = parseInt(req.params.tableNumber);
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const url = `${baseUrl}/order?table=${tableNumber}`;
    
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
      url, 
      qrCode: qrCodeDataUrl 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Socket.io handling
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
  });

  // Check-in
  socket.on('check-in', async ({ tableNumber, guestName }: { tableNumber: number; guestName: string }) => {
    activeTables.set(tableNumber, { guestName, socketId: socket.id });
    
    // Notify managers
    io.to('staff-manager').to('staff-all').emit('check-in', { tableNumber, guestName });
    
    // Send Telegram notification
    const message = `✅ <b>CHECK-IN</b>\n🪑 Table ${tableNumber}\n👤 ${guestName}\n🕐 ${formatTime(new Date())}`;
    await sendTelegramMessage(MANAGER_CHAT_ID, message);
    
    console.log(`Check-in: Table ${tableNumber} - ${guestName}`);
  });

  // New order
  socket.on('new-order', async (order: Order) => {
    orders.set(order.id, order);
    
    const foodItems = order.items.filter(item => item.category === 'food');
    const drinkItems = order.items.filter(item => 
      ['cocktails', 'spirits', 'wine', 'nonalc'].includes(item.category)
    );
    const shishaItems = order.items.filter(item => item.category === 'shisha');
    
    // Notify appropriate staff
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
    
    // Notify table
    io.to(`table-${order.tableNumber}`).emit('order-confirmation', { orderId: order.id });
    
    // Send Telegram notifications
    const itemsList = order.items.map(i => 
      `${i.quantity}× ${i.name} (${formatPrice(i.price * i.quantity)})`
    ).join('\n');
    
    // Manager notification (full order)
    const managerMsg = `🍾 <b>NEW ORDER</b> — Table ${order.tableNumber}\n` +
      `👤 ${order.guestName}\n` +
      `━━━━━━━━━━━━━━\n${itemsList}\n` +
      `━━━━━━━━━━━━━━\n` +
      `💰 <b>Total:</b> ${formatPrice(order.total)}` +
      (order.note ? `\n📝 <i>${order.note}</i>` : '');
    await sendTelegramMessage(MANAGER_CHAT_ID, managerMsg);
    
    // Kitchen notification (food only)
    if (foodItems.length > 0 && KITCHEN_CHAT_ID) {
      const kitchenItems = foodItems.map(i => 
        `${i.quantity}× ${i.name}`
      ).join('\n');
      const kitchenMsg = `👨‍🍳 <b>KITCHEN ORDER</b> — Table ${order.tableNumber}\n` +
        `👤 ${order.guestName}\n` +
        `━━━━━━━━━━━━━━\n${kitchenItems}\n` +
        `━━━━━━━━━━━━━━` +
        (order.note ? `\n📝 <i>${order.note}</i>` : '');
      await sendTelegramMessage(KITCHEN_CHAT_ID, kitchenMsg);
    }
    
    // Bar notification (drinks only)
    if ((drinkItems.length > 0 || shishaItems.length > 0) && BAR_CHAT_ID) {
      const barItems = [...drinkItems, ...shishaItems].map(i => 
        `${i.quantity}× ${i.name}`
      ).join('\n');
      const barMsg = `🍸 <b>BAR ORDER</b> — Table ${order.tableNumber}\n` +
        `👤 ${order.guestName}\n` +
        `━━━━━━━━━━━━━━\n${barItems}\n` +
        `━━━━━━━━━━━━━━` +
        (order.note ? `\n📝 <i>${order.note}</i>` : '');
      await sendTelegramMessage(BAR_CHAT_ID, barMsg);
    }
    
    console.log(`New order: ${order.id} from Table ${order.tableNumber}`);
  });

  // Update order status
  socket.on('update-order-status', async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
    const order = orders.get(orderId);
    if (order) {
      order.status = status;
      orders.set(orderId, order);
      
      // Broadcast to all relevant parties
      io.to(`table-${order.tableNumber}`).to('staff-manager').to('staff-all').emit('order-status-update', { orderId, status });
      
      if (['preparing', 'ready'].includes(status)) {
        const foodItems = order.items.filter(item => item.category === 'food');
        if (foodItems.length > 0) {
          io.to('staff-kitchen').emit('order-status-update', { orderId, status });
        }
        const drinkItems = order.items.filter(item => 
          ['cocktails', 'spirits', 'wine', 'nonalc', 'shisha'].includes(item.category)
        );
        if (drinkItems.length > 0) {
          io.to('staff-bar').emit('order-status-update', { orderId, status });
        }
      }
      
      // Telegram notification for delivered
      if (status === 'delivered') {
        const msg = `✅ <b>DELIVERED</b> — Table ${order.tableNumber}\nOrder completed`;
        await sendTelegramMessage(MANAGER_CHAT_ID, msg);
      }
      
      console.log(`Order ${orderId} status updated to ${status}`);
    }
  });

  // Access request
  socket.on('access-request', async (request: AccessRequest) => {
    accessRequests.set(request.id, request);
    
    // Notify managers
    io.to('staff-manager').to('staff-all').emit('access-request', request);
    
    // Send Telegram notification
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
    
    console.log(`Access request: ${request.type} from Table ${request.tableNumber}`);
  });

  // Access response
  socket.on('access-response', ({ requestId, granted }: { requestId: string; granted: boolean }) => {
    const request = accessRequests.get(requestId);
    if (request) {
      request.status = granted ? 'granted' : 'denied';
      accessRequests.set(requestId, request);
      
      // Notify table
      io.to(`table-${request.tableNumber}`).emit('access-response', { requestId, granted });
      
      console.log(`Access request ${requestId} ${granted ? 'granted' : 'denied'}`);
    }
  });

  // Chat message
  socket.on('chat-message', async (message: ChatMessage) => {
    const tableMessages = messages.get(`table-${message.tableNumber}`) || [];
    tableMessages.push(message);
    messages.set(`table-${message.tableNumber}`, tableMessages);
    
    // Broadcast to table and staff
    io.to(`table-${message.tableNumber}`).to('staff-manager').to('staff-all').emit('new-message', message);
    
    // Telegram notification for guest messages
    if (message.sender === 'guest') {
      const msg = `💬 <b>MESSAGE</b> — Table ${message.tableNumber}\n` +
        `👤 ${message.senderName}: ${message.text}`;
      await sendTelegramMessage(MANAGER_CHAT_ID, msg);
    }
    
    console.log(`Chat message from ${message.sender} at Table ${message.tableNumber}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Remove from active tables
    for (const [tableNum, data] of activeTables.entries()) {
      if (data.socketId === socket.id) {
        activeTables.delete(tableNum);
        io.to('staff-manager').to('staff-all').emit('table-inactive', tableNum);
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
});
