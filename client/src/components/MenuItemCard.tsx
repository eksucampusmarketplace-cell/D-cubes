import React, { useCallback } from 'react';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/format';
import { CATEGORY_IMAGES } from '@/config/images';

interface MenuItemCardProps {
  item: MenuItem;
  index?: number;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, index = 0 }) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find(i => i.id === item.id);
  const imageSrc = item.image || CATEGORY_IMAGES[item.category as keyof typeof CATEGORY_IMAGES] || CATEGORY_IMAGES.cocktails;

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item);
  }, [addItem, item]);

  const handleDecrease = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(item.id, cartItem.quantity - 1);
    }
  }, [cartItem, item.id, updateQuantity]);

  const handleIncrease = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      updateQuantity(item.id, cartItem.quantity + 1);
    } else {
      addItem(item);
    }
  }, [cartItem, item, addItem, updateQuantity]);

  const getTagStyle = () => {
    if (item.isNew) return { text: 'New', className: 'bg-emerald-500 text-white' };
    if (item.isSignature || item.tags.includes('Signature')) return { text: 'Signature', className: 'bg-gold text-black' };
    if (item.isPopular) return { text: 'Popular', className: 'bg-rose-500 text-white' };
    return null;
  };

  const tag = getTagStyle();

  return (
    <div 
      className="luxury-card overflow-hidden group stagger-item bg-black/30"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex gap-0">
        {/* Image */}
        <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden">
          <img 
            src={imageSrc}
            alt={item.name}
            className="w-full h-full object-cover image-hover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
          
          {/* Tags Overlay */}
          {tag && (
            <div className="absolute top-2 left-2 z-10">
              <span className={`px-2.5 py-1 text-[9px] tracking-[0.15em] uppercase rounded-full font-bold shadow-lg ${tag.className}`}>
                {tag.text}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-serif text-lg text-white font-semibold group-hover:text-gold transition-colors line-clamp-1
                           drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {item.name}
              </h3>
            </div>
            <p className="text-sm text-white/70 leading-relaxed line-clamp-2 mb-2 font-medium">
              {item.description}
            </p>
            
            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {item.tags.slice(0, 2).map(tag => (
                  <span 
                    key={tag}
                    className="text-[9px] tracking-[0.1em] uppercase px-2.5 py-1 border border-gold/40 
                               text-gold rounded-full bg-gold/10 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-lg text-gold font-bold">
              {formatPrice(item.price)}
            </p>

            {/* Add/Quantity Controls */}
            <div className="flex items-center">
              {cartItem ? (
                <div className="flex items-center bg-black/50 rounded-xl overflow-hidden border-2 border-gold/30 shadow-lg">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    className="btn-quantity border-0 rounded-none"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm text-white font-bold">
                    {cartItem.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    className="btn-quantity border-0 rounded-none"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="btn-luxury px-6 py-2.5 text-[10px]"
                  aria-label={`Add ${item.name} to cart`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
