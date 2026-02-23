import React, { useState } from 'react';
import { useSocket } from '@/context/SocketContext';
/// <reference path="../vite-env.d.ts" />

type StaffRole = 'manager' | 'kitchen' | 'bar';

const DEFAULT_PINS: Record<StaffRole, string> = {
  manager: '0000',
  kitchen: '1111',
  bar: '2222'
};

interface StaffAuthProps {
  role: StaffRole;
  children: React.ReactNode;
}

export const StaffAuth: React.FC<StaffAuthProps> = ({ role, children }) => {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const { isConnected } = useSocket();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();

    let correctPin = DEFAULT_PINS[role];
    if (role === 'manager' && import.meta.env.VITE_STAFF_MANAGER_PIN) {
      correctPin = import.meta.env.VITE_STAFF_MANAGER_PIN;
    } else if (role === 'kitchen' && import.meta.env.VITE_STAFF_KITCHEN_PIN) {
      correctPin = import.meta.env.VITE_STAFF_KITCHEN_PIN;
    } else if (role === 'bar' && import.meta.env.VITE_STAFF_BAR_PIN) {
      correctPin = import.meta.env.VITE_STAFF_BAR_PIN;
    }

    if (pin === correctPin) {
      setAuthenticated(true);
      setError('');
      localStorage.setItem(`velour_auth_${role}`, new Date().toISOString());
    } else {
      setError('Invalid PIN code');
      setPin('');
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPin('');
    localStorage.removeItem(`velour_auth_${role}`);
  };

  React.useEffect(() => {
    const storedAuth = localStorage.getItem(`velour_auth_${role}`);
    if (storedAuth) {
      const authTime = new Date(storedAuth);
      const now = new Date();
      const hoursDiff = (now.getTime() - authTime.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 8) {
        setAuthenticated(true);
      } else {
        localStorage.removeItem(`velour_auth_${role}`);
      }
    }
  }, [role]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cream/50 text-sm">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="bg-dark-2 border border-gold/20 rounded-lg p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl tracking-[0.3em] text-gold mb-2">VELOUR</h1>
            <p className="text-[10px] tracking-[0.2em] uppercase text-cream/30">Staff Authentication</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-cream/70 text-center mb-4">
              Enter PIN for <span className="text-gold font-medium capitalize">{role}</span> access
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                  setError('');
                }}
                placeholder="••••"
                className="w-full text-center text-3xl tracking-[0.5em] p-4 bg-dark border border-white/10 rounded-lg text-cream
                         focus:border-gold/50 focus:outline-none transition-colors"
                maxLength={4}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={pin.length !== 4}
              className="w-full bg-gold text-dark font-medium py-3 rounded-lg text-xs tracking-[0.2em] uppercase
                         hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Access Dashboard
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-cream/30">
              Unauthorized access is prohibited and monitored
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Authenticated Header */}
      <div className="fixed top-0 right-0 z-50 m-4 flex items-center gap-2">
        <span className="text-[10px] text-cream/40">Authenticated as</span>
        <span className="text-xs text-gold capitalize">{role}</span>
        <button
          onClick={handleLogout}
          className="ml-2 text-[10px] text-cream/40 hover:text-cream transition-colors"
          title="Logout"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  );
};
