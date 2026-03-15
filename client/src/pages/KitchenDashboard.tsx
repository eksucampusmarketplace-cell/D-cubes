import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Order, OrderStatus, ChatMessage } from '@/types';
import { formatPrice, formatTime, getStatusLabel, generateMessageId } from '@/utils/format';

export const KitchenDashboard: React.FC = () => {
  const { socket, joinStaff, updateOrderStatus, sendMessage } = useSocket();
  const [foodOrders, setFoodOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [unreadTables, setUnreadTables] = useState<Set<number>>(new Set());
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playAlertTone = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(660, ctx.currentTime);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch {
      // Web Audio not available
    }
  }, []);

  // Load existing food orders on mount (recovery from refresh)
  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    joinStaff('kitchen');
  }, [joinStaff]);

  useEffect(() => {
    if (!socket) return;
    
    const handleReconnect = () => {
      joinStaff('kitchen');
      // Re-fetch orders on reconnect to avoid missing orders sent during disconnect
      fetchInitialData();
    };
    
    socket.on('connect', handleReconnect);
    return () => { socket.off('connect', handleReconnect); };
  }, [socket, joinStaff]);
  
  // Expose fetchInitialData for reconnection handling
  const fetchInitialData = async () => {
    try {
      const [ordersRes, messagesRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/messages'),
      ]);

      if (ordersRes.ok) {
        const data: Order[] = await ordersRes.json();
        const kitchenOrders = data
          .map(o => ({ ...o, items: o.items.filter(i => i.category === 'food') }))
          .filter(o => o.items.length > 0);
        setFoodOrders(kitchenOrders.reverse());
      }

      if (messagesRes.ok) {
        const data: ChatMessage[] = await messagesRes.json();
        setMessages(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-order', (order: Order) => {
      const foodItems = order.items.filter(item => item.category === 'food');
      if (foodItems.length > 0) {
        const foodOrder = { ...order, items: foodItems };
        setFoodOrders(prev => {
          if (prev.some(o => o.id === order.id)) return prev;
          return [foodOrder, ...prev];
        });
        setNewOrderAlert(true);
        playAlertTone();
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = setTimeout(() => setNewOrderAlert(false), 5000);
      }
    });

    socket.on('order-status-update', ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      setFoodOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    });

    socket.on('order-cancelled', ({ orderId }: { orderId: string; reason?: string }) => {
      setFoodOrders(prev => prev.filter(o => o.id !== orderId));
    });

    socket.on('new-message', (message: ChatMessage) => {
      setMessages(prev => prev.some(existing => existing.id === message.id) ? prev : [...prev, message]);
      if (message.sender === 'guest') {
        setUnreadTables(prev => {
          const next = new Set(prev);
          if (message.tableNumber !== selectedTable) {
            next.add(message.tableNumber);
          }
          return next;
        });
      }
    });

    return () => {
      socket.off('new-order');
      socket.off('order-status-update');
      socket.off('order-cancelled');
      socket.off('new-message');
    };
  }, [socket, selectedTable]);

  const handleMarkPreparing = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing');
  };

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
  };

  const tableOptions = useMemo(() => {
    const tables = new Set<number>();
    foodOrders.forEach(order => tables.add(order.tableNumber));
    messages.forEach(message => tables.add(message.tableNumber));
    return Array.from(tables).sort((a, b) => a - b);
  }, [foodOrders, messages]);

  useEffect(() => {
    if (selectedTable === null && tableOptions.length > 0) {
      setSelectedTable(tableOptions[0]);
    }
  }, [selectedTable, tableOptions]);

  const handleSelectTable = useCallback((tableNumber: number) => {
    setSelectedTable(tableNumber);
    setUnreadTables(prev => {
      const next = new Set(prev);
      next.delete(tableNumber);
      return next;
    });
  }, []);

  const handleSendReply = useCallback(() => {
    if (!selectedTable || !replyMessage.trim()) return;

    const message: ChatMessage = {
      id: generateMessageId(),
      tableNumber: selectedTable,
      sender: 'staff',
      text: replyMessage.trim(),
      timestamp: new Date(),
      senderName: 'Kitchen'
    };

    setMessages(prev => [...prev, message]);
    sendMessage(message);
    setReplyMessage('');
  }, [replyMessage, selectedTable, sendMessage]);

  useEffect(() => {
    setReplyMessage('');
  }, [selectedTable]);

  const selectedTableMessages = messages.filter(message => message.tableNumber === selectedTable);

  return (
    <div className="min-h-screen bg-dark">
      {/* New Order Alert Banner */}
      {newOrderAlert && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-3 flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-xl">👨‍🍳</span>
            <span className="font-semibold tracking-wide text-sm">NEW FOOD ORDER</span>
          </div>
          <button
            type="button"
            onClick={() => setNewOrderAlert(false)}
            className="text-white/80 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className={`sticky bg-dark/95 backdrop-blur border-b border-gold/20 px-4 lg:px-8 py-4 lg:py-6 z-20 ${newOrderAlert ? 'top-10' : 'top-0'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-4">
            <h1 className="font-display text-xl lg:text-3xl tracking-[0.2em] lg:tracking-[0.25em] text-gold">D CUBE'S PLACE</h1>
            <div className="h-6 lg:h-8 w-px bg-gold/30 hidden sm:block" />
            <div className="hidden sm:block">
              <h2 className="font-serif text-lg lg:text-2xl text-white">Kitchen Display</h2>
              <p className="text-xs text-cream/35 mt-1">Food Orders Only</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-1.5 lg:py-2 border border-green-500/25 rounded-full text-xs lg:text-sm text-green-500">
              <span className="w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="hidden sm:inline">Live</span>
            </div>
            <div className="text-right">
              <p className="font-display text-xl lg:text-3xl text-gold">{foodOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}</p>
              <p className="text-[9px] lg:text-[10px] tracking-[0.2em] uppercase text-cream/35">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders & Messages */}
      <div className="p-4 lg:p-8 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4 lg:gap-6">
        <div>
          {foodOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-cream/30">
              <span className="text-6xl mb-4">👨‍🍳</span>
              <p className="font-serif text-2xl mb-2">No Food Orders</p>
              <p className="text-sm">New orders will appear here automatically</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-dark-2 rounded-lg border border-gold/10 h-fit xl:sticky xl:top-28">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">💬 Guest Messages</p>
            <p className="text-[11px] text-cream/35 mt-1">Kitchen replies</p>
          </div>
          <div className="p-4">
            {tableOptions.length === 0 ? (
              <p className="text-xs text-cream/30 text-center py-6">No active tables yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tableOptions.map(tableNumber => (
                  <button
                    key={tableNumber}
                    type="button"
                    onClick={() => handleSelectTable(tableNumber)}
                    className={`relative px-3 py-1.5 rounded-full text-[11px] border transition-colors
                      ${selectedTable === tableNumber
                        ? 'bg-gold/20 border-gold/50 text-gold'
                        : 'bg-dark-3 border-white/10 text-cream/60 hover:border-gold/30'
                      }`}
                  >
                    Table {tableNumber}
                    {unreadTables.has(tableNumber) && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="h-64 overflow-y-auto px-4 pb-4 space-y-2">
            {selectedTableMessages.length === 0 ? (
              <p className="text-xs text-cream/30 text-center py-6">No messages yet</p>
            ) : (
              selectedTableMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`max-w-[85%] p-3 rounded-lg text-xs
                    ${msg.sender === 'guest'
                      ? 'bg-gold/10 border border-gold/20 ml-auto rounded-br-sm'
                      : 'bg-dark-3 border border-white/5 mr-auto rounded-bl-sm'
                    }`}
                >
                  {msg.sender === 'staff' && (
                    <p className="text-[9px] text-gold uppercase tracking-wide mb-1 font-medium">Kitchen</p>
                  )}
                  <p className="text-cream/90">{msg.text}</p>
                  <p className="text-[9px] text-cream/30 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              placeholder={selectedTable ? `Reply to Table ${selectedTable}...` : 'Select a table to reply...'}
              disabled={!selectedTable}
              className="flex-1 bg-dark-3 border border-white/6 rounded-lg px-3 py-2 text-xs text-cream
                         focus:border-gold/35 focus:outline-none placeholder:text-cream/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleSendReply}
              disabled={!selectedTable || !replyMessage.trim()}
              className="w-8 h-8 rounded-lg bg-gold text-dark flex items-center justify-center text-xs hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
