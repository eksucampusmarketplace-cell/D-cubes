import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Order, AccessRequest, ChatMessage, OrderStatus, PaymentStatus, RefundRequest } from '@/types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  checkIn: (tableNumber: number, guestName: string) => void;
  sendOrder: (order: Order) => void;
  sendAccessRequest: (request: AccessRequest) => void;
  sendMessage: (message: ChatMessage) => void;
  sendStaffReply: (tableNumber: number, text: string, senderName: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  respondToAccess: (requestId: string, granted: boolean) => void;
  joinTable: (tableNumber: number) => void;
  joinStaff: (role: 'manager' | 'kitchen' | 'bar') => void;
  updatePayment: (orderId: string, status: PaymentStatus) => void;
  requestRefund: (request: RefundRequest) => void;
  processRefund: (requestId: string, approved: boolean) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  endSession: (tableNumber: number, finalBill: number) => void;
  getTableMessages: (tableNumber: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : window.location.origin);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
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

  const sendStaffReply = useCallback((tableNumber: number, text: string, senderName: string) => {
    socket?.emit('staff-reply', { tableNumber, text, senderName });
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

  const getTableMessages = useCallback((tableNumber: number) => {
    socket?.emit('get-messages', { tableNumber });
  }, [socket]);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      checkIn,
      sendOrder,
      sendAccessRequest,
      sendMessage,
      sendStaffReply,
      updateOrderStatus,
      respondToAccess,
      joinTable,
      joinStaff,
      updatePayment,
      requestRefund,
      processRefund,
      cancelOrder,
      endSession,
      getTableMessages
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