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
  items: CartItem[];
  note?: string;
  status: OrderStatus;
  timestamp: Date;
  total: number;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'delivering' 
  | 'delivered';

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
}
