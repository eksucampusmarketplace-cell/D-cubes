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

export const CartPanel: React.FC<CartPanelProps> = ({ isOpen, onClose }) => {
  const { items, total, clearCart, updateQuantity } = useCart();
  const { tableNumber, guestName, orders, setOrders } = useTable();
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
      items: [...items],
      note: note.trim() || undefined,
      status: 'pending',
      timestamp: new Date(),
      total
    };

    // Send via socket
    sendOrder(newOrder);
    
    // Update local state
    setOrders([...orders, newOrder]);
    
    // Clear cart
    clearCart();
    setNote('');
    
    setIsSubmitting(false);
    onClose();

    // Show success toast (could be moved to a toast context)
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
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] transition-opacity duration-300
                   ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-dark border-t border-gold/25 
                    rounded-t-2xl z-[80] max-h-[85vh] overflow-y-auto
                    transform transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-white/15 rounded-full mx-auto mt-3.5" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="font-serif text-xl text-white">Your Order</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-cream
                       hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-8 text-cream/40">
              <p className="text-sm">Your cart is empty</p>
              <p className="text-xs mt-1">Add items from the menu</p>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/5">
                    <div>
                      <p className="text-sm text-cream">{item.name}</p>
                      <p className="text-xs text-cream/40">×{item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <div className="flex items-center border border-gold/20 rounded overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-gold text-sm hover:bg-gold/10"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs text-cream">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center text-gold text-sm hover:bg-gold/10"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs uppercase tracking-[0.2em] text-cream/40">Total</span>
                <span className="font-serif text-2xl text-gold">{formatPrice(total)}</span>
              </div>

              {/* Order Preview by Destination */}
              {(foodItems.length > 0 || drinkItems.length > 0 || shishaItems.length > 0) && (
                <div className="bg-dark-2 rounded p-3 space-y-2">
                  <p className="text-xs text-cream/50 uppercase tracking-wider">Order will be sent to:</p>
                  {foodItems.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-cream/70">Kitchen ({foodItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                    </div>
                  )}
                  {drinkItems.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-cream/70">Bar ({drinkItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                    </div>
                  )}
                  {shishaItems.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-cream/70">Bar — Shisha ({shishaItems.reduce((a, b) => a + b.quantity, 0)} items)</span>
                    </div>
                  )}
                </div>
              )}

              {/* Note */}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any special requests or notes for the kitchen..."
                rows={2}
                className="w-full bg-dark-2 border border-white/8 rounded p-3.5 text-cream text-sm
                           focus:border-gold/40 focus:outline-none resize-none
                           placeholder:text-cream/20 transition-colors"
              />

              {/* Send Button */}
              <button
                onClick={handleSendOrder}
                disabled={isSubmitting}
                className="w-full bg-gold text-dark font-medium py-4 rounded text-xs tracking-[0.2em] uppercase
                           hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                    SENDING...
                  </>
                ) : (
                  <>📲 SEND ORDER TO STAFF</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
