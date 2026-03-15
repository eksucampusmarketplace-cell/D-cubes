import React, { useState, useCallback, useEffect } from 'react';
import { useTable } from '@/context/TableContext';
import { HERO_IMAGES, NIGHTLIFE_FILTER } from '@/config/images';
import { getZoneInfo } from '@/data/locations';

interface CheckInScreenProps {
  onCheckIn: () => void;
}

export const CheckInScreen: React.FC<CheckInScreenProps> = ({ onCheckIn }) => {
  const { location, zone, zoneName, tableNumber, checkIn, isCheckedIn, guestId } = useTable();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Listen for check-in success to transition
  useEffect(() => {
    if (isCheckedIn && guestId) {
      setIsLoading(false);
      onCheckIn();
    }
  }, [isCheckedIn, guestId, onCheckIn]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!name.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsLoading(true);
    checkIn(name.trim());
    // Don't call onCheckIn here - wait for server confirmation
  }, [name, checkIn]);

  // Get zone info
  const zoneInfo = zone ? getZoneInfo(zone) : null;

  // Generate floating particles
  const particles = React.useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${4 + Math.random() * 4}s`,
      size: Math.random() > 0.5 ? 2 : 1,
    }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* Background Image with Cozy Nightlife Filter */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${HERO_IMAGES.primary})`,
          filter: NIGHTLIFE_FILTER.filter,
          transform: 'scale(1.05)',
        }}
      />
      
      {/* Rich Nightlife Gradient Overlays for Luxurious Ambiance */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/95" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
      
      {/* Zone-Specific Tint */}
      {zoneInfo?.theme && (
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom right, ${zoneInfo.theme.primaryColor}15, transparent, ${zoneInfo.theme.accentColor}10)`
          }}
        />
      )}
      
      {/* Warm Gold/Purple Ambient Tint for Cozy Night Feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-purple-900/20" />
      
      {/* Decorative Gold Glows */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[100px]" />
      
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bg-gold/50 rounded-full animate-float"
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
              <div className="absolute inset-0 rounded-full border border-gold/30 animate-pulse-ring" />
              <div className="absolute inset-2 rounded-full border border-gold/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
              {/* Main circle with Crown */}
              <div className="absolute inset-4 rounded-full border-2 border-gold/50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <svg 
                  className="w-10 h-10 text-gold drop-shadow-[0_0_10px_rgba(201,168,76,0.8)]" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Main Title */}
          <h1 className="font-display text-5xl md:text-6xl tracking-[0.3em] text-gold mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
              style={{ textShadow: '0 0 40px rgba(201,168,76,0.5), 0 2px 4px rgba(0,0,0,0.8)' }}>
            D CUBES PLACE
          </h1>
          
          <div className="gold-divider w-32 mx-auto mb-4" />
          
          {/* Tagline */}
          <p className="text-[13px] tracking-[0.3em] uppercase text-gold font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
             style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
            Open bar, Lounge, Club
          </p>
        </div>

        {/* Location/Zone Badge */}
        {(location || tableNumber || zone) && (
          <div className="relative mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <div 
                className="w-40 h-40 rounded-full border-2 border-gold/40 flex flex-col items-center justify-center relative bg-black/60 backdrop-blur-xl
                          shadow-[0_0_60px_rgba(201,168,76,0.3)]"
              >
                <div className="absolute inset-0 rounded-full border border-gold/20 -m-3" />
                
                {/* Zone Icon */}
                <span className="text-4xl mb-1">{zoneInfo?.icon || '🍸'}</span>
                
                {/* Location Number/Name */}
                <span 
                  className="font-display text-5xl text-gold leading-none font-bold drop-shadow-[0_0_20px_rgba(201,168,76,0.8)]"
                  style={{ textShadow: '0 0 30px rgba(201,168,76,0.6)' }}
                >
                  {location?.number || tableNumber || '?'}
                </span>
                
                {/* Label */}
                <span className="text-[10px] tracking-[0.3em] uppercase text-white font-medium mt-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {location?.type === 'bar-stool' ? 'Open Bar' : 
                   location?.type === 'lounge-seat' ? 'Lounge Seat' :
                   location?.type === 'poolside-cabana' ? 'Cabana' :
                   location?.type === 'standing-table' ? 'Standing Table' :
                   'Your Table'}
                </span>
              </div>
              
              {/* Pulsing rings */}
              <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-pulse-ring" style={{ animationDelay: '0s' }} />
              <div className="absolute inset-0 rounded-full border border-gold/20 animate-pulse-ring" style={{ animationDelay: '0.7s' }} />
            </div>
            
            {/* Zone Label */}
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 border border-gold/30 rounded-full">
                <span>{zoneInfo?.icon}</span>
                <span className="text-gold text-sm font-semibold tracking-wider">{zoneName}</span>
              </span>
            </div>
          </div>
        )}

        {/* Welcome Text */}
        <div className="text-center mb-8 max-w-md animate-fade-up px-4" style={{ animationDelay: '0.3s' }}>
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-3 font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
            {location 
              ? <>Welcome to <span className="text-gold italic">{location.name}</span></>
              : tableNumber 
                ? <>Welcome to <span className="text-gold italic">Table {tableNumber}</span></>
                : <>Welcome to <span className="text-gold italic">D Cubes Place</span></>
            }
          </h2>
          <p className="text-white/90 text-base leading-relaxed font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
             style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
            {zoneInfo?.description || 'Enter your name to begin your exclusive dining experience. Our staff will be notified of your arrival.'}
          </p>
          
          {/* Food availability notice - all zones now support food */}
          {zone === 'nightclub' && (
            <p className="text-amber-400 text-sm mt-3 flex items-center justify-center gap-2">
              <span>🍸</span>
              <span>Drinks & snacks only in this area</span>
            </p>
          )}
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
              className="w-full bg-black/40 border-2 border-gold/30 rounded-xl px-6 py-4 text-center text-lg text-white font-medium
                         placeholder:text-white/40 focus:border-gold focus:outline-none transition-all duration-300
                         shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm"
              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-gold/70 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full btn-luxury py-4 text-sm group disabled:opacity-50"
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
                  <span className="text-lg">✦</span>
                  <span>BEGIN YOUR EXPERIENCE</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>

        {/* Features based on zone */}
        {(() => {
          const features = zone === 'open-bar' || zone === 'nightclub' 
            ? [
                { icon: '🍸', label: 'Premium Drinks' },
                { icon: '💨', label: 'Shisha' },
                { icon: '🎵', label: 'Live Music' },
              ]
            : zone === 'poolside'
              ? [
                  { icon: '🏊', label: 'Pool Access' },
                  { icon: '🍹', label: 'Tropical Drinks' },
                  { icon: '🍽️', label: 'Light Bites' },
                ]
              : [
                  { icon: '🍸', label: 'Premium Drinks' },
                  { icon: '🍽️', label: 'Fine Dining' },
                  { icon: '💨', label: 'Shisha Lounge' },
                ];
          return (
            <div className="mt-12 grid grid-cols-3 gap-6 text-center animate-fade-up" style={{ animationDelay: '0.5s' }}>
              {features.map((feature, idx) => (
                <div key={idx} className="flex flex-col items-center group">
                  <div className="w-14 h-14 rounded-2xl bg-gold/20 border border-gold/40 flex items-center justify-center mb-3
                                transition-all duration-300 group-hover:bg-gold/30 group-hover:scale-110 shadow-lg">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {feature.label}
                  </p>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-8 text-center animate-fade-up" style={{ animationDelay: '0.6s' }}>
        <div className="gold-divider w-20 mx-auto mb-4" />
        <p className="text-[10px] text-white/50 font-medium">
          Crafted by{' '}
          <a 
            href="https://wa.me/2348164143260" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-light transition-colors"
          >
            Decisive Analyst
          </a>
        </p>
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
      `}</style>
    </div>
  );
};
