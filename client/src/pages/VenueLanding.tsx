import React, { useState, useCallback, useMemo } from 'react';
import { useTable } from '@/context/TableContext';
import { HERO_IMAGES, NIGHTLIFE_FILTER } from '@/config/images';
import type { ZoneType } from '@/types';

interface VenueLandingProps {
  onContinue: () => void;
}

type LandingStep = 'zone' | 'table' | 'name';

interface ZoneOption {
  id: ZoneType;
  name: string;
  description: string;
  icon: string;
  vibe: string;
  color: string;
  borderColor: string;
  glowColor: string;
  bgImage: string;
}

const ZONE_OPTIONS: ZoneOption[] = [
  {
    id: 'lounge',
    name: 'Lounge',
    description: 'Relaxed seating, full menu, premium ambiance',
    icon: '🛋️',
    vibe: 'Chill & Sophisticated',
    color: 'from-amber-900/60 to-amber-950/80',
    borderColor: 'border-amber-600/40',
    glowColor: 'shadow-amber-900/30',
    bgImage: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=600&auto=format&fit=crop&q=70',
  },
  {
    id: 'nightclub',
    name: 'Nightclub',
    description: 'High energy dancefloor, bottle service, full bar',
    icon: '🎵',
    vibe: 'Electric & Vibrant',
    color: 'from-purple-900/60 to-pink-950/80',
    borderColor: 'border-pink-600/40',
    glowColor: 'shadow-pink-900/30',
    bgImage: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&auto=format&fit=crop&q=70',
  },
  {
    id: 'open-bar',
    name: 'Open Bar',
    description: 'Bar stools & standing tables, full drinks menu',
    icon: '🍺',
    vibe: 'Social & Energetic',
    color: 'from-yellow-900/60 to-yellow-950/80',
    borderColor: 'border-yellow-600/40',
    glowColor: 'shadow-yellow-900/30',
    bgImage: 'https://images.unsplash.com/photo-1474314170901-f351b68f544f?w=600&auto=format&fit=crop&q=70',
  },
  {
    id: 'poolside',
    name: 'Poolside',
    description: 'Pool cabanas, tropical drinks, light bites',
    icon: '🏊',
    vibe: 'Refreshing & Laid-back',
    color: 'from-cyan-900/60 to-cyan-950/80',
    borderColor: 'border-cyan-600/40',
    glowColor: 'shadow-cyan-900/30',
    bgImage: 'https://images.unsplash.com/photo-1540541338537-1220059af4dc?w=600&auto=format&fit=crop&q=70',
  },
];

