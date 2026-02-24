import React, { useState, useRef, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LOCATIONS, ZONES, getLocationsByZone } from '@/data/locations';
import type { ZoneType } from '@/types';

export const QRGenerator: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState('https://dcubesplace.com/order');
  
  // Mode selection: 'legacy' (old table numbers) or 'location' (new zone-based)
  const [mode, setMode] = useState<'location' | 'legacy'>('location');
  
  // Legacy mode state
  const [startTable, setStartTable] = useState(1);
  const [endTable, setEndTable] = useState(20);
  
  // Location mode state
  const [selectedZone, setSelectedZone] = useState<ZoneType | 'all'>('all');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  
  const printRef = useRef<HTMLDivElement>(null);

  // Get locations based on selection
  const filteredLocations = useMemo(() => {
    if (selectedZone === 'all') return LOCATIONS;
    return getLocationsByZone(selectedZone);
  }, [selectedZone]);

  // Get items to display
  interface DisplayItem {
    id: string;
    number: number | string;
    name: string;
    zone: ZoneType;
    zoneIcon: string;
    canReceiveFood: boolean;
    url: string;
  }

  const displayItems = useMemo((): DisplayItem[] => {
    if (mode === 'legacy') {
      return Array.from({ length: endTable - startTable + 1 }, (_, i) => ({
        id: `T-${String(startTable + i).padStart(3, '0')}`,
        number: startTable + i,
        name: `Table ${startTable + i}`,
        zone: 'lounge' as ZoneType,
        zoneIcon: ZONES['lounge'].icon,
        canReceiveFood: true,
        url: `${baseUrl}?table=${startTable + i}`
      }));
    }
    
    // Location mode
    const locationsToUse = selectedLocations.length > 0 
      ? LOCATIONS.filter(loc => selectedLocations.includes(loc.id))
      : filteredLocations;
      
    return locationsToUse.map(loc => ({
      id: loc.id,
      number: loc.number,
      name: loc.name,
      zone: loc.zone,
      zoneIcon: ZONES[loc.zone].icon,
      canReceiveFood: loc.canReceiveFood,
      url: `${baseUrl}?location=${loc.id}&zone=${loc.zone}`
    }));
  }, [mode, startTable, endTable, baseUrl, selectedZone, filteredLocations, selectedLocations]);

  const handlePrint = () => {
    window.print();
  };

  const toggleLocationSelection = (locationId: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const selectAllInZone = () => {
    setSelectedLocations(filteredLocations.map(loc => loc.id));
  };

  const clearSelection = () => {
    setSelectedLocations([]);
  };

  return (
    <div className="min-h-screen bg-dark p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl tracking-[0.2em] lg:tracking-[0.25em] text-gold">D CUBE&apos;S PLACE</h1>
          <h2 className="font-serif text-xl lg:text-2xl text-white mt-2">QR Code Generator</h2>
          <p className="text-cream/50 text-sm mt-1">Generate location-based QR codes for each zone</p>
        </div>
        <div className="flex gap-3 no-print">
          <button
            onClick={handlePrint}
            className="bg-gold text-dark px-4 lg:px-6 py-2 lg:py-3 rounded text-sm font-medium hover:bg-gold-light transition-colors"
          >
            Print QR Codes
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-dark-2 p-4 lg:p-6 rounded-lg mb-8 no-print">
        <h3 className="font-serif text-lg text-white mb-4">Settings</h3>
        
        {/* Base URL */}
        <div className="mb-6">
          <label className="text-xs tracking-wider uppercase text-cream/50 block mb-2">Base URL</label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full bg-dark-3 border border-gold/20 rounded px-4 py-2 text-cream text-sm focus:border-gold focus:outline-none"
          />
        </div>

        {/* Mode Toggle */}
        <div className="mb-6">
          <label className="text-xs tracking-wider uppercase text-cream/50 block mb-2">Generation Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('location')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                mode === 'location' 
                  ? 'bg-gold text-dark' 
                  : 'bg-dark-3 text-cream hover:bg-dark-4'
              }`}
            >
              🎯 Zone-Based (New)
            </button>
            <button
              onClick={() => setMode('legacy')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                mode === 'legacy' 
                  ? 'bg-gold text-dark' 
                  : 'bg-dark-3 text-cream hover:bg-dark-4'
              }`}
            >
              🔢 Table Numbers (Legacy)
            </button>
          </div>
        </div>

        {mode === 'legacy' ? (
          /* Legacy Mode: Table Numbers */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs tracking-wider uppercase text-cream/50 block mb-2">Start Table</label>
              <input
                type="number"
                value={startTable}
                onChange={(e) => setStartTable(parseInt(e.target.value) || 1)}
                min={1}
                className="w-full bg-dark-3 border border-gold/20 rounded px-4 py-2 text-cream text-sm focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs tracking-wider uppercase text-cream/50 block mb-2">End Table</label>
              <input
                type="number"
                value={endTable}
                onChange={(e) => setEndTable(parseInt(e.target.value) || 50)}
                min={startTable}
                max={100}
                className="w-full bg-dark-3 border border-gold/20 rounded px-4 py-2 text-cream text-sm focus:border-gold focus:outline-none"
              />
            </div>
          </div>
        ) : (
          /* Location Mode: Zone Selection */
          <div>
            {/* Zone Filter */}
            <div className="mb-4">
              <label className="text-xs tracking-wider uppercase text-cream/50 block mb-2">Filter by Zone</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setSelectedZone('all'); clearSelection(); }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    selectedZone === 'all' 
                      ? 'bg-gold text-dark' 
                      : 'bg-dark-3 text-cream hover:bg-dark-4'
                  }`}
                >
                  All Zones
                </button>
                {Object.entries(ZONES).map(([key, zone]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedZone(key as ZoneType); clearSelection(); }}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                      selectedZone === key 
                        ? 'bg-gold text-dark' 
                        : 'bg-dark-3 text-cream hover:bg-dark-4'
                    }`}
                  >
                    <span>{zone.icon}</span>
                    <span>{zone.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs tracking-wider uppercase text-cream/50">
                  Select Locations ({selectedLocations.length} selected)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllInZone}
                    className="text-xs text-gold hover:text-gold-light transition-colors"
                  >
                    Select All
                  </button>
                  <span className="text-cream/30">|</span>
                  <button
                    onClick={clearSelection}
                    className="text-xs text-cream/50 hover:text-cream transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-dark-3 rounded">
                {filteredLocations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => toggleLocationSelection(loc.id)}
                    className={`px-2 py-2 rounded text-xs text-left transition-colors ${
                      selectedLocations.includes(loc.id)
                        ? 'bg-gold text-dark'
                        : 'bg-dark-4 text-cream hover:bg-dark'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{ZONES[loc.zone].icon}</span>
                      <span className="font-medium truncate">{loc.name}</span>
                    </div>
                    {!loc.canReceiveFood && (
                      <span className="text-[8px] opacity-70 block">🍸 Drinks only</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-cream/50">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gold"></span>
                Selected
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-dark-4 border border-cream/20"></span>
                Available
              </span>
              <span className="flex items-center gap-1">
                <span>🍸</span>
                Drinks only (no food)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-cream/70 text-sm">
          Showing <span className="text-gold font-bold">{displayItems.length}</span> QR codes
        </p>
        {mode === 'location' && (
          <p className="text-cream/50 text-xs">
            Tip: Place QR codes at each location. Customers will see the appropriate menu for that zone.
          </p>
        )}
      </div>

      {/* QR Codes Grid */}
      <div ref={printRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {displayItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-white p-4 rounded-lg flex flex-col items-center print:break-inside-avoid shadow-lg"
          >
            <div className="mb-2">
              <QRCodeSVG
                value={item.url}
                size={100}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            
            {/* Location Name */}
            <p className="text-dark font-display text-lg tracking-wider text-center leading-tight">
              {item.name.toUpperCase()}
            </p>
            
            {/* Zone Badge */}
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm">{item.zoneIcon || ZONES[item.zone as ZoneType]?.icon}</span>
              <span className="text-dark/60 text-[10px]">
                {ZONES[item.zone as ZoneType]?.name || item.zone}
              </span>
            </div>
            
            {/* Food Availability */}
            {mode === 'location' && !item.canReceiveFood && (
              <p className="text-amber-600 text-[9px] mt-1 font-medium">🍸 Drinks Only</p>
            )}
            
            <p className="text-dark/40 text-[8px] mt-2">D CUBE&apos;S PLACE</p>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-cream/50 text-lg">No locations selected</p>
          <p className="text-cream/30 text-sm mt-2">
            {mode === 'location' 
              ? 'Select a zone and choose locations to generate QR codes'
              : 'Adjust table range to generate QR codes'}
          </p>
        </div>
      )}

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};
