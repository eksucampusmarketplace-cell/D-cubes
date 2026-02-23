import React, { useState } from 'react';
import { useTable } from '@/context/TableContext';

interface CheckInScreenProps {
  onCheckIn: () => void;
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop&q=80',
];

export const CheckInScreen: React.FC<CheckInScreenProps> = ({ onCheckIn }) => {
  const { tableNumber, checkIn } = useTable();
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    checkIn(name.trim());
    onCheckIn();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-dark-4">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${HERO_IMAGES[0]})` }}
      />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-4/80 via-dark-4/60 to-dark-4" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-4 via-transparent to-dark-4/50" />
      
      {/* Decorative Gold Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gold/5 rounded-full blur-[120px]" />
      
      {/* Animated Particles/Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-6 opacity-0 animate-fade-down">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-gold/40 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border border-gold/10 -m-3 animate-pulse-gold" />
              <span className="font-display text-3xl text-gold">D</span>
            </div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl tracking-[0.4em] text-gold text-glow">
            D CUBES PLACE
          </h1>
          <div className="gold-divider w-32 mx-auto my-4" />
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/60 font-light">
            Resort · Lounge · Nightlife
          </p>
        </div>

        {/* Table Badge */}
        {tableNumber && (
          <div className="relative mb-10 opacity-0 animate-fade-up animate-delay-200">
            <div className="relative">
              <div className="w-40 h-40 rounded-full border border-gold/30 flex flex-col items-center justify-center relative bg-dark-4/50 backdrop-blur-xl">
                <div className="absolute inset-0 rounded-full border border-gold/10 -m-4" />
                <div className="absolute inset-0 rounded-full border border-gold/5 -m-8" />
                <span className="font-display text-7xl text-gold leading-none text-glow">{tableNumber}</span>
                <span className="text-xs tracking-[0.3em] uppercase text-cream/50 mt-2">Your Table</span>
              </div>
              
              {/* Pulsing rings */}
              <div className="absolute inset-0 rounded-full border border-gold/20 animate-pulse-ring" style={{ animationDelay: '0s' }} />
              <div className="absolute inset-0 rounded-full border border-gold/15 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        )}

        {/* Welcome Text */}
        <div className="text-center mb-8 opacity-0 animate-fade-up animate-delay-300 max-w-md">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-3">
            {tableNumber
              ? <>Welcome to <span className="text-gold italic">Table {tableNumber}</span></>
              : <>Welcome to <span className="text-gold italic">D Cubes Place</span></>
            }
          </h2>
          <p className="text-cream/50 text-base leading-relaxed">
            Enter your name to begin your exclusive dining experience. Our staff will be notified of your arrival.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 opacity-0 animate-fade-up animate-delay-400">
          <div className={`transition-all duration-300 ${shake ? 'animate-pulse' : ''}`}>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or party name"
                maxLength={40}
                className="w-full input-luxury pr-12"
                disabled={isLoading}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-luxury py-4 rounded-2xl text-xs tracking-[0.25em] uppercase relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                  <span>CHECKING IN...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">✦</span>
                  <span>BEGIN YOUR EXPERIENCE</span>
                </>
              )}
            </span>
          </button>
        </form>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-6 text-center opacity-0 animate-fade-up animate-delay-500">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-2">
              <span className="text-xl">🍸</span>
            </div>
            <p className="text-[10px] tracking-wider uppercase text-cream/40">Premium Drinks</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-2">
              <span className="text-xl">🍽️</span>
            </div>
            <p className="text-[10px] tracking-wider uppercase text-cream/40">Fine Dining</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-2">
              <span className="text-xl">💨</span>
            </div>
            <p className="text-[10px] tracking-wider uppercase text-cream/40">Shisha Lounge</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-8 text-center opacity-0 animate-fade-up animate-delay-600">
        <div className="gold-divider w-16 mx-auto mb-4" />
        <p className="text-[10px] text-cream/20">
          Crafted by{' '}
          <a 
            href="https://wa.me/2348174143260" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gold/50 hover:text-gold transition-colors"
          >
            Toluwase Christopher
          </a>
        </p>
      </div>
    </div>
  );
};
