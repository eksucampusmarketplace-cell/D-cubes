import React, { useState } from 'react';
import { useTable } from '@/context/TableContext';
import { useSocket } from '@/context/SocketContext';
import { generateRequestId } from '@/utils/format';
import type { AccessRequest } from '@/types';

const ACCESS_OPTIONS = [
  { id: 'pool-spa', icon: '🏊', label: 'Pool & Spa', desc: 'Access pool area' },
  { id: 'lounge-entry', icon: '🛋️', label: 'Lounge Entry', desc: 'VIP lounge access' },
  { id: 'vip-dance', icon: '🎵', label: 'VIP Dance Floor', desc: 'Dance floor entry' },
  { id: 'call-waiter', icon: '🛎️', label: 'Call a Waiter', desc: 'Staff assistance' },
  { id: 'extra-ice', icon: '🧊', label: 'Extra Ice/Cups', desc: 'Additional supplies' },
  { id: 'bill-request', icon: '🧾', label: 'Bill Request', desc: 'Request your bill' },
];

export const AccessRequests: React.FC = () => {
  const { tableNumber, guestName } = useTable();
  const { sendAccessRequest } = useSocket();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleRequest = () => {
    if (!selectedId || !tableNumber) return;

    const request: AccessRequest = {
      id: generateRequestId(),
      tableNumber,
      guestName,
      type: selectedId as AccessRequest['type'],
      status: 'pending',
      timestamp: new Date()
    };

    sendAccessRequest(request);
    setSentId(selectedId);

    setTimeout(() => {
      setSentId(null);
      setSelectedId(null);
    }, 3000);
  };

  return (
    <div className="px-5 py-4">
      <div className="luxury-card rounded-2xl p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
            <span className="text-lg">🛎️</span>
          </div>
          <div>
            <h3 className="font-serif text-xl text-white">Quick Requests</h3>
            <p className="text-xs text-cream/40">Tap to request staff assistance</p>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {ACCESS_OPTIONS.map(option => (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`p-4 rounded-xl transition-all duration-300 text-left group
                         ${selectedId === option.id 
                           ? 'bg-gold/15 border border-gold/40 shadow-gold/10' 
                           : 'bg-dark-2/50 border border-gold/10 hover:border-gold/25'
                         }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl group-hover:scale-110 transition-transform">{option.icon}</span>
                <span className="text-sm text-white font-medium">{option.label}</span>
              </div>
              <p className="text-[10px] text-cream/40">{option.desc}</p>
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleRequest}
          disabled={!selectedId || sentId !== null}
          className={`w-full py-4 rounded-xl text-xs tracking-[0.2em] uppercase font-medium transition-all duration-300
                     ${sentId 
                       ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                       : selectedId
                         ? 'btn-luxury'
                         : 'bg-dark-2/50 border border-gold/20 text-cream/40 cursor-not-allowed'
                     }`}
        >
          {sentId ? (
            <span className="flex items-center justify-center gap-2">
              <span>✓</span>
              <span>REQUEST SENT!</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>📲</span>
              <span>SEND REQUEST</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
