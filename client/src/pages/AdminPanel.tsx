import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MenuItem, ZoneType, InventoryUpdate, TelegramNotificationConfig, Receipt } from '@/types';
import { MENU_ITEMS, CATEGORY_NAMES, CATEGORY_ICONS, ZONE_PRICES } from '@/data/menu';
import { ZONES } from '@/data/locations';
import { formatPrice } from '@/utils/format';
import { authenticatedFetch } from '@/utils/api';
import { useSocket } from '@/context/SocketContext';
import { useSettings } from '@/context/SettingsContext';

type Tab = 'menu' | 'zone-prices' | 'inventory' | 'receipts' | 'telegram' | 'settings';

const CATEGORY_IMAGES: Record<string, string> = {
  cocktails: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&auto=format&fit=crop&q=80',
  spirits: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop&q=80',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80',
  shisha: 'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=400&auto=format&fit=crop&q=80',
  nonalc: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&auto=format&fit=crop&q=80',
  brandy: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
  tequila: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400&auto=format&fit=crop&q=80',
  liquor: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
  mixers: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&auto=format&fit=crop&q=80',
  'energy-drinks': 'https://images.unsplash.com/photo-1613424188715-165f62092b30?w=400&auto=format&fit=crop&q=80',
  'sparkling-wine': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop&q=80',
};

