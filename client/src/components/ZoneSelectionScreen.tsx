import React, { useState } from 'react';
import { ZONES } from '@/data/locations';
import type { ZoneType } from '@/types';
import { HERO_IMAGES, NIGHTLIFE_FILTER } from '@/config/images';

interface ZoneSelectionScreenProps {
  onSelectZone: (zone: ZoneType, exploreOnly?: boolean, tableInput?: string) => void;
}

export const ZoneSelectionScreen: React.FC<ZoneSelectionScreenProps> = ({ onSelectZone }) => {
  const [selectedZone, setSelectedZone] = useState<ZoneType | null>(null);
  const [showTableInput, setShowTableInput] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [mode, setMode] = useState<'select' | 'choose-mode'>('select');

  const zones = Object.values(ZONES);

  const handleZoneClick = (zone: ZoneType) => {
    setSelectedZone(zone);
    setMode('choose-mode');
  };

  const handleExploreOnly = () => {
    if (selectedZone) {
      onSelectZone(selectedZone, true);
    }
  };

  const handleShowTableInput = () => {
    setShowTableInput(true);
  };

  const handleTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedZone && tableNumber.trim()) {
      onSelectZone(selectedZone, false, tableNumber.trim());
    }
  };

  const handleBack = () => {
    if (showTableInput) {
      setShowTableInput(false);
    } else {
      setSelectedZone(null);
      setMode('select');
    }
  };

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
      {/* Background Image with Nightlife Filter */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${HERO_IMAGES.primary})`,
          filter: NIGHTLIFE_FILTER.filter,
          transform: 'scale(1.05)',
        }}
      />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/95" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70" />
      
      {/* Warm Ambient Tint */}
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
              <div className="absolute inset-0 rounded-full border border-gold/30 animate-pulse-ring" />
              <div className="absolute inset-2 rounded-full border border-gold/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
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
          
          <h1 className="font-display text-5xl md:text-6xl tracking-[0.3em] text-gold mb-4 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
              style={{ textShadow: '0 0 40px rgba(201,168,76,0.5), 0 2px 4px rgba(0,0,0,0.8)' }}>
            D CUBES PLACE
          </h1>
          
          <div className="gold-divider w-32 mx-auto mb-4" />
          
          <p className="text-[13px] tracking-[0.3em] uppercase text-gold font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
             style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
            Open bar, Lounge, Club
          </p>
        </div>

        {/* Zone Selection */}
        {mode === 'select' && (
          <div className="w-full max-w-2xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-serif text-2xl md:text-3xl text-white text-center mb-2 font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Where would you like to explore?
            </h2>
            <p className="text-white/70 text-center mb-8 text-sm font-medium">
              Select a location to view menu and prices
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => handleZoneClick(zone.id)}
                  className="group relative overflow-hidden rounded-2xl border-2 border-gold/30 bg-black/40 backdrop-blur-sm
                           hover:border-gold hover:bg-gold/10 transition-all duration-300 shadow-lg hover:shadow-gold/20"
                >
                  <div className="p-6 text-center">
                    <span className="text-4xl block mb-3">{zone.icon}</span>
                    <h3 className="font-serif text-xl text-white font-semibold mb-1 group-hover:text-gold transition-colors">
                      {zone.name}
                    </h3>
                    <p className="text-white/50 text-xs line-clamp-2">{zone.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mode Selection after Zone is picked */}
        {mode === 'choose-mode' && selectedZone && !showTableInput && (
          <div className="w-full max-w-md animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 text-gold/70 hover:text-gold mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Back to zones</span>
            </button>

            <div className="text-center mb-8">
              <span className="text-5xl block mb-4">{ZONES[selectedZone].icon}</span>
              <h2 className="font-serif text-3xl text-white font-semibold mb-2">
                {ZONES[selectedZone].name}
              </h2>
              <p className="text-white/60 text-sm">{ZONES[selectedZone].description}</p>
            </div>

            <div className="space-y-4">
              {/* Explore Option */}
              <button
                type="button"
                onClick={handleExploreOnly}
                className="w-full group relative overflow-hidden rounded-xl border-2 border-gold/40 bg-black/40 backdrop-blur-sm
                         hover:border-gold hover:bg-gold/10 transition-all duration-300"
              >
                <div className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/40">
                    <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-serif text-lg text-white font-semibold group-hover:text-gold transition-colors">
                      Just Exploring
                    </h3>
                    <p className="text-white/50 text-xs">View menu and prices without ordering</p>
                  </div>
                  <svg className="w-5 h-5 text-gold/50 group-hover:text-gold group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Order Option */}
              <button
                type="button"
                onClick={handleShowTableInput}
                className="w-full group relative overflow-hidden rounded-xl border-2 border-gold/40 bg-black/40 backdrop-blur-sm
                         hover:border-gold hover:bg-gold/10 transition-all duration-300"
              >
                <div className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/40">
                    <svg className="w-7 h-7 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-serif text-lg text-white font-semibold group-hover:text-gold transition-colors">
                      Place an Order
                    </h3>
                    <p className="text-white/50 text-xs">Enter your table/seat number to order</p>
                  </div>
                  <svg className="w-5 h-5 text-gold/50 group-hover:text-gold group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Table Input */}
        {showTableInput && selectedZone && (
          <div className="w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 text-gold/70 hover:text-gold mb-6 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Back</span>
            </button>

            <div className="text-center mb-8">
              <span className="text-4xl block mb-3">{ZONES[selectedZone].icon}</span>
              <h2 className="font-serif text-2xl text-white font-semibold mb-2">
                {ZONES[selectedZone].name}
              </h2>
              <p className="text-white/60 text-sm">Enter your table or seat number</p>
            </div>

            <form onSubmit={handleTableSubmit} className="space-y-4">
              <div className="relative group">
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g., T-001, BAR-05, or just 1"
                  maxLength={20}
                  className="w-full bg-black/40 border-2 border-gold/30 rounded-xl px-6 py-4 text-center text-lg text-white font-medium
                           placeholder:text-white/40 focus:border-gold focus:outline-none transition-all duration-300
                           shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                />
              </div>

              <button
                type="submit"
                disabled={!tableNumber.trim()}
                className="w-full btn-luxury py-4 text-sm group disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <span className="text-lg">✦</span>
                  <span>CONTINUE TO MENU</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </form>

            <p className="text-center text-white/40 text-xs mt-6">
              Your table number helps our staff find you
            </p>
          </div>
        )}
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
    </div>
  );
};
