import React from 'react';
import { useTable } from '@/context/TableContext';
import { getStatusLabel, getStatusColor } from '@/utils/format';

const STATUS_FLOW = [
  { key: 'pending', label: 'Pending', icon: '⏳' },
  { key: 'confirmed', label: 'Confirmed', icon: '✓' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'ready', label: 'Ready', icon: '✓' },
  { key: 'delivering', label: 'On Its Way', icon: '🚶' },
  { key: 'delivered', label: 'Delivered', icon: '✓' }
];

export const OrderStatus: React.FC = () => {
  const { orders } = useTable();
  
  const latestOrder = orders.length > 0 ? orders[orders.length - 1] : null;
  
  if (!latestOrder) return null;

  const currentStatusIndex = STATUS_FLOW.findIndex(s => s.key === latestOrder.status);

  return (
    <div className="px-5 pb-5">
      <div className="bg-dark-2 border border-white/5 rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs tracking-[0.1em] uppercase text-cream/50">YOUR ORDER</span>
          <span className={`text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full border
                          ${getStatusColor(latestOrder.status)}`}>
            {getStatusLabel(latestOrder.status)}
          </span>
        </div>
        
        {/* Items Preview */}
        <p className="text-sm text-cream mb-4 line-clamp-2">
          {latestOrder.items.map(i => i.name).join(', ')}
        </p>

        {/* Status Flow */}
        <div className="flex items-center justify-between">
          {STATUS_FLOW.map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            
            return (
              <div key={status.key} className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm mb-1
                             transition-colors duration-300
                             ${isCompleted 
                               ? 'bg-gold text-dark' 
                               : 'bg-dark-3 text-cream/30 border border-white/10'
                             }
                             ${isCurrent ? 'ring-2 ring-gold/50' : ''}`}
                >
                  {status.icon}
                </div>
                <span className={`text-[9px] tracking-wide ${isCompleted ? 'text-cream/70' : 'text-cream/30'}`}>
                  {status.label}
                </span>
                
                {/* Connector line */}
                {index < STATUS_FLOW.length - 1 && (
                  <div 
                    className={`absolute w-4 h-0.5 ml-8 mt-3.5
                               ${index < currentStatusIndex ? 'bg-gold' : 'bg-white/10'}`}
                    style={{ width: 'calc(100% / 6 - 32px)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