export const AdminPanel: React.FC = () => {
  const { inventoryStatus, telegramConfig, updateInventory, updateTelegramConfig } = useSocket();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [localTelegramConfig, setLocalTelegramConfig] = useState<TelegramNotificationConfig>({
    newOrder: true,
    orderStatus: true,
    payment: true,
    refund: true,
    accessRequest: true,
    chat: true,
    session: true
  });
  
  // Zone prices state
  const [zonePrices, setZonePrices] = useState(ZONE_PRICES);
  const [selectedZoneForPricing, setSelectedZoneForPricing] = useState<ZoneType>('lounge');

  // Load receipts
  useEffect(() => {
    authenticatedFetch('/api/receipts', {}, 'manager')
      .then(res => res.json())
      .then(data => setReceipts(data))
      .catch(console.error);
  }, []);

  // Sync telegram config
  useEffect(() => {
    if (telegramConfig) {
      setLocalTelegramConfig(telegramConfig);
    }
  }, [telegramConfig]);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSaveItem = (item: MenuItem) => {
    if (selectedItem) {
      setMenuItems(prev => prev.map(i => i.id === item.id ? item : i));
    } else {
      setMenuItems(prev => [...prev, { ...item, id: Date.now() }]);
    }
    setSelectedItem(null);
    setIsEditing(false);
  };

  const handleDeleteItem = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMenuItems(prev => prev.filter(i => i.id !== id));
    }
  };

  // Zone price handlers
  const handleZonePriceChange = (itemId: number, price: number) => {
    setZonePrices(prev => ({
      ...prev,
      [selectedZoneForPricing]: {
        ...prev[selectedZoneForPricing],
        [itemId]: price
      }
    }));
  };

  const handleClearZonePrice = (itemId: number) => {
    setZonePrices(prev => {
      const newZonePrices = { ...prev };
      if (newZonePrices[selectedZoneForPricing]) {
        delete newZonePrices[selectedZoneForPricing][itemId];
      }
      return newZonePrices;
    });
  };

  const handleToggleInventory = (itemId: number, isAvailable: boolean) => {
    const update: InventoryUpdate = {
      itemId,
      isAvailable,
      updatedBy: 'admin',
      updatedAt: new Date()
    };
    updateInventory(update);
  };

  const handleSaveTelegramConfig = () => {
    updateTelegramConfig(localTelegramConfig);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-dark-4">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:fixed left-0 top-0 bottom-0 w-64 bg-dark-2 border-r border-gold/10 flex flex-col z-50 transform transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-gold/10">
          <h1 className="font-display text-2xl tracking-[0.2em] text-gold">ADMIN</h1>
          <p className="text-[10px] tracking-[0.2em] uppercase text-cream/30 mt-1">Content Management</p>
        </div>

        {/* Navigation */}
        <div className="p-4 flex-1">
          <button
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all mb-2
                       ${activeTab === 'menu' 
                         ? 'bg-gold/10 text-gold border border-gold/20' 
                         : 'text-cream/50 hover:text-cream hover:bg-white/5'}`}
          >
            <span className="text-lg">📋</span>
            Menu Items
          </button>
          <button
            onClick={() => setActiveTab('zone-prices')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all mb-2
                       ${activeTab === 'zone-prices' 
                         ? 'bg-gold/10 text-gold border border-gold/20' 
                         : 'text-cream/50 hover:text-cream hover:bg-white/5'}`}
          >
            <span className="text-lg">💰</span>
            Zone Prices
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all mb-2
                       ${activeTab === 'inventory' 
                         ? 'bg-gold/10 text-gold border border-gold/20' 
                         : 'text-cream/50 hover:text-cream hover:bg-white/5'}`}
          >
            <span className="text-lg">📦</span>
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all mb-2
                       ${activeTab === 'receipts' 
                         ? 'bg-gold/10 text-gold border border-gold/20' 
                         : 'text-cream/50 hover:text-cream hover:bg-white/5'}`}
          >
            <span className="text-lg">🧾</span>
            Receipts
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all mb-2
                       ${activeTab === 'telegram' 
                         ? 'bg-gold/10 text-gold border border-gold/20' 
                         : 'text-cream/50 hover:text-cream hover:bg-white/5'}`}
          >
            <span className="text-lg">📱</span>
            Telegram
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                       ${activeTab === 'settings' 
                         ? 'bg-gold/10 text-gold border border-gold/20' 
                         : 'text-cream/50 hover:text-cream hover:bg-white/5'}`}
          >
            <span className="text-lg">⚙️</span>
            App Settings
          </button>
        </div>

        {/* Back to Manager */}
        <div className="p-4 border-t border-gold/10">
          <a
            href="/manager"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-cream/50 hover:text-cream hover:bg-white/5 transition-all"
          >
            <span className="text-lg">←</span>
            Back to Manager
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-0 lg:ml-64 p-4 lg:p-8">
        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 text-cream hover:text-gold transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {activeTab === 'menu' && (
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-3xl text-white">Menu Items</h2>
                <p className="text-cream/40 mt-1">Manage your menu items, images, and base pricing</p>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setIsEditing(true);
                }}
                className="btn-luxury px-6 py-3 rounded-xl text-xs"
              >
                + Add New Item
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items..."
                  className="w-full input-luxury pr-10"
                />
                <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-cream/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-luxury min-w-[200px]"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_NAMES).filter(([key]) => key !== 'all').map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="luxury-card rounded-2xl overflow-hidden group">
                  <div className="relative h-40">
                    <img 
                      src={item.image || CATEGORY_IMAGES[item.category]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 gradient-overlay" />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-dark-4/80 backdrop-blur text-gold text-xs rounded-full">
                        {CATEGORY_ICONS[item.category]} {CATEGORY_NAMES[item.category]}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsEditing(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-dark-4/80 backdrop-blur flex items-center justify-center text-cream hover:text-gold transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/80 backdrop-blur flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-serif text-lg text-white">{item.name}</h3>
                      <span className="text-gold font-medium">{formatPrice(item.price)}</span>
                    </div>
                    <p className="text-sm text-cream/40 line-clamp-2 mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-[9px] uppercase tracking-wider border border-gold/20 text-gold/70 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'zone-prices' && (
          <ZonePricesManager 
            menuItems={menuItems}
            zonePrices={zonePrices}
            selectedZone={selectedZoneForPricing}
            onZoneChange={setSelectedZoneForPricing}
            onPriceChange={handleZonePriceChange}
            onClearPrice={handleClearZonePrice}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManager 
            menuItems={menuItems}
            inventoryStatus={inventoryStatus}
            onToggle={handleToggleInventory}
          />
        )}

        {activeTab === 'receipts' && (
          <ReceiptsManager receipts={receipts} />
        )}

        {activeTab === 'telegram' && (
          <TelegramConfig 
            config={localTelegramConfig}
            onChange={setLocalTelegramConfig}
            onSave={handleSaveTelegramConfig}
          />
        )}

        {activeTab === 'settings' && (
          <AppSettingsManager 
            settings={settings}
            updateSettings={updateSettings}
          />
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <EditItemModal
          item={selectedItem}
          onSave={handleSaveItem}
          onClose={() => {
            setSelectedItem(null);
            setIsEditing(false);
          }}
        />
      )}
    </div>
  );
};

// Zone Prices Manager Component
interface ZonePricesManagerProps {
  menuItems: MenuItem[];
  zonePrices: typeof ZONE_PRICES;
  selectedZone: ZoneType;
  onZoneChange: (zone: ZoneType) => void;
  onPriceChange: (itemId: number, price: number) => void;
  onClearPrice: (itemId: number) => void;
}

