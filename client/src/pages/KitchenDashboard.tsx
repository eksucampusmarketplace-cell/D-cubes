import React, { useState, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { Order, OrderStatus } from '@/types';
import { formatPrice, formatTime, getStatusLabel } from '@/utils/format';

export const KitchenDashboard: React.FC = () => {
  const { socket, joinStaff, updateOrderStatus } = useSocket();
  const [foodOrders, setFoodOrders] = useState<Order[]>([]);

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
    });

    socket.on('order-status-update', ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      setFoodOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    });

    return () => {
      socket.off('new-order');
      socket.off('order-status-update');
    };
  }, [socket]);

  const handleMarkPreparing = (orderId: string) => {
    updateOrderStatus(orderId, 'preparing');
  };

  const handleMarkReady = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
  };

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="sticky top-0 bg-dark/95 backdrop-blur border-b border-gold/20 px-8 py-6 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-4xl tracking-[0.3em] text-gold">VELOUR</h1>
            <div className="h-8 w-px bg-gold/30" />
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
            <div className="text-right">
              <p className="font-display text-3xl text-gold">{foodOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length}</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-cream/35">Pending Orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="p-8">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
