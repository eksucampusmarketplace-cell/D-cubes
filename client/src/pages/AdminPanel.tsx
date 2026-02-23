import React, { useState } from 'react';
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
    name: 'D CUBES PLACE',
    tagline: 'Resort · Lounge · Nightlife',
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

  return (
    <div className="min-h-screen bg-dark-4">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-dark-2 border-r border-gold/10 flex flex-col z-50">
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
      <div className="ml-64 p-8">
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
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-3xl text-white">Club Gallery</h2>
                <p className="text-cream/40 mt-1">Manage images for your club's ambiance</p>
              </div>
              <button
                onClick={() => {
                  const url = prompt('Enter image URL:');
                  if (url) handleAddGalleryImage(url);
                }}
                className="btn-luxury px-6 py-3 rounded-xl text-xs"
              >
                + Add Image
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {galleryImages.map((img, index) => (
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
                        onChange={(e) => {
                          const newImages = [...galleryImages];
                          newImages[index] = e.target.value;
                          setGalleryImages(newImages);
                        }}
                        className="flex-1 text-xs bg-dark-4/80 backdrop-blur border border-gold/20 rounded-lg px-3 py-2 text-cream"
                        placeholder="Image URL"
                      />
                      <button
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="w-10 h-10 rounded-lg bg-red-500/80 flex items-center justify-center text-white"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add New Card */}
              <div 
                onClick={() => {
                  const url = prompt('Enter image URL:');
                  if (url) handleAddGalleryImage(url);
                }}
                className="luxury-card rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-gold/40 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-3">
                  <span className="text-2xl text-gold">+</span>
                </div>
                <span className="text-sm text-cream/40">Add New Image</span>
              </div>
            </div>
          </div>
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
                <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                  <img 
                    src={clubSettings.heroImage}
                    alt="Hero"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 gradient-overlay" />
                </div>
                <div>
                  <label className="text-xs text-cream/40 uppercase tracking-wider mb-2 block">Image URL</label>
                  <input
                    type="text"
                    value={clubSettings.heroImage}
                    onChange={(e) => setClubSettings({ ...clubSettings, heroImage: e.target.value })}
                    className="w-full input-luxury"
                    placeholder="https://..."
                  />
                </div>
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
          {/* Image Preview */}
          <div className="relative h-40 rounded-xl overflow-hidden">
            <img 
              src={formData.image || CATEGORY_IMAGES[formData.category]}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 gradient-overlay" />
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
              <label className="text-xs text-cream/40 uppercase tracking-wider mb-2 block">Image URL</label>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full input-luxury"
                placeholder="https://..."
              />
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
