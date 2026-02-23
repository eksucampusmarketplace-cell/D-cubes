import React, { useState, useCallback } from 'react';
import { useTable } from '@/context/TableContext';
import { useSocket } from '@/context/SocketContext';
import { generateRequestId } from '@/utils/format';
import type { AccessRequest } from '@/types';

const ACCESS_OPTIONS = [
  { id: 'pool-spa', icon: '🏊', label: 'Pool & Spa', desc: 'Access pool area', color: 'from-cyan-500/20 to-blue-500/20' },
  { id: 'lounge-entry', icon: '🛋️', label: 'Lounge Entry', desc: 'VIP lounge access', color: 'from-gold/20 to-amber-500/20' },
  { id: 'vip-dance', icon: '🎵', label: 'VIP Dance Floor', desc: 'Dance floor entry', color: 'from-purple-500/20 to-pink-500/20' },
  { id: 'call-waiter', icon: '🛎️', label: 'Call a Waiter', desc: 'Staff assistance', color: 'from-emerald-500/20 to-green-500/20' },
  { id: 'extra-ice', icon: '🧊', label: 'Extra Ice/Cups', desc: 'Additional supplies', color: 'from-blue-500/20 to-cyan-500/20' },
  { id: 'bill-request', icon: '🧾', label: 'Bill Request', desc: 'Request your bill', color: 'from-rose-500/20 to-red-500/20' },
];

export const AccessRequests: React.FC = () => {
  const { tableNumber, guestName } = useTable();
  const { sendAccessRequest } = useSocket();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = useCallback((id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sentId) {
      setSelectedId(id === selectedId ? null : id);
    }
  }, [selectedId, sentId]);

  const handleRequest = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedId || !tableNumber || sentId) return;

    setIsSubmitting(true);

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
      setIsSubmitting(false);
    }, 3000);
  }, [selectedId, tableNumber, guestName, sendAccessRequest, sentId]);

  return (
    <div className="px-5 py-4">
      <div className="luxury-card rounded-2xl p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/25 flex items-center justify-center
                          shadow-[0_4px_20px_rgba(201,168,76,0.15)]">
            <span className="text-xl">🛎️</span>
          </div>
          <div>
            <h3 className="font-serif text-xl text-white">Quick Requests</h3>
            <p className="text-xs text-cream/40">Tap to request staff assistance</p>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {ACCESS_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={handleSelect(option.id)}
              disabled={!!sentId}
              className={`p-4 rounded-xl transition-all duration-300 text-left group relative overflow-hidden
                         ${selectedId === option.id 
                           ? 'bg-gradient-to-br from-gold/20 to-gold/8 border-2 border-gold/50 shadow-[0_0_30px_rgba(201,168,76,0.2)]' 
                           : 'bg-dark-2/50 border border-gold/10 hover:border-gold/30'
                         }
                         ${sentId ? 'opacity-60' : ''}`}
            >
              {/* Background gradient on hover/active */}
              <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300
                             ${selectedId === option.id ? 'opacity-100' : ''}`} />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl transition-transform duration-300 group-hover:scale-110">{option.icon}</span>
                  <span className="text-sm text-white font-medium">{option.label}</span>
                </div>
                <p className="text-[10px] text-cream/40">{option.desc}</p>
              </div>
              
              {/* Selected indicator */}
              {selectedId === option.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                  <svg className="w-3 h-3 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleRequest}
          disabled={!selectedId || sentId !== null || isSubmitting}
          className={`w-full py-4 rounded-xl text-xs tracking-[0.2em] uppercase font-semibold transition-all duration-300
                     ${sentId 
                       ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30' 
                       : selectedId
                         ? 'btn-luxury'
                         : 'bg-dark-2/50 border border-gold/20 text-cream/40 cursor-not-allowed'
                     }`}
        >
          {sentId ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              <span>REQUEST SENT!</span>
            </span>
          ) : isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>SENDING...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>SEND REQUEST</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
