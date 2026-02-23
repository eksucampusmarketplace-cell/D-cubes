export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'cocktails' | 'spirits' | 'wine' | 'food' | 'shisha' | 'nonalc';
  tags: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  tableNumber: number;
  guestName: string;
  guestId: string;
  sessionId: string;
  items: CartItem[];
  note?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  timestamp: Date;
  total: number;
  refundAmount?: number;
  refundReason?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded';

export interface AccessRequest {
  id: string;
  tableNumber: number;
  guestName: string;
  type: AccessType;
  status: 'pending' | 'granted' | 'denied';
  timestamp: Date;
}

export type AccessType = 
  | 'pool-spa' 
  | 'lounge-entry' 
  | 'vip-dance' 
  | 'call-waiter' 
  | 'extra-ice' 
  | 'bill-request';

export interface ChatMessage {
  id: string;
  tableNumber: number;
  sender: 'guest' | 'staff';
  text: string;
  timestamp: Date;
  senderName: string;
}

export interface Table {
  number: number;
  isActive: boolean;
  hasPendingOrder: boolean;
  hasUnreadMessage: boolean;
  guestName?: string;
  currentOrder?: Order;
  currentSession?: TableSession;
}

export interface TableSession {
  id: string;
  tableNumber: number;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  guests: TableGuest[];
  totalOrders: number;
  totalSpent: number;
}

export interface TableGuest {
  id: string;
  guestName: string;
  socketId: string;
  checkInTime: Date;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  tableNumber: number;
  guestName: string;
  itemIds: number[];
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  timestamp: Date;
  amount: number;
}

export interface AnalyticsData {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  topSellingItems: { name: string; quantity: number; revenue: number }[];
  categoryBreakdown: { category: string; count: number; revenue: number }[];
  hourlySales: { hour: number; orders: number; revenue: number }[];
  tablePerformance: { tableNumber: number; orders: number; revenue: number }[];
  popularItemsByCategory: Record<string, { name: string; quantity: number }[]>;
}
