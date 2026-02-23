import React from 'react';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/format';

interface MenuItemCardProps {
  item: MenuItem;
  index?: number;
}

const CATEGORY_IMAGES: Record<string, string> = {
  cocktails: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&auto=format&fit=crop&q=80',
  spirits: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop&q=80',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80',
  shisha: 'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=400&auto=format&fit=crop&q=80',
  nonalc: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&auto=format&fit=crop&q=80',
};

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, index = 0 }) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find(i => i.id === item.id);
  const imageSrc = item.image || CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.cocktails;

  return (
    <div 
      className="luxury-card rounded-2xl overflow-hidden group"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex gap-0">
        {/* Image */}
        <div className="relative w-28 h-28 flex-shrink-0 overflow-hidden">
          <img 
            src={imageSrc}
            alt={item.name}
            className="w-full h-full object-cover image-hover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-dark-2/50" />
          
          {/* Tags Overlay */}
          {(item.isNew || item.isSignature || item.isPopular || item.tags.includes('Signature')) && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-0.5 bg-gold text-dark text-[9px] tracking-wider uppercase rounded-full font-semibold">
                {item.isNew ? 'New' : item.isSignature || item.tags.includes('Signature') ? 'Signature' : 'Popular'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-serif text-lg text-white group-hover:text-gold transition-colors line-clamp-1">
                {item.name}
              </h3>
            </div>
            <p className="text-xs text-cream/40 leading-relaxed line-clamp-2 mb-2">
              {item.description}
            </p>
            
            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {item.tags.slice(0, 2).map(tag => (
                  <span 
                    key={tag}
                    className="text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 border border-gold/20 
                               text-gold/70 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-lg text-gold font-medium">
              {formatPrice(item.price)}
            </p>

            {/* Add/Quantity Controls */}
            <div className="flex items-center">
              {cartItem ? (
                <div className="flex items-center bg-dark-3 rounded-xl overflow-hidden border border-gold/20">
                  <button
                    onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
                    className="w-9 h-9 flex items-center justify-center text-gold hover:bg-gold/10 
                               transition-colors text-lg font-light"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm text-cream font-medium">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
                    className="w-9 h-9 flex items-center justify-center text-gold hover:bg-gold/10 
                               transition-colors text-lg font-light"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addItem(item)}
                  className="btn-luxury px-5 py-2.5 rounded-xl text-[10px] relative overflow-hidden"
                >
                  <span className="relative z-10">Add</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
