import React, { useState, useRef, useMemo } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { LOCATIONS, ZONES, getLocationsByZone } from '@/data/locations';
import type { ZoneType } from '@/types';

const getClientUrl = (): string => {
  const envUrl = import.meta.env.VITE_CLIENT_URL;
  if (envUrl) return `${envUrl}/order`;
  return `${window.location.origin}/order`;
};

export const QRGenerator: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState(getClientUrl());
  
  // Mode selection: 'location' (new zone-based) or 'legacy' (old table numbers)
  const [mode, setMode] = useState<'location' | 'legacy'>('location');
  
  // Legacy mode state
  const [startTable, setStartTable] = useState(1);
  const [endTable, setEndTable] = useState(20);
  
  // Location mode state
  const [selectedZone, setSelectedZone] = useState<ZoneType | 'all'>('all');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  
  // Export settings
  const [showZoneBadge, setShowZoneBadge] = useState(true);
  
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
    url: string;
  }

  const displayItems = useMemo((): DisplayItem[] => {
    if (mode === 'legacy') {
      return Array.from({ length: endTable - startTable + 1 }, (_, i) => {
        const tableNum = startTable + i;
        const locationId = `T-${String(tableNum).padStart(3, '0')}`;
        return {
          id: locationId,
          number: tableNum,
          name: `Table ${tableNum}`,
          zone: 'lounge' as ZoneType,
          zoneIcon: ZONES['lounge'].icon,
          url: `${baseUrl}?location=${locationId}&zone=lounge`
        };
      });
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
      url: `${baseUrl}?location=${loc.id}&zone=${loc.zone}`
    }));
  }, [mode, startTable, endTable, baseUrl, selectedZone, filteredLocations, selectedLocations]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Location ID', 'Name', 'Zone', 'QR URL'];
    const rows = displayItems.map(item => [
      item.id,
      item.name,
      item.zone,
      item.url
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-codes-${selectedZone}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = (item: DisplayItem) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 300 DPI dimensions: 3.37" x 2.125"
    const width = 1011; // 3.37 * 300
    const height = 638; // 2.125 * 300
    canvas.width = width;
    canvas.height = height;

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Get the QR code canvas
    const qrCanvas = document.getElementById(`qr-canvas-${item.id}`) as HTMLCanvasElement;
    if (qrCanvas) {
      // Draw QR code
      const qrSizeOnCard = 380; 
      const x = (width - qrSizeOnCard) / 2;
      const y = 60;
      ctx.drawImage(qrCanvas, x, y, qrSizeOnCard, qrSizeOnCard);
    }

    // Text settings
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    
    // Location Name
    ctx.font = 'bold 54px "Cormorant Garamond", serif';
    ctx.fillText(item.name.toUpperCase(), width / 2, 510);

    // Zone
    ctx.font = '28px "DM Sans", sans-serif'; 
    ctx.fillStyle = '#444444';
    ctx.fillText(`${item.zoneIcon} ${ZONES[item.zone].name}`, width / 2, 560);

    // Footer
    ctx.font = '20px "DM Sans", sans-serif';
    ctx.fillStyle = '#999999';
    ctx.fillText("D CUBE'S PLACE", width / 2, 600);

    // Download
    const link = document.createElement('a');
    link.download = `qr-${item.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadAllPNG = async () => {
    if (!confirm(`Are you sure you want to download ${displayItems.length} individual PNG files? Your browser may prompt you for permission.`)) {
      return;
    }
    for (const item of displayItems) {
      downloadPNG(item);
      // Wait a bit between downloads to not overwhelm the browser
      await new Promise(resolve => setTimeout(resolve, 300));
    }
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
        <div className="flex flex-wrap gap-3 no-print">
          <button
            onClick={handleExportCSV}
            className="px-4 lg:px-6 py-2 lg:py-3 rounded text-sm font-medium bg-dark-2 text-cream border border-gold/20 hover:border-gold/40 transition-colors"
          >
            📥 Export CSV
          </button>
          <button
            onClick={downloadAllPNG}
            className="px-4 lg:px-6 py-2 lg:py-3 rounded text-sm font-medium bg-dark-2 text-gold border border-gold/40 hover:bg-gold/10 transition-colors"
          >
            🖼️ Download All PNG
          </button>
          <button
            onClick={handlePrint}
            className="bg-gold text-dark px-4 lg:px-6 py-2 lg:py-3 rounded text-sm font-medium hover:bg-gold-light transition-colors"
          >
            🖨️ Print QR Codes
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
                {(Object.keys(ZONES) as ZoneType[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedZone(key); clearSelection(); }}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                      selectedZone === key 
                        ? 'bg-gold text-dark' 
                        : 'bg-dark-3 text-cream hover:bg-dark-4'
                    }`}
                  >
                    <span>{ZONES[key].icon}</span>
                    <span>{ZONES[key].name}</span>
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
            </div>
          </div>
        )}

        {/* Export Settings */}
        <div className="mt-6 pt-6 border-t border-gold/10">
          <h4 className="text-sm text-white mb-4">Export Settings</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs tracking-wider uppercase text-cream/50 block mb-2">Individual Card Size</label>
              <p className="text-gold text-sm font-medium">Standard 3.37&quot; x 2.125&quot; (PNG &amp; Print)</p>
              <p className="text-cream/40 text-xs mt-1">Formatted for CorelDraw, card printers, and individual PNG export.</p>
            </div>
            <div>
              <label className="text-xs tracking-wider uppercase text-cream/50 block mb-2">Options</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showZoneBadge}
                  onChange={(e) => setShowZoneBadge(e.target.checked)}
                  className="w-4 h-4 rounded border-gold/30 bg-dark-3 text-gold"
                />
                <span className="text-sm text-cream/70">Show Zone Badge</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4 flex items-center justify-between no-print">
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
      <div ref={printRef} className="flex flex-wrap justify-center gap-6 print-container">
        {displayItems.map((item) => (
          <div 
            key={item.id} 
            className="qr-card bg-white rounded-md flex flex-col items-center print:break-inside-avoid shadow-xl relative group border border-gray-100"
            style={{ 
              width: '3.37in', 
              height: '2.125in', 
              minWidth: '3.37in', 
              minHeight: '2.125in',
              padding: '0.2in'
            }}
          >
            {/* Download Button (Overlay) */}
            <button
              onClick={() => downloadPNG(item)}
              className="absolute top-2 right-2 bg-gold/90 text-dark p-1.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity no-print z-10"
              title="Download PNG"
            >
              <span className="text-xs font-bold uppercase tracking-tighter">PNG</span>
            </button>

            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <div className="mb-2">
                <QRCodeCanvas
                  id={`qr-canvas-${item.id}`}
                  value={item.url}
                  size={512}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  style={{ width: '1.2in', height: '1.2in' }}
                />
              </div>
              
              {/* Location Name */}
              <p className="text-dark font-display text-base lg:text-lg tracking-wider text-center leading-tight font-bold">
                {item.name.toUpperCase()}
              </p>
              
              {/* Zone Badge */}
              {showZoneBadge && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-sm">{item.zoneIcon}</span>
                  <span className="text-dark/60 text-[9px] uppercase tracking-wider font-medium">
                    {ZONES[item.zone].name}
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-dark/30 text-[7px] mt-1 uppercase tracking-[0.2em] font-medium">D CUBE&apos;S PLACE</p>
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
            margin: 0;
            padding: 0;
          }
          @page {
            margin: 0;
            size: 3.37in 2.125in;
          }
          .print-container {
            display: block !important;
            gap: 0 !important;
          }
          .qr-card {
            box-shadow: none !important;
            border: none !important;
            page-break-after: always;
            break-after: page;
            margin: 0 !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};
