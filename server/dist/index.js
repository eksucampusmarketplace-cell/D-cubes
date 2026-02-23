"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const qrcode_1 = __importDefault(require("qrcode"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static files from client in production
if (process.env.NODE_ENV === 'production') {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../../client/dist')));
    // Handle client-side routing
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../../client/dist/index.html'));
    });
}
// Telegram Bot Setup
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const KITCHEN_CHAT_ID = process.env.KITCHEN_CHAT_ID || '';
const BAR_CHAT_ID = process.env.BAR_CHAT_ID || '';
const MANAGER_CHAT_ID = process.env.MANAGER_CHAT_ID || '';
let bot = null;
if (TELEGRAM_BOT_TOKEN) {
    bot = new node_telegram_bot_api_1.default(TELEGRAM_BOT_TOKEN, { polling: true });
    console.log('✅ Telegram bot initialized');
}
// Store orders, requests, and messages in memory (use Redis for production)
const orders = new Map();
const accessRequests = new Map();
const messages = new Map();
const activeTables = new Map();
const refundRequests = new Map();
// Helper functions
const formatPrice = (price) => {
    return `₦${price.toLocaleString('en-NG')}`;
};
const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};
const sendTelegramMessage = async (chatId, message) => {
    if (!bot || !chatId)
        return;
    try {
        await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    }
    catch (error) {
        console.error('Failed to send Telegram message:', error);
    }
};
const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
const generateGuestId = () => {
    return `guest-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
};
const generateSessionId = () => {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
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
        const qrCodeDataUrl = await qrcode_1.default.toDataURL(url, {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});
// Analytics endpoint
app.get('/api/analytics', (req, res) => {
    const analytics = {
        totalRevenue: 0,
        orderCount: 0,
        averageOrderValue: 0,
        topSellingItems: [],
        categoryBreakdown: [],
        hourlySales: Array.from({ length: 24 }, (_, i) => ({ hour: i, orders: 0, revenue: 0 })),
        tablePerformance: [],
        popularItemsByCategory: {}
    };
    const itemSales = new Map();
    const categorySales = new Map();
    const tableSales = new Map();
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
// Socket.io handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    // Join table room
    socket.on('join-table', (tableNumber) => {
        socket.join(`table-${tableNumber}`);
        console.log(`Socket ${socket.id} joined table-${tableNumber}`);
    });
    // Join staff room
    socket.on('join-staff', (role) => {
        socket.join(`staff-${role}`);
        if (role === 'manager')
            socket.join('staff-all');
        console.log(`Socket ${socket.id} joined staff-${role}`);
    });
    // Check-in
    socket.on('check-in', async ({ tableNumber, guestName }) => {
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
        }
        const guest = {
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
        const message = session.guests.length === 1
            ? `✅ <b>NEW SESSION</b>\n🪑 Table ${tableNumber}\n👤 ${guestName}\n🕐 ${formatTime(new Date())}`
            : `👥 <b>GUEST JOINED</b>\n🪑 Table ${tableNumber}\n👤 ${guestName}\n👥 ${session.guests.length} guests\n🕐 ${formatTime(new Date())}`;
        await sendTelegramMessage(MANAGER_CHAT_ID, message);
        socket.emit('check-in-success', {
            tableNumber,
            guestName,
            guestId,
            sessionId: session.id
        });
        console.log(`Check-in: Table ${tableNumber} - ${guestName} (Session: ${session.id})`);
    });
    // New order
    socket.on('new-order', async (order) => {
        order.id = order.id || generateId();
        order.paymentStatus = 'unpaid';
        orders.set(order.id, order);
        const session = activeTables.get(order.tableNumber);
        if (session) {
            session.totalOrders++;
            session.totalSpent += order.total;
            activeTables.set(order.tableNumber, session);
        }
        const foodItems = order.items.filter(item => item.category === 'food');
        const drinkItems = order.items.filter(item => ['cocktails', 'spirits', 'wine', 'nonalc'].includes(item.category));
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
        const itemsList = order.items.map(i => `${i.quantity}× ${i.name} (${formatPrice(i.price * i.quantity)})`).join('\n');
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
        console.log(`New order: ${order.id} from Table ${order.tableNumber}`);
    });
    // Update order status
    socket.on('update-order-status', async ({ orderId, status }) => {
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
                const drinkItems = order.items.filter(item => ['cocktails', 'spirits', 'wine', 'nonalc', 'shisha'].includes(item.category));
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
    socket.on('access-request', async (request) => {
        accessRequests.set(request.id, request);
        // Notify managers
        io.to('staff-manager').to('staff-all').emit('access-request', request);
        // Send Telegram notification
        const accessLabels = {
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
    socket.on('access-response', ({ requestId, granted }) => {
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
    socket.on('chat-message', async (message) => {
        const tableMessages = messages.get(`table-${message.tableNumber}`) || [];
        tableMessages.push(message);
        messages.set(`table-${message.tableNumber}`, tableMessages);
        io.to(`table-${message.tableNumber}`).to('staff-manager').to('staff-all').emit('new-message', message);
        if (message.sender === 'guest') {
            const msg = `💬 <b>MESSAGE</b> — Table ${message.tableNumber}\n` +
                `👤 ${message.senderName}: ${message.text}`;
            await sendTelegramMessage(MANAGER_CHAT_ID, msg);
        }
        console.log(`Chat message from ${message.sender} at Table ${message.tableNumber}`);
    });
    // Update payment status
    socket.on('update-payment', async ({ orderId, status }) => {
        const order = orders.get(orderId);
        if (order) {
            order.paymentStatus = status;
            orders.set(orderId, order);
            io.to(`table-${order.tableNumber}`).to('staff-manager').to('staff-all').emit('payment-update', { orderId, status });
            if (status === 'paid') {
                const msg = `💳 <b>PAYMENT RECEIVED</b> — Table ${order.tableNumber}\n` +
                    `💰 ${formatPrice(order.total)}\n` +
                    `🆔 ${order.id.slice(-8)}`;
                await sendTelegramMessage(MANAGER_CHAT_ID, msg);
            }
            console.log(`Order ${orderId} payment updated to ${status}`);
        }
    });
    // Request refund
    socket.on('request-refund', async (request) => {
        refundRequests.set(request.id, request);
        io.to('staff-manager').to('staff-all').emit('refund-request', request);
        const msg = `🔄 <b>REFUND REQUEST</b>\n` +
            `🪑 Table ${request.tableNumber}\n` +
            `👤 ${request.guestName}\n` +
            `💰 Amount: ${formatPrice(request.amount)}\n` +
            `📝 Reason: ${request.reason}`;
        await sendTelegramMessage(MANAGER_CHAT_ID, msg);
        console.log(`Refund request: ${request.id} from Table ${request.tableNumber}`);
    });
    // Process refund
    socket.on('process-refund', async ({ requestId, approved }) => {
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
                    const msg = `✅ <b>REFUND APPROVED</b> — Table ${request.tableNumber}\n` +
                        `💰 ${formatPrice(request.amount)}\n` +
                        `📝 ${request.reason}`;
                    await sendTelegramMessage(MANAGER_CHAT_ID, msg);
                }
            }
            else {
                io.to('staff-manager').to('staff-all').emit('refund-processed', { requestId, approved });
                const msg = `❌ <b>REFUND DENIED</b> — Table ${request.tableNumber}\n` +
                    `💰 ${formatPrice(request.amount)}`;
                await sendTelegramMessage(MANAGER_CHAT_ID, msg);
            }
            console.log(`Refund ${requestId} ${approved ? 'approved' : 'denied'}`);
        }
    });
    // Cancel order
    socket.on('cancel-order', async ({ orderId, reason }) => {
        const order = orders.get(orderId);
        if (order && order.status === 'pending') {
            order.status = 'cancelled';
            orders.set(orderId, order);
            io.to(`table-${order.tableNumber}`).to('staff-manager').to('staff-all').emit('order-cancelled', { orderId, reason });
            const msg = `❌ <b>ORDER CANCELLED</b> — Table ${order.tableNumber}\n` +
                `💰 ${formatPrice(order.total)}\n` +
                `🆔 ${order.id.slice(-8)}` +
                (reason ? `\n📝 ${reason}` : '');
            await sendTelegramMessage(MANAGER_CHAT_ID, msg);
            console.log(`Order ${orderId} cancelled. Reason: ${reason || 'No reason provided'}`);
        }
    });
    // End table session (table turnover)
    socket.on('end-session', async ({ tableNumber, finalBill }) => {
        const session = activeTables.get(tableNumber);
        if (session) {
            session.isActive = false;
            session.endTime = new Date();
            session.totalSpent = finalBill;
            io.to('staff-manager').to('staff-all').emit('session-ended', {
                tableNumber,
                sessionId: session.id,
                duration: Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 60000),
                guestCount: session.guests.length,
                totalOrders: session.totalOrders,
                totalSpent: finalBill
            });
            const msg = `🧹 <b>SESSION ENDED</b> — Table ${tableNumber}\n` +
                `👥 ${session.guests.length} guests\n` +
                `📦 ${session.totalOrders} orders\n` +
                `💰 ${formatPrice(finalBill)}`;
            await sendTelegramMessage(MANAGER_CHAT_ID, msg);
            activeTables.delete(tableNumber);
            io.to(`table-${tableNumber}`).emit('session-ended-client', {
                sessionId: session.id
            });
            console.log(`Session ended for Table ${tableNumber}. Total spent: ${formatPrice(finalBill)}`);
        }
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
                }
                else {
                    io.to('staff-manager').to('staff-all').emit('guest-left', {
                        tableNumber: tableNum,
                        guestName: guest.guestName,
                        remainingGuests: session.guests.length
                    });
                }
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
//# sourceMappingURL=index.js.map