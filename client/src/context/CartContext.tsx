import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CartItem, MenuItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dcubes_cart';
const CART_EXPIRY_KEY = 'dcubes_cart_expiry';
const CART_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function loadCartFromStorage(): CartItem[] {
  try {
    const expiry = localStorage.getItem(CART_EXPIRY_KEY);
    if (expiry) {
      const expiryTime = parseInt(expiry, 10);
      if (Date.now() > expiryTime) {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(CART_EXPIRY_KEY);
        return [];
      }
    }
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  try {
    if (items.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_EXPIRY_KEY);
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(CART_EXPIRY_KEY, String(Date.now() + CART_TTL_MS));
    }
  } catch {
    // Ignore storage errors
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const [isOpen, setIsOpen] = useState(false);

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addItem = useCallback((item: MenuItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((itemId: number) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(prev => prev.map(i => 
      i.id === itemId ? { ...i, quantity } : i
    ));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      itemCount,
      isOpen,
      setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
