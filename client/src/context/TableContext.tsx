import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Order, ChatMessage, OrderStatus } from '@/types';
import { useSocket } from './SocketContext';

interface TableContextType {
  tableNumber: number | null;
  guestName: string;
  guestId: string;
  sessionId: string;
  isCheckedIn: boolean;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  checkIn: (name: string) => void;
  currentOrderStatus: OrderStatus | null;
  hasError: boolean;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestId, setGuestId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasError, setHasError] = useState(false);
  const { socket, checkIn: socketCheckIn, joinTable } = useSocket();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get('table');
    
    if (!tableParam) {
      setHasError(true);
      return;
    }

    const tableNum = parseInt(tableParam, 10);
    if (isNaN(tableNum) || tableNum < 1) {
      setHasError(true);
      return;
    }

    setTableNumber(tableNum);
  }, []);

  useEffect(() => {
    if (tableNumber && isCheckedIn) {
      joinTable(tableNumber);
    }
  }, [tableNumber, isCheckedIn, joinTable]);

  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      ));
    };

    const handleNewMessage = (message: ChatMessage) => {
      if (message.tableNumber === tableNumber) {
        setMessages(prev => [...prev, message]);
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
    if (!tableNumber || !name.trim()) return;
    
    setGuestName(name);
    setIsCheckedIn(true);
    socketCheckIn(tableNumber, name);
    
    // Add welcome message
    setMessages([{
      id: 'welcome',
      tableNumber,
      sender: 'staff',
      text: `Welcome to VELOUR, ${name}! 👋 How can we make your evening special?`,
      timestamp: new Date(),
      senderName: 'Staff'
    }]);
  }, [tableNumber, socketCheckIn]);

  const currentOrderStatus = orders.length > 0 ? orders[orders.length - 1].status : null;

  return (
    <TableContext.Provider value={{
      tableNumber,
      guestName,
      guestId,
      sessionId,
      isCheckedIn,
      orders,
      setOrders,
      messages,
      setMessages,
      checkIn,
      currentOrderStatus,
      hasError
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
