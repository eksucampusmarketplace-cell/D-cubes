import React from 'react';
import { useTable } from '@/context/TableContext';
import { getStatusLabel, getStatusColor, formatPrice } from '@/utils/format';

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

export const OrderStatus: React.FC = () => {
  const { orders } = useTable();
  
  const activeOrders = orders.filter(o => !['delivered', 'cancelled', 'refunded'].includes(o.status));
  
  if (activeOrders.length === 0) return null;

  return (
    <div className="px-5 py-4">
      <div className="space-y-4">
        {activeOrders.map(order => {
          const currentStatusIndex = STATUS_FLOW.findIndex(s => s.key === order.status);
          
          return (
            <div key={order.id} className="luxury-card rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-gold/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <span className="text-lg">📋</span>
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.15em] uppercase text-cream/40">Order {order.id.slice(-6)}</p>
                    <p className="font-serif text-base text-white">{formatPrice(order.total)}</p>
                  </div>
                </div>
                <span className={`text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border
                                ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              
              {/* Items Preview */}
              <div className="px-5 py-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {order.items.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-2 border border-gold/10">
                      <img 
                        src={item.image || CATEGORY_IMAGES[item.category]}
                        alt={item.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs text-cream/70">{item.quantity}× {item.name}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span className="text-xs text-cream/40 self-center">+{order.items.length - 3} more</span>
                  )}
                </div>

                {/* Status Flow */}
                <div className="relative">
                  <div className="flex items-center justify-between relative">
                    {/* Progress Line Background */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-dark-3" />
                    
                    {/* Progress Line Active */}
                    <div 
                      className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-gold to-gold-light transition-all duration-500"
                      style={{ width: `${(currentStatusIndex / (STATUS_FLOW.length - 1)) * 100}%` }}
                    />
                    
                    {STATUS_FLOW.map((status, index) => {
                      const isCompleted = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;
                      
                      return (
                        <div key={status.key} className="flex flex-col items-center relative z-10">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-2
                                       transition-all duration-300
                                       ${isCompleted 
                                         ? 'bg-gradient-to-br from-gold to-gold-dark text-dark shadow-gold' 
                                         : 'bg-dark-3 text-cream/30 border border-gold/10'
                                       }
                                       ${isCurrent ? 'ring-2 ring-gold/50 ring-offset-2 ring-offset-dark-4 scale-110' : ''}`}
                          >
                            {status.icon}
                          </div>
                          <span className={`text-[9px] tracking-wider text-center ${isCompleted ? 'text-gold' : 'text-cream/30'}`}>
                            {status.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
