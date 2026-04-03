import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Order, AccessRequest, ChatMessage, OrderStatus, PaymentStatus, RefundRequest, Receipt, TelegramNotificationConfig, InventoryUpdate } from '@/types';

interface InventoryStatus {
  [itemId: number]: {
    isAvailable: boolean;
    stockQuantity: number | null;
  };
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  inventoryStatus: InventoryStatus;
  telegramConfig: TelegramNotificationConfig | null;
  checkIn: (tableNumber: number, guestName: string, locationId?: string) => void;
  sendOrder: (order: Order) => void;
  sendAccessRequest: (request: AccessRequest) => void;
  sendMessage: (message: ChatMessage) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  respondToAccess: (requestId: string, granted: boolean) => void;
  joinTable: (tableNumber: number) => void;
  joinStaff: (role: 'manager' | 'kitchen' | 'bar') => void;
  updatePayment: (orderId: string, status: PaymentStatus) => void;
  requestRefund: (request: RefundRequest) => void;
  processRefund: (requestId: string, approved: boolean) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  endSession: (tableNumber: number, finalBill: number) => void;
  updateInventory: (update: InventoryUpdate) => void;
  generateReceipt: (orderId: string) => void;
  updateTelegramConfig: (config: Partial<TelegramNotificationConfig>) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus>({});
  const [telegramConfig, setTelegramConfig] = useState<TelegramNotificationConfig | null>(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://d-cubes.com.ng';

    // Configure socket with reconnection logic
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 20000,
      withCredentials: true
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      
      // Rejoin previous rooms if reconnecting
      const lastTable = sessionStorage.getItem('last_table');
      if (lastTable) {
        newSocket.emit('join-table', parseInt(lastTable, 10));
      }
      
      // Rejoin staff room if previously authenticated as staff
      const lastRole = sessionStorage.getItem('staff_role');
      if (lastRole === 'manager' || lastRole === 'kitchen' || lastRole === 'bar') {
        console.log(`Rejoining staff room: ${lastRole}`);
        newSocket.emit('join-staff', lastRole);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
    });

    // Reconnection events
    newSocket.io.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
    });

    newSocket.io.on('reconnect', (attempt) => {
      console.log(`Reconnected after ${attempt} attempts`);
      setIsConnected(true);
    });

    newSocket.io.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    newSocket.io.on('reconnect_failed', () => {
      console.error('Failed to reconnect after all attempts');
    });

    // Ping/pong for connection health
    newSocket.on('ping', () => {
      console.debug('Ping received from server');
    });

    // Listen for inventory updates
    newSocket.on('inventory-update', (status: InventoryStatus) => {
      setInventoryStatus(status);
    });

    // Listen for telegram config
    newSocket.on('telegram-config', (config: TelegramNotificationConfig) => {
      setTelegramConfig(config);
    });

    // Listen for receipt generated
    newSocket.on('receipt-generated', (receipt: Receipt) => {
      // Emit custom event for components to listen
      window.dispatchEvent(new CustomEvent('receipt-generated', { detail: receipt }));
    });

    // Listen for order errors
    newSocket.on('order-error', (error: { error: string; message: string }) => {
      window.dispatchEvent(new CustomEvent('order-error', { detail: error }));
    });

    // Listen for check-in errors
    newSocket.on('check-in-error', (error: { error: string; message: string }) => {
      window.dispatchEvent(new CustomEvent('check-in-error', { detail: error }));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const checkIn = useCallback((tableNumber: number, guestName: string, locationId?: string) => {
    socket?.emit('check-in', { tableNumber, guestName, locationId });
  }, [socket]);

  const sendOrder = useCallback((order: Order) => {
    socket?.emit('new-order', order);
  }, [socket]);

  const sendAccessRequest = useCallback((request: AccessRequest) => {
    socket?.emit('access-request', request);
  }, [socket]);

  const sendMessage = useCallback((message: ChatMessage) => {
    socket?.emit('chat-message', message);
  }, [socket]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    socket?.emit('update-order-status', { orderId, status });
  }, [socket]);

  const respondToAccess = useCallback((requestId: string, granted: boolean) => {
    socket?.emit('access-response', { requestId, granted });
  }, [socket]);

  const joinTable = useCallback((tableNumber: number) => {
    socket?.emit('join-table', tableNumber);
  }, [socket]);

  const joinStaff = useCallback(async (role: 'manager' | 'kitchen' | 'bar') => {
    // Fetch a short-lived socket token from verify endpoint (using our session cookie)
    try {
      const response = await fetch('/api/auth/verify');
      if (response.ok) {
        const data = await response.json();
        if (data.valid && data.token) {
          // Store staff role for reconnection handling
          sessionStorage.setItem('staff_role', role);
          socket?.emit('join-staff', { role, token: data.token });
        }
      }
    } catch (err) {
      console.error('Failed to get socket token:', err);
    }
  }, [socket]);

  const updatePayment = useCallback((orderId: string, status: PaymentStatus) => {
    socket?.emit('update-payment', { orderId, status });
  }, [socket]);

  const requestRefund = useCallback((request: RefundRequest) => {
    socket?.emit('request-refund', request);
  }, [socket]);

  const processRefund = useCallback((requestId: string, approved: boolean) => {
    socket?.emit('process-refund', { requestId, approved });
  }, [socket]);

  const cancelOrder = useCallback((orderId: string, reason?: string) => {
    socket?.emit('cancel-order', { orderId, reason });
  }, [socket]);

  const endSession = useCallback((tableNumber: number, finalBill: number, locationId?: string) => {
    socket?.emit('end-session', { tableNumber, finalBill, locationId });
  }, [socket]);

  const updateInventory = useCallback((update: InventoryUpdate) => {
    socket?.emit('update-inventory', update);
  }, [socket]);

  const generateReceipt = useCallback((orderId: string) => {
    socket?.emit('generate-receipt', { orderId });
  }, [socket]);

  const updateTelegramConfig = useCallback((config: Partial<TelegramNotificationConfig>) => {
    socket?.emit('update-telegram-config', config);
  }, [socket]);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      inventoryStatus,
      telegramConfig,
      checkIn,
      sendOrder,
      sendAccessRequest,
      sendMessage,
      updateOrderStatus,
      respondToAccess,
      joinTable,
      joinStaff,
      updatePayment,
      requestRefund,
      processRefund,
      cancelOrder,
      endSession,
      updateInventory,
      generateReceipt,
      updateTelegramConfig
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
