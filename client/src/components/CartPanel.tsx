import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useTable } from '@/context/TableContext';
import { useSocket } from '@/context/SocketContext';
import { formatPrice, generateOrderId } from '@/utils/format';
import type { Order } from '@/types';

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_IMAGES: Record<string, string> = {
  cocktails: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=100&auto=format&fit=crop&q=80',
  spirits: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=100&auto=format&fit=crop&q=80',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=100&auto=format&fit=crop&q=80',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&auto=format&fit=crop&q=80',
  shisha: 'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=100&auto=format&fit=crop&q=80',
  nonalc: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=100&auto=format&fit=crop&q=80',
};

export const CartPanel: React.FC<CartPanelProps> = ({ isOpen, onClose }) => {
  const { items, total, clearCart, updateQuantity } = useCart();
  const { tableNumber, guestName, guestId, sessionId, orders, setOrders } = useTable();
  const { sendOrder } = useSocket();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOrder = async () => {
    if (!tableNumber || items.length === 0) return;

    setIsSubmitting(true);

    const newOrder: Order = {
      id: generateOrderId(),
      tableNumber,
      guestName,
      guestId,
      sessionId,
      items: [...items],
      note: note.trim() || undefined,
      status: 'pending',
      paymentStatus: 'unpaid',
      timestamp: new Date(),
      total
    };

    sendOrder(newOrder);
    setOrders([...orders, newOrder]);
    clearCart();
    setNote('');
    setIsSubmitting(false);
    onClose();

    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = '✦ Order sent! Staff notified.';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const foodItems = items.filter(item => item.category === 'food');
  const drinkItems = items.filter(item => ['cocktails', 'spirits', 'wine', 'nonalc'].includes(item.category));
  const shishaItems = items.filter(item => item.category === 'shisha');

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[70] transition-opacity duration-300
                   ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-dark-4 border-t border-gold/20 
                    rounded-t-3xl z-[80] max-h-[90vh] overflow-y-auto
                    transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Handle */}
        <div className="relative flex justify-center pt-4 pb-2">
          <div className="w-12 h-1 bg-gold/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-gold/10">
          <div>
            <h2 className="font-serif text-2xl text-white">Your Order</h2>
            <p className="text-xs text-cream/40 mt-1">Review and confirm your selections</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-dark-2 border border-gold/15 flex items-center justify-center text-cream
                       hover:border-gold/30 hover:bg-dark-3 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-dark-2 border border-gold/10 flex items-center justify-center mb-4">
                <span className="text-3xl opacity-50">🍽️</span>
              </div>
              <p className="text-cream/50 text-base">Your cart is empty</p>
              <p className="text-cream/30 text-sm mt-2">Browse our menu and add items</p>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex gap-4 p-3 rounded-2xl bg-dark-2/50 border border-gold/10 hover:border-gold/20 transition-colors"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image || CATEGORY_IMAGES[item.category]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-white text-base line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-cream/40 line-clamp-1">{item.description}</p>
                      <p className="text-gold text-sm font-medium mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center">
                      <div className="flex items-center bg-dark-3 rounded-xl overflow-hidden border border-gold/15">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm text-cream font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="flex justify-between items-center pt-4 border-t border-gold/10">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-cream/40">Total</span>
                  <p className="text-xs text-cream/30 mt-1">{items.reduce((a, b) => a + b.quantity, 0)} items</p>
                </div>
                <span className="font-serif text-3xl text-gold">{formatPrice(total)}</span>
              </div>

              {/* Order Preview by Destination */}
              {(foodItems.length > 0 || drinkItems.length > 0 || shishaItems.length > 0) && (
                <div className="bg-dark-2/60 rounded-2xl p-4 border border-gold/10">
                  <p className="text-[10px] text-cream/40 uppercase tracking-[0.2em] mb-3">Order routing</p>
                  <div className="flex flex-wrap gap-2">
                    {foodItems.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-xs text-orange-400">Kitchen ({foodItems.reduce((a, b) => a + b.quantity, 0)})</span>
                      </div>
                    )}
                    {drinkItems.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs text-blue-400">Bar ({drinkItems.reduce((a, b) => a + b.quantity, 0)})</span>
                      </div>
                    )}
                    {shishaItems.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-purple-500/10 border border-purple-500/20">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-xs text-purple-400">Shisha ({shishaItems.reduce((a, b) => a + b.quantity, 0)})</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="text-[10px] text-cream/40 uppercase tracking-[0.2em] mb-2 block">Special Requests</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Allergies, preferences, or special instructions..."
                  rows={3}
                  className="w-full input-luxury resize-none"
                />
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendOrder}
                disabled={isSubmitting}
                className="w-full btn-luxury py-5 rounded-2xl text-xs relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                      <span>SENDING...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">✦</span>
                      <span>SEND ORDER TO STAFF</span>
                    </>
                  )}
                </span>
              </button>
              
              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="w-full text-cream/30 text-xs hover:text-red-400 transition-colors py-2"
              >
                Clear all items
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
