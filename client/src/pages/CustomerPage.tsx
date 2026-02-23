import React, { useState, useEffect, useCallback } from 'react';
import { useTable } from '@/context/TableContext';
import { useCart } from '@/context/CartContext';
import { CheckInScreen } from '@/components/CheckInScreen';
import { MenuItemCard } from '@/components/MenuItemCard';
import { CartPanel } from '@/components/CartPanel';
import { AccessRequests } from '@/components/AccessRequests';
import { ChatPanel } from '@/components/ChatPanel';
import { OrderStatus } from '@/components/OrderStatus';
import { MENU_ITEMS, CATEGORY_NAMES, CATEGORY_ICONS } from '@/data/menu';
import { getGreeting, formatPrice } from '@/utils/format';

type Category = 'all' | 'cocktails' | 'spirits' | 'wine' | 'food' | 'shisha' | 'nonalc';

const CATEGORIES: Category[] = ['all', 'cocktails', 'spirits', 'wine', 'food', 'shisha', 'nonalc'];

const CATEGORY_IMAGES: Record<string, string> = {
  cocktails: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80',
  spirits: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800&auto=format&fit=crop&q=80',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
  shisha: 'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=800&auto=format&fit=crop&q=80',
  nonalc: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&auto=format&fit=crop&q=80',
};

const HERO_IMAGE = 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&auto=format&fit=crop&q=80';

