"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
class Database {
    constructor() {
        this.supabase = null;
        this.useSupabase = false;
    }
    // Initialize Supabase connection
    initialize() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
            this.useSupabase = true;
            console.log('✅ Supabase connected');
        }
        else {
            console.log('⚠️ Running in-memory mode (Supabase not configured)');
            this.useSupabase = false;
        }
    }
    isConnected() {
        return this.useSupabase && this.supabase !== null;
    }
    // ORDER OPERATIONS
    async saveOrder(order) {
        if (!this.useSupabase || !this.supabase)
            return;
        const dbOrder = {
            id: order.id,
            table_number: order.tableNumber,
            guest_name: order.guestName,
            guest_id: order.guestId || '',
            session_id: order.sessionId || '',
            items: order.items,
            total: order.total,
            status: order.status,
            payment_status: order.paymentStatus || 'unpaid',
            note: order.note || null,
            timestamp: new Date(order.timestamp).toISOString(),
            refund_amount: order.refundAmount || null,
            refund_reason: order.refundReason || null
        };
        await this.supabase.from('orders').upsert(dbOrder);
    }
    async getOrders() {
        if (!this.useSupabase || !this.supabase)
            return [];
        const { data } = await this.supabase
            .from('orders')
            .select('*')
            .order('timestamp', { ascending: false });
        if (!data)
            return [];
        return data.map((row) => ({
            id: row.id,
            tableNumber: row.table_number,
            guestName: row.guest_name,
            guestId: row.guest_id || '',
            sessionId: row.session_id || '',
            items: row.items,
            total: row.total,
            status: row.status,
            paymentStatus: row.payment_status,
            note: row.note || undefined,
            timestamp: new Date(row.timestamp),
            refundAmount: row.refund_amount || undefined,
            refundReason: row.refund_reason || undefined
        }));
    }
    async getOrderById(orderId) {
        if (!this.useSupabase || !this.supabase)
            return null;
        const { data } = await this.supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
        if (!data)
            return null;
        const row = data;
        return {
            id: row.id,
            tableNumber: row.table_number,
            guestName: row.guest_name,
            guestId: row.guest_id || '',
            sessionId: row.session_id || '',
            items: row.items,
            total: row.total,
            status: row.status,
            paymentStatus: row.payment_status,
            note: row.note || undefined,
            timestamp: new Date(row.timestamp),
            refundAmount: row.refund_amount || undefined,
            refundReason: row.refund_reason || undefined
        };
    }
    async updateOrderStatus(orderId, status) {
        if (!this.useSupabase || !this.supabase)
            return;
        await this.supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);
    }
    async updateOrderPaymentStatus(orderId, paymentStatus) {
        if (!this.useSupabase || !this.supabase)
            return;
        await this.supabase
            .from('orders')
            .update({ payment_status: paymentStatus })
            .eq('id', orderId);
    }
    // ACCESS REQUEST OPERATIONS
    async saveAccessRequest(request) {
        if (!this.useSupabase || !this.supabase)
            return;
        const dbRequest = {
            id: request.id,
            table_number: request.tableNumber,
            guest_name: request.guestName,
            type: request.type,
            status: request.status,
            timestamp: new Date(request.timestamp).toISOString()
        };
        await this.supabase.from('access_requests').upsert(dbRequest);
    }
    async getAccessRequests() {
        if (!this.useSupabase || !this.supabase)
            return [];
        const { data } = await this.supabase
            .from('access_requests')
            .select('*')
            .order('timestamp', { ascending: false });
        if (!data)
            return [];
        return data.map((row) => ({
            id: row.id,
            tableNumber: row.table_number,
            guestName: row.guest_name,
            type: row.type,
            status: row.status,
            timestamp: new Date(row.timestamp)
        }));
    }
    // CHAT MESSAGE OPERATIONS
    async saveMessage(message) {
        if (!this.useSupabase || !this.supabase)
            return;
        const dbMessage = {
            id: message.id,
            table_number: message.tableNumber,
            sender: message.sender,
            sender_name: message.senderName,
            text: message.text,
            timestamp: new Date(message.timestamp).toISOString()
        };
        await this.supabase.from('messages').upsert(dbMessage);
    }
    async getMessages(tableNumber) {
        if (!this.useSupabase || !this.supabase)
            return [];
        let query = this.supabase
            .from('messages')
            .select('*')
            .order('timestamp', { ascending: true });
        if (tableNumber) {
            query = query.eq('table_number', tableNumber);
        }
        const { data } = await query;
        if (!data)
            return [];
        return data.map((row) => ({
            id: row.id,
            tableNumber: row.table_number,
            sender: row.sender,
            senderName: row.sender_name,
            text: row.text,
            timestamp: new Date(row.timestamp)
        }));
    }
    // TABLE SESSION OPERATIONS
    async saveTableSession(session) {
        if (!this.useSupabase || !this.supabase)
            return;
        const dbSession = {
            id: session.id,
            table_number: session.tableNumber,
            start_time: new Date(session.startTime).toISOString(),
            end_time: session.endTime ? new Date(session.endTime).toISOString() : null,
            is_active: session.isActive,
            total_orders: session.totalOrders,
            total_spent: session.totalSpent
        };
        await this.supabase.from('table_sessions').upsert(dbSession);
    }
    async getActiveSessions() {
        if (!this.useSupabase || !this.supabase)
            return [];
        const { data } = await this.supabase
            .from('table_sessions')
            .select('*')
            .eq('is_active', true);
        if (!data)
            return [];
        return data.map((row) => ({
            id: row.id,
            tableNumber: row.table_number,
            startTime: new Date(row.start_time),
            endTime: row.end_time ? new Date(row.end_time) : undefined,
            isActive: row.is_active,
            guests: [],
            totalOrders: row.total_orders,
            totalSpent: row.total_spent
        }));
    }
    // REFUND REQUEST OPERATIONS
    async saveRefundRequest(request) {
        if (!this.useSupabase || !this.supabase)
            return;
        const dbRequest = {
            id: request.id,
            order_id: request.orderId,
            table_number: request.tableNumber,
            guest_name: request.guestName,
            item_ids: request.itemIds,
            reason: request.reason,
            status: request.status,
            timestamp: new Date(request.timestamp).toISOString(),
            amount: request.amount
        };
        await this.supabase.from('refund_requests').upsert(dbRequest);
    }
    async getRefundRequests() {
        if (!this.useSupabase || !this.supabase)
            return [];
        const { data } = await this.supabase
            .from('refund_requests')
            .select('*')
            .order('timestamp', { ascending: false });
        if (!data)
            return [];
        return data.map((row) => ({
            id: row.id,
            orderId: row.order_id,
            tableNumber: row.table_number,
            guestName: row.guest_name,
            itemIds: row.item_ids,
            reason: row.reason,
            status: row.status,
            timestamp: new Date(row.timestamp),
            amount: row.amount
        }));
    }
    // AUTO-DELETE: Remove data older than specified hours (configurable)
    async cleanupOldData(retentionHours = 24) {
        if (!this.useSupabase || !this.supabase) {
            return { deletedOrders: 0, deletedMessages: 0, deletedRequests: 0 };
        }
        const cutoffTime = new Date(Date.now() - retentionHours * 60 * 60 * 1000).toISOString();
        // Delete old orders (keep completed orders for the retention period)
        const { count: orderCount } = await this.supabase
            .from('orders')
            .delete({ count: 'exact' })
            .lt('timestamp', cutoffTime)
            .eq('status', 'delivered');
        // Delete old messages
        const { count: messageCount } = await this.supabase
            .from('messages')
            .delete({ count: 'exact' })
            .lt('timestamp', cutoffTime);
        // Delete old access requests
        const { count: requestCount } = await this.supabase
            .from('access_requests')
            .delete({ count: 'exact' })
            .lt('timestamp', cutoffTime);
        // Delete old refund requests (keep approved/denied for retention period)
        await this.supabase
            .from('refund_requests')
            .delete()
            .lt('timestamp', cutoffTime);
        // Delete old inactive sessions
        await this.supabase
            .from('table_sessions')
            .delete()
            .eq('is_active', false)
            .lt('start_time', cutoffTime);
        console.log(`🧹 Cleanup: Deleted ${orderCount || 0} orders, ${messageCount || 0} messages, ${requestCount || 0} requests (Retention: ${retentionHours}h)`);
        return {
            deletedOrders: orderCount || 0,
            deletedMessages: messageCount || 0,
            deletedRequests: requestCount || 0
        };
    }
    // BACKUP: Export all data for backup
    async exportBackup() {
        if (!this.useSupabase || !this.supabase) {
            return {
                orders: [],
                accessRequests: [],
                messages: [],
                sessions: [],
                refundRequests: [],
                exportedAt: new Date().toISOString()
            };
        }
        const orders = await this.getOrders();
        const accessRequests = await this.getAccessRequests();
        const messages = await this.getMessages();
        const sessions = await this.getActiveSessions();
        const refundRequests = await this.getRefundRequests();
        console.log(`📦 Backup exported: ${orders.length} orders, ${accessRequests.length} requests, ${messages.length} messages`);
        return {
            orders,
            accessRequests,
            messages,
            sessions,
            refundRequests,
            exportedAt: new Date().toISOString()
        };
    }
    // STORAGE STATS: Get database storage information
    async getStorageStats() {
        if (!this.useSupabase || !this.supabase) {
            return {
                ordersCount: 0,
                messagesCount: 0,
                requestsCount: 0,
                sessionsCount: 0,
                oldestRecord: null,
                estimatedSizeKB: 0
            };
        }
        const { count: ordersCount } = await this.supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });
        const { count: messagesCount } = await this.supabase
            .from('messages')
            .select('*', { count: 'exact', head: true });
        const { count: requestsCount } = await this.supabase
            .from('access_requests')
            .select('*', { count: 'exact', head: true });
        const { count: sessionsCount } = await this.supabase
            .from('table_sessions')
            .select('*', { count: 'exact', head: true });
        // Get oldest record
        const { data: oldestOrder } = await this.supabase
            .from('orders')
            .select('timestamp')
            .order('timestamp', { ascending: true })
            .limit(1)
            .single();
        // Rough estimate: ~2KB per order, ~500 bytes per message, ~300 bytes per request
        const estimatedSizeKB = Math.round((ordersCount || 0) * 2 +
            (messagesCount || 0) * 0.5 +
            (requestsCount || 0) * 0.3 +
            (sessionsCount || 0) * 0.5);
        return {
            ordersCount: ordersCount || 0,
            messagesCount: messagesCount || 0,
            requestsCount: requestsCount || 0,
            sessionsCount: sessionsCount || 0,
            oldestRecord: oldestOrder?.timestamp || null,
            estimatedSizeKB
        };
    }
    // Load initial data from Supabase into memory
    async loadAllData() {
        const orders = new Map();
        const accessRequests = new Map();
        const messages = new Map();
        const activeTables = new Map();
        const refundRequests = new Map();
        if (!this.useSupabase || !this.supabase) {
            return { orders, accessRequests, messages, activeTables, refundRequests };
        }
        // Load orders
        const ordersData = await this.getOrders();
        ordersData.forEach(order => orders.set(order.id, order));
        // Load access requests
        const accessData = await this.getAccessRequests();
        accessData.forEach(req => accessRequests.set(req.id, req));
        // Load messages grouped by table
        const messagesData = await this.getMessages();
        messagesData.forEach(msg => {
            const key = `table-${msg.tableNumber}`;
            const tableMessages = messages.get(key) || [];
            tableMessages.push(msg);
            messages.set(key, tableMessages);
        });
        // Load active sessions
        const sessionsData = await this.getActiveSessions();
        sessionsData.forEach(session => activeTables.set(session.tableNumber, session));
        // Load refund requests
        const refundData = await this.getRefundRequests();
        refundData.forEach(req => refundRequests.set(req.id, req));
        console.log(`📊 Loaded from Supabase: ${orders.size} orders, ${accessRequests.size} requests, ${messagesData.length} messages`);
        return { orders, accessRequests, messages, activeTables, refundRequests };
    }
}
// Export singleton instance
exports.db = new Database();
//# sourceMappingURL=database.js.map