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
import { CUSTOMER_HERO, CATEGORY_IMAGES } from '@/config/images';

type Category = 'all' | 'cocktails' | 'spirits' | 'wine' | 'food' | 'shisha' | 'nonalc';

const CATEGORIES: Category[] = ['all', 'cocktails', 'spirits', 'wine', 'food', 'shisha', 'nonalc'];

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
    <div className="min-h-screen bg-black">
      {/* Hero Section - Darkened for better text readability */}
      <div className="relative h-[40vh] min-h-[350px] overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${CUSTOMER_HERO.background})` }}
        />
        
        {/* Stronger Gradient Overlays for text readability */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-gold/5 rounded-full blur-3xl" />
        
        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-8">
          <div className="animate-fade-up">
            {/* Greeting */}
            <p className="text-[12px] tracking-[0.3em] uppercase text-gold font-semibold mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {getGreeting()}
            </p>
            
            {/* Welcome Message - Enhanced contrast */}
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-2 leading-tight font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
              Welcome, <span className="text-gold italic">{guestName}</span>
            </h1>
            <p className="text-white/80 text-base font-medium mb-6 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
               style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
              Indulge in our curated selection of fine offerings
            </p>
            
            {/* Table Badge - Enhanced */}
            {tableNumber && (
              <div className="inline-flex items-center gap-3 px-5 py-3 bg-black/60 backdrop-blur-xl rounded-full border-2 border-gold/40
                            shadow-[0_4px_30px_rgba(201,168,76,0.2)]">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-gold tracking-wider font-bold">Table {tableNumber}</span>
                <span className="text-white/50 text-sm">•</span>
                <span className="text-white/80 text-sm font-medium">Active Session</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Top Bar */}
      <div 
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-black/95 backdrop-blur-xl border-b border-gold/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]' 
            : 'bg-transparent'
        }`}
      >
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="font-display text-xl tracking-[0.3em] text-gold font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            D CUBES PLACE
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleChatOpen}
              className="flex items-center gap-2 px-4 py-2.5 bg-black/60 backdrop-blur border-2 border-gold/30 rounded-full text-white text-sm font-medium
                         hover:border-gold hover:bg-gold/10 transition-all duration-300 shadow-lg"
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
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/60 border-2 border-gold/20 text-white text-xs font-medium flex-shrink-0 shadow-lg">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Staff Online
        </div>
        {tableNumber && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/60 border-2 border-gold/20 text-white text-xs font-medium flex-shrink-0 shadow-lg">
            🪑 Table {tableNumber} · Active
          </div>
        )}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/60 border-2 border-gold/20 text-white text-xs font-medium flex-shrink-0 shadow-lg">
          🕐 Service Open
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/60 border-2 border-gold/20 text-white text-xs font-medium flex-shrink-0 shadow-lg">
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
              <h3 className="font-serif text-2xl text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Popular Picks</h3>
              <p className="text-white/60 text-sm mt-1 font-medium">Guest favorites this evening</p>
            </div>
            <button 
              type="button"
              className="flex items-center gap-1 text-gold text-sm font-semibold hover:text-gold-light transition-colors group"
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
                className="flex-shrink-0 w-[170px] luxury-card rounded-2xl overflow-hidden group cursor-pointer bg-black/40"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={CATEGORY_IMAGES[item.category as keyof typeof CATEGORY_IMAGES] || CATEGORY_IMAGES.cocktails}
                    alt={item.name}
                    className="w-full h-full object-cover image-hover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1.5 bg-gold text-black text-[10px] tracking-wider uppercase rounded-full font-bold shadow-lg">
                      Popular
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-black/20">
                  <h4 className="font-serif text-white text-base font-semibold mb-1 line-clamp-1 group-hover:text-gold transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-gold text-sm font-bold">{formatPrice(item.price)}</p>
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
              src={CATEGORY_IMAGES[selectedCategory as keyof typeof CATEGORY_IMAGES]}
              alt={CATEGORY_NAMES[selectedCategory]}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-center">
              <h2 className="font-serif text-3xl text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">{CATEGORY_NAMES[selectedCategory]}</h2>
              <p className="text-white/70 text-sm font-medium">
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
            <h3 className="font-serif text-2xl text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Full Menu</h3>
            <span className="text-sm text-white/50 font-medium">{filteredItems.length} items</span>
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
          <div className="bg-black/95 backdrop-blur-xl border-t-2 border-gold/20 px-5 py-4
                          flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/40 to-gold/20 flex items-center justify-center border-2 border-gold/40
                            shadow-[0_4px_20px_rgba(201,168,76,0.4)]">
                <span className="text-gold text-2xl font-bold">{itemCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] tracking-[0.15em] uppercase text-white/50 font-medium">
                  Your Order
                </span>
                <span className="font-serif text-2xl text-gold font-bold">{formatPrice(total)}</span>
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
        <p className="font-display text-2xl tracking-[0.3em] text-gold/80 mb-2 font-bold">D CUBES PLACE</p>
        <p className="text-[11px] text-white/40 tracking-wider mb-4 font-medium">
          Resort · Lounge · Nightlife
        </p>
        <p className="text-[10px] text-white/30 font-medium">
          Crafted by{' '}
          <a 
            href="https://wa.me/2348174143260" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gold/70 hover:text-gold transition-colors"
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