export const CustomerPage: React.FC = () => {
  const { isCheckedIn, tableNumber, guestName } = useTable();
  const { itemCount, total, isOpen: cartOpen, setIsOpen: setCartOpen } = useCart();
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [chatOpen, setChatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isCheckedIn) {
      setHasCheckedIn(true);
    }
  }, [isCheckedIn]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryChange = useCallback((cat: Category) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCategory(cat);
  }, []);

  const handleChatOpen = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setChatOpen(true);
  }, []);

  const handleCartOpen = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCartOpen(true);
  }, [setCartOpen]);

  if (!hasCheckedIn) {
    return <CheckInScreen onCheckIn={() => setHasCheckedIn(true)} />;
  }

  const filteredItems = selectedCategory === 'all' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

  const popularItems = MENU_ITEMS.filter(item => item.isPopular || item.tags.includes('Popular')).slice(0, 4);

  return (
    <div className="min-h-screen bg-dark-4">
      {/* Hero Section */}
      <div className="relative h-[45vh] min-h-[380px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-[15s] ease-out"
          style={{ 
            backgroundImage: `url(${HERO_IMAGE})`,
            animation: 'slowZoom 15s ease-in-out infinite alternate'
          }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-4/80 via-dark-4/50 to-dark-4" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-4 via-transparent to-dark-4/60" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-gold/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-gold/5 rounded-full blur-3xl" />
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-8">
          <div className="animate-fade-up">
            {/* Greeting */}
            <p className="text-[11px] tracking-[0.4em] uppercase text-gold/80 mb-2">
              {getGreeting()}
            </p>
            
            {/* Welcome Message */}
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-2 leading-tight">
              Welcome, <span className="text-gold italic">{guestName}</span>
            </h1>
            <p className="text-cream/60 text-base font-light mb-6">
              Indulge in our curated selection of fine offerings
            </p>
            
            {/* Table Badge */}
            {tableNumber && (
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-dark/60 backdrop-blur-xl rounded-full border border-gold/30
                            shadow-[0_4px_30px_rgba(201,168,76,0.15)]">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-gold tracking-wider font-medium">Table {tableNumber}</span>
                <span className="text-cream/40 text-sm">•</span>
                <span className="text-cream/60 text-sm">Active Session</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Top Bar */}
      <div 
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-dark-4/98 backdrop-blur-xl border-b border-gold/10 shadow-[0_10px_40px_rgba(0,0,0,0.4)]' 
            : 'bg-transparent'
        }`}
      >
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="font-display text-xl tracking-[0.3em] text-gold">D CUBES PLACE</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleChatOpen}
              className="flex items-center gap-2 px-4 py-2.5 bg-dark-2/80 backdrop-blur border border-gold/20 rounded-full text-cream text-sm
                         hover:border-gold/50 hover:bg-gold/10 transition-all duration-300 shadow-lg"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="hidden sm:inline">Chat with Staff</span>
              <span className="sm:hidden">💬</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2.5 px-5 py-4 overflow-x-auto no-scrollbar -mt-2">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-dark-2/80 border border-gold/15 text-cream/70 text-xs flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Staff Online
        </div>
        {tableNumber && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-dark-2/80 border border-gold/15 text-cream/70 text-xs flex-shrink-0">
            🪑 Table {tableNumber} · Active
          </div>
        )}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-dark-2/80 border border-gold/15 text-cream/70 text-xs flex-shrink-0">
          🕐 Service Open
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-dark-2/80 border border-gold/15 text-cream/70 text-xs flex-shrink-0">
          🥂 Bar Open
        </div>
      </div>

      {/* Access Requests */}
      <AccessRequests />

      {/* Order Status */}
      <OrderStatus />

      {/* Popular Items Carousel */}
      {popularItems.length > 0 && selectedCategory === 'all' && (
        <div className="px-5 py-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif text-2xl text-white">Popular Picks</h3>
              <p className="text-cream/40 text-sm mt-1">Guest favorites this evening</p>
            </div>
            <button 
              type="button"
              className="flex items-center gap-1 text-gold text-sm hover:text-gold-light transition-colors group"
            >
              <span>View All</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
            {popularItems.map((item, index) => (
              <div 
                key={item.id} 
                className="flex-shrink-0 w-[170px] luxury-card rounded-2xl overflow-hidden group cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.cocktails}
                    alt={item.name}
                    className="w-full h-full object-cover image-hover"
                  />
                  <div className="absolute inset-0 gradient-overlay" />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1.5 bg-gold text-dark text-[10px] tracking-wider uppercase rounded-full font-bold shadow-lg">
                      Popular
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-serif text-white text-base mb-1 line-clamp-1 group-hover:text-gold transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-gold text-sm font-semibold">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Navigation */}
      <div className="px-5 py-4">
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={handleCategoryChange(cat)}
              className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
            >
              {CATEGORY_ICONS[cat] && <span>{CATEGORY_ICONS[cat]}</span>}
              <span>{cat === 'all' ? 'All Items' : CATEGORY_NAMES[cat].split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Hero Image */}
      {selectedCategory !== 'all' && (
        <div className="px-5 pb-6">
          <div className="relative h-44 rounded-2xl overflow-hidden luxury-card">
            <img 
              src={CATEGORY_IMAGES[selectedCategory]}
              alt={CATEGORY_NAMES[selectedCategory]}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-4/95 via-dark-4/70 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-center">
              <h2 className="font-serif text-3xl text-white mb-2">{CATEGORY_NAMES[selectedCategory]}</h2>
              <p className="text-cream/50 text-sm">
                {filteredItems.length} exquisite selections
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="px-5 pb-32">
        {selectedCategory === 'all' && (
          <div className="flex items-baseline justify-between mb-6">
            <h3 className="font-serif text-2xl text-white">Full Menu</h3>
            <span className="text-sm text-cream/40">{filteredItems.length} items</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredItems.map((item, index) => (
            <MenuItemCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>

      {/* Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[60]">
          <div className="bg-dark-4/98 backdrop-blur-xl border-t border-gold/20 px-5 py-4
                          flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center border border-gold/30
                            shadow-[0_4px_20px_rgba(201,168,76,0.3)]">
                <span className="text-gold text-2xl font-bold">{itemCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-[0.15em] uppercase text-cream/40">
                  Your Order
                </span>
                <span className="font-serif text-2xl text-gold font-semibold">{formatPrice(total)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCartOpen}
              className="btn-luxury px-8 py-3.5 text-[11px] flex items-center gap-2 group"
            >
              <span>View Order</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-12 text-center border-t border-gold/10">
        <div className="gold-divider-thick w-24 mx-auto mb-6" />
        <p className="font-display text-2xl tracking-[0.3em] text-gold/60 mb-2">D CUBES PLACE</p>
        <p className="text-[11px] text-cream/30 tracking-wider mb-4">
          Resort · Lounge · Nightlife
        </p>
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

      {/* Panels */}
      <CartPanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      <style>{`
        @keyframes slowZoom {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
};