export const VenueLanding: React.FC<VenueLandingProps> = ({ onContinue }) => {
  const { checkIn, setWalkInZone } = useTable();
  const [step, setStep] = useState<LandingStep>('zone');
  const [selectedZone, setSelectedZone] = useState<ZoneType | null>(null);
  const [tableName, setTableName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const particles = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${4 + Math.random() * 4}s`,
      size: Math.random() > 0.5 ? 2 : 1,
    }));
  }, []);

  const selectedZoneOption = useMemo(
    () => ZONE_OPTIONS.find(z => z.id === selectedZone) ?? null,
    [selectedZone]
  );

  const handleZoneSelect = useCallback((zoneId: ZoneType) => {
    setSelectedZone(zoneId);
    setStep('table');
  }, []);

  const handleBrowseOnly = useCallback(() => {
    setIsBrowsing(true);
    setStep('name');
  }, []);

  const handleTableNext = useCallback(() => {
    setStep('name');
  }, []);

  const handleBack = useCallback(() => {
    if (step === 'name') {
      setStep('table');
      setIsBrowsing(false);
    } else if (step === 'table') {
      setStep('zone');
      setSelectedZone(null);
    }
  }, [step]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 700));
    setWalkInZone(selectedZone || 'lounge', tableName.trim() || null, isBrowsing);
    checkIn(guestName.trim());
    onContinue();
    setIsLoading(false);
  }, [guestName, selectedZone, tableName, isBrowsing, setWalkInZone, checkIn, onContinue]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${selectedZoneOption?.bgImage || HERO_IMAGES.primary})`,
          filter: NIGHTLIFE_FILTER.filter,
          transform: 'scale(1.05)',
        }}
      />
      <div className="absolute inset-0 bg-black/65" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/95" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/70" />
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gold/8 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[100px]" />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bg-gold/40 rounded-full animate-float"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-5 py-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-down">
          <div className="inline-flex items-center justify-center mb-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border border-gold/30 animate-pulse-ring" />
              <div className="absolute inset-2 rounded-full border border-gold/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
              <div className="absolute inset-3 rounded-full border-2 border-gold/50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <svg className="w-8 h-8 text-gold drop-shadow-[0_0_10px_rgba(201,168,76,0.8)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z"/>
                </svg>
              </div>
            </div>
          </div>
          <h1
            className="font-display text-4xl md:text-5xl tracking-[0.3em] text-gold mb-2"
            style={{ textShadow: '0 0 40px rgba(201,168,76,0.5), 0 2px 4px rgba(0,0,0,0.8)' }}
          >
            D CUBES PLACE
          </h1>
          <div className="gold-divider w-24 mx-auto mb-3" />
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold/80 font-medium">
            Open Bar · Lounge · Nightlife
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-8 animate-fade-up">
          {(['zone', 'table', 'name'] as LandingStep[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                step === s
                  ? 'bg-gold text-black shadow-[0_0_12px_rgba(201,168,76,0.6)]'
                  : ['zone', 'table', 'name'].indexOf(step) > i
                    ? 'bg-gold/30 border border-gold/50 text-gold'
                    : 'bg-black/40 border border-white/20 text-white/40'
              }`}>
                {i + 1}
              </div>
              {i < 2 && (
                <div className={`w-8 h-px transition-all duration-300 ${
                  ['zone', 'table', 'name'].indexOf(step) > i ? 'bg-gold/50' : 'bg-white/15'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: ZONE SELECTION ── */}
        {step === 'zone' && (
          <div className="w-full max-w-md animate-fade-up">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl text-white font-bold mb-1">
                Where are you sitting?
              </h2>
              <p className="text-white/60 text-sm">Choose your area or just browse our menu</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {ZONE_OPTIONS.map((zone) => (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => handleZoneSelect(zone.id)}
                  className={`relative overflow-hidden rounded-2xl border-2 ${zone.borderColor} bg-black/50 backdrop-blur-sm
                              p-4 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${zone.glowColor}
                              active:scale-[0.98] group`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${zone.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <div className="relative z-10">
                    <span className="text-3xl mb-2 block">{zone.icon}</span>
                    <h3 className="font-serif text-white font-bold text-base mb-0.5">{zone.name}</h3>
                    <p className="text-white/50 text-[10px] leading-tight mb-2">{zone.description}</p>
                    <span className="text-[9px] tracking-[0.1em] uppercase text-gold/70 font-semibold">{zone.vibe}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Just Browsing */}
            <button
              type="button"
              onClick={handleBrowseOnly}
              className="w-full py-4 px-6 rounded-2xl border-2 border-white/15 bg-black/30 backdrop-blur-sm
                         text-white/70 text-sm font-medium hover:border-gold/30 hover:text-white transition-all duration-300
                         flex items-center justify-center gap-3 group"
            >
              <svg className="w-4 h-4 text-gold/60 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Just browsing the menu &amp; prices</span>
              <svg className="w-3.5 h-3.5 text-white/30 group-hover:text-gold/60 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* ── STEP 2: TABLE / SEAT SELECTION ── */}
        {step === 'table' && selectedZone && (
          <div className="w-full max-w-md animate-fade-up">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/15 border border-gold/30 rounded-full mb-4">
                <span className="text-lg">{selectedZoneOption?.icon}</span>
                <span className="text-gold text-sm font-semibold tracking-wider">{selectedZoneOption?.name}</span>
              </div>
              <h2 className="font-serif text-2xl text-white font-bold mb-1">
                What's your table or seat?
              </h2>
              <p className="text-white/60 text-sm">Optional — helps staff find you faster</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="e.g. Table 5, Sofa 2, Bar Stool 3…"
                  maxLength={30}
                  className="w-full bg-black/40 border-2 border-gold/30 rounded-xl px-5 py-4 text-center text-base text-white font-medium
                             placeholder:text-white/35 focus:border-gold focus:outline-none transition-all duration-300
                             shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTableNext}
                className="w-full btn-luxury py-4 text-sm flex items-center justify-center gap-3 group"
              >
                <span>{tableName.trim() ? 'Continue' : 'Skip, I\'ll just check in'}</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={handleBack}
              className="w-full py-3 text-white/50 text-sm hover:text-white/80 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to zone selection
            </button>
          </div>
        )}

        {/* ── STEP 3: GUEST NAME ── */}
        {step === 'name' && (
          <div className="w-full max-w-sm animate-fade-up">
            <div className="text-center mb-6">
              {isBrowsing ? (
                <>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-4">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-white/70 text-sm font-medium">Browse Mode</span>
                  </div>
                  <h2 className="font-serif text-2xl text-white font-bold mb-1">
                    What should we call you?
                  </h2>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Browse freely — no table required. View our full menu and prices at your own pace.
                  </p>
                </>
              ) : (
                <>
                  {selectedZoneOption && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/15 border border-gold/30 rounded-full mb-4">
                      <span className="text-base">{selectedZoneOption.icon}</span>
                      <span className="text-gold text-sm font-semibold">{selectedZoneOption.name}</span>
                      {tableName && (
                        <>
                          <span className="text-white/30 text-xs">·</span>
                          <span className="text-white/70 text-xs">{tableName}</span>
                        </>
                      )}
                    </div>
                  )}
                  <h2 className="font-serif text-2xl text-white font-bold mb-1">
                    Almost there!
                  </h2>
                  <p className="text-white/60 text-sm">
                    Enter your name to start your experience
                  </p>
                </>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className={`space-y-4 ${shake ? 'animate-shake' : ''}`}
            >
              <div className="relative group">
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    if (shake) setShake(false);
                  }}
                  placeholder="Your name or party name"
                  maxLength={40}
                  autoFocus
                  disabled={isLoading}
                  className="w-full bg-black/40 border-2 border-gold/30 rounded-xl px-6 py-4 text-center text-lg text-white font-medium
                             placeholder:text-white/35 focus:border-gold focus:outline-none transition-all duration-300
                             shadow-[0_4px_20px_rgba(0,0,0,0.5)] backdrop-blur-sm"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-gold/60 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !guestName.trim()}
                className="w-full btn-luxury py-4 text-sm group disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{isBrowsing ? 'LOADING MENU...' : 'CHECKING IN...'}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">✦</span>
                      <span>{isBrowsing ? 'BROWSE MENU' : 'BEGIN EXPERIENCE'}</span>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            {!isBrowsing && (
              <button
                type="button"
                onClick={handleBack}
                className="w-full mt-4 py-3 text-white/50 text-sm hover:text-white/80 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-8 text-center">
        <div className="gold-divider w-16 mx-auto mb-3" />
        <p className="text-[10px] text-white/40 font-medium">
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
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};
