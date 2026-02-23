import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Order, AccessRequest, ChatMessage, Table, OrderStatus, RefundRequest, AnalyticsData, PaymentStatus } from '@/types';
import { formatPrice, formatTime, getStatusLabel, getAccessTypeLabel } from '@/utils/format';

export const ManagerDashboard: React.FC = () => {
  const { socket, joinStaff, updateOrderStatus, respondToAccess, updatePayment, processRefund, cancelOrder, endSession } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [stats, setStats] = useState({
    newOrders: 0,
    activeTables: 0,
    revenue: 0,
    delivered: 0,
    unpaidOrders: 0
  });

  useEffect(() => {
    joinStaff('manager');
  }, [joinStaff]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-order', (order: Order) => {
      setOrders(prev => [order, ...prev]);
      setStats(prev => ({ ...prev, newOrders: prev.newOrders + 1 }));
      if (order.paymentStatus === 'unpaid') {
        setStats(prev => ({ ...prev, unpaidOrders: prev.unpaidOrders + 1 }));
      }
      updateTableStatus(order.tableNumber, { hasPendingOrder: true });
      addTelegramMessage(`🍾 NEW ORDER — Table ${order.tableNumber}\n👤 ${order.guestName}\n💰 ${formatPrice(order.total)}`);
    });

    socket.on('check-in', (data: { tableNumber: number; guestName: string; guestId: string; sessionId: string; guestCount: number }) => {
      updateTableStatus(data.tableNumber, { isActive: true, guestName: data.guestName });
      setStats(prev => ({ ...prev, activeTables: prev.activeTables + 1 }));
      addTelegramMessage(`✅ CHECK-IN — Table ${data.tableNumber}\n👤 ${data.guestName}\n👥 ${data.guestCount} guests`);
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

    socket.on('payment-update', ({ orderId, status }: { orderId: string; status: PaymentStatus }) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o));
      if (status === 'paid') {
        setStats(prev => ({ ...prev, unpaidOrders: Math.max(0, prev.unpaidOrders - 1) }));
      }
    });

    socket.on('refund-request', (request: RefundRequest) => {
      setRefundRequests(prev => [request, ...prev]);
      addTelegramMessage(`🔄 REFUND REQUEST — Table ${request.tableNumber}\n💰 ${formatPrice(request.amount)}`);
    });

    return () => {
      socket.off('new-order');
      socket.off('check-in');
      socket.off('access-request');
      socket.off('chat-message');
      socket.off('order-status-update');
      socket.off('payment-update');
      socket.off('refund-request');
    };
  }, [socket]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
          setStats(prev => ({
            ...prev,
            revenue: data.totalRevenue
          }));
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const handleMarkPaid = (orderId: string) => {
    updatePayment(orderId, 'paid');
  };

  const handleCancelOrder = (orderId: string) => {
    cancelOrder(orderId, 'Cancelled by staff');
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
  };

  const handleEndSession = (tableNumber: number) => {
    const tableOrders = orders.filter(o => o.tableNumber === tableNumber && o.status !== 'cancelled');
    const totalBill = tableOrders.reduce((sum, o) => sum + o.total, 0);
    endSession(tableNumber, totalBill);
    updateTableStatus(tableNumber, { isActive: false, hasPendingOrder: false });
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
        <div className="grid grid-cols-5 gap-0.5 p-6">
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
          <div className="bg-dark-2 p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-500/80" />
            <p className="text-[10px] tracking-[0.25em] uppercase text-cream/35 mb-2">Unpaid Orders</p>
            <p className="font-display text-3xl text-orange-500">{stats.unpaidOrders}</p>
            <p className="text-[11px] text-cream/30 mt-1">Awaiting payment</p>
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

            {/* Refund Requests */}
            {refundRequests.length > 0 && (
              <div className="bg-dark-2">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">🔄 Refund Requests</p>
                  <span className="text-[10px] text-gold">{refundRequests.length} pending</span>
                </div>
                <div className="p-4 space-y-2">
                  {refundRequests.map(req => (
                    <div key={req.id} className="bg-dark-3 border border-orange-500/15 p-3 flex items-center justify-between rounded">
                      <div>
                        <p className="text-sm text-cream">Table {req.tableNumber} · {req.guestName}</p>
                        <p className="text-[10px] text-cream/35 mt-1">
                          💰 {formatPrice(req.amount)} · {req.reason}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => processRefund(req.id, true)}
                          className="bg-green-500 text-white text-[10px] px-3 py-1.5 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => processRefund(req.id, false)}
                          className="bg-red-500 text-white text-[10px] px-2.5 py-1.5 rounded"
                        >
                          Deny
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
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full border whitespace-nowrap
                            ${order.status === 'pending' ? 'bg-red-500/15 text-red-500 border-red-500/30' : ''}
                            ${order.status === 'confirmed' ? 'bg-orange-500/15 text-orange-500 border-orange-500/30' : ''}
                            ${order.status === 'delivering' ? 'bg-blue-500/15 text-blue-500 border-blue-500/30' : ''}
                            ${order.status === 'delivered' ? 'bg-green-500/12 text-green-500 border-green-500/25' : ''}
                            ${order.status === 'cancelled' ? 'bg-gray-500/15 text-gray-500 border-gray-500/30' : ''}
                            ${order.status === 'refunded' ? 'bg-purple-500/15 text-purple-500 border-purple-500/30' : ''}
                          `}>
                            {getStatusLabel(order.status)}
                          </span>
                          <span className={`text-[9px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full border whitespace-nowrap
                            ${order.paymentStatus === 'unpaid' ? 'bg-orange-500/15 text-orange-500 border-orange-500/30' : ''}
                            ${order.paymentStatus === 'paid' ? 'bg-green-500/15 text-green-500 border-green-500/30' : ''}
                            ${order.paymentStatus === 'refunded' ? 'bg-purple-500/15 text-purple-500 border-purple-500/30' : ''}
                          `}>
                            {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
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
                          {order.paymentStatus === 'unpaid' && order.status !== 'cancelled' && (
                            <button
                              onClick={() => handleMarkPaid(order.id)}
                              className="bg-emerald-600 text-white text-[10px] px-2.5 py-1 rounded"
                            >
                              💳 Mark Paid
                            </button>
                          )}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="bg-red-500/80 text-white text-[10px] px-2.5 py-1 rounded"
                            >
                              Cancel
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
                  <div key={table.number} className="relative">
                    <button
                      onClick={() => setSelectedTable(table.number)}
                      className={`w-full p-2.5 text-center border transition-all relative
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
                    {table.isActive && (
                      <button
                        onClick={() => handleEndSession(table.number)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center hover:bg-red-600"
                        title="End Session"
                      >
                        ×
                      </button>
                    )}
                  </div>
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

        {/* Analytics Section */}
        {analytics && (
          <div className="px-6 pb-6">
            <div className="bg-dark-2">
              <div className="px-5 py-4 border-b border-white/5">
                <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">📊 Analytics</p>
              </div>
              <div className="p-5 space-y-6">
                {/* Top Items */}
                <div>
                  <h3 className="text-sm text-cream mb-3">Top Selling Items</h3>
                  <div className="space-y-2">
                    {analytics.topSellingItems.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="text-cream/70">{i + 1}. {item.name}</span>
                        <span className="text-gold">{formatPrice(item.revenue)} ({item.quantity} sold)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Breakdown */}
                <div>
                  <h3 className="text-sm text-cream mb-3">Category Breakdown</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {analytics.categoryBreakdown.map(cat => (
                      <div key={cat.category} className="bg-dark-3 p-3 rounded">
                        <p className="text-[10px] text-cream/40 uppercase">{cat.category}</p>
                        <p className="text-sm text-gold">{formatPrice(cat.revenue)}</p>
                        <p className="text-[10px] text-cream/30">{cat.count} items</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table Performance */}
                <div>
                  <h3 className="text-sm text-cream mb-3">Top Tables by Revenue</h3>
                  <div className="space-y-2">
                    {analytics.tablePerformance.slice(0, 5).map((table, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="text-cream/70">🪑 Table {table.tableNumber}</span>
                        <span className="text-gold">{formatPrice(table.revenue)} ({table.orders} orders)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
