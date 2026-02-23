import React from 'react';
import { useTable } from '@/context/TableContext';
import { getStatusLabel, formatPrice } from '@/utils/format';

const STATUS_FLOW = [
  { key: 'pending', label: 'Pending', icon: '⏳' },
  { key: 'confirmed', label: 'Confirmed', icon: '✓' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'ready', label: 'Ready', icon: '🔔' },
  { key: 'delivering', label: 'On Way', icon: '🚶' },
  { key: 'delivered', label: 'Delivered', icon: '✓' }
];

const CATEGORY_IMAGES: Record<string, string> = {
  cocktails: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=100&auto=format&fit=crop&q=80',
  spirits: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=100&auto=format&fit=crop&q=80',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=100&auto=format&fit=crop&q=80',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&auto=format&fit=crop&q=80',
  shisha: 'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=100&auto=format&fit=crop&q=80',
  nonalc: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=100&auto=format&fit=crop&q=80',
};

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  pending: { 
    bg: 'bg-red-500/10', 
    border: 'border-red-500/30', 
    text: 'text-red-400',
    glow: 'shadow-red-500/20'
  },
  confirmed: { 
    bg: 'bg-orange-500/10', 
    border: 'border-orange-500/30', 
    text: 'text-orange-400',
    glow: 'shadow-orange-500/20'
  },
  preparing: { 
    bg: 'bg-yellow-500/10', 
    border: 'border-yellow-500/30', 
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/20'
  },
  ready: { 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/30', 
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20'
  },
  delivering: { 
    bg: 'bg-cyan-500/10', 
    border: 'border-cyan-500/30', 
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/20'
  },
  delivered: { 
    bg: 'bg-green-500/10', 
    border: 'border-green-500/30', 
    text: 'text-green-400',
    glow: 'shadow-green-500/20'
  },
};

export const OrderStatus: React.FC = () => {
  const { orders } = useTable();
  
  const activeOrders = orders.filter(o => !['delivered', 'cancelled', 'refunded'].includes(o.status));
  
  if (activeOrders.length === 0) return null;

  return (
    <div className="px-5 py-4">
      <div className="space-y-4">
        {activeOrders.map((order) => {
          const currentStatusIndex = STATUS_FLOW.findIndex(s => s.key === order.status);
          const colors = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
          
          return (
            <div key={order.id} className="luxury-card rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gold/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/25 flex items-center justify-center">
                    <span className="text-lg">📋</span>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-cream/40">Order #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="font-serif text-lg text-white font-medium">{formatPrice(order.total)}</p>
                  </div>
                </div>
                <span className={`text-[10px] tracking-[0.15em] uppercase px-4 py-2 rounded-full border font-semibold
                                ${colors.bg} ${colors.border} ${colors.text} ${colors.glow} shadow-lg`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              
              {/* Items Preview */}
              <div className="px-5 py-5">
                <div className="flex flex-wrap gap-2 mb-5">
                  {order.items.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-full bg-dark-2 border border-gold/10">
                      <img 
                        src={item.image || CATEGORY_IMAGES[item.category]}
                        alt={item.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs text-cream/70">{item.quantity}× {item.name}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-xs text-cream/40 self-center px-2">+{order.items.length - 3} more</span>
                  )}
                </div>

                {/* Status Flow */}
                <div className="relative">
                  <div className="flex items-center justify-between relative">
                    {/* Progress Line Background */}
                    <div className="absolute top-[18px] left-0 right-0 h-1 bg-dark-3 rounded-full" />
                    
                    {/* Progress Line Active */}
                    <div 
                      className="absolute top-[18px] left-0 h-1 bg-gradient-to-r from-gold to-gold-light rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${(currentStatusIndex / (STATUS_FLOW.length - 1)) * 100}%` }}
                    />
                    
                    {STATUS_FLOW.map((status, index) => {
                      const isCompleted = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;
                      
                      return (
                        <div key={status.key} className="flex flex-col items-center relative z-10">
                          <div 
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm mb-2
                                       transition-all duration-500
                                       ${isCompleted 
                                         ? 'bg-gradient-to-br from-gold to-gold-dark text-dark shadow-[0_0_20px_rgba(201,168,76,0.4)]' 
                                         : 'bg-dark-3 text-cream/30 border border-gold/10'
                                       }
                                       ${isCurrent ? 'ring-4 ring-gold/20 scale-110' : ''}`}
                          >
                            {status.icon}
                          </div>
                          <span className={`text-[9px] tracking-wider text-center font-medium transition-colors duration-300
                                           ${isCompleted ? 'text-gold' : 'text-cream/30'}`}>
                            {status.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ETA Message */}
                {order.status !== 'delivered' && (
                  <div className="mt-5 p-4 rounded-xl bg-dark-2/50 border border-gold/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                        <span className="text-sm">⏱️</span>
                      </div>
                      <div>
                        <p className="text-sm text-cream/80">
                          {order.status === 'pending' && 'Your order is being reviewed by staff'}
                          {order.status === 'confirmed' && 'Order confirmed! Preparation starting soon'}
                          {order.status === 'preparing' && 'Our chefs are preparing your order now'}
                          {order.status === 'ready' && 'Your order is ready for pickup/delivery'}
                          {order.status === 'delivering' && 'A waiter is bringing your order now'}
                        </p>
                        <p className="text-xs text-gold mt-1">
                          {order.status === 'pending' && 'Usually confirmed within 2 minutes'}
                          {order.status === 'confirmed' && 'Estimated: 10-15 minutes'}
                          {order.status === 'preparing' && 'Almost ready...'}
                          {order.status === 'ready' && 'Please wait for your waiter'}
                          {order.status === 'delivering' && 'Arriving at your table shortly'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
