import React, { useState, useRef, useCallback } from 'react';
import { MenuItem } from '@/types';
import { MENU_ITEMS, CATEGORY_NAMES, CATEGORY_ICONS } from '@/data/menu';
import { formatPrice } from '@/utils/format';

type Tab = 'menu' | 'gallery' | 'settings';

const CATEGORY_IMAGES: Record<string, string> = {
  cocktails: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&auto=format&fit=crop&q=80',
  spirits: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&auto=format&fit=crop&q=80',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop&q=80',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80',
  shisha: 'https://images.unsplash.com/photo-1542567455-cd733f23fbb1?w=400&auto=format&fit=crop&q=80',
  nonalc: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&auto=format&fit=crop&q=80',
};

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80',
  ]);

  // Club settings
  const [clubSettings, setClubSettings] = useState({
    name: 'D CUBE\'S PLACE',
    tagline: 'Open Bar · Lounge · Nightlife',
    heroImage: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&auto=format&fit=crop&q=80',
    address: 'Victoria Island, Lagos, Nigeria',
    phone: '+234 800 000 0000',
    email: 'info@dcubesplace.com',
  });

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

  const handleAddGalleryImage = (url: string) => {
    setGalleryImages(prev => [...prev, url]);
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
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
            onClick={() => setActiveTab('gallery')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all mb-2
                       ${activeTab === 'gallery' 
                         ? 'bg-gold/10 text-gold border border-gold/20' 
                         : 'text-cream/50 hover:text-cream hover:bg-white/5'}`}
          >
            <span className="text-lg">🖼️</span>
            Gallery
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
                       ${activeTab === 'settings' 
                         ? 'bg-gold/10 text-gold border border-gold/20' 
                         : 'text-cream/50 hover:text-cream hover:bg-white/5'}`}
          >
            <span className="text-lg">⚙️</span>
            Club Settings
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
                <p className="text-cream/40 mt-1">Manage your menu items, images, and pricing</p>
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

        {activeTab === 'gallery' && (
          <GalleryManager 
            images={galleryImages}
            onAddImage={handleAddGalleryImage}
            onRemoveImage={handleRemoveGalleryImage}
            onUpdateImage={(index, url) => {
              const newImages = [...galleryImages];
              newImages[index] = url;
              setGalleryImages(newImages);
            }}
          />
        )}

        {activeTab === 'settings' && (
          <div>
            {/* Header */}
            <div className="mb-8">
              <h2 className="font-serif text-3xl text-white">Club Settings</h2>
              <p className="text-cream/40 mt-1">Configure your club's branding and information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="luxury-card rounded-2xl p-6">
                <h3 className="font-serif text-xl text-white mb-6">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-cream/40 uppercase tracking-wider mb-2 block">Club Name</label>
                    <input
                      type="text"
                      value={clubSettings.name}
                      onChange={(e) => setClubSettings({ ...clubSettings, name: e.target.value })}
                      className="w-full input-luxury"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-cream/40 uppercase tracking-wider mb-2 block">Tagline</label>
                    <input
                      type="text"
                      value={clubSettings.tagline}
                      onChange={(e) => setClubSettings({ ...clubSettings, tagline: e.target.value })}
                      className="w-full input-luxury"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-cream/40 uppercase tracking-wider mb-2 block">Address</label>
                    <input
                      type="text"
                      value={clubSettings.address}
                      onChange={(e) => setClubSettings({ ...clubSettings, address: e.target.value })}
                      className="w-full input-luxury"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-cream/40 uppercase tracking-wider mb-2 block">Phone</label>
                      <input
                        type="text"
                        value={clubSettings.phone}
                        onChange={(e) => setClubSettings({ ...clubSettings, phone: e.target.value })}
                        className="w-full input-luxury"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-cream/40 uppercase tracking-wider mb-2 block">Email</label>
                      <input
                        type="email"
                        value={clubSettings.email}
                        onChange={(e) => setClubSettings({ ...clubSettings, email: e.target.value })}
                        className="w-full input-luxury"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="luxury-card rounded-2xl p-6">
                <h3 className="font-serif text-xl text-white mb-6">Hero Image</h3>
                <ImageUpload
                  currentImage={clubSettings.heroImage}
                  onImageChange={(image) => setClubSettings({ ...clubSettings, heroImage: image })}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button className="btn-luxury px-8 py-4 rounded-xl text-xs">
                💾 Save Settings
              </button>
            </div>
          </div>
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

// Gallery Manager Component
interface GalleryManagerProps {
  images: string[];
  onAddImage: (url: string) => void;
  onRemoveImage: (index: number) => void;
  onUpdateImage: (index: number, url: string) => void;
}

const GalleryManager: React.FC<GalleryManagerProps> = ({ images, onAddImage, onRemoveImage, onUpdateImage }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    setUploadError(null);
    
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onAddImage(result);
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }, [onAddImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => handleFileSelect(file));
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
    const files = Array.from(e.target.files || []);
    files.forEach(file => handleFileSelect(file));
    e.target.value = ''; // Reset input
  }, [handleFileSelect]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl text-white">Club Gallery</h2>
          <p className="text-cream/40 mt-1">Upload and manage your club's ambiance photos</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-luxury px-6 py-3 rounded-xl text-xs flex items-center gap-2"
          >
            <span>📤</span> Upload Images
          </button>
          <button
            onClick={() => {
              const url = prompt('Enter image URL:');
              if (url) onAddImage(url);
            }}
            className="px-6 py-3 rounded-xl text-xs border border-gold/30 text-gold hover:bg-gold/10 transition-all"
          >
            + URL
          </button>
        </div>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <span className="text-red-400">⚠️</span>
          <p className="text-red-400 text-sm">{uploadError}</p>
        </div>
      )}

      {/* Hidden File Input - Multiple files allowed */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Gallery Grid */}
      <div 
        className={`grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 transition-all ${
          isDragging ? 'opacity-50' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {images.map((img, index) => (
          <div key={index} className="luxury-card rounded-2xl overflow-hidden group aspect-square">
            <div className="relative w-full h-full">
              <img 
                src={img}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-4/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="text"
                  defaultValue={img}
                  onChange={(e) => onUpdateImage(index, e.target.value)}
                  className="flex-1 text-xs bg-dark-4/80 backdrop-blur border border-gold/20 rounded-lg px-3 py-2 text-cream"
                  placeholder="Image URL"
                />
                <button
                  onClick={() => onRemoveImage(index)}
                  className="w-10 h-10 rounded-lg bg-red-500/80 flex items-center justify-center text-white hover:bg-red-600 transition-all"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Upload Drop Zone Card */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={`luxury-card rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-gold bg-gold/20 scale-105' 
              : 'hover:border-gold/40 hover:bg-gold/5'
          }`}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 transition-all ${
            isDragging ? 'bg-gold/30 scale-110' : 'bg-gold/10 border border-gold/20'
          }`}>
            <span className={`text-2xl transition-all ${isDragging ? 'scale-125' : ''}`}>
              {isDragging ? '📥' : '📤'}
            </span>
          </div>
          <span className="text-sm text-cream/40">
            {isDragging ? 'Drop images here' : 'Click or drag to upload'}
          </span>
          <span className="text-xs text-cream/30 mt-1">JPG, PNG, WEBP up to 5MB each</span>
        </div>
      </div>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-dark-4/90 backdrop-blur-xl border-2 border-gold rounded-3xl p-8 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gold/20 flex items-center justify-center mb-4 animate-bounce">
              <span className="text-4xl">📥</span>
            </div>
            <p className="text-xl text-gold font-medium">Drop images to upload</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Image Upload Component
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
      category: 'cocktails',
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
              <label className="text-xs text-cream/40 uppercase tracking-wider mb-2 block">Price (₦)</label>
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
