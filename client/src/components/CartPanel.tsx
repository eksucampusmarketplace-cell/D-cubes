import React, { useState, useCallback, useEffect } from 'react';
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
  const { sendOrder, isConnected } = useSocket();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Listen for order errors
  useEffect(() => {
    const handleOrderError = (event: CustomEvent<{ error: string; message: string }>) => {
      setOrderError(event.detail.message);
      setIsSubmitting(false);
    };

    window.addEventListener('order-error', handleOrderError as EventListener);
    return () => {
      window.removeEventListener('order-error', handleOrderError as EventListener);
    };
  }, []);

  // Clear error when panel opens
  useEffect(() => {
    if (isOpen) {
      setOrderError(null);
    }
  }, [isOpen]);

  const handleSendOrder = useCallback(async () => {
    if (!tableNumber || items.length === 0) return;

    if (!isConnected) {
      setOrderError('Connection lost. Please check your internet and try again.');
      return;
    }

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

    // Show success toast
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.innerHTML = '✦ Order sent! Staff notified.';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }, [tableNumber, items, guestName, guestId, sessionId, orders, setOrders, sendOrder, clearCart, note, total, onClose]);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  }, [onClose]);

  const handleQuantityUpdate = useCallback((itemId: number, newQuantity: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQuantity(itemId, newQuantity);
  }, [updateQuantity]);

  const handleClearCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Clear all items from your order?')) {
      clearCart();
    }
  }, [clearCart]);

  const foodItems = items.filter(item => item.category === 'food');
  const drinkItems = items.filter(item =>
    ['cocktails', 'spirits', 'wine', 'nonalc', 'brandy', 'tequila', 'sparkling-wine', 'liquor', 'mixers', 'energy-drinks', 'beer'].includes(item.category)
  );
  const shishaItems = items.filter(item => item.category === 'shisha');

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[70] transition-opacity duration-300
                   ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-dark-4 border-t border-gold/20 
                    rounded-t-[32px] z-[80] max-h-[92vh] overflow-hidden flex flex-col
                    transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Handle */}
        <div className="relative flex justify-center pt-5 pb-3">
          <div className="w-14 h-1.5 bg-gold/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-gold/10">
          <div>
            <h2 className="font-serif text-2xl text-white">Your Order</h2>
            <p className="text-xs text-cream/40 mt-1">Review and confirm your selections</p>
          </div>
          <button 
            type="button"
            onClick={handleClose}
            className="btn-icon"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-dark-2 border border-gold/15 flex items-center justify-center mb-5
                            shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
                <span className="text-4xl opacity-40">🍽️</span>
              </div>
              <p className="text-cream/60 text-lg font-medium">Your cart is empty</p>
              <p className="text-cream/35 text-sm mt-2">Browse our menu and add items</p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-6 btn-secondary"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex gap-4 p-4 rounded-2xl bg-dark-2/60 border border-gold/10 
                               hover:border-gold/25 transition-all duration-300 stagger-item"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gold/10">
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
                      <p className="text-gold text-sm font-semibold mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center">
                      <div className="flex items-center bg-dark-3 rounded-xl overflow-hidden border border-gold/15">
                        <button
                          type="button"
                          onClick={handleQuantityUpdate(item.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center text-gold hover:bg-gold/10 
                                     transition-colors text-lg font-light"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-9 text-center text-sm text-cream font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={handleQuantityUpdate(item.id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-gold hover:bg-gold/10 
                                     transition-colors text-lg font-light"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="flex justify-between items-center pt-4 border-t border-gold/15">
                <div>
                  <span className="text-xs uppercase tracking-[0.25em] text-cream/40">Total</span>
                  <p className="text-xs text-cream/30 mt-1">{items.reduce((a, b) => a + b.quantity, 0)} items</p>
                </div>
                <span className="font-serif text-3xl text-gold">{formatPrice(total)}</span>
              </div>

              {/* Order Preview by Destination */}
              {(foodItems.length > 0 || drinkItems.length > 0 || shishaItems.length > 0) && (
                <div className="bg-dark-2/60 rounded-2xl p-5 border border-gold/10">
                  <p className="text-[10px] text-cream/40 uppercase tracking-[0.2em] mb-4">Order routing</p>
                  <div className="flex flex-wrap gap-2">
                    {foodItems.length > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-orange-500/10 border border-orange-500/25">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-xs text-orange-400 font-medium">Kitchen ({foodItems.reduce((a, b) => a + b.quantity, 0)})</span>
                      </div>
                    )}
                    {drinkItems.length > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/25">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs text-blue-400 font-medium">Bar ({drinkItems.reduce((a, b) => a + b.quantity, 0)})</span>
                      </div>
                    )}
                    {shishaItems.length > 0 && (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-purple-500/10 border border-purple-500/25">
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <span className="text-xs text-purple-400 font-medium">Shisha ({shishaItems.reduce((a, b) => a + b.quantity, 0)})</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="text-[10px] text-cream/40 uppercase tracking-[0.2em] mb-3 block">Special Requests</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Allergies, preferences, or special instructions..."
                  rows={3}
                  className="w-full input-luxury resize-none text-sm"
                />
              </div>

              {/* Error Message */}
              {orderError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-red-400 text-sm font-medium">Order Failed</p>
                    <p className="text-red-300/70 text-xs mt-1">{orderError}</p>
                  </div>
                </div>
              )}

              {/* Connection Warning */}
              {!isConnected && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-amber-400 text-sm font-medium">Connection Lost</p>
                    <p className="text-amber-300/70 text-xs mt-1">Your order cannot be sent until connection is restored.</p>
                  </div>
                </div>
              )}

              {/* Send Button */}
              <button
                type="button"
                onClick={handleSendOrder}
                disabled={isSubmitting || !isConnected}
                className={`w-full btn-luxury py-5 text-xs ${isSubmitting ? 'loading' : ''} ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>SENDING ORDER...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg animate-pulse">✦</span>
                      <span>SEND ORDER TO STAFF</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
              
              {/* Clear Cart */}
              <button
                type="button"
                onClick={handleClearCart}
                className="w-full text-cream/30 text-xs hover:text-red-400 transition-colors py-2 flex items-center justify-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear all items
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
