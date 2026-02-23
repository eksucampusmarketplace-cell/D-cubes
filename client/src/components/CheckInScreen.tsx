import React, { useState, useCallback } from 'react';
import { useTable } from '@/context/TableContext';

interface CheckInScreenProps {
  onCheckIn: () => void;
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&auto=format&fit=crop&q=80',
];

export const CheckInScreen: React.FC<CheckInScreenProps> = ({ onCheckIn }) => {
  const { tableNumber, checkIn } = useTable();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!name.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    checkIn(name.trim());
    onCheckIn();
    setIsLoading(false);
  }, [name, checkIn, onCheckIn]);

  // Generate floating particles
  const particles = React.useMemo(() => {
    return [...Array(25)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${4 + Math.random() * 4}s`,
      size: Math.random() > 0.5 ? 2 : 1,
    }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-dark-4">
      {/* Background Image with Parallax */}
      <div 
        className="absolute inset-0 bg-cover bg-center scale-110 transition-transform duration-[20s] ease-out"
        style={{ 
          backgroundImage: `url(${HERO_IMAGES[0]})`,
          animation: 'slowZoom 20s ease-in-out infinite alternate'
        }}
      />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-4/90 via-dark-4/70 to-dark-4" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-4 via-dark-4/30 to-dark-4/70" />
      
      {/* Decorative Gold Glows */}
      <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-gold/8 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute -bottom-20 right-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/3 rounded-full blur-[180px]" />
      
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bg-gold/40 rounded-full animate-float"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-down">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative w-20 h-20">
              {/* Outer rings */}
              <div className="absolute inset-0 rounded-full border border-gold/20 animate-pulse-ring" />
              <div className="absolute inset-2 rounded-full border border-gold/15 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
              {/* Main circle */}
              <div className="absolute inset-4 rounded-full border-2 border-gold/40 flex items-center justify-center bg-dark-4/30 backdrop-blur-sm">
                <span className="font-display text-4xl text-gold text-glow">D</span>
              </div>
            </div>
          </div>
          
          <h1 className="font-display text-6xl md:text-7xl tracking-[0.35em] text-gold text-glow mb-4">
            D CUBES PLACE
          </h1>
          
          <div className="gold-divider w-40 mx-auto mb-4" />
          
          <p className="text-[12px] tracking-[0.4em] uppercase text-gold/70 font-light">
            Resort · Lounge · Nightlife
          </p>
        </div>

        {/* Table Badge */}
        {tableNumber && (
          <div className="relative mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <div className="w-44 h-44 rounded-full border border-gold/30 flex flex-col items-center justify-center relative bg-dark-4/40 backdrop-blur-xl
                            shadow-[0_0_60px_rgba(201,168,76,0.15)]">
                <div className="absolute inset-0 rounded-full border border-gold/10 -m-4" />
                <div className="absolute inset-0 rounded-full border border-gold/5 -m-8" />
                <span className="font-display text-8xl text-gold leading-none text-glow">{tableNumber}</span>
                <span className="text-xs tracking-[0.4em] uppercase text-cream/60 mt-3">Your Table</span>
              </div>
              
              {/* Pulsing rings */}
              <div className="absolute inset-0 rounded-full border border-gold/20 animate-pulse-ring" style={{ animationDelay: '0s' }} />
              <div className="absolute inset-0 rounded-full border border-gold/15 animate-pulse-ring" style={{ animationDelay: '0.7s' }} />
            </div>
          </div>
        )}

        {/* Welcome Text */}
        <div className="text-center mb-10 max-w-md animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
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
        <form 
          onSubmit={handleSubmit} 
          className={`w-full max-w-sm space-y-5 animate-fade-up ${shake ? 'animate-shake' : ''}`}
          style={{ animationDelay: '0.4s' }}
        >
          <div className="relative group">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (shake) setShake(false);
              }}
              placeholder="Your name or party name"
              maxLength={40}
              disabled={isLoading}
              className="w-full input-luxury pr-14 text-center text-lg tracking-wide"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-cream/20 group-focus-within:text-gold/50 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full btn-luxury group"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>CHECKING IN...</span>
                </>
              ) : (
                <>
                  <span className="text-lg animate-pulse">✦</span>
                  <span>BEGIN YOUR EXPERIENCE</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>

        {/* Features */}
        <div className="mt-14 grid grid-cols-3 gap-8 text-center animate-fade-up" style={{ animationDelay: '0.5s' }}>
          {[
            { icon: '🍸', label: 'Premium Drinks' },
            { icon: '🍽️', label: 'Fine Dining' },
            { icon: '💨', label: 'Shisha Lounge' },
          ].map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center group">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-3
                            transition-all duration-300 group-hover:bg-gold/20 group-hover:border-gold/40 group-hover:scale-110">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <p className="text-[11px] tracking-[0.15em] uppercase text-cream/50 group-hover:text-cream/70 transition-colors">
                {feature.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-8 text-center animate-fade-up" style={{ animationDelay: '0.6s' }}>
        <div className="gold-divider w-20 mx-auto mb-4" />
        <p className="text-[10px] text-cream/25">
          Crafted by{' '}
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

      <style>{`
        @keyframes slowZoom {
          0% { transform: scale(1.1); }
          100% { transform: scale(1.15); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};
