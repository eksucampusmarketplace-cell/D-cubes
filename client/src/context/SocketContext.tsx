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
  checkIn: (tableNumber: number, guestName: string) => void;
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
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (() => {
      const { protocol, hostname, port, origin } = window.location;
      const isDevPort = port === '3000' || port === '5173';
      if (hostname === 'localhost' || isDevPort) {
        return `${protocol}//${hostname}:5000`;
      }
      return origin;
    })();

    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
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

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const checkIn = useCallback((tableNumber: number, guestName: string) => {
    socket?.emit('check-in', { tableNumber, guestName });
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

  const joinStaff = useCallback((role: 'manager' | 'kitchen' | 'bar') => {
    socket?.emit('join-staff', role);
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

  const endSession = useCallback((tableNumber: number, finalBill: number) => {
    socket?.emit('end-session', { tableNumber, finalBill });
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
