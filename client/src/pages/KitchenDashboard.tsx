import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Order, ChatMessage, OrderStatus, Table } from '@/types';
import { formatPrice, formatTime, getStatusLabel } from '@/utils/format';

export const KitchenDashboard: React.FC = () => {
  const { socket, joinStaff, updateOrderStatus, sendStaffReply } = useSocket();
  const [foodOrders, setFoodOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tables, setTables] = useState<Table[]>(
    Array.from({ length: 50 }, (_, i) => ({
      number: i + 1,
      isActive: false,
      hasPendingOrder: false,
      hasUnreadMessage: false
    }))
  );
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    joinStaff('kitchen');
  }, [joinStaff]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-order', (order: Order) => {
      // Only add food items
      const foodItems = order.items.filter(item => item.category === 'food');
      if (foodItems.length > 0) {
        const foodOrder = { ...order, items: foodItems };
        setFoodOrders(prev => [foodOrder, ...prev]);
      }
      // Mark table as having pending order
      if (order.status === 'pending') {
        setTables(prev => prev.map(t => 
          t.number === order.tableNumber ? { ...t, hasPendingOrder: true } : t
        ));
      }
    });

    socket.on('order-status-update', ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      setFoodOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    });

    socket.on('new-message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      if (message.sender === 'guest') {
        setTables(prev => prev.map(t => 
          t.number === message.tableNumber ? { ...t, hasUnreadMessage: true } : t
        ));
      }
    });

    socket.on('check-in', (data: { tableNumber: number; guestName: string }) => {
      setTables(prev => prev.map(t => 
        t.number === data.tableNumber ? { ...t, isActive: true, guestName: data.guestName } : t
      ));
    });

    socket.on('table-inactive', (tableNumber: number) => {
      setTables(prev => prev.map(t => 
        t.number === tableNumber ? { ...t, isActive: false, hasPendingOrder: false } : t
      ));
    });

    return () => {
      socket.off('new-order');
      socket.off('order-status-update');
      socket.off('new-message');
      socket.off('check-in');
      socket.off('table-inactive');
    };
  }, [socket]);

  useEffect(() => {
    if (selectedTable) {
      setTables(prev => prev.map(t => 
        t.number === selectedTable ? { ...t, hasUnreadMessage: false } : t
      ));
    }
  }, [selectedTable]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedTable]);

  const handleMarkPreparing = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing');
  };

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
  };

  const handleSendMessage = useCallback(() => {
    if (!chatInput.trim() || !selectedTable) return;
    
    sendStaffReply(selectedTable, chatInput.trim(), 'Kitchen Staff');
    setChatInput('');
  }, [chatInput, selectedTable, sendStaffReply]);

  const handleChatKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const selectedTableMessages = messages.filter(m => m.tableNumber === selectedTable);
  const selectedTableData = tables.find(t => t.number === selectedTable);

  const activeTablesWithMessages = tables.filter(t => t.isActive || t.hasUnreadMessage);

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar - Tables with messages */}
      <div className="w-64 bg-dark-2 border-r border-gold/10 flex-shrink-0 flex flex-col sticky top-0 h-screen">
        <div className="p-4 border-b border-white/5">
          <h1 className="font-display text-lg tracking-[0.2em] text-gold">D CUBES PLACE</h1>
          <p className="text-[10px] tracking-[0.15em] uppercase text-cream/30 mt-1">Kitchen Staff</p>
        </div>
        
        {/* Active Tables */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="text-[10px] tracking-[0.2em] uppercase text-cream/25 mb-3">💬 Active Chats</p>
          {activeTablesWithMessages.length === 0 ? (
            <p className="text-xs text-cream/30 text-center py-4">No active tables</p>
          ) : (
            <div className="space-y-1">
              {activeTablesWithMessages.map(table => (
                <button
                  key={table.number}
                  type="button"
                  onClick={() => setSelectedTable(table.number)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
                    ${selectedTable === table.number 
                      ? 'bg-gold/10 border border-gold/30' 
                      : 'hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-dark-3 flex items-center justify-center text-sm font-display text-gold">
                    {table.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-cream truncate">{table.guestName || 'Guest'}</p>
                    <p className="text-[10px] text-cream/40">Table {table.number}</p>
                  </div>
                  {table.hasUnreadMessage && (
                    <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-dark-3 rounded-lg p-3">
            <p className="text-[10px] tracking-[0.15em] uppercase text-cream/40 mb-1">Pending Orders</p>
            <p className="font-display text-2xl text-gold">
              {foodOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-dark/95 backdrop-blur border-b border-gold/20 px-8 py-4 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="font-serif text-2xl text-white">Kitchen Display</h2>
                <p className="text-xs text-cream/35 mt-1">Food Orders Only</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 border border-green-500/25 rounded-full text-sm text-green-500">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Connection
              </div>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {foodOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-cream/30">
              <span className="text-6xl mb-4">👨‍🍳</span>
              <p className="font-serif text-2xl mb-2">No Food Orders</p>
              <p className="text-sm">New orders will appear here automatically</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {foodOrders.map(order => (
                <div 
                  key={order.id}
                  className={`p-6 rounded-lg border-2 transition-all
                    ${order.status === 'pending' || order.status === 'confirmed'
                      ? 'bg-dark-2 border-gold/50 animate-pulse'
                      : order.status === 'preparing'
                      ? 'bg-orange-500/5 border-orange-500/30'
                      : 'bg-green-500/5 border-green-500/30'
                    }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-display text-5xl text-gold leading-none">{order.tableNumber}</p>
                      <p className="text-xs tracking-[0.15em] uppercase text-cream/40 mt-1">Table</p>
                    </div>
                    <span className={`text-xs tracking-[0.1em] uppercase px-3 py-1.5 rounded-full border
                      ${order.status === 'pending' || order.status === 'confirmed'
                        ? 'bg-red-500/15 text-red-500 border-red-500/30'
                        : order.status === 'preparing'
                        ? 'bg-orange-500/15 text-orange-500 border-orange-500/30'
                        : 'bg-green-500/15 text-green-500 border-green-500/30'
                      }`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  {/* Guest */}
                  <p className="text-lg text-white mb-1">👤 {order.guestName}</p>
                  <p className="text-xs text-cream/35 mb-4">{formatTime(order.timestamp)}</p>

                  {/* Items - Large and readable */}
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-baseline justify-between">
                        <p className="text-xl text-cream">
                          <span className="text-gold font-display text-2xl mr-2">{item.quantity}×</span>
                          {item.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Note */}
                  {order.note && (
                    <div className="bg-dark-3 border-l-4 border-gold p-3 mb-4">
                      <p className="text-xs text-cream/50 uppercase tracking-wide mb-1">Special Request</p>
                      <p className="text-base text-gold">{order.note}</p>
                    </div>
                  )}

                  {/* Total */}
                  <p className="font-display text-3xl text-gold mb-4">
                    {formatPrice(order.items.reduce((sum, i) => sum + i.price * i.quantity, 0))}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button
                        onClick={() => handleMarkPreparing(order.id)}
                        className="flex-1 bg-orange-500 text-white py-3 rounded text-sm font-medium
                                   hover:bg-orange-600 transition-colors"
                      >
                        Start Cooking
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => handleMarkReady(order.id)}
                        className="flex-1 bg-green-500 text-white py-3 rounded text-sm font-medium
                                   hover:bg-green-600 transition-colors"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <div className="flex-1 bg-green-500/20 text-green-500 py-3 rounded text-sm font-medium text-center border border-green-500/30">
                        ✓ Ready for Pickup
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedTable(order.tableNumber)}
                      className="px-4 py-3 rounded text-sm font-medium bg-dark-3 border border-gold/20 text-gold
                                 hover:bg-gold/10 transition-colors"
                    >
                      💬
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {selectedTable && (
        <div className="w-80 bg-dark-2 border-l border-gold/10 flex flex-col">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm text-cream font-medium">💬 Table {selectedTable}</p>
              <p className="text-xs text-cream/40">{selectedTableData?.guestName || 'Guest'}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedTable(null)}
              className="w-8 h-8 rounded-lg bg-dark-3 flex items-center justify-center text-cream/50 hover:text-cream transition-colors"
            >
              ×
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {selectedTableMessages.length === 0 ? (
              <p className="text-center text-cream/30 text-sm py-8">No messages yet</p>
            ) : (
              selectedTableMessages.map(msg => (
                <div 
                  key={msg.id}
                  className={`max-w-[90%] p-3 rounded-lg text-xs
                    ${msg.sender === 'guest'
                      ? 'bg-gold/10 border border-gold/20 ml-auto rounded-br-sm'
                      : 'bg-dark-3 border border-white/5 mr-auto rounded-bl-sm'
                    }`}
                >
                  {msg.sender === 'staff' && (
                    <p className="text-[9px] text-gold uppercase tracking-wide mb-1 font-medium">{msg.senderName}</p>
                  )}
                  <p className="text-cream/90">{msg.text}</p>
                  <p className="text-[9px] text-cream/30 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-3 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-dark-3 border border-white/6 rounded-lg px-3 py-2 text-xs text-cream
                         focus:border-gold/35 focus:outline-none placeholder:text-cream/20"
            />
            <button 
              type="button"
              onClick={handleSendMessage}
              disabled={!chatInput.trim()}
              className="w-10 h-10 rounded-lg bg-gold text-dark flex items-center justify-center text-sm 
                         hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};