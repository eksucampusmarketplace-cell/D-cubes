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

export const CustomerPage: React.FC = () => {
  const { isCheckedIn, tableNumber, guestName } = useTable();
  const { itemCount, total, isOpen: cartOpen, setIsOpen: setCartOpen } = useCart();
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (isCheckedIn) {
      setHasCheckedIn(true);
    }
  }, [isCheckedIn]);

  if (!hasCheckedIn) {
    return <CheckInScreen onCheckIn={() => setHasCheckedIn(true)} />;
  }

  const filteredItems = selectedCategory === 'all' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-dark pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 glass border-b border-gold/15 px-5 py-4 flex items-center justify-between">
        <span className="font-display text-xl tracking-[0.25em] text-gold">D CUBES PLACE</span>
        <div className="flex items-center gap-2.5">
          {tableNumber && (
            <div className="flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-3.5 py-1.5">
              <span className="text-sm">🪑</span>
              <span className="text-[11px] tracking-[0.15em] uppercase text-gold">
                Table {tableNumber}
              </span>
            </div>
          )}
          <button
            onClick={() => setChatOpen(true)}
            className="relative border border-gold/30 rounded-full px-3.5 py-1.5 text-cream text-[11px]
                       hover:border-gold hover:text-gold transition-colors"
          >
            💬 Staff
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-5 pt-7 pb-5 bg-gradient-to-b from-gold/6 to-transparent">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold/60 mb-1">
          {getGreeting()}
        </p>
        <h2 className="font-serif text-2xl text-white">
          Welcome, <em className="text-gold not-italic">{guestName}</em>
        </h2>
      </div>

      {/* Status Pills */}
      <div className="flex gap-2 px-5 pb-5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/8 text-cream/50 text-[11px] flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Staff Online
        </div>
        {tableNumber && (
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/8 text-cream/50 text-[11px] flex-shrink-0">
            🪑 Table {tableNumber} · Active
          </div>
        )}
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/8 text-cream/50 text-[11px] flex-shrink-0">
          🕐 Service Open
        </div>
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/8 text-cream/50 text-[11px] flex-shrink-0">
          🥂 Bar Open
        </div>
      </div>

      {/* Access Requests */}
      <AccessRequests />

      {/* Order Status */}
      <OrderStatus />

      {/* Category Tabs */}
      <div className="flex gap-0 px-5 mb-6 overflow-x-auto no-scrollbar border-b border-white/5">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-5 py-3 text-[11px] tracking-[0.15em] uppercase 
                       border-b-2 transition-all whitespace-nowrap
                       ${selectedCategory === cat
                         ? 'text-gold border-gold'
                         : 'text-cream/35 border-transparent hover:text-cream/60'
                       }`}
          >
            {CATEGORY_ICONS[cat] && <span className="mr-1.5">{CATEGORY_ICONS[cat]}</span>}
            {cat === 'all' ? 'All' : CATEGORY_NAMES[cat].split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Menu Header */}
      <div className="px-5 pb-4 flex items-baseline justify-between">
        <h3 className="font-serif text-xl text-white">{CATEGORY_NAMES[selectedCategory]}</h3>
        <span className="text-[11px] text-cream/30 tracking-wide">{filteredItems.length} items</span>
      </div>

      {/* Menu Items */}
      <div className="px-5 space-y-0.5">
        {filteredItems.map(item => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Cart Bar */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 glass border-t border-gold/20 px-5 py-3.5 z-[60]
                        flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] tracking-[0.15em] uppercase text-cream/40">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </span>
            <span className="font-serif text-xl text-gold">{formatPrice(total)}</span>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="bg-gold text-dark font-medium px-7 py-3 rounded text-[11px] tracking-[0.15em] uppercase
                       hover:bg-gold-light transition-colors"
          >
            View Order →
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-8 text-center">
        <p className="text-[10px] text-cream/20">
          Built by{' '}
          <a 
            href="https://wa.me/2348174143260" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gold/40 hover:text-gold transition-colors"
          >
            Toluwase Christopher
          </a>
          {' '}· Web Developer
        </p>
      </div>

      {/* Panels */}
      <CartPanel isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};
