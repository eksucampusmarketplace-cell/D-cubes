import React, { useState } from 'react';
import { useTable } from '@/context/TableContext';
import { useSocket } from '@/context/SocketContext';
import { generateRequestId } from '@/utils/format';
import type { AccessRequest } from '@/types';

const ACCESS_OPTIONS = [
  { id: 'pool-spa', icon: '🏊', label: 'Pool & Spa' },
  { id: 'lounge-entry', icon: '🛋️', label: 'Lounge Entry' },
  { id: 'vip-dance', icon: '🎵', label: 'VIP Dance Floor' },
  { id: 'call-waiter', icon: '🛎️', label: 'Call a Waiter' },
  { id: 'extra-ice', icon: '🧊', label: 'Extra Ice/Cups' },
  { id: 'bill-request', icon: '🧾', label: 'Bill Request' },
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

    // Show success state temporarily
    setTimeout(() => {
      setSentId(null);
      setSelectedId(null);
    }, 3000);
  };

  return (
    <div className="mx-5 mb-6 p-5 bg-gradient-to-br from-gold/8 to-gold/3 border border-gold/20 rounded">
      <h3 className="font-serif text-lg text-white mb-1">Request Access or Assistance</h3>
      <p className="text-xs text-cream/40 mb-4 leading-relaxed">
        Need something? Select what you need and our staff will come to you.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {ACCESS_OPTIONS.map(option => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`p-3 text-center rounded transition-all duration-200 border
                       ${selectedId === option.id 
                         ? 'border-gold bg-gold/8' 
                         : 'border-white/5 bg-dark-2 hover:border-gold/50'
                       }`}
          >
            <div className="text-xl mb-1">{option.icon}</div>
            <div className="text-xs text-cream tracking-wide">{option.label}</div>
          </button>
        ))}
      </div>

      <button
        onClick={handleRequest}
        disabled={!selectedId || sentId !== null}
        className={`w-full py-3.5 rounded text-xs tracking-[0.2em] uppercase transition-all duration-300
                   ${sentId 
                     ? 'bg-green-500 text-white border border-green-500' 
                     : 'bg-transparent border border-gold text-gold hover:bg-gold hover:text-dark'
                   } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {sentId ? '✓ REQUEST SENT!' : 'SEND REQUEST TO STAFF →'}
      </button>
    </div>
  );
};
