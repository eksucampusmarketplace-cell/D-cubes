export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'cocktails' | 'spirits' | 'wine' | 'food' | 'shisha' | 'nonalc' | 'soft-drinks' | 'energy-drinks' | 'brandy' | 'liquor' | 'tequila' | 'sparkling-wine' | 'beer' | 'cigar';
  tags: string[];
  image?: string;
  isPopular?: boolean;
  isNew?: boolean;
  isSignature?: boolean;
  /** Which zones this item is available in. Empty = all zones */
  availableIn?: ZoneType[];
  /** Whether this item requires food service capability */
  requiresFoodService?: boolean;
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

// === ZONE & LOCATION TYPES ===

/** Types of service zones in the venue */
export type ZoneType = 'open-bar' | 'lounge' | 'nightclub' | 'vip' | 'poolside';

/** Types of physical locations where guests can be seated */
export type LocationType = 'table' | 'bar-stool' | 'lounge-seat' | 'vip-booth' | 'standing-table' | 'poolside-cabana';

/** Configuration for a specific location/spot in the venue */
export interface Location {
  /** Unique identifier (e.g., "T-001", "BAR-01", "VIP-A") */
  id: string;
  /** Display number or name */
  number: number | string;
  /** Human-readable name */
  name: string;
  /** Physical type of location */
  type: LocationType;
  /** Which service zone this location belongs to */
  zone: ZoneType;
  /** Which menus are available at this location */
  availableMenus: MenuType[];
  /** Whether food can be delivered to this location */
  canReceiveFood: boolean;
  /** Whether this location is currently active */
  isActive: boolean;
  /** Maximum capacity */
  capacity?: number;
  /** Special notes about this location */
  notes?: string;
}

/** Types of menus available */
export type MenuType = 'full' | 'drinks-only' | 'bar' | 'lounge' | 'nightclub' | 'food';

/** Zone configuration */
export interface ZoneConfig {
  id: ZoneType;
  name: string;
  description: string;
  icon: string;
  defaultMenus: MenuType[];
  allowFood: boolean;
  theme?: {
    primaryColor: string;
    accentColor: string;
  };
}

/** Customer session with location info */
export interface CustomerSession {
  locationId: string;
  locationName: string;
  zone: ZoneType;
  zoneName: string;
  canOrderFood: boolean;
  availableCategories: string[];
}
