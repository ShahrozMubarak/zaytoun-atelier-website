import React, { useState } from 'react';
import { COLOR_PALETTE_INFO } from '../data/products';

export default function BrandPaletteGuide({ isOpen, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-onyx-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-linen-300 relative fade-in max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-linen-300">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-camel-700">Official Brand System</span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-onyx-950">
              The Earth Atelier Palette: Olive, Camel, Black & White
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-onyx-500 hover:text-onyx-950 rounded-full hover:bg-linen-200 transition"
          >
            ✕
          </button>
        </div>

        <p className="text-xs sm:text-sm text-onyx-600 mt-4 leading-relaxed">
          Curated specifically for contemporary luxury apparel and sustainable pret. This quad-color system balances earthy warmth with high-fashion editorial rigor, meeting international <strong>WCAG 2.1 AAA</strong> accessibility standards.
        </p>

        {/* 4 Primary Color Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          
          {/* Olive Green */}
          <div className="rounded-xl overflow-hidden border border-linen-300 shadow-sm bg-linen-50 flex flex-col justify-between">
            <div className="h-28 bg-[#364634] p-3 flex flex-col justify-between text-white">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Primary Anchor</span>
              <span className="font-mono text-xs font-bold">#364634</span>
            </div>
            <div className="p-4 space-y-2 text-xs text-onyx-700 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-onyx-950 text-sm">{COLOR_PALETTE_INFO.olive.name}</h4>
                <p className="text-[11px] text-onyx-600 mt-1">{COLOR_PALETTE_INFO.olive.role}</p>
                <div className="mt-2 text-[10px] space-y-0.5 text-onyx-500 font-mono">
                  <div>RGB: {COLOR_PALETTE_INFO.olive.rgb}</div>
                  <div>Contrast: {COLOR_PALETTE_INFO.olive.contrastOnWhite}</div>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(COLOR_PALETTE_INFO.olive.hex, 'olive')}
                className="w-full mt-3 py-1.5 rounded bg-linen-200 hover:bg-olive-700 hover:text-white transition font-mono text-[10px] font-bold"
              >
                {copiedKey === 'olive' ? '✓ Copied Hex!' : 'Copy #364634'}
              </button>
            </div>
          </div>

          {/* Camel */}
          <div className="rounded-xl overflow-hidden border border-linen-300 shadow-sm bg-linen-50 flex flex-col justify-between">
            <div className="h-28 bg-[#C69F6F] p-3 flex flex-col justify-between text-onyx-950">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Warm Accent</span>
              <span className="font-mono text-xs font-bold">#C69F6F</span>
            </div>
            <div className="p-4 space-y-2 text-xs text-onyx-700 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-onyx-950 text-sm">{COLOR_PALETTE_INFO.camel.name}</h4>
                <p className="text-[11px] text-onyx-600 mt-1">{COLOR_PALETTE_INFO.camel.role}</p>
                <div className="mt-2 text-[10px] space-y-0.5 text-onyx-500 font-mono">
                  <div>RGB: {COLOR_PALETTE_INFO.camel.rgb}</div>
                  <div>Contrast: {COLOR_PALETTE_INFO.camel.contrastOnBlack}</div>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(COLOR_PALETTE_INFO.camel.hex, 'camel')}
                className="w-full mt-3 py-1.5 rounded bg-linen-200 hover:bg-camel-600 hover:text-white transition font-mono text-[10px] font-bold"
              >
                {copiedKey === 'camel' ? '✓ Copied Hex!' : 'Copy #C69F6F'}
              </button>
            </div>
          </div>

          {/* Obsidian Black */}
          <div className="rounded-xl overflow-hidden border border-linen-300 shadow-sm bg-linen-50 flex flex-col justify-between">
            <div className="h-28 bg-[#111315] p-3 flex flex-col justify-between text-white">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Foundation Dark</span>
              <span className="font-mono text-xs font-bold">#111315</span>
            </div>
            <div className="p-4 space-y-2 text-xs text-onyx-700 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-onyx-950 text-sm">{COLOR_PALETTE_INFO.black.name}</h4>
                <p className="text-[11px] text-onyx-600 mt-1">{COLOR_PALETTE_INFO.black.role}</p>
                <div className="mt-2 text-[10px] space-y-0.5 text-onyx-500 font-mono">
                  <div>RGB: {COLOR_PALETTE_INFO.black.rgb}</div>
                  <div>Contrast: {COLOR_PALETTE_INFO.black.contrastOnWhite}</div>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(COLOR_PALETTE_INFO.black.hex, 'black')}
                className="w-full mt-3 py-1.5 rounded bg-linen-200 hover:bg-onyx-900 hover:text-white transition font-mono text-[10px] font-bold"
              >
                {copiedKey === 'black' ? '✓ Copied Hex!' : 'Copy #111315'}
              </button>
            </div>
          </div>

          {/* Linen White */}
          <div className="rounded-xl overflow-hidden border border-linen-300 shadow-sm bg-linen-50 flex flex-col justify-between">
            <div className="h-28 bg-[#FAF8F5] p-3 flex flex-col justify-between text-onyx-900 border-b border-linen-300">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Canvas Light</span>
              <span className="font-mono text-xs font-bold">#FAF8F5</span>
            </div>
            <div className="p-4 space-y-2 text-xs text-onyx-700 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-onyx-950 text-sm">{COLOR_PALETTE_INFO.white.name}</h4>
                <p className="text-[11px] text-onyx-600 mt-1">{COLOR_PALETTE_INFO.white.role}</p>
                <div className="mt-2 text-[10px] space-y-0.5 text-onyx-500 font-mono">
                  <div>RGB: {COLOR_PALETTE_INFO.white.rgb}</div>
                  <div>Contrast: {COLOR_PALETTE_INFO.white.contrastOnBlack}</div>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(COLOR_PALETTE_INFO.white.hex, 'white')}
                className="w-full mt-3 py-1.5 rounded bg-linen-200 hover:bg-onyx-800 hover:text-white transition font-mono text-[10px] font-bold"
              >
                {copiedKey === 'white' ? '✓ Copied Hex!' : 'Copy #FAF8F5'}
              </button>
            </div>
          </div>

        </div>

        {/* UI Application Examples Showcase */}
        <div className="mt-8 p-5 bg-linen-100 rounded-xl border border-linen-300 space-y-4">
          <h4 className="font-editorial text-base font-bold text-onyx-950">Live Component Token Harmonies</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Primary Action Button */}
            <div className="p-4 bg-white rounded-lg border border-linen-300 space-y-2 text-center">
              <span className="text-[10px] uppercase font-bold text-onyx-500">Primary CTA</span>
              <button className="w-full bg-olive-700 hover:bg-olive-800 text-linen-100 font-bold py-2.5 rounded-lg text-xs shadow uppercase tracking-wider">
                Add to Cart (Rs. 18,500)
              </button>
              <span className="text-[10px] text-onyx-500 block">Olive bg + White text + Camel icons</span>
            </div>

            {/* Accent Badge & Price */}
            <div className="p-4 bg-white rounded-lg border border-linen-300 space-y-2 text-center">
              <span className="text-[10px] uppercase font-bold text-onyx-500">Highlight & Urgency</span>
              <button className="w-full bg-camel-500 hover:bg-camel-600 text-onyx-950 font-bold py-2.5 rounded-lg text-xs shadow uppercase tracking-wider">
                Claim 15% Earth Discount
              </button>
              <span className="text-[10px] text-onyx-500 block">Camel bg + Onyx 950 text</span>
            </div>

            {/* Editorial Card Pill */}
            <div className="p-4 bg-white rounded-lg border border-linen-300 space-y-2 text-center">
              <span className="text-[10px] uppercase font-bold text-onyx-500">Editorial Contrast</span>
              <button className="w-full bg-onyx-900 hover:bg-onyx-950 text-camel-300 font-bold py-2.5 rounded-lg text-xs shadow uppercase tracking-wider">
                Explore Atelier Lookbook
              </button>
              <span className="text-[10px] text-onyx-500 block">Onyx 900 bg + Camel text</span>
            </div>

          </div>
        </div>

        {/* Close action */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-olive-700 hover:bg-olive-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
          >
            Close Palette Guide
          </button>
        </div>

      </div>
    </div>
  );
}
