import React, { useState } from 'react';
import Mannequin3D from '../components/Mannequin3D';
import * as FormeEngine from '../engine/formeEngine';
import { useCurrency } from '../context/CurrencyContext';

export default function FittingRoomPage({
  products = [],
  outfits = {},
  selectedPerson = 'women',
  onSelectPerson,
  onToggleEquip,
  onSelectVariant,
  onClearOutfit,
  onResetOutfit,
  onAddLookToBag,
  onAddToCart,
  onOpenBrandGuide
}) {
  // Rendering mode: '3d' | '2d' (allows 360° 3D or 2D technical vector)
  const [modelMode, setModelMode] = useState('3d');
  // 3D Studio lighting mode: 'studio' | 'warm'
  const [lightingMode, setLightingMode] = useState('studio');
  // Selected size for "Add Look to Bag"
  const [selectedSize, setSelectedSize] = useState('M');
  // Try-on rack slot filter
  const [rackFilter, setRackFilter] = useState('all');
  const { formatPrice } = useCurrency();

  const currentOutfit = outfits[selectedPerson] || {};

  // Resolve equipped items
  const getEquippedProduct = (slot) => {
    const item = currentOutfit[slot];
    if (!item || !item.id) return null;
    return products.find(p => p.id === item.id) || null;
  };

  const equippedTop = getEquippedProduct('top');
  const equippedBottom = getEquippedProduct('bottom');
  const equippedOuter = getEquippedProduct('outer');
  const equippedDress = getEquippedProduct('dress');

  // Filter garments for the interactive rack below
  const rackProducts = products.filter(p => {
    const matchPerson = (p.person === selectedPerson) || (p.gender === selectedPerson);
    const matchSlot = rackFilter === 'all' || p.slot === rackFilter;
    return matchPerson && matchSlot;
  });

  // Calculate outfit total
  const outfitItems = [equippedTop, equippedBottom, equippedOuter, equippedDress].filter(Boolean);
  const outfitTotal = outfitItems.reduce((sum, item) => sum + (item.price || 0), 0);

  // 2D SVG Mannequin Markup generator
  const get2dSvgMarkup = () => {
    try {
      const items = [];
      if (equippedTop) items.push({ product: equippedTop, variant: currentOutfit.top?.variant || 0 });
      if (equippedBottom) items.push({ product: equippedBottom, variant: currentOutfit.bottom?.variant || 0 });
      if (equippedOuter) items.push({ product: equippedOuter, variant: currentOutfit.outer?.variant || 0 });
      if (equippedDress) items.push({ product: equippedDress, variant: currentOutfit.dress?.variant || 0 });
      return FormeEngine.mannequin(selectedPerson, items);
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-linen-100 dark:bg-onyx-950 text-onyx-950 dark:text-linen-100 transition-colors py-8 sm:py-12">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Atelier Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-linen-300 dark:border-onyx-800 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-olive-700 dark:bg-camel-400 animate-pulse"></span>
              <span className="text-xs font-mono uppercase tracking-widest text-camel-600 dark:text-camel-400 font-semibold">
                Interactive 3D Atelier & Fitting Room
              </span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-onyx-950 dark:text-linen-50 mt-1">
              Dress the 3D Form
            </h1>
            <p className="text-sm text-onyx-600 dark:text-linen-400 max-w-xl font-light mt-1">
              Drag to spin 360°, switch silhouettes, and mix curated garments from the atelier rack below.
            </p>
          </div>

          {/* Model Display & Lighting Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 3D vs 2D Mode Switcher */}
            <div className="inline-flex rounded-xl p-1 bg-white dark:bg-onyx-900 border border-[#D8CEBF] dark:border-onyx-800 text-xs">
              <button
                onClick={() => setModelMode('3d')}
                className={`px-4 py-1.5 rounded-xl font-bold uppercase text-[11px] tracking-wider transition cursor-pointer ${
                  modelMode === '3d'
                    ? 'bg-[#1C1612] text-white shadow-sm'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-black'
                }`}
              >
                3D Model
              </button>
              <button
                onClick={() => setModelMode('2d')}
                className={`px-4 py-1.5 rounded-xl font-bold uppercase text-[11px] tracking-wider transition cursor-pointer ${
                  modelMode === '2d'
                    ? 'bg-[#1C1612] text-white shadow-sm'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-black'
                }`}
              >
                2D Studio
              </button>
            </div>

            {/* Studio Lighting Mood Switch */}
            {modelMode === '3d' && (
              <div className="inline-flex rounded-xl p-1 bg-white dark:bg-onyx-900 border border-[#D8CEBF] dark:border-onyx-800 text-xs">
                <button
                  onClick={() => setLightingMode('studio')}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition cursor-pointer ${
                    lightingMode === 'studio'
                      ? 'bg-[#FAF6F0] dark:bg-onyx-800 text-[#9A6E3E] border border-[#E6D3B3] shadow-2xs'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                  title="Studio Daylight"
                >
                  Daylight
                </button>
                <button
                  onClick={() => setLightingMode('warm')}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition cursor-pointer ${
                    lightingMode === 'warm'
                      ? 'bg-[#FAF6F0] dark:bg-onyx-800 text-[#9A6E3E] border border-[#E6D3B3] shadow-2xs'
                      : 'text-neutral-600 dark:text-neutral-400'
                  }`}
                  title="Warm Atelier"
                >
                  Warm
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Demographic Selector Tabs */}
        <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'women', label: "Women's Collection" },
            { id: 'men', label: "Men's Collection" },
            { id: 'kids', label: "Kids Collection" }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => onSelectPerson && onSelectPerson(p.id)}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                selectedPerson === p.id
                  ? 'bg-[#1C1612] text-white shadow-sm'
                  : 'bg-white dark:bg-onyx-900 text-neutral-700 dark:text-neutral-300 border border-[#D8CEBF] dark:border-onyx-800 hover:border-[#9A6E3E]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Main Stage Grid: Left Outfit Summary & Rack, Right 3D Mannequin */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Outfit Builder & Equipped Garments (5 cols) */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
            
            {/* Live Look Card */}
            <div className="p-6 rounded-3xl bg-linen-200/50 dark:bg-onyx-900/50 border border-linen-300 dark:border-onyx-800 backdrop-blur-sm shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-linen-300 dark:border-onyx-800">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-camel-600 dark:text-camel-400 font-semibold">
                    On Your Form
                  </h3>
                  <p className="font-editorial text-xl font-bold text-onyx-950 dark:text-linen-50 mt-0.5">
                    {outfitItems.length === 0 ? "Empty Form" : `${outfitItems.length} Piece Ensemble`}
                  </p>
                </div>
                {outfitItems.length > 0 && (
                  <button
                    onClick={() => onClearOutfit && onClearOutfit(selectedPerson)}
                    className="text-xs font-mono text-onyx-500 hover:text-red-600 dark:text-linen-400 dark:hover:text-red-400 transition"
                  >
                    Clear Look
                  </button>
                )}
              </div>

              {/* Equipped Slot Tiles */}
              {outfitItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-onyx-500 dark:text-linen-400 italic">
                  Tap any piece in the rack below to drape it on the 3D model.
                </div>
              ) : (
                <div className="space-y-3">
                  {outfitItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-linen-100 dark:bg-onyx-950 border border-linen-300 dark:border-onyx-800"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-xl bg-linen-200 dark:bg-onyx-900 p-1 flex items-center justify-center shrink-0 border border-linen-300 dark:border-onyx-800 overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: FormeEngine.thumb(item, currentOutfit[item.slot]?.variant || 0) }}
                        />
                        <div>
                          <p className="text-xs font-bold text-onyx-950 dark:text-linen-50">
                            {item.name}
                          </p>
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className="text-[10px] text-onyx-500 dark:text-linen-400 uppercase font-mono mr-1">
                              {item.slot}:
                            </span>
                            {item.colors && item.colors.length > 0 ? (
                              item.colors.map((c, cIdx) => (
                                <button
                                  key={c.name || cIdx}
                                  onClick={() => onSelectVariant && onSelectVariant(item.slot, cIdx)}
                                  className={`w-3.5 h-3.5 rounded-full border transition transform active:scale-90 ${
                                    (currentOutfit[item.slot]?.variant || 0) === cIdx
                                      ? 'ring-2 ring-olive-700 dark:ring-camel-400 scale-110 shadow-sm'
                                      : 'border-black/15 hover:scale-105 opacity-70 hover:opacity-100'
                                  }`}
                                  style={{ backgroundColor: c.hex }}
                                  title={`${c.name}`}
                                />
                              ))
                            ) : (
                              <span
                                className="w-3 h-3 rounded-full inline-block border border-black/10"
                                style={{ backgroundColor: item.color || '#364634' }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-mono font-bold text-onyx-900 dark:text-linen-100">
                          {formatPrice(item.price)}
                        </span>
                        <button
                          onClick={() => onToggleEquip && onToggleEquip(item)}
                          className="text-xs text-onyx-400 hover:text-red-500 transition px-1"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Outfit Total & Size Selector */}
              {outfitItems.length > 0 && (
                <div className="pt-4 border-t border-linen-300 dark:border-onyx-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-onyx-600 dark:text-linen-400">
                      Ensemble Total:
                    </span>
                    <span className="font-editorial text-2xl font-bold text-olive-800 dark:text-camel-400">
                      {formatPrice(outfitTotal)}
                    </span>
                  </div>

                  {/* Size Selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-onyx-600 dark:text-linen-400">
                      Size:
                    </span>
                    <div className="flex space-x-1.5">
                      {['XS', 'S', 'M', 'L', 'XL'].map(sz => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`w-9 h-9 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                            selectedSize === sz
                              ? 'bg-[#1C1612] text-white shadow-sm'
                              : 'bg-white dark:bg-onyx-950 text-neutral-700 dark:text-neutral-300 border border-[#D8CEBF] dark:border-onyx-800 hover:border-[#9A6E3E]'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add Entire Look to Bag */}
                  <button
                    onClick={() => {
                      if (onAddLookToBag) {
                        onAddLookToBag(selectedPerson, selectedSize);
                      } else if (onAddToCart) {
                        outfitItems.forEach(item => onAddToCart(item, selectedSize));
                      }
                    }}
                    className="w-full py-3.5 rounded-xl bg-[#1C1612] hover:bg-[#9A6E3E] text-white font-bold text-xs uppercase tracking-widest transition shadow-md active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M6 7h12l2 14H4L6 7Z" />
                      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                    </svg>
                    <span>Add Entire Look to Bag</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Reset & Brand Guide links */}
            <div className="flex items-center justify-between text-xs font-mono px-2">
              <button
                onClick={() => onResetOutfit && onResetOutfit(selectedPerson)}
                className="text-onyx-500 hover:text-onyx-900 dark:text-linen-400 dark:hover:text-linen-100 underline transition"
              >
                Reset to Signature Look
              </button>
              {onOpenBrandGuide && (
                <button
                  onClick={onOpenBrandGuide}
                  className="text-camel-600 dark:text-camel-400 hover:underline transition"
                >
                  Color Palette Guide →
                </button>
              )}
            </div>

          </div>

          {/* Right Column: 3D / 2D Mannequin Stage (7 cols) */}
          <div className="lg:col-span-7 order-1 lg:order-2 sticky top-24">
            <div className="p-4 sm:p-6 rounded-3xl bg-linen-200/50 dark:bg-onyx-900/50 border border-linen-300 dark:border-onyx-800 shadow-xl backdrop-blur-sm">
              {modelMode === '3d' ? (
                <Mannequin3D
                  person={selectedPerson}
                  equippedOutfit={currentOutfit}
                  products={products}
                  lightingMode={lightingMode}
                  autoRotateDefault={false}
                  className="rounded-2xl overflow-hidden"
                />
              ) : (
                /* 2D Technical SVG Flat View */
                <div className="relative w-full h-[520px] flex items-center justify-center bg-linen-100 dark:bg-onyx-950 rounded-2xl border border-linen-300 dark:border-onyx-800 overflow-hidden">
                  <div
                    className="w-full h-full flex items-center justify-center p-6"
                    dangerouslySetInnerHTML={{ __html: get2dSvgMarkup() }}
                  />
                  <div className="absolute top-4 left-4 z-10 bg-linen-100/90 dark:bg-onyx-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-linen-300 dark:border-onyx-700 text-[10px] font-mono text-onyx-700 dark:text-linen-300">
                    2D Technical Vector
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Garment Try-On Rack Section */}
        <div className="mt-16 pt-12 border-t border-linen-300 dark:border-onyx-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-camel-600 dark:text-camel-400">
                Atelier Rack
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold mt-0.5">
                Available Pieces for {selectedPerson === 'women' ? "Women's Pret" : selectedPerson === 'men' ? "Men's Collection" : "Kids Pret"}
              </h2>
            </div>

            {/* Rack Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'top', label: 'Tops' },
                { id: 'bottom', label: 'Bottoms' },
                { id: 'outer', label: 'Outerwear' },
                { id: 'dress', label: 'Dresses' }
              ].map(slot => (
                <button
                  key={slot.id}
                  onClick={() => setRackFilter(slot.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase transition ${
                    rackFilter === slot.id
                      ? 'bg-olive-800 text-linen-100 dark:bg-camel-500 dark:text-onyx-950 shadow-sm'
                      : 'bg-linen-200 dark:bg-onyx-900 text-onyx-700 dark:text-linen-300 hover:bg-linen-300 dark:hover:bg-onyx-800'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Garment Rack Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {rackProducts.map(product => {
              const isEquipped = currentOutfit[product.slot]?.id === product.id;
              return (
                <div
                  key={product.id}
                  onClick={() => onToggleEquip && onToggleEquip(product)}
                  className={`cursor-pointer rounded-2xl p-3.5 border transition transform active:scale-95 flex flex-col justify-between ${
                    isEquipped
                      ? 'bg-olive-900/10 dark:bg-camel-400/15 border-olive-800 dark:border-camel-400 ring-2 ring-olive-800/20 dark:ring-camel-400/20 shadow-md'
                      : 'bg-linen-100 dark:bg-onyx-900 border-linen-300 dark:border-onyx-800 hover:border-olive-700 dark:hover:border-camel-500'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="w-full h-24 flex items-center justify-center p-2 bg-linen-200/50 dark:bg-onyx-950/60 rounded-xl overflow-hidden mb-1 border border-linen-300/40 dark:border-onyx-800/40">
                      <div
                        className="w-full h-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: FormeEngine.thumb(product, 0) }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {product.colors && product.colors.length > 0 ? (
                          product.colors.slice(0, 4).map((c, cIdx) => (
                            <button
                              key={c.name || cIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onToggleEquip) onToggleEquip(product, cIdx);
                              }}
                              className={`w-3.5 h-3.5 rounded-full border transition transform active:scale-90 ${
                                isEquipped && (currentOutfit[product.slot]?.variant === cIdx)
                                  ? 'ring-2 ring-olive-700 dark:ring-camel-400 scale-110 shadow-sm'
                                  : 'border-black/15 hover:scale-110'
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={`Drape in ${c.name}`}
                            />
                          ))
                        ) : (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: product.color || '#364634' }}
                          />
                        )}
                      </div>
                      <span className="text-[10px] font-mono uppercase text-onyx-500 dark:text-linen-400">
                        {product.slot}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-onyx-900 dark:text-linen-100 leading-snug line-clamp-2">
                      {product.name}
                    </h4>
                  </div>

                  <div className="mt-4 pt-2 border-t border-linen-300/60 dark:border-onyx-800/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-onyx-800 dark:text-linen-200">
                      Rs. {product.price?.toLocaleString()}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                      isEquipped
                        ? 'bg-olive-800 text-linen-100 dark:bg-camel-500 dark:text-onyx-950 font-bold'
                        : 'bg-linen-200 dark:bg-onyx-800 text-onyx-700 dark:text-linen-300'
                    }`}>
                      {isEquipped ? 'Draped' : '+ Drape'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
