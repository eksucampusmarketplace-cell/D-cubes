import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Order, AccessRequest, ChatMessage, Table, OrderStatus } from '@/types';
import { formatPrice, formatTime, getStatusLabel, getAccessTypeLabel } from '@/utils/format';

export const ManagerDashboard: React.FC = () => {
  const { socket, joinStaff, updateOrderStatus, respondToAccess } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [tables, setTables] = useState<Table[]>(
    Array.from({ length: 50 }, (_, i) => ({
      number: i + 1,
      isActive: false,
      hasPendingOrder: false,
      hasUnreadMessage: false
    }))
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [telegramMessages, setTelegramMessages] = useState<string[]>([]);
  const [stats, setStats] = useState({
    newOrders: 0,
    activeTables: 0,
    revenue: 0,
    delivered: 0
  });

  useEffect(() => {
    joinStaff('manager');
  }, [joinStaff]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-order', (order: Order) => {
      setOrders(prev => [order, ...prev]);
      setStats(prev => ({ ...prev, newOrders: prev.newOrders + 1 }));
      updateTableStatus(order.tableNumber, { hasPendingOrder: true });
      addTelegramMessage(`🍾 NEW ORDER — Table ${order.tableNumber}\n👤 ${order.guestName}\n💰 ${formatPrice(order.total)}`);
    });

    socket.on('check-in', ({ tableNumber, guestName }: { tableNumber: number; guestName: string }) => {
      updateTableStatus(tableNumber, { isActive: true, guestName });
      setStats(prev => ({ ...prev, activeTables: prev.activeTables + 1 }));
      addTelegramMessage(`✅ CHECK-IN — Table ${tableNumber}\n👤 ${guestName}`);
    });

    socket.on('access-request', (request: AccessRequest) => {
      setAccessRequests(prev => [request, ...prev]);
      addTelegramMessage(`🛎️ ACCESS REQUEST — Table ${request.tableNumber}\n👤 ${request.guestName}\n📍 ${getAccessTypeLabel(request.type)}`);
    });

    socket.on('chat-message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      if (message.sender === 'guest') {
        updateTableStatus(message.tableNumber, { hasUnreadMessage: true });
      }
    });

    socket.on('order-status-update', ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      if (status === 'delivered') {
        setStats(prev => ({ ...prev, delivered: prev.delivered + 1 }));
      }
    });

    return () => {
      socket.off('new-order');
      socket.off('check-in');
      socket.off('access-request');
      socket.off('chat-message');
      socket.off('order-status-update');
    };
  }, [socket]);

  const updateTableStatus = (tableNumber: number, updates: Partial<Table>) => {
    setTables(prev => prev.map(t => 
      t.number === tableNumber ? { ...t, ...updates } : t
    ));
  };

  const addTelegramMessage = (msg: string) => {
    setTelegramMessages(prev => [msg, ...prev].slice(0, 20));
  };

  const handleConfirmOrder = (orderId: string, _tableNum: number) => {
    updateOrderStatus(orderId, 'confirmed');
  };

  const handleMarkDelivering = (orderId: string, _tableNum: number) => {
    updateOrderStatus(orderId, 'delivering');
  };

  const handleMarkDone = (orderId: string, tableNum: number) => {
    updateOrderStatus(orderId, 'delivered');
    updateTableStatus(tableNum, { hasPendingOrder: false });
  };

  const handleGrantAccess = (requestId: string, tableNum: number) => {
    respondToAccess(requestId, true);
    setAccessRequests(prev => prev.filter(r => r.id !== requestId));
    addTelegramMessage(`🎫 ACCESS GRANTED — Table ${tableNum}`);
  };

  const handleDenyAccess = (requestId: string) => {
    respondToAccess(requestId, false);
    setAccessRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const selectedTableMessages = messages.filter(m => m.tableNumber === selectedTable);
  const selectedTableData = tables.find(t => t.number === selectedTable);

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <div className="w-56 bg-dark-2 border-r border-gold/10 flex-shrink-0 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5">
          <h1 className="font-display text-2xl tracking-[0.3em] text-gold">VELOUR</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-cream/30 mt-1">Staff Dashboard</p>
        </div>
        
        <div className="p-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-cream/25 mb-3">Operations</p>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-cream border-l-2 border-gold bg-gold/6">
            📋 Live Orders
            {stats.newOrders > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {stats.newOrders}
              </span>
            )}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-cream/50 hover:text-cream transition-colors">
            🪑 Tables
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-cream/50 hover:text-cream transition-colors">
            💬 Messages
          </button>
        </div>

        <div className="mt-auto p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-amber-700 flex items-center justify-center text-dark text-xs font-medium">
              AK
            </div>
            <div>
              <p className="text-sm text-cream">Alex K.</p>
              <p className="text-[10px] text-cream/35">Floor Manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark/95 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between z-20">
          <div>
            <h2 className="text-base text-white font-normal">Live Orders & Table Management</h2>
            <p className="text-xs text-cream/35 mt-1">{new Date().toLocaleDateString()} · Victoria Island, Lagos</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 border border-white/8 rounded-full text-[11px] text-cream/40">
              📲 Telegram Connected
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 border border-green-500/25 rounded-full text-[11px] text-green-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {stats.activeTables} Tables Active
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-0.5 p-6">
          <div className="bg-dark-2 p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500/80" />
            <p className="text-[10px] tracking-[0.25em] uppercase text-cream/35 mb-2">New Orders</p>
            <p className="font-display text-3xl text-red-500">{stats.newOrders}</p>
            <p className="text-[11px] text-cream/30 mt-1">Needs attention</p>
          </div>
          <div className="bg-dark-2 p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold/30" />
            <p className="text-[10px] tracking-[0.25em] uppercase text-cream/35 mb-2">Active Tables</p>
            <p className="font-display text-3xl text-gold">{stats.activeTables}</p>
            <p className="text-[11px] text-cream/30 mt-1">of 50 tables</p>
          </div>
          <div className="bg-dark-2 p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500/80" />
            <p className="text-[10px] tracking-[0.25em] uppercase text-cream/35 mb-2">Tonight's Revenue</p>
            <p className="font-display text-3xl text-green-500">₦{(stats.revenue / 1000000).toFixed(2)}M</p>
            <p className="text-[11px] text-cream/30 mt-1">↑ 18% vs last Friday</p>
          </div>
          <div className="bg-dark-2 p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold/30" />
            <p className="text-[10px] tracking-[0.25em] uppercase text-cream/35 mb-2">Orders Delivered</p>
            <p className="font-display text-3xl text-white">{stats.delivered}</p>
            <p className="text-[11px] text-cream/30 mt-1">Since 8PM</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-[1fr_360px] gap-5 px-6 pb-6">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Access Requests */}
            {accessRequests.length > 0 && (
              <div className="bg-dark-2">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">🛎️ Access Requests</p>
                  <span className="text-[10px] text-gold">{accessRequests.length} pending</span>
                </div>
                <div className="p-4 space-y-2">
                  {accessRequests.map(req => (
                    <div key={req.id} className="bg-dark-3 border border-gold/15 p-3 flex items-center justify-between rounded">
                      <div>
                        <p className="text-sm text-cream">{getAccessTypeLabel(req.type)}</p>
                        <p className="text-[10px] text-cream/35 mt-1">
                          Table {req.tableNumber} · {req.guestName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleGrantAccess(req.id, req.tableNumber)}
                          className="bg-green-500 text-white text-[10px] px-3 py-1.5 rounded"
                        >
                          Grant
                        </button>
                        <button 
                          onClick={() => handleDenyAccess(req.id)}
                          className="bg-white/5 text-cream text-[10px] px-2.5 py-1.5 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Orders */}
            <div className="bg-dark-2">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">📋 Live Orders</p>
                <button className="text-[10px] text-gold hover:underline">Clear Completed</button>
              </div>
              <div>
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-cream/30 text-sm">
                    No orders yet
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="grid grid-cols-[60px_1fr_auto] gap-4 px-5 py-4 border-b border-white/4 hover:bg-white/1 transition-colors">
                      <div>
                        <p className="font-display text-3xl text-gold leading-none">{order.tableNumber}</p>
                        <p className="text-[9px] tracking-[0.15em] uppercase text-cream/30 mt-1">Table</p>
                      </div>
                      <div>
                        <p className="text-[13px] text-cream mb-1">👤 {order.guestName}</p>
                        <p className="text-xs text-cream/40 line-clamp-1">
                          {order.items.map(i => `${i.quantity}× ${i.name}`).join(' · ')}
                        </p>
                        <p className="text-xs text-gold mt-1">{formatPrice(order.total)}</p>
                        {order.note && (
                          <p className="text-[10px] text-cream/25 mt-1">📝 {order.note}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[10px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full border whitespace-nowrap
                          ${order.status === 'pending' ? 'bg-red-500/15 text-red-500 border-red-500/30' : ''}
                          ${order.status === 'confirmed' ? 'bg-orange-500/15 text-orange-500 border-orange-500/30' : ''}
                          ${order.status === 'delivering' ? 'bg-blue-500/15 text-blue-500 border-blue-500/30' : ''}
                          ${order.status === 'delivered' ? 'bg-green-500/12 text-green-500 border-green-500/25' : ''}
                        `}>
                          {getStatusLabel(order.status)}
                        </span>
                        <div className="flex gap-1">
                          {order.status === 'pending' && (
                            <button 
                              onClick={() => handleConfirmOrder(order.id, order.tableNumber)}
                              className="bg-gold text-dark text-[10px] px-2.5 py-1 rounded"
                            >
                              Confirm
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button 
                              onClick={() => handleMarkDelivering(order.id, order.tableNumber)}
                              className="bg-blue-500 text-white text-[10px] px-2.5 py-1 rounded"
                            >
                              On Way
                            </button>
                          )}
                          {order.status === 'delivering' && (
                            <button 
                              onClick={() => handleMarkDone(order.id, order.tableNumber)}
                              className="bg-green-500 text-white text-[10px] px-2.5 py-1 rounded"
                            >
                              Delivered
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedTable(order.tableNumber)}
                            className="bg-white/5 text-cream text-[10px] px-2.5 py-1 rounded"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Tables Grid */}
            <div className="bg-dark-2">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">🪑 Tables</p>
                <button className="text-[10px] text-gold hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-5 gap-0.5 p-4">
                {tables.slice(0, 30).map(table => (
                  <button
                    key={table.number}
                    onClick={() => setSelectedTable(table.number)}
                    className={`p-2.5 text-center border transition-all relative
                      ${table.isActive 
                        ? 'bg-dark-3 border-gold/40' 
                        : 'bg-dark-3 border-white/4 hover:border-gold/30'
                      }
                      ${selectedTable === table.number ? 'ring-1 ring-gold bg-gold/8' : ''}
                    `}
                  >
                    <p className={`font-display text-xl leading-none ${table.isActive ? 'text-gold' : 'text-cream/50'}`}>
                      {table.number}
                    </p>
                    <p className="text-[9px] text-cream/30 uppercase mt-1">
                      {table.isActive ? 'Active' : 'Empty'}
                    </p>
                    {(table.hasPendingOrder || table.hasUnreadMessage) && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat */}
            {selectedTable && (
              <div className="bg-dark-2">
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">💬 Chat</p>
                  <p className="text-[11px] text-gold mt-1">
                    Table {selectedTable} · {selectedTableData?.guestName || 'Guest'}
                  </p>
                </div>
                <div className="h-64 overflow-y-auto p-4 space-y-2">
                  {selectedTableMessages.length === 0 ? (
                    <p className="text-center text-cream/30 text-sm py-8">No messages</p>
                  ) : (
                    selectedTableMessages.map(msg => (
                      <div 
                        key={msg.id}
                        className={`max-w-[85%] p-2.5 rounded-lg text-xs
                          ${msg.sender === 'guest'
                            ? 'bg-gold/10 border border-gold/20 ml-auto rounded-br-sm'
                            : 'bg-dark-3 border border-white/5 mr-auto rounded-bl-sm'
                          }`}
                      >
                        {msg.sender === 'staff' && (
                          <p className="text-[9px] text-gold uppercase tracking-wide mb-1">Staff</p>
                        )}
                        <p className="text-cream">{msg.text}</p>
                        <p className="text-[9px] text-cream/30 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    placeholder={`Reply to Table ${selectedTable}...`}
                    className="flex-1 bg-dark-3 border border-white/6 rounded-full px-3 py-2 text-xs text-cream
                               focus:border-gold/35 focus:outline-none placeholder:text-cream/20"
                  />
                  <button className="w-8 h-8 rounded-full bg-gold text-dark flex items-center justify-center text-xs">
                    ➤
                  </button>
                </div>
              </div>
            )}

            {/* Telegram Feed */}
            <div className="bg-dark-2">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">📲 Telegram Feed</p>
                <button className="text-[10px] text-gold hover:underline">View Bot</button>
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {telegramMessages.length === 0 ? (
                  <p className="text-center text-cream/30 text-xs py-4">No messages yet</p>
                ) : (
                  telegramMessages.map((msg, i) => (
                    <div key={i} className="bg-dark-3 border border-blue-500/15 rounded p-3 text-xs text-cream/70 whitespace-pre-line font-mono">
                      {msg}
                      <p className="text-[9px] text-cream/25 mt-2 text-right">{formatTime(new Date())}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
