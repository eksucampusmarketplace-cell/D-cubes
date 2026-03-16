import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Order, OrderStatus, ChatMessage, ZoneType } from '@/types';
import { formatPrice, formatTime, getStatusLabel, generateMessageId } from '@/utils/format';
import { authenticatedFetch } from '@/utils/api';
import { ZONES } from '@/data/locations';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const BAR_CATEGORIES = ['cocktails', 'spirits', 'wine', 'nonalc', 'brandy', 'tequila', 'sparkling-wine', 'liquor', 'mixers', 'energy-drinks', 'beer', 'shisha'];

// Zone-specific bar dashboard
export const BarDashboard: React.FC = () => {
  return (
    <ErrorBoundary>
      <BarDashboardContent />
    </ErrorBoundary>
  );
};

const BarDashboardContent: React.FC = () => {
  const { socket, joinStaff, updateOrderStatus, sendMessage } = useSocket();
  const [barOrders, setBarOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [unreadTables, setUnreadTables] = useState<Set<number>>(new Set());
  const [activeZone, setActiveZone] = useState<ZoneType>('lounge');
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
      oscillator.frequency.setValueAtTime(784, ctx.currentTime);
      oscillator.frequency.setValueAtTime(523, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch {
      // Web Audio not available
    }
  }, []);

  // Load existing bar orders on mount (recovery from refresh)
  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    joinStaff('bar');
  }, [joinStaff]);

  useEffect(() => {
    if (!socket) return;
    
    const handleReconnect = () => {
      joinStaff('bar');
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
        authenticatedFetch('/api/orders', {}, 'bar'),
        authenticatedFetch('/api/messages', {}, 'bar'),
      ]);

      if (ordersRes.ok) {
        const data: Order[] = await ordersRes.json();
        const barOrdersData = data
          .map(o => ({ ...o, items: o.items.filter(i => BAR_CATEGORIES.includes(i.category)) }))
          .filter(o => o.items.length > 0);
        setBarOrders(barOrdersData.reverse());
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
      const barItems = order.items.filter(item => BAR_CATEGORIES.includes(item.category));
      if (barItems.length > 0) {
        const barOrder = { ...order, items: barItems };
        setBarOrders(prev => {
          if (prev.some(o => o.id === order.id)) return prev;
          return [barOrder, ...prev];
        });
        setNewOrderAlert(true);
        playAlertTone();
        if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = setTimeout(() => setNewOrderAlert(false), 5000);
      }
    });

    socket.on('order-status-update', ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      setBarOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    });

    socket.on('order-cancelled', ({ orderId }: { orderId: string; reason?: string }) => {
      setBarOrders(prev => prev.filter(o => o.id !== orderId));
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

  const handleMarkDelivered = (orderId: string) => {
    updateOrderStatus(orderId, 'delivered');
  };

  const handleMarkConfirmed = (orderId: string) => {
    updateOrderStatus(orderId, 'confirmed');
  };

  const tableOptions = useMemo(() => {
    const tables = new Set<number>();
    barOrders.forEach(order => tables.add(order.tableNumber));
    messages.forEach(message => tables.add(message.tableNumber));
    return Array.from(tables).sort((a, b) => a - b);
  }, [barOrders, messages]);

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
      senderName: 'Bar'
    };

    setMessages(prev => [...prev, message]);
    sendMessage(message);
    setReplyMessage('');
  }, [selectedTable, replyMessage, sendMessage]);

  const selectedTableOrders = barOrders.filter(o => o.tableNumber === selectedTable);
  const selectedTableMessages = messages.filter(m => m.tableNumber === selectedTable);

  // Zone tabs for bar sections
  const zoneTabs: ZoneType[] = ['lounge', 'nightclub', 'open-bar'];

  return (
    <div className="min-h-screen bg-dark-4">
      {/* New Order Alert Banner */}
      {newOrderAlert && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-xl">🍸</span>
            <span className="font-semibold tracking-wide text-sm">NEW BAR ORDER</span>
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
      <header className={`bg-dark-2 border-b border-gold/10 sticky z-50 ${newOrderAlert ? 'top-10' : 'top-0'}`}>
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-2xl tracking-[0.2em] text-gold">BAR DASHBOARD</h1>
              <span className="px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold text-sm">
                🍸 Drinks & Shisha
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a href="/manager" className="px-4 py-2 text-sm text-cream/50 hover:text-cream transition-colors">
                Manager
              </a>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-cream/50">Online</span>
            </div>
          </div>
          
          {/* Zone Tabs */}
          <div className="flex gap-2">
            {zoneTabs.map(zone => (
              <button
                key={zone}
                onClick={() => setActiveZone(zone)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                           ${activeZone === zone 
                             ? 'bg-gold text-black' 
                             : 'bg-dark-3 text-cream/60 hover:bg-dark-4 hover:text-cream'}`}
              >
                <span>{ZONES[zone].icon}</span>
                <span className="capitalize">{ZONES[zone].name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Sidebar - Table List */}
        <div className="w-64 bg-dark-2 border-r border-gold/10 flex flex-col">
          <div className="p-4 border-b border-gold/10">
            <h2 className="text-xs text-cream/40 uppercase tracking-wider mb-1">Active Tables</h2>
            <p className="text-2xl text-white font-serif">{tableOptions.length}</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {tableOptions.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-cream/30 text-sm">No active tables</p>
              </div>
            ) : (
              tableOptions.map(tableNumber => {
                const hasUnread = unreadTables.has(tableNumber);
                const pendingOrders = barOrders.filter(o => 
                  o.tableNumber === tableNumber && 
                  ['pending', 'confirmed', 'preparing'].includes(o.status)
                ).length;
                
                return (
                  <button
                    key={tableNumber}
                    onClick={() => handleSelectTable(tableNumber)}
                    className={`w-full p-4 text-left border-b border-gold/5 transition-all
                               ${selectedTable === tableNumber 
                                 ? 'bg-gold/10 border-l-4 border-l-gold' 
                                 : 'hover:bg-dark-3 border-l-4 border-l-transparent'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🪑</span>
                        <span className="font-medium text-white">Table {tableNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {pendingOrders > 0 && (
                          <span className="px-2 py-0.5 bg-gold text-black text-xs rounded-full font-bold">
                            {pendingOrders}
                          </span>
                        )}
                        {hasUnread && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedTable ? (
            <>
              {/* Orders Section */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl text-white">Table {selectedTable}</h2>
                  <div className="flex gap-2">
                    {selectedTableOrders.some(o => o.status === 'pending') && (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full">
                        ⏳ Pending Orders
                      </span>
                    )}
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4 mb-8">
                  {selectedTableOrders.length === 0 ? (
                    <div className="luxury-card rounded-2xl p-8 text-center">
                      <p className="text-cream/30">No orders for this table</p>
                    </div>
                  ) : (
                    selectedTableOrders.map(order => (
                      <div key={order.id} className="luxury-card rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-cream/40 uppercase tracking-wider">
                                Order #{order.id.slice(-6)}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium
                                ${order.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                  order.status === 'preparing' ? 'bg-blue-500/20 text-blue-400' :
                                  order.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                                  'bg-cream/10 text-cream/60'}`}>
                                {getStatusLabel(order.status)}
                              </span>
                            </div>
                            <p className="text-sm text-cream/60">{order.guestName}</p>
                            <p className="text-xs text-cream/40">{formatTime(order.timestamp)}</p>
                          </div>
                          <span className="text-xl text-gold font-bold">
                            {formatPrice(order.total)}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-gold/5 last:border-0">
                              <div className="flex items-center gap-3">
                                <span className="text-cream/40">{item.quantity}×</span>
                                <span className="text-cream">{item.name}</span>
                              </div>
                              <span className="text-cream/60">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleMarkConfirmed(order.id)}
                              className="flex-1 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all text-sm font-medium"
                            >
                              ✓ Confirm
                            </button>
                          )}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              onClick={() => handleMarkPreparing(order.id)}
                              className="flex-1 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all text-sm font-medium"
                            >
                              🍸 Start Preparing
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => handleMarkReady(order.id)}
                              className="flex-1 py-3 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-all text-sm font-medium"
                            >
                              ✅ Mark Ready
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button
                              onClick={() => handleMarkDelivered(order.id)}
                              className="flex-1 py-3 bg-gold/20 text-gold rounded-xl hover:bg-gold/30 transition-all text-sm font-medium"
                            >
                              🚚 Mark Delivered
                            </button>
                          )}
                        </div>

                        {order.note && (
                          <div className="mt-4 p-3 bg-gold/5 border border-gold/10 rounded-xl">
                            <p className="text-sm text-cream/60">
                              <span className="text-gold">📝 Note:</span> {order.note}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Section */}
                <div className="luxury-card rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-gold/10 bg-dark-3">
                    <h3 className="font-serif text-lg text-white">💬 Chat with Table {selectedTable}</h3>
                  </div>
                  
                  {/* Messages */}
                  <div className="h-64 overflow-y-auto p-4 space-y-3">
                    {selectedTableMessages.length === 0 ? (
                      <p className="text-center text-cream/30 text-sm">No messages yet</p>
                    ) : (
                      selectedTableMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'staff' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] px-4 py-2 rounded-2xl
                            ${msg.sender === 'staff' 
                              ? 'bg-gold/20 text-cream rounded-br-md' 
                              : 'bg-dark-3 text-cream rounded-bl-md'}`}>
                            <p className="text-sm">{msg.text}</p>
                            <span className="text-xs text-cream/40 mt-1 block">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply Input */}
                  <div className="p-4 border-t border-gold/10 bg-dark-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                        placeholder="Type a message..."
                        className="flex-1 input-luxury"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim()}
                        className="px-6 py-3 bg-gold text-black rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-light transition-all"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">🍸</span>
                <h2 className="font-serif text-2xl text-white mb-2">Bar Dashboard</h2>
                <p className="text-cream/40">Select a table to view orders and chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
