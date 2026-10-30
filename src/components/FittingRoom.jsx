import React, { useState } from 'react';
import * as FormeEngine from '../engine/formeEngine';

export default function FittingRoom({
  products,
  outfits,
  selectedPerson,
  onSelectPerson,
  onToggleEquip,
  onClearOutfit,
  onResetOutfit,
  onAddLookToBag,
  onAddToCart,
  onOpenBrandGuide
}) {
  const [selectedOutfitSize, setSelectedOutfitSize] = useState(selectedPerson === 'kids' ? '6–7' : 'M');
  const [rackFilterSlot, setRackFilterSlot] = useState('all');

  // Currently equipped garments on this mannequin
  const currentPersonOutfit = outfits[selectedPerson] || {};
  const equippedItems = Object.values(currentPersonOutfit)
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      return product ? { product, variant: item.variant || 0 } : null;
    })
    .filter(Boolean);

  // Outfit total price
  const outfitTotal = equippedItems.reduce((acc, i) => acc + i.product.price, 0);

  // Generate Mannequin SVG markup dynamically
  const mannequinSvg = FormeEngine.mannequin(selectedPerson, equippedItems);

  // Available pieces for current person
  const allPersonPieces = products.filter((p) => p.person === selectedPerson);
  const availablePieces = rackFilterSlot === 'all'
    ? allPersonPieces
    : allPersonPieces.filter((p) => p.slot === rackFilterSlot);

  const availableSizes = selectedPerson === 'kids'
    ? ['4–5', '6–7', '8–9', '10–11']
    : ['XS', 'S', 'M', 'L', 'XL'];

  const scrollToCollection = () => {
    const el = document.getElementById('collection');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div id="fitting-room" className="bg-[#FAF8F5] dark:bg-[#191C17] text-onyx-950 dark:text-linen-100 transition-colors">
      
      {/* =========================================================================
          HERO SPLIT-SCREEN (Inspired by FORME Standalone)
          Left: Copy & "ON YOUR FORM" Look Builder
          Right: Interactive 2D Mannequin Stage with live garment dressing
      ========================================================================= */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 sm:pt-12 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: HERO COPY & LIVE LOOK SUMMARY (approx 47%) */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start pr-0 lg:pr-6 space-y-6">
            
            {/* Eyebrow */}
            <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-camel-700 dark:text-camel-400">
              <span className="w-6 h-px bg-olive-700 dark:bg-camel-400"></span>
              <span>YOUR EVERYDAY, REIMAGINED</span>
            </div>

            {/* Display Headline */}
            <h1 className="font-editorial text-4xl sm:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight text-onyx-950 dark:text-linen-50">
              Good clothes.<br />
              Better <em className="italic font-normal text-olive-700 dark:text-camel-300">together.</em>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-onyx-600 dark:text-linen-300 leading-relaxed font-light max-w-lg">
              Meet your next everyday favourites. Crafted in organic Belgian linen, pure Mongolian cashmere, and raw silk. Try a little. Mix a little. Make the look yours on our live 2D mannequin model.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={scrollToCollection}
                className="bg-olive-800 hover:bg-olive-900 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-sm shadow-md transition active:scale-95 flex items-center space-x-3"
              >
                <span>Build your look</span>
                <span className="text-camel-300">→</span>
              </button>
              <button
                onClick={onOpenBrandGuide}
                className="border border-linen-300 dark:border-onyx-700 hover:border-camel-400 text-onyx-800 dark:text-linen-200 text-xs font-semibold px-4 py-3.5 rounded-sm transition flex items-center space-x-1.5"
              >
                <span>🎨 Atelier Palette</span>
              </button>
            </div>

            <span className="text-[10px] text-onyx-500 dark:text-linen-400 tracking-wide font-normal">
              Your wardrobe starts with a little curiosity. Nationwide COD & instant digital payments across Pakistan.
            </span>

            {/* LIVE OUTFIT SUMMARY ("ON YOUR FORM") */}
            <div className="w-full max-w-lg mt-4 pt-6 border-t border-linen-300 dark:border-onyx-800 space-y-4">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-camel-700 dark:text-camel-400">
                    ON YOUR FORM
                  </span>
                  <span className="text-[11px] text-onyx-500 dark:text-linen-400">
                    ({equippedItems.length} {equippedItems.length === 1 ? 'piece' : 'pieces'})
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onResetOutfit(selectedPerson)}
                    className="text-[11px] font-medium text-onyx-600 dark:text-linen-300 hover:text-olive-700 dark:hover:text-camel-400 transition flex items-center space-x-1"
                    title="Restore default atelier pairing"
                  >
                    <span>Reset</span>
                    <span>↺</span>
                  </button>
                </div>
              </div>

              {/* Equiped Mini Garments */}
              {equippedItems.length === 0 ? (
                <div className="py-6 px-4 rounded-xl border border-dashed border-linen-300 dark:border-onyx-800 text-center text-xs text-onyx-500 dark:text-linen-400">
                  ✨ A blank canvas. Click any piece below to style your {selectedPerson} form.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {equippedItems.map(({ product, variant }) => {
                    const activeColor = product.colors[variant] || product.colors[0];
                    return (
                      <div
                        key={product.id}
                        className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-white dark:bg-onyx-900 border border-linen-200 dark:border-onyx-800 text-xs shadow-xs"
                      >
                        <div
                          className="w-11 h-13 bg-linen-100 dark:bg-onyx-950 rounded overflow-hidden flex items-center justify-center p-0.5 flex-shrink-0"
                          dangerouslySetInnerHTML={{ __html: FormeEngine.thumb(product, variant) }}
                        />
                        <div className="flex-1 min-w-0">
                          <strong className="block text-onyx-950 dark:text-linen-50 truncate text-[11px]">
                            {product.name}
                          </strong>
                          <span className="block text-[10px] text-onyx-500 dark:text-linen-400 capitalize">
                            {activeColor.name} • {product.slot}
                          </span>
                          <span className="block font-bold text-olive-800 dark:text-camel-300 text-[11px]">
                            Rs. {product.price.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => onToggleEquip(product, variant)}
                          className="text-onyx-400 hover:text-red-500 p-1 text-xs"
                          title="Remove piece"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Outfit Total & Add Look to Bag */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-linen-200 dark:border-onyx-800/60">
                <div className="flex items-baseline space-x-2 text-xs">
                  <span className="text-[10px] uppercase font-bold text-onyx-500 dark:text-linen-400">
                    Complete Look Total:
                  </span>
                  <strong className="font-editorial text-xl font-bold text-olive-800 dark:text-camel-300">
                    Rs. {outfitTotal.toLocaleString()}
                  </strong>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <select
                    value={selectedOutfitSize}
                    onChange={(e) => setSelectedOutfitSize(e.target.value)}
                    className="bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-700 rounded px-2 py-1.5 text-xs font-bold text-onyx-900 dark:text-linen-100"
                    title="Select size for the look"
                  >
                    {availableSizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <button
                    disabled={equippedItems.length === 0}
                    onClick={() => onAddLookToBag(equippedItems, selectedOutfitSize)}
                    className="flex-1 sm:flex-none bg-olive-700 hover:bg-olive-800 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded shadow transition active:scale-95 flex items-center justify-center space-x-2"
                  >
                    <span>Add look to bag</span>
                    <span className="text-camel-300">+</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: 2D MANNEQUIN STAGE (approx 53%) */}
          <div className="lg:col-span-6 xl:col-span-6 relative">
            <div className="relative w-full h-[580px] sm:h-[630px] bg-gradient-to-b from-[#E7E8DC] via-[#DCE0CF] to-[#CCD1BE] dark:from-[#2B3224] dark:via-[#242B1E] dark:to-[#1A2015] rounded-3xl border border-linen-300 dark:border-onyx-800 overflow-hidden shadow-2xl flex flex-col justify-between p-6">
              
              {/* Subtle Atelier Watermark */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none select-none opacity-[0.07] dark:opacity-[0.06]">
                <img 
                  src="/images/brand/foolish/arc_emblem.png" 
                  alt="" 
                  className="w-48 sm:w-64 object-contain invert dark:invert-0" 
                />
                <span className="text-2xl sm:text-4xl font-editorial tracking-[0.2em] font-bold mt-2 text-onyx-950 dark:text-white">
                  FOOLISH ARC
                </span>
              </div>

              {/* Stage Top Bar: Eyebrow + Live Indicator */}
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-olive-900 dark:text-camel-300 block">
                    THE FITTING ROOM
                  </span>
                  <span className="text-[10px] text-olive-800/80 dark:text-linen-400 font-light">
                    A new way to see yourself.
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 bg-white/70 dark:bg-onyx-900/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/50 dark:border-onyx-700 text-[9px] font-bold tracking-widest text-olive-800 dark:text-camel-300 shadow-xs uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-olive-600 animate-pulse"></span>
                  <span>LIVE PREVIEW</span>
                </div>
              </div>

              {/* Collection Tabs: Women / Men / Kids */}
              <div className="relative z-10 inline-flex p-1 rounded-full bg-white/60 dark:bg-onyx-900/60 backdrop-blur-md border border-[#c8ccbb] dark:border-onyx-700 shadow-sm mx-auto">
                {FormeEngine.PEOPLE.map((p) => {
                  const isPressed = selectedPerson === p;
                  return (
                    <button
                      key={p}
                      onClick={() => onSelectPerson(p)}
                      aria-pressed={isPressed}
                      className={`px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                        isPressed
                          ? 'bg-white dark:bg-onyx-800 text-onyx-950 dark:text-linen-50 shadow-sm'
                          : 'text-onyx-700 dark:text-linen-300 hover:text-onyx-950'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* DYNAMIC SVG MANNEQUIN MODEL */}
              <div className="relative z-10 w-full flex-1 flex items-center justify-center my-2">
                <div
                  className="w-full max-w-[340px] h-[440px] sm:h-[480px] flex items-center justify-center filter drop-shadow-xl transition-transform duration-300"
                  dangerouslySetInnerHTML={{ __html: mannequinSvg }}
                />
              </div>

              {/* Stage Callout */}
              <div className="absolute right-5 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center space-x-2 text-[10px] text-olive-800 dark:text-camel-300 font-light leading-relaxed">
                <span className="w-6 h-px bg-olive-700/60 dark:bg-camel-400/60"></span>
                <span>
                  Made to be<br />
                  <strong className="font-editorial italic font-bold">put together.</strong>
                </span>
              </div>

              {/* Stage Bottom Bar */}
              <div className="relative z-10 flex items-center justify-between text-[10px] text-olive-800 dark:text-linen-300 pt-2 border-t border-olive-900/10 dark:border-linen-100/10">
                <span className="flex items-center space-x-1.5">
                  <span>✨</span>
                  <span>Pick a piece below. See it on.</span>
                </span>

                {equippedItems.length > 0 && (
                  <button
                    onClick={() => onClearOutfit(selectedPerson)}
                    className="hover:text-red-500 font-medium underline transition"
                  >
                    Clear look ✕
                  </button>
                )}
              </div>

              {/* Stage Floor Glow Oval */}
              <div className="absolute bottom-0 left-[-20%] right-[-20%] h-24 rounded-t-full bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-0"></div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          DETAIL STRIP (Trust & Philosophy)
      ========================================================================= */}
      <div className="border-y border-linen-300 dark:border-onyx-800 py-4 bg-linen-50 dark:bg-onyx-900/50">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-wrap items-center justify-between gap-4 text-xs text-onyx-600 dark:text-linen-300 font-medium">
          <span className="flex items-center space-x-2">
            <span className="text-olive-700 dark:text-camel-400">❖</span>
            <span>A wardrobe that works together</span>
          </span>
          <span className="flex items-center space-x-2">
            <span className="text-olive-700 dark:text-camel-400">☝</span>
            <span>Click to try. Style your way live.</span>
          </span>
          <span className="flex items-center space-x-2">
            <span className="text-olive-700 dark:text-camel-400">☀️</span>
            <span>From morning light to after dark</span>
          </span>
          <span className="flex items-center space-x-2">
            <span className="text-olive-700 dark:text-camel-400">🇵🇰</span>
            <span>Cash on Delivery & Instant Pakistani Gateways</span>
          </span>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE GARMENT RACK FOR CURRENT MODEL
          Clicking any garment drapes it on the model above!
      ========================================================================= */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-14">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-linen-300 dark:border-onyx-800">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.18em] text-camel-700 dark:text-camel-400">
              LIVE TRY-ON ATELIER RACK
            </span>
            <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-onyx-950 dark:text-linen-50 mt-0.5">
              Pieces for the <span className="capitalize">{selectedPerson}</span> Form
            </h2>
            <p className="text-xs text-onyx-600 dark:text-linen-300 mt-1 max-w-xl">
              Tap any garment to see it dynamically draped on the mannequin model above. Click color swatches to recolor both the piece and the model in real time.
            </p>
          </div>

          {/* Slot Tabs Filter */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {['all', 'top', 'bottom', 'outer', 'dress'].map((slot) => {
              const label = slot === 'all' ? 'All Pieces' : slot === 'outer' ? 'Layers' : slot + 's';
              const isActive = rackFilterSlot === slot;
              return (
                <button
                  key={slot}
                  onClick={() => setRackFilterSlot(slot)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                    isActive
                      ? 'bg-olive-700 text-white shadow-xs'
                      : 'bg-white dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 text-onyx-700 dark:text-linen-300 hover:border-camel-400'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rack Garments Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {availablePieces.map((p) => {
            const isWorn = currentPersonOutfit[p.slot]?.id === p.id;
            const currentVariant = isWorn ? (currentPersonOutfit[p.slot]?.variant || 0) : 0;

            return (
              <div
                key={p.id}
                className={`relative rounded-xl border p-3 flex flex-col justify-between transition-all ${
                  isWorn
                    ? 'border-olive-700 bg-olive-50/50 dark:bg-olive-950/20 shadow-sm ring-1 ring-olive-700'
                    : 'border-linen-200 dark:border-onyx-800 bg-white dark:bg-onyx-900 hover:border-camel-400 shadow-xs'
                }`}
              >
                {/* Slot Tag & Wearing Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-onyx-500 dark:text-linen-400">
                    {p.slot}
                  </span>
                  {isWorn && (
                    <span className="text-[9px] font-bold bg-olive-700 text-white px-1.5 py-0.2 rounded-full">
                      ✓ Wearing
                    </span>
                  )}
                </div>

                {/* Clickable Vector Thumbnail to Drapes on Model */}
                <button
                  onClick={() => onToggleEquip(p, currentVariant)}
                  className="w-full h-28 bg-linen-50 dark:bg-onyx-950 rounded-lg p-2 flex items-center justify-center cursor-pointer hover:scale-105 transition"
                  title={isWorn ? "Click to remove from model" : "Click to dress model"}
                  dangerouslySetInnerHTML={{ __html: FormeEngine.thumb(p, currentVariant) }}
                />

                {/* Garment Info */}
                <div className="mt-2.5 text-left space-y-1">
                  <h4 className="font-bold text-xs text-onyx-950 dark:text-linen-50 truncate" title={p.name}>
                    {p.name}
                  </h4>
                  <div className="text-xs font-bold text-olive-800 dark:text-camel-300">
                    Rs. {p.price.toLocaleString()}
                  </div>

                  {/* Swatches (Clicking recolors model) */}
                  <div className="flex items-center space-x-1 pt-1">
                    {p.colors.map((c, idx) => (
                      <button
                        key={c.hex}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleEquip(p, idx, true);
                        }}
                        className={`w-3.5 h-3.5 rounded-full border transition ${
                          idx === currentVariant && isWorn
                            ? 'ring-2 ring-olive-700 dark:ring-camel-400 scale-110'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons: Try on & Quick Add to Bag */}
                <div className="mt-3 flex gap-1.5">
                  <button
                    onClick={() => onToggleEquip(p, currentVariant)}
                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
                      isWorn
                        ? 'bg-olive-700 text-white'
                        : 'bg-linen-100 dark:bg-onyx-800 text-onyx-800 dark:text-linen-200 hover:bg-olive-700 hover:text-white'
                    }`}
                  >
                    {isWorn ? "Wearing" : "+ Try on"}
                  </button>
                  {onAddToCart && (
                    <button
                      onClick={() => onAddToCart(p, p.sizes?.[0] || 'M', (p.colors[currentVariant] || p.colors[0]).name)}
                      className="px-2 py-1.5 rounded-md bg-linen-200 dark:bg-onyx-800 hover:bg-camel-500 hover:text-onyx-950 text-onyx-800 dark:text-linen-200 text-[10px] font-bold transition"
                      title="Add this piece directly to bag"
                    >
                      + Bag
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </section>

    </div>
  );
}
