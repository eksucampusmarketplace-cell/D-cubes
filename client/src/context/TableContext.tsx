import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Order, ChatMessage, OrderStatus, Location, ZoneType, CustomerSession } from '@/types';
import { useSocket } from './SocketContext';
import { getLocationById, getLocationByNumber, getZoneInfo } from '@/data/locations';

const SESSION_KEY = 'customer_session';

interface PersistedSession {
  isCheckedIn: boolean;
  isExploring: boolean;
  zone: ZoneType | null;
  guestName: string;
  locationId: string | null;
  tableNumber: number | null;
}

function loadPersistedSession(): PersistedSession | null {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function savePersistedSession(session: PersistedSession) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors
  }
}

function clearPersistedSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
}

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
  
  // Exploring mode - zone selected but no table
  isExploring: boolean;
  setExploreZone: (zone: ZoneType) => void;
  setLocationFromZone: (zone: ZoneType, tableInput: string) => void;
  
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
  // Load persisted session on initial mount
  const persistedSession = React.useMemo(() => loadPersistedSession(), []);
  
  // Legacy support
  const [tableNumber, setTableNumber] = useState<number | null>(
    persistedSession?.tableNumber ?? null
  );
  
  // New location system
  const [location, setLocation] = useState<Location | null>(null);
  const [locationId, setLocationId] = useState<string | null>(
    persistedSession?.locationId ?? null
  );
  const [zone, setZone] = useState<ZoneType | null>(
    persistedSession?.zone ?? null
  );
  
  // Exploring mode - user selected zone but no specific table
  const [isExploring, setIsExploring] = useState(
    persistedSession?.isExploring ?? false
  );
  
  // Guest session
  const [guestName, setGuestName] = useState(
    persistedSession?.guestName ?? ''
  );
  const [guestId, setGuestId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(
    persistedSession?.isCheckedIn ?? false
  );
  
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

  // Restore location from persisted session on mount
  useEffect(() => {
    if (persistedSession?.locationId && !location) {
      const loc = getLocationById(persistedSession.locationId);
      if (loc) {
        setLocation(loc);
      }
    }
  }, [persistedSession, location]);

  // Persist session state when it changes
  useEffect(() => {
    if (isCheckedIn) {
      savePersistedSession({
        isCheckedIn,
        isExploring,
        zone,
        guestName,
        locationId,
        tableNumber
      });
    }
  }, [isCheckedIn, isExploring, zone, guestName, locationId, tableNumber]);

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

  // Set zone for exploring mode (no table selected)
  const setExploreZone = useCallback((selectedZone: ZoneType) => {
    setZone(selectedZone);
    setIsExploring(true);
    setIsCheckedIn(true);
    setGuestName('Explorer');
  }, []);

  // Set location from zone and table input
  const setLocationFromZone = useCallback((selectedZone: ZoneType, tableInput: string) => {
    setZone(selectedZone);
    setIsExploring(false);
    
    // Try to parse the table input
    const input = tableInput.trim().toUpperCase();
    
    // Check if it matches a known location ID pattern
    const knownLocation = getLocationById(input);
    if (knownLocation) {
      setLocation(knownLocation);
      setLocationId(knownLocation.id);
      setTableNumber(typeof knownLocation.number === 'number' ? knownLocation.number : null);
      return;
    }
    
    // Try to extract a number from the input
    const numMatch = input.match(/\d+/);
    if (numMatch) {
      const num = parseInt(numMatch[0], 10);
      setTableNumber(num);
      
      // Create a location ID based on zone and number
      let prefix = 'T-';
      let locType: 'table' | 'bar-stool' | 'lounge-seat' | 'standing-table' | 'poolside-cabana' = 'table';
      
      if (selectedZone === 'open-bar') {
        if (input.includes('BAR')) {
          prefix = 'BAR-';
          locType = 'bar-stool';
        } else if (input.includes('ST')) {
          prefix = 'ST-';
          locType = 'standing-table';
        }
      } else if (selectedZone === 'poolside') {
        prefix = 'PC-';
        locType = 'poolside-cabana';
      } else if (selectedZone === 'nightclub') {
        prefix = 'NF-';
      } else if (selectedZone === 'lounge') {
        if (input.includes('LS')) {
          prefix = 'LS-';
          locType = 'lounge-seat';
        }
      }
      
      const newLocationId = `${prefix}${String(num).padStart(prefix === 'T-' ? 3 : 2, '0')}`;
      setLocationId(newLocationId);
      
      // Create a basic location object
      setLocation({
        id: newLocationId,
        number: num,
        name: `${selectedZone === 'open-bar' ? (locType === 'bar-stool' ? 'Bar Stool' : 'Standing Table') : 
               selectedZone === 'poolside' ? 'Poolside Cabana' :
               selectedZone === 'nightclub' ? 'Nightclub Floor' :
               locType === 'lounge-seat' ? 'Lounge Sofa' : 'Table'} ${num}`,
        type: locType,
        zone: selectedZone,
        availableMenus: ['full'],
        canReceiveFood: true,
        isActive: true
      });
    }
  }, []);

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
      
      // Exploring mode
      isExploring,
      setExploreZone,
      setLocationFromZone,
      
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
