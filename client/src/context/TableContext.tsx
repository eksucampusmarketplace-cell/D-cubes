import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Order, ChatMessage, OrderStatus, Location, ZoneType, CustomerSession } from '@/types';
import { useSocket } from './SocketContext';
import { getLocationById, getLocationByNumber, getZoneInfo } from '@/data/locations';

interface TableContextType {
  // Legacy support
  tableNumber: number | null;
  
  // New location-based system
  location: Location | null;
  locationId: string | null;
  zone: ZoneType | null;
  zoneName: string;
  canOrderFood: boolean;
  availableCategories: string[];
  customerSession: CustomerSession | null;
  
  // Guest info
  guestName: string;
  guestId: string;
  sessionId: string;
  isCheckedIn: boolean;
  
  // Orders & messages
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  
  // Actions
  checkIn: (name: string) => void;
  currentOrderStatus: OrderStatus | null;
  
  // Helper
  isCategoryAvailable: (category: string) => boolean;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Legacy support
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  
  // New location system
  const [location, setLocation] = useState<Location | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [zone, setZone] = useState<ZoneType | null>(null);
  
  // Guest session
  const [guestName, setGuestName] = useState('');
  const [guestId, setGuestId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  
  // Orders & messages
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const { socket, checkIn: socketCheckIn, joinTable } = useSocket();

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const locationParam = params.get('location');
    const tableParam = params.get('table');
    const zoneParam = params.get('zone') as ZoneType | null;
    
    if (locationParam) {
      // New location-based QR
      const loc = getLocationById(locationParam);
      if (loc) {
        setLocation(loc);
        setLocationId(loc.id);
        setZone(loc.zone);
        setTableNumber(typeof loc.number === 'number' ? loc.number : null);
      }
    } else if (tableParam) {
      // Legacy table-based QR - convert to lounge table
      const tableNum = parseInt(tableParam, 10);
      if (!isNaN(tableNum) && tableNum >= 1) {
        setTableNumber(tableNum);
        // Try to find matching location or create default
        const loc = getLocationByNumber(tableNum);
        if (loc) {
          setLocation(loc);
          setLocationId(loc.id);
          setZone(loc.zone);
        } else {
          // Create default lounge location for legacy tables
          setLocationId(`T-${String(tableNum).padStart(3, '0')}`);
          setZone('lounge');
        }
      }
    }
    
    // Zone can be overridden via URL
    if (zoneParam && ['open-bar', 'lounge', 'nightclub', 'vip', 'poolside'].includes(zoneParam)) {
      setZone(zoneParam);
    }
  }, []);

  // Join table room when checked in
  useEffect(() => {
    if (tableNumber && isCheckedIn) {
      joinTable(tableNumber);
    }
  }, [tableNumber, isCheckedIn, joinTable]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      ));
    };

    const handleNewMessage = (message: ChatMessage) => {
      const currentTable = tableNumber;
      if (message.tableNumber === currentTable) {
        setMessages(prev => prev.some(existing => existing.id === message.id) ? prev : [...prev, message]);
      }
    };

    const handleCheckInSuccess = (data: { tableNumber: number; guestName: string; guestId: string; sessionId: string }) => {
      setGuestId(data.guestId);
      setSessionId(data.sessionId);
    };

    socket.on('order-status-update', handleOrderUpdate);
    socket.on('new-message', handleNewMessage);
    socket.on('check-in-success', handleCheckInSuccess);

    return () => {
      socket.off('order-status-update', handleOrderUpdate);
      socket.off('new-message', handleNewMessage);
      socket.off('check-in-success', handleCheckInSuccess);
    };
  }, [socket, tableNumber]);

  const checkIn = useCallback((name: string) => {
    const targetTable = tableNumber || 1;
    
    if (!targetTable || !name.trim()) return;
    
    setGuestName(name);
    setIsCheckedIn(true);
    socketCheckIn(targetTable, name);
    
    // Add welcome message with zone info
    const zoneDisplayName = zone ? getZoneInfo(zone).name : 'D CUBES PLACE';
    setMessages([{
      id: 'welcome',
      tableNumber: targetTable,
      sender: 'staff',
      text: `Welcome to ${zoneDisplayName}, ${name}! 👋 How can we make your visit special?`,
      timestamp: new Date(),
      senderName: 'Staff'
    }]);
  }, [tableNumber, zone, socketCheckIn]);

  // Determine available categories based on zone
  const availableCategories = React.useMemo(() => {
    if (!zone) return [];
    
    const zoneCategoryMap: Record<ZoneType, string[]> = {
      'open-bar': ['brandy', 'spirits', 'tequila', 'liquor', 'mixers', 'energy-drinks', 'wine', 'sparkling-wine', 'shisha', 'food'],
      'lounge': ['brandy', 'spirits', 'tequila', 'liquor', 'mixers', 'energy-drinks', 'wine', 'sparkling-wine', 'shisha', 'food'],
      'nightclub': ['brandy', 'spirits', 'tequila', 'liquor', 'mixers', 'energy-drinks', 'wine', 'sparkling-wine', 'shisha', 'food'],
      'poolside': ['brandy', 'spirits', 'tequila', 'liquor', 'mixers', 'energy-drinks', 'wine', 'sparkling-wine', 'shisha', 'food']
    };
    
    return zoneCategoryMap[zone] || zoneCategoryMap['lounge'];
  }, [zone]);

  // Check if a category is available
  const isCategoryAvailable = useCallback((category: string) => {
    return availableCategories.includes(category);
  }, [availableCategories]);

  // Can order food - now enabled for all zones
  const canOrderFood = React.useMemo(() => {
    return true;
  }, []);

  // Zone display name
  const zoneName = React.useMemo(() => {
    if (!zone) return 'D CUBES PLACE';
    return getZoneInfo(zone).name;
  }, [zone]);

  // Build customer session object
  const customerSession: CustomerSession | null = React.useMemo(() => {
    if (!location && !locationId) return null;
    
    return {
      locationId: locationId || location?.id || 'unknown',
      locationName: location?.name || `Table ${tableNumber}`,
      zone: zone || 'lounge',
      zoneName: zoneName,
      canOrderFood: canOrderFood,
      availableCategories: availableCategories
    };
  }, [location, locationId, zone, zoneName, canOrderFood, availableCategories, tableNumber]);

  const currentOrderStatus = orders.length > 0 ? orders[orders.length - 1].status : null;

  return (
    <TableContext.Provider value={{
      // Legacy
      tableNumber,
      
      // New location system
      location,
      locationId,
      zone,
      zoneName,
      canOrderFood,
      availableCategories,
      customerSession,
      
      // Guest info
      guestName,
      guestId,
      sessionId,
      isCheckedIn,
      
      // Orders & messages
      orders,
      setOrders,
      messages,
      setMessages,
      
      // Actions
      checkIn,
      currentOrderStatus,
      
      // Helper
      isCategoryAvailable
    }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
};
