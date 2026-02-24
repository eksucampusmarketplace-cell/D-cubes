import React, { useState, useCallback, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
/// <reference path="../vite-env.d.ts" />

type StaffRole = 'manager' | 'kitchen' | 'bar';

const DEFAULT_PINS: Record<StaffRole, string> = {
  manager: '0000',
  kitchen: '1111',
  bar: '2222'
};

const ROLE_COLORS: Record<StaffRole, string> = {
  manager: 'from-gold/30 to-amber-600/20',
  kitchen: 'from-orange-500/30 to-red-500/20',
  bar: 'from-blue-500/30 to-cyan-500/20',
};

const ROLE_ICONS: Record<StaffRole, string> = {
  manager: '👔',
  kitchen: '👨‍🍳',
  bar: '🍸',
};

interface StaffAuthProps {
  role: StaffRole;
  children: React.ReactNode;
}

export const StaffAuth: React.FC<StaffAuthProps> = ({ role, children }) => {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const { isConnected } = useSocket();

  const handleAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (pin.length !== 4) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 400));

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
      localStorage.setItem(`dcubes_auth_${role}`, new Date().toISOString());
    } else {
      setError('Invalid PIN code');
      setPin('');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
    setIsSubmitting(false);
  }, [pin, role]);

  const handleLogout = useCallback(() => {
    setAuthenticated(false);
    setPin('');
    localStorage.removeItem(`dcubes_auth_${role}`);
  }, [role]);

  const handlePinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
    if (error) setError('');
  }, [error]);

  useEffect(() => {
    const storedAuth = localStorage.getItem(`dcubes_auth_${role}`);
    if (storedAuth) {
      const authTime = new Date(storedAuth);
      const now = new Date();
      const hoursDiff = (now.getTime() - authTime.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < 8) {
        setAuthenticated(true);
      } else {
        localStorage.removeItem(`dcubes_auth_${role}`);
      }
    }
  }, [role]);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-5" />
          <p className="text-cream/50 text-sm">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br ${ROLE_COLORS[role]} rounded-full blur-[120px] opacity-50`} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/5 rounded-full blur-[100px]" />
        </div>

        <div className={`relative bg-dark-2 border border-gold/20 rounded-2xl p-8 w-full max-w-md shadow-[0_25px_80px_rgba(0,0,0,0.6)]
                        ${shake ? 'animate-shake' : ''}`}>
          {/* Logo */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${ROLE_COLORS[role]} border border-gold/30 
                          flex items-center justify-center mb-4 shadow-[0_10px_40px_rgba(201,168,76,0.2)]`}>
              <span className="text-4xl">{ROLE_ICONS[role]}</span>
            </div>
            <h1 className="font-display text-3xl tracking-[0.25em] text-gold mb-2">D CUBE'S PLACE</h1>
            <p className="text-[10px] tracking-[0.2em] uppercase text-cream/30">Staff Authentication</p>
          </div>

          {/* Role Badge */}
          <div className="mb-8">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${ROLE_COLORS[role]} border border-gold/20`}>
              <span className="text-lg">{ROLE_ICONS[role]}</span>
              <span className="text-sm text-gold font-medium capitalize tracking-wide">{role} Access</span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="text-xs text-cream/40 uppercase tracking-wider mb-3 block text-center">
                Enter 4-digit PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="••••"
                  className="w-full text-center text-4xl tracking-[0.6em] p-5 bg-dark border border-gold/20 rounded-xl text-cream
                           focus:border-gold focus:outline-none transition-all duration-300
                           shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]"
                  maxLength={4}
                  autoFocus
                />
                {/* Pin dots indicator */}
                <div className="flex justify-center gap-3 mt-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        i < pin.length ? 'bg-gold scale-110' : 'bg-gold/20'
                      }`} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-sm animate-fade-in">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pin.length !== 4 || isSubmitting}
              className="w-full btn-luxury py-4 text-xs"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  VERIFYING...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  ACCESS DASHBOARD
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-cream/30">
              Unauthorized access is prohibited and monitored
            </p>
          </div>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Authenticated Header */}
      <div className="fixed top-0 right-0 z-50 m-4 flex items-center gap-3 bg-dark-2/90 backdrop-blur border border-gold/20 rounded-full px-4 py-2
                    shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <span className="text-[10px] text-cream/50">Authenticated as</span>
        <span className={`text-xs font-semibold capitalize px-2 py-1 rounded-full bg-gradient-to-r ${ROLE_COLORS[role]} text-gold`}>
          {ROLE_ICONS[role]} {role}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="ml-1 w-7 h-7 rounded-full bg-gold/10 hover:bg-red-500/20 flex items-center justify-center text-cream/50 hover:text-red-400 transition-all"
          title="Logout"
          aria-label="Logout"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  );
};
