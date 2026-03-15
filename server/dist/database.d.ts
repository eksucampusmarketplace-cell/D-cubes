import { Order, AccessRequest, ChatMessage, TableSession, RefundRequest } from './types';
export interface DbOrder {
    id: string;
    table_number: number;
    guest_name: string;
    guest_id: string;
    session_id: string;
    items: any[];
    total: number;
    status: string;
    payment_status: string;
    note: string | null;
    timestamp: string;
    refund_amount: number | null;
    refund_reason: string | null;
}
export interface DbAccessRequest {
    id: string;
    table_number: number;
    guest_name: string;
    type: string;
    status: string;
    timestamp: string;
}
export interface DbChatMessage {
    id: string;
    table_number: number;
    sender: string;
    sender_name: string;
    text: string;
    timestamp: string;
}
export interface DbTableSession {
    id: string;
    table_number: number;
    start_time: string;
    end_time: string | null;
    is_active: boolean;
    total_orders: number;
    total_spent: number;
}
export interface DbRefundRequest {
    id: string;
    order_id: string;
    table_number: number;
    guest_name: string;
    item_ids: number[];
    reason: string;
    status: string;
    timestamp: string;
    amount: number;
}
declare class Database {
    private supabase;
    private useSupabase;
    private connectionRetries;
    private maxRetries;
    initialize(): void;
    private withRetry;
    isConnected(): boolean;
    saveOrder(order: Order): Promise<void>;
    getOrders(): Promise<Order[]>;
    getOrderById(orderId: string): Promise<Order | null>;
    updateOrderStatus(orderId: string, status: string): Promise<void>;
    updateOrderPaymentStatus(orderId: string, paymentStatus: string): Promise<void>;
    saveAccessRequest(request: AccessRequest): Promise<void>;
    getAccessRequests(): Promise<AccessRequest[]>;
    saveMessage(message: ChatMessage): Promise<void>;
    getMessages(tableNumber?: number): Promise<ChatMessage[]>;
    saveTableSession(session: TableSession): Promise<void>;
    getActiveSessions(): Promise<TableSession[]>;
    saveRefundRequest(request: RefundRequest): Promise<void>;
    getRefundRequests(): Promise<RefundRequest[]>;
    cleanupOldData(retentionHours?: number): Promise<{
        deletedOrders: number;
        deletedMessages: number;
        deletedRequests: number;
    }>;
    exportBackup(): Promise<{
        orders: Order[];
        accessRequests: AccessRequest[];
        messages: ChatMessage[];
        sessions: TableSession[];
        refundRequests: RefundRequest[];
        exportedAt: string;
    }>;
    getStorageStats(): Promise<{
        ordersCount: number;
        messagesCount: number;
        requestsCount: number;
        sessionsCount: number;
        oldestRecord: string | null;
        estimatedSizeKB: number;
    }>;
    loadAllData(): Promise<{
        orders: Map<string, Order>;
        accessRequests: Map<string, AccessRequest>;
        messages: Map<string, ChatMessage[]>;
        activeTables: Map<number, TableSession>;
        refundRequests: Map<string, RefundRequest>;
    }>;
}
export declare const db: Database;
export {};
//# sourceMappingURL=database.d.ts.map