import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export const QRGenerator: React.FC = () => {
  const [baseUrl, setBaseUrl] = useState('https://velourclub.com/order');
  const [startTable, setStartTable] = useState(1);
  const [endTable, setEndTable] = useState(50);
  const printRef = useRef<HTMLDivElement>(null);

  const tables = Array.from({ length: endTable - startTable + 1 }, (_, i) => startTable + i);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-dark p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl tracking-[0.25em] text-gold">D CUBES PLACE</h1>
          <h2 className="font-serif text-2xl text-white mt-2">QR Code Generator</h2>
        </div>
        <div className="flex gap-3 no-print">
          <button
            onClick={handlePrint}
            className="bg-gold text-dark px-6 py-3 rounded text-sm font-medium hover:bg-gold-light transition-colors"
          >
            Print QR Codes
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-dark-2 p-6 rounded-lg mb-8 no-print">
        <h3 className="font-serif text-lg text-white mb-4">Settings</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs tracking-wider uppercase text-cream/50 block mb-2">Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-dark-3 border border-gold/20 rounded px-4 py-2 text-cream text-sm focus:border-gold focus:outline-none"
            />
          </div>
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
      </div>

      {/* QR Codes Grid */}
      <div ref={printRef} className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-4">
        {tables.map(tableNum => (
          <div 
            key={tableNum} 
            className="bg-white p-4 rounded-lg flex flex-col items-center print:break-inside-avoid"
          >
            <div className="mb-2">
              <QRCodeSVG
                value={`${baseUrl}?table=${tableNum}`}
                size={120}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <p className="text-dark font-display text-2xl tracking-wider">TABLE {tableNum}</p>
            <p className="text-dark/50 text-[10px] mt-1">Scan to order</p>
            <p className="text-dark/30 text-[8px] mt-0.5">VELOUR Members Club</p>
          </div>
        ))}
      </div>

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
