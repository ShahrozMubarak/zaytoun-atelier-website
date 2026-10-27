import React, { useState } from 'react';

export const FABRIC_SPECIMENS = [
  {
    id: 'linen',
    name: 'Belgian Organic Flax Twill',
    gsm: '320 GSM',
    weave: 'Heavyweight Cross-Hatch Twill',
    origin: 'Kortrijk, Belgium',
    wash: 'Organic River-Washed Natural Enzyme',
    handfeel: 'Supple, cool, structured drape that softens exponentially with wear.',
    zoomImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1400&q=85',
    characteristics: ['100% Biodegradable Flax', 'High Tensile Strength', 'Natural Breathability']
  },
  {
    id: 'cashmere',
    name: 'Grade-A Mongolian Cashmere',
    gsm: '260 GSM',
    weave: '2-Ply 12-Gauge Milano Rib',
    origin: 'Alashan Plateau, Inner Mongolia',
    wash: 'Pure Glacial Spring Water Softened',
    handfeel: 'Weightless micro-cloud softness with exceptional loft and thermal rebound.',
    zoomImage: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1400&q=85',
    characteristics: ['Hand-Combed Underfleece', 'Zero Synthetic Blending', 'Natural Temperature Regulation']
  },
  {
    id: 'denim',
    name: 'Kurabo Shuttle-Loomed Selvedge Denim',
    gsm: '480 GSM (14oz)',
    weave: '3x1 Right-Hand Shuttle Selvedge Twill',
    origin: 'Okayama, Japan',
    wash: 'Natural Indigo Mineral River Wash',
    handfeel: 'Substantial vintage ring-spun hand with handcrafted whisker patina.',
    zoomImage: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1400&q=85',
    characteristics: ['Vintage Toyoda G9 Looms', 'Solid Copper Hardware', 'Authentic Selvedge ID']
  },
  {
    id: 'leather',
    name: 'Full-Grain Calf Nappa Leather',
    gsm: '1.2mm Gauge',
    weave: 'Unsplit Full-Grain Hide',
    origin: 'Ethical Tannery, Lahore',
    wash: 'Organic Beeswax & Walnut Oil Buffed',
    handfeel: 'Buttery, glove-like flexibility with architectural drape and storm resilience.',
    zoomImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1400&q=85',
    characteristics: ['Natural Uncorrected Grain', 'Beeswax Weather Resistance', 'Heirloom Aging Patina']
  }
];

export default function FabricTextureModal({ isOpen, onClose }) {
  const [selectedFabric, setSelectedFabric] = useState(FABRIC_SPECIMENS[0]);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-onyx-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl bg-linen-100 dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 shadow-2xl flex flex-col">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-linen-300 dark:border-onyx-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-camel-600 dark:text-camel-400 font-bold block">
              Atelier Textile Lab
            </span>
            <h3 className="font-editorial text-2xl font-bold text-onyx-950 dark:text-linen-50 mt-0.5">
              Tactile Fabric Provenance &amp; Weave Density
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full text-onyx-600 dark:text-linen-300 hover:bg-linen-200 dark:hover:bg-onyx-800 transition"
            aria-label="Close Fabric Modal"
          >
            ✕
          </button>
        </div>

        {/* Fabric Selector Tabs */}
        <div className="px-6 py-3 border-b border-linen-300 dark:border-onyx-800 bg-linen-200/40 dark:bg-onyx-950/40 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          {FABRIC_SPECIMENS.map((fabric) => (
            <button
              key={fabric.id}
              onClick={() => {
                setSelectedFabric(fabric);
                setZoomLevel(1);
              }}
              className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition whitespace-nowrap ${
                selectedFabric.id === fabric.id
                  ? 'bg-olive-800 text-linen-100 dark:bg-camel-500 dark:text-onyx-950 font-bold shadow-md'
                  : 'bg-linen-100 dark:bg-onyx-900 text-onyx-700 dark:text-linen-300 hover:border-camel-400'
              }`}
            >
              {fabric.name.split(' ')[0]} {fabric.name.split(' ')[1] || ''}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left: High-Res Macro Fabric Viewport */}
            <div className="md:col-span-7 space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-linen-300 dark:border-onyx-800 bg-black aspect-[4/3] group shadow-inner">
                <img
                  src={selectedFabric.zoomImage}
                  alt={selectedFabric.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out cursor-zoom-in"
                  style={{ transform: `scale(${zoomLevel})` }}
                  onClick={() => setZoomLevel(prev => prev === 1 ? 1.6 : 1)}
                />
                
                {/* Zoom Hint Overlay */}
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-onyx-950/75 backdrop-blur-md text-[10px] font-mono text-white pointer-events-none">
                  {zoomLevel === 1 ? 'Click to 1.6x Macro Zoom' : 'Click to Reset Zoom'}
                </div>
              </div>

              {/* Zoom Sliders */}
              <div className="flex items-center justify-between text-xs font-mono text-onyx-600 dark:text-linen-400 px-1">
                <span>Optical Magnification</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setZoomLevel(1)}
                    className={`px-2 py-0.5 rounded ${zoomLevel === 1 ? 'bg-camel-500 text-onyx-950 font-bold' : 'border'}`}
                  >
                    1.0x
                  </button>
                  <button
                    onClick={() => setZoomLevel(1.6)}
                    className={`px-2 py-0.5 rounded ${zoomLevel === 1.6 ? 'bg-camel-500 text-onyx-950 font-bold' : 'border'}`}
                  >
                    1.6x Macro
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Technical Provenance Specs */}
            <div className="md:col-span-5 space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-camel-600 dark:text-camel-400 font-bold block">
                  {selectedFabric.origin}
                </span>
                <h4 className="font-editorial text-2xl font-bold text-onyx-950 dark:text-linen-50 mt-0.5">
                  {selectedFabric.name}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-linen-300 dark:border-onyx-800 text-xs font-mono">
                <div>
                  <span className="text-onyx-500 dark:text-linen-400 block text-[10px]">WEIGHT DENSITY</span>
                  <span className="font-bold text-onyx-900 dark:text-linen-100">{selectedFabric.gsm}</span>
                </div>
                <div>
                  <span className="text-onyx-500 dark:text-linen-400 block text-[10px]">WEAVE TYPE</span>
                  <span className="font-bold text-onyx-900 dark:text-linen-100">{selectedFabric.weave}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-onyx-500 dark:text-linen-400 block">
                  FINISHING &amp; WASH
                </span>
                <p className="text-xs text-onyx-700 dark:text-linen-300 font-light leading-relaxed">
                  {selectedFabric.wash}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-onyx-500 dark:text-linen-400 block">
                  TACTILE CHARACTER
                </span>
                <p className="text-xs text-onyx-700 dark:text-linen-300 font-light leading-relaxed">
                  {selectedFabric.handfeel}
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-camel-600 dark:text-camel-400 font-bold block">
                  STANDARDS &amp; ATTRIBUTES
                </span>
                <div className="space-y-1 text-xs font-mono text-onyx-700 dark:text-linen-300">
                  {selectedFabric.characteristics.map((c, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span className="text-camel-500 font-bold">✓</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
