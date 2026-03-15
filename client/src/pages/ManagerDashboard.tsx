import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Order, AccessRequest, ChatMessage, Table, OrderStatus, RefundRequest, AnalyticsData, PaymentStatus, TableSession } from '@/types';
import { formatPrice, formatTime, getStatusLabel, getAccessTypeLabel, generateMessageId } from '@/utils/format';
import { ErrorBoundary } from '@/components/ErrorBoundary';

type ActiveView = 'orders' | 'tables' | 'messages';

export const ManagerDashboard: React.FC = () => {
  return (
    <ErrorBoundary>
      <ManagerDashboardContent />
    </ErrorBoundary>
  );
};

const ManagerDashboardContent: React.FC = () => {
  const { socket, joinStaff, updateOrderStatus, respondToAccess, updatePayment, processRefund, cancelOrder, endSession, sendMessage } = useSocket();
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
  const [replyMessage, setReplyMessage] = useState('');
  const [telegramMessages, setTelegramMessages] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [telegramEnabled, setTelegramEnabled] = useState<boolean | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('orders');
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [stats, setStats] = useState({
    newOrders: 0,
    activeTables: 0,
    revenue: 0,
    delivered: 0,
    unpaidOrders: 0
  });
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Play a short alert tone using Web Audio API (no external files needed)
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
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch {
      // Web Audio not available
    }
  }, []);

  const triggerNewOrderAlert = useCallback(() => {
    setNewOrderAlert(true);
    playAlertTone();
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    alertTimeoutRef.current = setTimeout(() => setNewOrderAlert(false), 5000);
  }, [playAlertTone]);

  // Load existing data on mount (recovery from refresh)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [ordersRes, allOrdersRes, accessRes, refundRes, sessionsRes, messagesRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/orders/all'),
          fetch('/api/access-requests'),
          fetch('/api/refund-requests'),
          fetch('/api/sessions'),
          fetch('/api/messages'),
        ]);

        if (ordersRes.ok) {
          const data: Order[] = await ordersRes.json();
          setOrders(data.reverse());
          const unpaid = data.filter(o => o.paymentStatus === 'unpaid' && o.status !== 'cancelled').length;
          const pending = data.filter(o => o.status === 'pending').length;
          setStats(prev => ({ ...prev, newOrders: pending, unpaidOrders: unpaid }));
        }

        if (allOrdersRes.ok) {
          const allData: Order[] = await allOrdersRes.json();
          const revenue = allData.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
          const delivered = allData.filter(o => o.status === 'delivered').length;
          setStats(prev => ({ ...prev, revenue, delivered }));
        }

        if (accessRes.ok) {
          const data: AccessRequest[] = await accessRes.json();
          setAccessRequests(data);
        }

        if (refundRes.ok) {
          const data: RefundRequest[] = await refundRes.json();
          setRefundRequests(data);
        }

        if (sessionsRes.ok) {
          const data: TableSession[] = await sessionsRes.json();
          setStats(prev => ({ ...prev, activeTables: data.length }));
          data.forEach(session => {
            updateTableStatus(session.tableNumber, { isActive: true });
          });
        }

        if (messagesRes.ok) {
          const data: ChatMessage[] = await messagesRes.json();
          setMessages(data);
        }
      } catch {
        // Server not reachable, continue with empty state
      }
    };

    fetchInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    joinStaff('manager');
  }, [joinStaff]);

  useEffect(() => {
    if (!socket) return;
    const handleReconnect = () => joinStaff('manager');
    socket.on('connect', handleReconnect);
    return () => { socket.off('connect', handleReconnect); };
  }, [socket, joinStaff]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-order', (order: Order) => {
      setOrders(prev => {
        if (prev.some(o => o.id === order.id)) return prev;
        return [order, ...prev];
      });
      setStats(prev => ({
        ...prev,
        newOrders: prev.newOrders + 1,
        revenue: prev.revenue + order.total,
        unpaidOrders: order.paymentStatus === 'unpaid' ? prev.unpaidOrders + 1 : prev.unpaidOrders
      }));
      updateTableStatus(order.tableNumber, { hasPendingOrder: true });
      addTelegramMessage(`🍾 NEW ORDER — Table ${order.tableNumber}\n👤 ${order.guestName}\n💰 ${formatPrice(order.total)}`);
      triggerNewOrderAlert();
    });

    socket.on('check-in', (data: { tableNumber: number; guestName: string; guestId: string; sessionId: string; guestCount: number }) => {
      updateTableStatus(data.tableNumber, { isActive: true, guestName: data.guestName });
      setStats(prev => ({ ...prev, activeTables: prev.activeTables + 1 }));
      addTelegramMessage(`✅ CHECK-IN — Table ${data.tableNumber}\n👤 ${data.guestName}\n👥 ${data.guestCount} guests`);
    });

    socket.on('access-request', (request: AccessRequest) => {
      setAccessRequests(prev => {
        if (prev.some(r => r.id === request.id)) return prev;
        return [request, ...prev];
      });
      addTelegramMessage(`🛎️ ACCESS REQUEST — Table ${request.tableNumber}\n👤 ${request.guestName}\n📍 ${getAccessTypeLabel(request.type)}`);
    });

    socket.on('new-message', (message: ChatMessage) => {
      setMessages(prev => prev.some(existing => existing.id === message.id) ? prev : [...prev, message]);
      if (message.sender === 'guest' && message.tableNumber !== selectedTable) {
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
      setRefundRequests(prev => {
        if (prev.some(r => r.id === request.id)) return prev;
        return [request, ...prev];
      });
      addTelegramMessage(`🔄 REFUND REQUEST — Table ${request.tableNumber}\n💰 ${formatPrice(request.amount)}`);
    });

    socket.on('table-inactive', (tableNumber: number) => {
      updateTableStatus(tableNumber, { isActive: false, hasPendingOrder: false, hasUnreadMessage: false });
      setStats(prev => ({ ...prev, activeTables: Math.max(0, prev.activeTables - 1) }));
    });

    socket.on('guest-left', ({ tableNumber }: { tableNumber: number; guestName: string; remainingGuests: number }) => {
      updateTableStatus(tableNumber, { isActive: true });
    });

    socket.on('order-cancelled', ({ orderId }: { orderId: string }) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    });

    socket.on('session-ended', ({ tableNumber, guestCount, totalOrders, totalSpent }: 
      { tableNumber: number; sessionId: string; duration: number; guestCount: number; totalOrders: number; totalSpent: number }) => {
      updateTableStatus(tableNumber, { isActive: false, hasPendingOrder: false, hasUnreadMessage: false });
      setStats(prev => ({ 
        ...prev, 
        activeTables: Math.max(0, prev.activeTables - 1),
        revenue: prev.revenue + totalSpent
      }));
      addTelegramMessage(`🧹 SESSION ENDED — Table ${tableNumber}\n👥 ${guestCount} guests · 📦 ${totalOrders} orders · 💰 ${formatPrice(totalSpent)}`);
    });

    socket.on('session-receipt', ({ tableNumber, receipt }: { tableNumber: number; receipt: any }) => {
      addTelegramMessage(`🧾 SESSION RECEIPT — Table ${tableNumber}\n💰 ${formatPrice(receipt.total)} · Receipt #${receipt.id.slice(-8).toUpperCase()}`);
    });

    return () => {
      socket.off('new-order');
      socket.off('check-in');
      socket.off('access-request');
      socket.off('new-message');
      socket.off('order-status-update');
      socket.off('payment-update');
      socket.off('refund-request');
      socket.off('table-inactive');
      socket.off('guest-left');
      socket.off('order-cancelled');
      socket.off('session-ended');
      socket.off('session-receipt');
    };
  }, [socket, selectedTable, triggerNewOrderAlert]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
          setStats(prev => ({
            ...prev,
            revenue: data.totalRevenue,
            delivered: data.orderCount
          }));
        }
      } catch {
        // ignore
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          setTelegramEnabled(Boolean(data.telegramEnabled));
        } else {
          setTelegramEnabled(false);
        }
      } catch {
        setTelegramEnabled(false);
      }
    };

    fetchHealth();
  }, []);

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, []);

  const updateTableStatus = (tableNumber: number, updates: Partial<Table>) => {
    setTables(prev => prev.map(t =>
      t.number === tableNumber ? { ...t, ...updates } : t
    ));
  };

  const addTelegramMessage = (msg: string) => {
    setTelegramMessages(prev => [msg, ...prev].slice(0, 20));
  };

  const handleSelectTable = useCallback((tableNumber: number) => {
    setSelectedTable(tableNumber);
    setActiveView('messages');
    updateTableStatus(tableNumber, { hasUnreadMessage: false });
  }, []);

  const handleConfirmOrder = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'confirmed');
    setStats(prev => ({ ...prev, newOrders: Math.max(0, prev.newOrders - 1) }));
  }, [updateOrderStatus]);

  const handleMarkDelivering = useCallback((orderId: string) => {
    updateOrderStatus(orderId, 'delivering');
  }, [updateOrderStatus]);

  const handleMarkDone = useCallback((orderId: string, tableNum: number) => {
    updateOrderStatus(orderId, 'delivered');
    updateTableStatus(tableNum, { hasPendingOrder: false });
  }, [updateOrderStatus]);

  const handleMarkPaid = useCallback((orderId: string) => {
    updatePayment(orderId, 'paid');
  }, [updatePayment]);

  const handleCancelOrder = useCallback((orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrder(orderId, 'Cancelled by staff');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    }
  }, [cancelOrder]);

  const handleEndSession = useCallback((tableNumber: number) => {
    if (window.confirm(`End session for Table ${tableNumber}?`)) {
      const tableOrders = orders.filter(o => o.tableNumber === tableNumber && o.status !== 'cancelled');
      const totalBill = tableOrders.reduce((sum, o) => sum + o.total, 0);
      endSession(tableNumber, totalBill);
      updateTableStatus(tableNumber, { isActive: false, hasPendingOrder: false });
      setStats(prev => ({ ...prev, activeTables: Math.max(0, prev.activeTables - 1) }));
    }
  }, [endSession, orders]);

  const handleGrantAccess = useCallback((requestId: string, tableNum: number) => {
    respondToAccess(requestId, true);
    setAccessRequests(prev => prev.filter(r => r.id !== requestId));
    addTelegramMessage(`🎫 ACCESS GRANTED — Table ${tableNum}`);
  }, [respondToAccess]);

  const handleDenyAccess = useCallback((requestId: string) => {
    respondToAccess(requestId, false);
    setAccessRequests(prev => prev.filter(r => r.id !== requestId));
  }, [respondToAccess]);

  const handleProcessRefund = useCallback((requestId: string, approved: boolean) => {
    processRefund(requestId, approved);
    setRefundRequests(prev => prev.filter(r => r.id !== requestId));
  }, [processRefund]);

  const handleSendReply = useCallback(() => {
    if (!selectedTable || !replyMessage.trim()) return;

    const message: ChatMessage = {
      id: generateMessageId(),
      tableNumber: selectedTable,
      sender: 'staff',
      text: replyMessage.trim(),
      timestamp: new Date(),
      senderName: 'Manager'
    };

    setMessages(prev => [...prev, message]);
    sendMessage(message);
    setReplyMessage('');
  }, [replyMessage, selectedTable, sendMessage]);

  useEffect(() => {
    setReplyMessage('');
  }, [selectedTable]);

  const selectedTableMessages = messages.filter(m => m.tableNumber === selectedTable);
  const selectedTableData = tables.find(t => t.number === selectedTable);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const unreadMessageTables = tables.filter(t => t.hasUnreadMessage).length;

  // Button style helpers
  const btnBase = "inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium tracking-wide transition-all duration-200";
  const btnGold = `${btnBase} bg-gradient-to-r from-gold to-gold-light text-dark hover:shadow-[0_4px_20px_rgba(201,168,76,0.4)] hover:-translate-y-0.5`;
  const btnGreen = `${btnBase} bg-green-500 text-white hover:bg-green-400 hover:shadow-[0_4px_20px_rgba(46,204,113,0.4)]`;
  const btnRed = `${btnBase} bg-red-500 text-white hover:bg-red-400 hover:shadow-[0_4px_20px_rgba(231,76,60,0.4)]`;
  const btnBlue = `${btnBase} bg-blue-500 text-white hover:bg-blue-400 hover:shadow-[0_4px_20px_rgba(52,152,219,0.4)]`;
  const btnGray = `${btnBase} bg-white/10 text-cream hover:bg-white/15`;
  const btnDark = `${btnBase} bg-dark-3 border border-gold/20 text-gold hover:bg-gold/10`;

  return (
    <div className="min-h-screen bg-dark flex">
      {/* New Order Alert Banner */}
      {newOrderAlert && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-3 flex items-center justify-between shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-xl">🍾</span>
            <span className="font-semibold tracking-wide text-sm">NEW ORDER RECEIVED</span>
            <span className="text-red-200 text-xs">— Check Live Orders</span>
          </div>
          <button
            type="button"
            onClick={() => { setNewOrderAlert(false); setActiveView('orders'); }}
            className="text-white/80 hover:text-white text-xs underline"
          >
            View Now
          </button>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-56 bg-dark-2 border-r border-gold/10 flex-shrink-0 flex flex-col sticky top-0 h-screen transform transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-white/5">
          <h1 className="font-display text-xl tracking-[0.25em] text-gold">D CUBE'S PLACE</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-cream/30 mt-1">Staff Dashboard</p>
        </div>

        <div className="p-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-cream/25 mb-3">Operations</p>
          <button
            type="button"
            onClick={() => { setActiveView('orders'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              activeView === 'orders'
                ? 'text-cream border-l-2 border-gold bg-gold/6'
                : 'text-cream/50 hover:text-cream border-l-2 border-transparent'
            }`}
          >
            📋 Live Orders
            {pendingOrdersCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('tables'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              activeView === 'tables'
                ? 'text-cream border-l-2 border-gold bg-gold/6'
                : 'text-cream/50 hover:text-cream border-l-2 border-transparent'
            }`}
          >
            🪑 Tables
            {stats.activeTables > 0 && (
              <span className="ml-auto text-gold text-[10px] font-medium">{stats.activeTables}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('messages'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              activeView === 'messages'
                ? 'text-cream border-l-2 border-gold bg-gold/6'
                : 'text-cream/50 hover:text-cream border-l-2 border-transparent'
            }`}
          >
            💬 Messages
            {unreadMessageTables > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                {unreadMessageTables}
              </span>
            )}
          </button>
          <a
            href="/admin"
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-cream/50 hover:text-cream transition-colors block border-l-2 border-transparent"
          >
            ⚙️ Admin Panel
          </a>
        </div>

        <div className="mt-auto p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-amber-700 flex items-center justify-center text-dark text-xs font-medium">
              MGR
            </div>
            <div>
              <p className="text-sm text-cream">Manager</p>
              <p className="text-[10px] text-cream/35">Floor Manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className={`sticky bg-dark/95 backdrop-blur border-b border-white/5 px-4 lg:px-6 py-4 flex items-center justify-between z-20 ${newOrderAlert ? 'top-10' : 'top-0'}`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-cream hover:text-gold transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h2 className="text-sm lg:text-base text-white font-normal">Live Orders & Table Management</h2>
              <p className="text-xs text-cream/35 mt-0.5 hidden sm:block">{new Date().toLocaleDateString()} · Victoria Island, Lagos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <div
              className={`flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1 lg:py-1.5 border rounded-full text-[10px] lg:text-[11px]
                ${telegramEnabled
                  ? 'border-green-500/25 text-green-500'
                  : 'border-white/8 text-cream/40'
                }`}
            >
              📲 <span className="hidden sm:inline">{telegramEnabled === null ? 'Checking...' : telegramEnabled ? 'Telegram' : 'Offline'}</span>
            </div>
            <div className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1 lg:py-1.5 border border-green-500/25 rounded-full text-[10px] lg:text-[11px] text-green-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {stats.activeTables} Tables
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0.5 p-3 lg:p-6">
          <div className="bg-dark-2 p-5 relative overflow-hidden group hover:bg-dark-3 transition-colors cursor-pointer" onClick={() => setActiveView('orders')}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500/80" />
            <p className="text-[10px] tracking-[0.25em] uppercase text-cream/35 mb-2">Pending Orders</p>
            <p className={`font-display text-3xl ${pendingOrdersCount > 0 ? 'text-red-500' : 'text-cream/50'}`}>{pendingOrdersCount}</p>
            <p className="text-[11px] text-cream/30 mt-1">Needs attention</p>
          </div>
          <div className="bg-dark-2 p-5 relative overflow-hidden group hover:bg-dark-3 transition-colors cursor-pointer" onClick={() => setActiveView('tables')}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold/30" />
            <p className="text-[10px] tracking-[0.25em] uppercase text-cream/35 mb-2">Active Tables</p>
            <p className="font-display text-3xl text-gold">{stats.activeTables}</p>
            <p className="text-[11px] text-cream/30 mt-1">of 50 tables</p>
          </div>
          <div className="bg-dark-2 p-5 relative overflow-hidden group hover:bg-dark-3 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500/80" />
            <p className="text-[10px] tracking-[0.25em] uppercase text-cream/35 mb-2">Tonight's Revenue</p>
            <p className="font-display text-3xl text-green-500">₦{(stats.revenue / 1000000).toFixed(2)}M</p>
            <p className="text-[11px] text-cream/30 mt-1">{analytics?.orderCount ?? 0} total orders</p>
          </div>
          <div className="bg-dark-2 p-5 relative overflow-hidden group hover:bg-dark-3 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gold/30" />
            <p className="text-[10px] tracking-[0.25em] uppercase text-cream/35 mb-2">Orders Delivered</p>
            <p className="font-display text-3xl text-white">{stats.delivered}</p>
            <p className="text-[11px] text-cream/30 mt-1">Since start</p>
          </div>
          <div className="bg-dark-2 p-5 relative overflow-hidden group hover:bg-dark-3 transition-colors">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-orange-500/80" />
            <p className="text-[10px] tracking-[0.25em] uppercase text-cream/35 mb-2">Unpaid Orders</p>
            <p className="font-display text-3xl text-orange-500">{stats.unpaidOrders}</p>
            <p className="text-[11px] text-cream/30 mt-1">Awaiting payment</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 px-4 lg:px-6 pb-6">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Access Requests */}
            {accessRequests.length > 0 && (
              <div className="bg-dark-2 rounded-lg border border-gold/10">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">🛎️ Access Requests</p>
                  <span className="text-[10px] text-gold font-medium">{accessRequests.length} pending</span>
                </div>
                <div className="p-4 space-y-2">
                  {accessRequests.map(req => (
                    <div key={req.id} className="bg-dark-3 border border-gold/15 p-4 flex items-center justify-between rounded-lg">
                      <div>
                        <p className="text-sm text-cream font-medium">{getAccessTypeLabel(req.type)}</p>
                        <p className="text-[10px] text-cream/35 mt-1">
                          Table {req.tableNumber} · {req.guestName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleGrantAccess(req.id, req.tableNumber)}
                          className={btnGreen}
                        >
                          ✓ Grant
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDenyAccess(req.id)}
                          className={btnGray}
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
              <div className="bg-dark-2 rounded-lg border border-gold/10">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">🔄 Refund Requests</p>
                  <span className="text-[10px] text-gold font-medium">{refundRequests.length} pending</span>
                </div>
                <div className="p-4 space-y-2">
                  {refundRequests.map(req => (
                    <div key={req.id} className="bg-dark-3 border border-orange-500/15 p-4 flex items-center justify-between rounded-lg">
                      <div>
                        <p className="text-sm text-cream font-medium">Table {req.tableNumber} · {req.guestName}</p>
                        <p className="text-[10px] text-cream/35 mt-1">
                          💰 {formatPrice(req.amount)} · {req.reason}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleProcessRefund(req.id, true)}
                          className={btnGreen}
                        >
                          ✓ Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleProcessRefund(req.id, false)}
                          className={btnRed}
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Orders - shown when activeView is orders or always visible on wide screens */}
            {(activeView === 'orders' || activeView === 'tables') && (
              <div className="bg-dark-2 rounded-lg border border-gold/10">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">📋 Live Orders</p>
                  <button
                    type="button"
                    className="text-[10px] text-gold hover:text-gold-light transition-colors"
                    onClick={() => setOrders(prev => prev.filter(o => !['delivered', 'cancelled', 'refunded'].includes(o.status)))}
                  >
                    Clear Completed
                  </button>
                </div>
                <div>
                  {orders.length === 0 ? (
                    <div className="p-8 text-center text-cream/30 text-sm">
                      No orders yet
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="grid grid-cols-[60px_1fr_auto] gap-4 px-5 py-4 border-b border-white/4 hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="font-display text-3xl text-gold leading-none">{order.tableNumber}</p>
                          <p className="text-[9px] tracking-[0.15em] uppercase text-cream/30 mt-1">Table</p>
                        </div>
                        <div>
                          <p className="text-[13px] text-cream mb-1">👤 {order.guestName}</p>
                          <p className="text-xs text-cream/40 line-clamp-1">
                            {order.items.map(i => `${i.quantity}× ${i.name}`).join(' · ')}
                          </p>
                          <p className="text-xs text-gold mt-1 font-medium">{formatPrice(order.total)}</p>
                          {order.note && (
                            <p className="text-[10px] text-cream/25 mt-1">📝 {order.note}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[9px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full border whitespace-nowrap font-medium
                              ${order.status === 'pending' ? 'bg-red-500/15 text-red-400 border-red-500/30' : ''}
                              ${order.status === 'confirmed' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : ''}
                              ${order.status === 'preparing' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' : ''}
                              ${order.status === 'ready' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : ''}
                              ${order.status === 'delivering' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' : ''}
                              ${order.status === 'delivered' ? 'bg-green-500/12 text-green-400 border-green-500/25' : ''}
                              ${order.status === 'cancelled' ? 'bg-gray-500/15 text-gray-400 border-gray-500/30' : ''}
                              ${order.status === 'refunded' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' : ''}
                            `}>
                              {getStatusLabel(order.status)}
                            </span>
                            <span className={`text-[9px] tracking-[0.12em] uppercase px-2.5 py-1 rounded-full border whitespace-nowrap font-medium
                              ${order.paymentStatus === 'unpaid' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : ''}
                              ${order.paymentStatus === 'paid' ? 'bg-green-500/15 text-green-400 border-green-500/30' : ''}
                              ${order.paymentStatus === 'refunded' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' : ''}
                            `}>
                              {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex gap-1.5 flex-wrap justify-end">
                            {order.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleConfirmOrder(order.id)}
                                className={btnGold}
                              >
                                Confirm
                              </button>
                            )}
                            {order.status === 'confirmed' && (
                              <button
                                type="button"
                                onClick={() => handleMarkDelivering(order.id)}
                                className={btnBlue}
                              >
                                On Way
                              </button>
                            )}
                            {order.status === 'delivering' && (
                              <button
                                type="button"
                                onClick={() => handleMarkDone(order.id, order.tableNumber)}
                                className={btnGreen}
                              >
                                Delivered
                              </button>
                            )}
                            {order.paymentStatus === 'unpaid' && order.status !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => handleMarkPaid(order.id)}
                                className={btnDark}
                              >
                                💳 Paid
                              </button>
                            )}
                            {order.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleCancelOrder(order.id)}
                                className={btnRed}
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleSelectTable(order.tableNumber)}
                              className={btnGray}
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
            )}

            {/* Analytics Section */}
            {analytics && activeView === 'orders' && (
              <div className="bg-dark-2 rounded-lg border border-gold/10">
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">📊 Analytics</p>
                </div>
                <div className="p-5 space-y-6">
                  <div>
                    <h3 className="text-sm text-cream mb-3 font-medium">Top Selling Items</h3>
                    <div className="space-y-2">
                      {analytics.topSellingItems.slice(0, 5).map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-cream/70">{i + 1}. {item.name}</span>
                          <span className="text-gold font-medium">{formatPrice(item.revenue)} ({item.quantity} sold)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm text-cream mb-3 font-medium">Category Breakdown</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {analytics.categoryBreakdown.map(cat => (
                        <div key={cat.category} className="bg-dark-3 p-3 rounded-lg">
                          <p className="text-[10px] text-cream/40 uppercase">{cat.category}</p>
                          <p className="text-sm text-gold font-semibold">{formatPrice(cat.revenue)}</p>
                          <p className="text-[10px] text-cream/30">{cat.count} items</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm text-cream mb-3 font-medium">Top Tables by Revenue</h3>
                    <div className="space-y-2">
                      {analytics.tablePerformance.slice(0, 5).map((table, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-cream/70">🪑 Table {table.tableNumber}</span>
                          <span className="text-gold font-medium">{formatPrice(table.revenue)} ({table.orders} orders)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Tables Grid */}
            {(activeView === 'tables' || activeView === 'orders') && (
              <div className="bg-dark-2 rounded-lg border border-gold/10">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">🪑 Tables</p>
                  <span className="text-[10px] text-cream/40">{stats.activeTables} active</span>
                </div>
                <div className="grid grid-cols-5 gap-0.5 p-4">
                  {tables.slice(0, 30).map(table => (
                    <div key={table.number} className="relative">
                      <button
                        type="button"
                        onClick={() => handleSelectTable(table.number)}
                        className={`w-full p-2.5 text-center border transition-all duration-200 relative
                          ${table.isActive
                            ? 'bg-dark-3 border-gold/40 hover:bg-dark-2'
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
                          <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full animate-pulse ${table.hasUnreadMessage ? 'bg-blue-400' : 'bg-red-500'}`} />
                        )}
                      </button>
                      {table.isActive && (
                        <button
                          type="button"
                          onClick={() => handleEndSession(table.number)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[8px] rounded-full
                                     flex items-center justify-center hover:bg-red-400 transition-colors shadow-lg"
                          title="End Session"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat */}
            {(activeView === 'messages' || selectedTable !== null) && (
              <div className="bg-dark-2 rounded-lg border border-gold/10">
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">💬 Chat</p>
                  {selectedTable ? (
                    <p className="text-[11px] text-gold mt-1">
                      Table {selectedTable} · {selectedTableData?.guestName || 'Guest'}
                    </p>
                  ) : (
                    <p className="text-[11px] text-cream/30 mt-1">Select a table to view messages</p>
                  )}
                </div>

                {/* Table selector for messages view */}
                {activeView === 'messages' && (
                  <div className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-white/5">
                    {tables.filter(t => messages.some(m => m.tableNumber === t.number)).map(t => (
                      <button
                        key={t.number}
                        type="button"
                        onClick={() => handleSelectTable(t.number)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                          selectedTable === t.number
                            ? 'bg-gold text-dark font-semibold'
                            : 'bg-dark-3 text-cream/60 hover:bg-dark-2 border border-white/5'
                        }`}
                      >
                        T{t.number}
                        {t.hasUnreadMessage && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        )}
                      </button>
                    ))}
                    {!tables.some(t => messages.some(m => m.tableNumber === t.number)) && (
                      <p className="text-cream/30 text-xs py-1">No conversations yet</p>
                    )}
                  </div>
                )}

                <div className="h-64 overflow-y-auto p-4 space-y-2">
                  {!selectedTable ? (
                    <p className="text-center text-cream/30 text-sm py-8">Select a table to view chat</p>
                  ) : selectedTableMessages.length === 0 ? (
                    <p className="text-center text-cream/30 text-sm py-8">No messages</p>
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
                          <p className="text-[9px] text-gold uppercase tracking-wide mb-1 font-medium">{msg.senderName}</p>
                        )}
                        <p className="text-cream/90">{msg.text}</p>
                        <p className="text-[9px] text-cream/30 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                      </div>
                    ))
                  )}
                </div>
                {selectedTable && (
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
                      placeholder={`Reply to Table ${selectedTable}...`}
                      className="flex-1 bg-dark-3 border border-white/6 rounded-lg px-3 py-2 text-xs text-cream
                                 focus:border-gold/35 focus:outline-none placeholder:text-cream/20"
                    />
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={!replyMessage.trim()}
                      className="w-8 h-8 rounded-lg bg-gold text-dark flex items-center justify-center text-xs hover:bg-gold-light transition-colors disabled:opacity-50"
                    >
                      ➤
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Telegram Feed */}
            <div className="bg-dark-2 rounded-lg border border-gold/10">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <p className="text-[11px] tracking-[0.2em] uppercase text-cream/50">📲 Activity Feed</p>
                <span className="text-[10px] text-cream/30">Last {telegramMessages.length} events</span>
              </div>
              <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                {telegramMessages.length === 0 ? (
                  <p className="text-center text-cream/30 text-xs py-4">No activity yet</p>
                ) : (
                  telegramMessages.map((msg, i) => (
                    <div key={i} className="bg-dark-3 border border-blue-500/15 rounded-lg p-3 text-xs text-cream/70 whitespace-pre-line font-mono">
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