const ZonePricesManager: React.FC<ZonePricesManagerProps> = ({
  menuItems,
  zonePrices,
  selectedZone,
  onZoneChange,
  onPriceChange,
  onClearPrice
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getZonePrice = (itemId: number) => {
    return zonePrices[selectedZone]?.[itemId];
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl text-white">Zone Prices</h2>
          <p className="text-cream/40 mt-1">Set custom prices for each zone. Blank = uses base price.</p>
        </div>
      </div>

      {/* Zone Selector */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(ZONES) as ZoneType[]).map(zone => (
          <button
            key={zone}
            onClick={() => onZoneChange(zone)}
            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                       ${selectedZone === zone 
                         ? 'bg-gold text-black' 
                         : 'bg-dark-2 text-cream/70 hover:bg-dark-3'}`}
          >
            <span>{ZONES[zone].icon}</span>
            <span className="capitalize">{ZONES[zone].name}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full input-luxury pr-10"
          />
          <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-cream/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-luxury min-w-[200px]"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_NAMES).filter(([key]) => key !== 'all').map(([key, name]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>
      </div>

      {/* Prices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const zonePrice = getZonePrice(item.id);
          const hasCustomPrice = zonePrice !== undefined;
          
          return (
            <div key={item.id} className={`luxury-card rounded-2xl p-4 ${hasCustomPrice ? 'border-gold/30' : ''}`}>
              <div className="flex items-start gap-3 mb-3">
                <img 
                  src={item.image || CATEGORY_IMAGES[item.category]} 
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-white truncate">{item.name}</h3>
                  <p className="text-xs text-cream/40">{CATEGORY_NAMES[item.category]}</p>
                  <p className="text-xs text-cream/30">Base: {formatPrice(item.price)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30">₦</span>
                  <input
                    type="number"
                    value={zonePrice || ''}
                    onChange={(e) => onPriceChange(item.id, Number(e.target.value))}
                    placeholder={item.price.toString()}
                    className="w-full input-luxury pl-8"
                  />
                </div>
                {hasCustomPrice && (
                  <button
                    onClick={() => onClearPrice(item.id)}
                    className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-sm"
                    title="Clear custom price"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {hasCustomPrice && (
                <p className="text-xs text-gold mt-2">
                  Custom price active for {ZONES[selectedZone].name}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Image Upload Component (used in EditItemModal)
interface ImageUploadProps {
  currentImage: string;
  onImageChange: (image: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ currentImage, onImageChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setUploadError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange(result);
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  return (
    <div className="space-y-3">
      {/* Image Preview */}
      <div 
        className={`relative h-48 rounded-xl overflow-hidden border-2 transition-all ${
          isDragging ? 'border-gold bg-gold/10' : 'border-gold/20'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {currentImage ? (
          <>
            <img 
              src={currentImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-4/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 bg-dark-4/90 backdrop-blur border border-gold/30 rounded-lg text-gold text-sm
                           hover:bg-gold hover:text-black transition-all"
              >
                🖼️ Change Image
              </button>
              <button
                onClick={() => onImageChange('')}
                className="px-4 py-2 bg-red-500/90 backdrop-blur rounded-lg text-white text-sm
                           hover:bg-red-600 transition-all"
              >
                ✕
              </button>
            </div>
          </>
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-dark-2/50"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-all ${
              isDragging ? 'bg-gold/20 scale-110' : 'bg-gold/10'
            }`}>
              <span className="text-3xl">📤</span>
            </div>
            <p className="text-cream/70 text-sm font-medium">
              {isDragging ? 'Drop image here' : 'Click or drag image here'}
            </p>
            <p className="text-cream/40 text-xs mt-1">JPG, PNG, WEBP up to 5MB</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {uploadError && (
        <p className="text-red-400 text-sm flex items-center gap-2">
          <span>⚠️</span> {uploadError}
        </p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* URL Input as Alternative */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gold/10" />
        <span className="text-cream/30 text-xs">or use URL</span>
        <div className="flex-1 h-px bg-gold/10" />
      </div>
      
      <input
        type="text"
        value={currentImage || ''}
        onChange={(e) => onImageChange(e.target.value)}
        className="w-full input-luxury text-sm"
        placeholder="https://example.com/image.jpg"
      />
    </div>
  );
};

// Edit Item Modal Component
interface EditItemModalProps {
  item: MenuItem | null;
  onSave: (item: MenuItem) => void;
  onClose: () => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ item, onSave, onClose }) => {
  const [formData, setFormData] = useState<MenuItem>(
    item || {
      id: 0,
      name: '',
      description: '',
      price: 0,
      category: 'brandy',
      tags: [],
      image: '',
    }
  );

  const handleTagChange = (tags: string) => {
    setFormData({
      ...formData,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-dark-4 rounded-3xl border border-gold/20">
        {/* Header */}
        <div className="sticky top-0 bg-dark-4 px-6 py-4 border-b border-gold/10 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-white">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-dark-2 border border-gold/15 flex items-center justify-center text-cream
                       hover:border-gold/30 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Image Upload Section */}
          <div>
            <label className="text-xs text-cream/40 uppercase tracking-wider mb-3 block">Item Image</label>
            <ImageUpload
              currentImage={formData.image || ''}
              onImageChange={(image) => setFormData({ ...formData, image })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-cream/40 uppercase tracking-wider mb-2 block">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full input-luxury"
                placeholder="Item name"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-cream/40 uppercase tracking-wider mb-2 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full input-luxury resize-none"
                rows={2}
                placeholder="Item description"
              />
            </div>

            <div>
              <label className="text-xs text-cream/40 uppercase tracking-wider mb-2 block">Base Price (₦)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full input-luxury"
                placeholder="0"
              />
            </div>

            <div>
              <label className="text-xs text-cream/40 uppercase tracking-wider mb-2 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuItem['category'] })}
                className="w-full input-luxury"
              >
                {Object.entries(CATEGORY_NAMES).filter(([key]) => key !== 'all').map(([key, name]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs text-cream/40 uppercase tracking-wider mb-2 block">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => handleTagChange(e.target.value)}
                className="w-full input-luxury"
                placeholder="Popular, Signature, Nigerian"
              />
            </div>

            <div className="col-span-2 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="w-5 h-5 rounded border-gold/30 bg-dark-2 text-gold focus:ring-gold"
                />
                <span className="text-sm text-cream/70">Popular</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                  className="w-5 h-5 rounded border-gold/30 bg-dark-2 text-gold focus:ring-gold"
                />
                <span className="text-sm text-cream/70">New</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isSignature}
                  onChange={(e) => setFormData({ ...formData, isSignature: e.target.checked })}
                  className="w-5 h-5 rounded border-gold/30 bg-dark-2 text-gold focus:ring-gold"
                />
                <span className="text-sm text-cream/70">Signature</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-gold/10">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-xl border border-gold/20 text-cream/70 hover:text-cream hover:border-gold/40 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(formData)}
              className="flex-1 btn-luxury py-4 rounded-xl text-xs"
            >
              💾 Save Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// INVENTORY MANAGER COMPONENT
// ============================================

interface InventoryManagerProps {
  menuItems: MenuItem[];
  inventoryStatus: Record<number, { isAvailable: boolean; stockQuantity: number | null }>;
  onToggle: (itemId: number, isAvailable: boolean) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ menuItems, inventoryStatus, onToggle }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyUnavailable, setShowOnlyUnavailable] = useState(false);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const itemStatus = inventoryStatus[item.id];
    const isAvailable = itemStatus?.isAvailable !== false;
    const matchesAvailability = !showOnlyUnavailable || !isAvailable;
    return matchesCategory && matchesSearch && matchesAvailability;
  });

  const availableCount = menuItems.filter(item => {
    const status = inventoryStatus[item.id];
    return status?.isAvailable !== false;
  }).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl text-white">Inventory Management</h2>
          <p className="text-cream/40 mt-1">Toggle item availability - unavailable items show as "Out of Stock" to customers</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
            ✓ {availableCount} Available
          </span>
          <span className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            ✕ {menuItems.length - availableCount} Unavailable
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full input-luxury pr-10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-luxury min-w-[200px]"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_NAMES).filter(([key]) => key !== 'all').map(([key, name]) => (
            <option key={key} value={key}>{name}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 px-4 bg-dark-2 rounded-xl border border-gold/20 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyUnavailable}
            onChange={(e) => setShowOnlyUnavailable(e.target.checked)}
            className="w-4 h-4 rounded border-gold/30 bg-dark-2 text-gold"
          />
          <span className="text-sm text-cream/70">Out of Stock only</span>
        </label>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => {
          const status = inventoryStatus[item.id];
          const isAvailable = status?.isAvailable !== false;
          
          return (
            <div key={item.id} className={`luxury-card rounded-xl p-4 ${!isAvailable ? 'border-red-500/30 bg-red-500/5' : ''}`}>
              <div className="flex items-start gap-3">
                <img 
                  src={item.image || CATEGORY_IMAGES[item.category]} 
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{item.name}</h3>
                  <p className="text-xs text-cream/40">{CATEGORY_NAMES[item.category]}</p>
                  <p className="text-sm text-gold">{formatPrice(item.price)}</p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-sm ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                  {isAvailable ? '✓ Available' : '✕ Out of Stock'}
                </span>
                <button
                  onClick={() => onToggle(item.id, !isAvailable)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    isAvailable ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                    isAvailable ? 'right-1' : 'right-8'
                  }`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// RECEIPTS MANAGER COMPONENT
// ============================================

interface ReceiptsManagerProps {
  receipts: Receipt[];
}

const ReceiptsManager: React.FC<ReceiptsManagerProps> = ({ receipts: initialReceipts }) => {
  const [receipts, setReceipts] = useState(initialReceipts);

  useEffect(() => {
    setReceipts(initialReceipts);
  }, [initialReceipts]);

  const openReceipt = (receiptId: string) => {
    window.open(`/api/receipts/${receiptId}/html`, '_blank');
  };

  const getTimeRemaining = (expiresAt: Date | string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl text-white">Receipts</h2>
          <p className="text-cream/40 mt-1">Digital receipts - expire after 2 hours. Customers should save a screenshot.</p>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="luxury-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
            <span className="text-3xl">🧾</span>
          </div>
          <h3 className="font-serif text-xl text-white mb-2">No Active Receipts</h3>
          <p className="text-cream/40">Receipts are generated when staff creates them from orders. They expire after 2 hours.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receipts.map(receipt => (
            <div key={receipt.id} className="luxury-card rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-white">Table {receipt.tableNumber}</h3>
                  <p className="text-xs text-cream/40">{receipt.guestName}</p>
                </div>
                <span className="px-2 py-1 bg-gold/10 text-gold text-xs rounded-lg">
                  #{receipt.id.slice(-8).toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-1 mb-3">
                {receipt.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-cream/70">{item.quantity}× {item.name}</span>
                    <span className="text-cream/40">{formatPrice(item.total)}</span>
                  </div>
                ))}
                {receipt.items.length > 3 && (
                  <p className="text-xs text-cream/30">+{receipt.items.length - 3} more items</p>
                )}
              </div>

              <div className="flex justify-between items-center py-2 border-t border-gold/10">
                <span className="text-cream/70">Total</span>
                <span className="text-lg font-bold text-gold">{formatPrice(receipt.total)}</span>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-cream/40">{getTimeRemaining(receipt.expiresAt)}</span>
                <button
                  onClick={() => openReceipt(receipt.id)}
                  className="px-4 py-2 bg-gold/10 border border-gold/30 rounded-lg text-gold text-sm hover:bg-gold/20 transition-all"
                >
                  📄 View Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// TELEGRAM CONFIG COMPONENT
// ============================================

interface TelegramConfigProps {
  config: TelegramNotificationConfig;
  onChange: (config: TelegramNotificationConfig) => void;
  onSave: () => void;
}

const TelegramConfig: React.FC<TelegramConfigProps> = ({ config, onChange, onSave }) => {
  const toggleOptions: { key: keyof TelegramNotificationConfig; label: string; icon: string }[] = [
    { key: 'newOrder', label: 'New Orders', icon: '🍾' },
    { key: 'orderStatus', label: 'Order Status Updates', icon: '📝' },
    { key: 'payment', label: 'Payment Updates', icon: '💳' },
    { key: 'refund', label: 'Refund Requests', icon: '🔄' },
    { key: 'accessRequest', label: 'Access Requests', icon: '🛎️' },
    { key: 'chat', label: 'Chat Messages', icon: '💬' },
    { key: 'session', label: 'Session Events', icon: '👥' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl text-white">Telegram Notifications</h2>
          <p className="text-cream/40 mt-1">Configure which events send notifications to Telegram</p>
        </div>
      </div>

      <div className="luxury-card rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {toggleOptions.map(({ key, label, icon }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-dark-2 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-cream/70">{label}</span>
              </div>
              <button
                onClick={() => onChange({ ...config, [key]: !config[key] })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  config[key] ? 'bg-green-500' : 'bg-dark-4'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                  config[key] ? 'right-1' : 'right-8'
                }`} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onSave}
            className="btn-luxury px-8 py-3 rounded-xl text-xs"
          >
            💾 Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// APP SETTINGS MANAGER COMPONENT
// ============================================

interface AppSettingsManagerProps {
  settings: { darkMode: boolean; soundEnabled: boolean; orderSoundEnabled: boolean; chatSoundEnabled: boolean };
  updateSettings: (updates: Partial<AppSettingsManagerProps['settings']>) => void;
}

const AppSettingsManager: React.FC<AppSettingsManagerProps> = ({ settings, updateSettings }) => {
  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-white">App Settings</h2>
        <p className="text-cream/40 mt-1">Configure display and notification preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <div className="luxury-card rounded-2xl p-6">
          <h3 className="font-serif text-xl text-white mb-6">Appearance</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-2 rounded-xl">
              <div>
                <span className="text-cream/70">Dark Mode</span>
                <p className="text-xs text-cream/40 mt-1">Use dark theme throughout the app</p>
              </div>
              <button
                onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.darkMode ? 'bg-gold' : 'bg-dark-4'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                  settings.darkMode ? 'right-1' : 'right-8'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Sound Settings */}
        <div className="luxury-card rounded-2xl p-6">
          <h3 className="font-serif text-xl text-white mb-6">Sound Notifications</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-2 rounded-xl">
              <div>
                <span className="text-cream/70">Enable Sounds</span>
                <p className="text-xs text-cream/40 mt-1">Play sounds for notifications</p>
              </div>
              <button
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.soundEnabled ? 'bg-green-500' : 'bg-dark-4'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                  settings.soundEnabled ? 'right-1' : 'right-8'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-2 rounded-xl">
              <div>
                <span className="text-cream/70">Order Sounds</span>
                <p className="text-xs text-cream/40 mt-1">Play sound for new orders</p>
              </div>
              <button
                onClick={() => updateSettings({ orderSoundEnabled: !settings.orderSoundEnabled })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.orderSoundEnabled ? 'bg-green-500' : 'bg-dark-4'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                  settings.orderSoundEnabled ? 'right-1' : 'right-8'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-2 rounded-xl">
              <div>
                <span className="text-cream/70">Chat Sounds</span>
                <p className="text-xs text-cream/40 mt-1">Play sound for new messages</p>
              </div>
              <button
                onClick={() => updateSettings({ chatSoundEnabled: !settings.chatSoundEnabled })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.chatSoundEnabled ? 'bg-green-500' : 'bg-dark-4'
                }`}
              >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
                  settings.chatSoundEnabled ? 'right-1' : 'right-8'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="luxury-card rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-serif text-xl text-white mb-6">Keyboard Shortcuts</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-dark-2 rounded-lg text-center">
              <kbd className="px-2 py-1 bg-dark-4 rounded text-gold text-sm">1-5</kbd>
              <p className="text-xs text-cream/40 mt-2">Quick status update</p>
            </div>
            <div className="p-3 bg-dark-2 rounded-lg text-center">
              <kbd className="px-2 py-1 bg-dark-4 rounded text-gold text-sm">P</kbd>
              <p className="text-xs text-cream/40 mt-2">Mark as Paid</p>
            </div>
            <div className="p-3 bg-dark-2 rounded-lg text-center">
              <kbd className="px-2 py-1 bg-dark-4 rounded text-gold text-sm">R</kbd>
              <p className="text-xs text-cream/40 mt-2">Generate Receipt</p>
            </div>
            <div className="p-3 bg-dark-2 rounded-lg text-center">
              <kbd className="px-2 py-1 bg-dark-4 rounded text-gold text-sm">?</kbd>
              <p className="text-xs text-cream/40 mt-2">Show shortcuts</p>
            </div>
          </div>
        </div>

        {/* Order Notes Templates */}
        <div className="luxury-card rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-serif text-xl text-white mb-6">Quick Order Notes</h3>
          <p className="text-cream/40 text-sm mb-4">Pre-defined notes staff can quickly add to orders</p>
          
          <div className="flex flex-wrap gap-2">
            {['No Ice', 'Extra Ice', 'No Lemon', 'Extra Lemon', 'Less Sweet', 'Extra Cold', 'Room Temperature', 'With Water'].map(note => (
              <span key={note} className="px-4 py-2 bg-dark-2 border border-gold/20 rounded-full text-sm text-cream/70 hover:border-gold/40 hover:text-gold transition-all cursor-pointer">
                {note}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
