import React, { useState } from 'react';
import { useTable } from '@/context/TableContext';

interface CheckInScreenProps {
  onCheckIn: () => void;
}

export const CheckInScreen: React.FC<CheckInScreenProps> = ({ onCheckIn }) => {
  const { tableNumber, checkIn, hasError } = useTable();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsLoading(true);
    
    // Simulate brief delay for effect
    await new Promise(resolve => setTimeout(resolve, 800));
    
    checkIn(name.trim());
    onCheckIn();
    setIsLoading(false);
  };

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-dark-4 via-dark to-dark-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-6">⚠️</div>
          <h1 className="font-serif text-3xl text-white mb-4">Invalid Table</h1>
          <p className="text-cream/50 text-sm leading-relaxed">
            Please scan the QR code on your table to access the ordering system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-dark-4 via-dark to-dark-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Logo */}
      <div className="text-center mb-4 opacity-0 animate-fade-down">
        <h1 className="font-display text-5xl tracking-[0.4em] text-gold">VELOUR</h1>
        <p className="text-xs tracking-[0.3em] uppercase text-gold/50 mt-2">
          Members Club · Lagos
        </p>
      </div>

      {/* Table Badge */}
      <div className="relative mb-10 opacity-0 animate-fade-down animate-delay-100">
        <div className="w-36 h-36 rounded-full border border-gold/30 flex flex-col items-center justify-center animate-pulse-gold relative">
          <div className="absolute inset-0 rounded-full border border-gold/10 -m-2" />
          <span className="font-display text-6xl text-gold leading-none">{tableNumber}</span>
          <span className="text-xs tracking-[0.3em] uppercase text-cream/40 mt-2">Your Table</span>
        </div>
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-8 opacity-0 animate-fade-up animate-delay-200">
        <h2 className="font-serif text-2xl text-white mb-2">
          Welcome to <em className="text-gold not-italic">Table {tableNumber}</em>
        </h2>
        <p className="text-cream/50 text-sm leading-relaxed max-w-[280px]">
          Enter your name to check in and start ordering. Our staff will be notified of your arrival.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4 opacity-0 animate-fade-up animate-delay-300">
        <div className={`transition-all duration-300 ${shake ? 'animate-pulse border-red-500' : ''}`}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name or party name"
            maxLength={40}
            className="w-full bg-dark-2 border border-gold/20 rounded px-5 py-4 text-cream placeholder:text-cream/25 
                       focus:border-gold focus:outline-none transition-colors text-base"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gold text-dark font-medium py-4 rounded text-xs tracking-[0.2em] uppercase
                     hover:bg-gold-light active:translate-y-0 transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transform hover:-translate-y-0.5"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
              CHECKING IN...
            </span>
          ) : (
            <span>✦ CHECK IN & ORDER</span>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="absolute bottom-8 text-center opacity-0 animate-fade-up animate-delay-400">
        <p className="text-xs text-cream/25">
          Built by{' '}
          <a 
            href="https://wa.me/2348174143260" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gold/60 hover:text-gold transition-colors"
          >
            Toluwase Christopher
          </a>
        </p>
      </div>
    </div>
  );
};
