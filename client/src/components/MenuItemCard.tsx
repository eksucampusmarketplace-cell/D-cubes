import React from 'react';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/format';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find(i => i.id === item.id);

  return (
    <div className="bg-dark-2 p-4 grid grid-cols-[1fr_auto] gap-4 items-center transition-all duration-200 
                    border-l-2 border-transparent hover:bg-dark-3 hover:border-gold/30 group">
      <div>
        <h3 className="font-serif text-base text-white mb-1 group-hover:text-gold-light transition-colors">
          {item.name}
        </h3>
        <p className="text-xs text-cream/35 leading-relaxed mb-1.5">
          {item.description}
        </p>
        <p className="text-sm text-gold tracking-wide">
          {formatPrice(item.price)}
        </p>
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {item.tags.map(tag => (
              <span 
                key={tag}
                className="text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 border border-gold/20 
                           text-gold/60 rounded-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        {cartItem ? (
          <div className="flex items-center border border-gold/20 rounded overflow-hidden">
            <button
              onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-gold hover:bg-gold/10 
                         transition-colors text-lg font-light"
            >
              −
            </button>
            <span className="w-8 text-center text-sm text-cream bg-gold/5">
              {cartItem.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center text-gold hover:bg-gold/10 
                         transition-colors text-lg font-light"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => addItem(item)}
            className="bg-gold text-dark text-[10px] font-medium tracking-[0.1em] uppercase 
                       px-4 py-2 rounded hover:bg-gold-light transition-colors w-[70px]"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
};
