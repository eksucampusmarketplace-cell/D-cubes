import React, { useState, useEffect } from 'react';
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
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-dark-4/70 via-dark-4/40 to-dark-4" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-4 via-transparent to-dark-4/50" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />
        
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
            <p className="text-cream/60 text-lg font-light mb-6">
              Indulge in our curated selection of fine offerings
            </p>
            
            {/* Table Badge */}
            {tableNumber && (
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-dark/60 backdrop-blur-xl rounded-full border border-gold/30">
                <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="text-sm text-gold tracking-wider">Table {tableNumber}</span>
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
            ? 'bg-dark-4/95 backdrop-blur-xl border-b border-gold/10 shadow-luxury' 
            : 'bg-transparent'
        }`}
      >
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="font-display text-xl tracking-[0.3em] text-gold">D CUBES PLACE</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setChatOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 bg-dark-2/60 backdrop-blur border border-gold/20 rounded-full text-cream text-sm
                         hover:border-gold/50 hover:bg-gold/5 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="hidden sm:inline">Chat with Staff</span>
              <span className="sm:hidden">💬</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2 px-5 py-4 overflow-x-auto no-scrollbar -mt-2">
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-2xl text-white">Popular Picks</h3>
              <p className="text-cream/40 text-sm mt-1">Guest favorites this evening</p>
            </div>
            <div className="flex items-center gap-1 text-gold text-sm">
              <span>View All</span>
              <span>→</span>
            </div>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
            {popularItems.map((item, index) => (
              <div 
                key={item.id} 
                className="flex-shrink-0 w-[160px] luxury-card rounded-2xl overflow-hidden group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-36 overflow-hidden">
                  <img 
                    src={CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.cocktails}
                    alt={item.name}
                    className="w-full h-full object-cover image-hover"
                  />
                  <div className="absolute inset-0 gradient-overlay" />
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-gold/90 text-dark text-[10px] tracking-wider uppercase rounded-full font-medium">
                      Popular
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-serif text-white text-base mb-1 line-clamp-1 group-hover:text-gold transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-gold text-sm font-medium">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Navigation */}
      <div className="px-5 py-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 relative px-5 py-3 rounded-xl text-sm tracking-wide transition-all whitespace-nowrap
                         ${selectedCategory === cat
                           ? 'bg-gradient-to-r from-gold/20 to-gold/10 text-gold border border-gold/40 shadow-gold/10'
                           : 'bg-dark-2/60 text-cream/50 border border-transparent hover:text-cream hover:border-gold/20'
                         }`}
            >
              {CATEGORY_ICONS[cat] && <span className="mr-2">{CATEGORY_ICONS[cat]}</span>}
              {cat === 'all' ? 'All' : CATEGORY_NAMES[cat].split(' ')[0]}
              {selectedCategory === cat && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Category Hero Image */}
      {selectedCategory !== 'all' && (
        <div className="px-5 pb-6">
          <div className="relative h-40 rounded-2xl overflow-hidden luxury-card">
            <img 
              src={CATEGORY_IMAGES[selectedCategory]}
              alt={CATEGORY_NAMES[selectedCategory]}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-4/90 via-dark-4/60 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-center">
              <h2 className="font-serif text-3xl text-white mb-1">{CATEGORY_NAMES[selectedCategory]}</h2>
              <p className="text-cream/50 text-sm">
                {filteredItems.length} exquisite selections
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="px-5 pb-28">
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
          <div className="bg-dark-4/95 backdrop-blur-xl border-t border-gold/20 px-5 py-4
                          flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
                <span className="text-gold text-xl">{itemCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-[0.15em] uppercase text-cream/40">
                  Your Order
                </span>
                <span className="font-serif text-2xl text-gold">{formatPrice(total)}</span>
              </div>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="btn-luxury px-8 py-3.5 rounded-xl text-xs relative overflow-hidden"
            >
              <span className="relative z-10">View Order →</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-10 text-center border-t border-gold/10">
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
    </div>
  );
};
