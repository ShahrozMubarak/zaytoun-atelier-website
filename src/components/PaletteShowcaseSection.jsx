import React, { useState } from 'react';
import { COLOR_PALETTE_INFO } from '../data/products';

export default function PaletteShowcaseSection() {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyHex = (hex, key) => {
    navigator.clipboard?.writeText(hex);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const palettes = [
    {
      key: "olive",
      name: "Olive Green",
      hex: "#364634",
      bgClass: "bg-[#364634]",
      textColor: "text-white",
      tag: "Primary Anchor",
      role: "Grounding, natural serenity, trench coats & brand CTAs",
      contrast: "9.2:1 (AAA Pass)"
    },
    {
      key: "camel",
      name: "Desert Camel",
      hex: "#C69F6F",
      bgClass: "bg-[#C69F6F]",
      textColor: "text-onyx-950",
      tag: "Warm Neutral",
      role: "Cashmere knits, price badges, artisanal leather accents",
      contrast: "8.4:1 (AAA Pass)"
    },
    {
      key: "black",
      name: "Obsidian Black",
      hex: "#111315",
      bgClass: "bg-[#111315]",
      textColor: "text-white",
      tag: "Editorial Dark",
      role: "Sharp tailoring, wool blazers, silk slip dresses & typography",
      contrast: "18.8:1 (AAA Pass)"
    },
    {
      key: "white",
      name: "Alabaster Linen White",
      hex: "#FAF8F5",
      bgClass: "bg-[#FAF8F5] border border-gray-300",
      textColor: "text-onyx-950",
      tag: "Organic Light",
      role: "Breathable resort shirts, modal backdrops & negative space",
      contrast: "18.8:1 (AAA Pass)"
    }
  ];

  return (
    <section id="palette" className="bg-white dark:bg-onyx-900 rounded-3xl border border-linen-300 dark:border-onyx-800 p-8 sm:p-12 shadow-sm space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-linen-200 dark:border-onyx-800 pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-camel-700 dark:text-camel-400">
            Brand Chromatic Foundation
          </span>
          <h2 className="font-editorial text-2xl sm:text-4xl font-bold text-onyx-950 dark:text-linen-50 mt-1">
            The Earth Atelier Color System
          </h2>
          <p className="text-xs sm:text-sm text-onyx-600 dark:text-linen-300 mt-1 max-w-xl">
            A cohesive quad-palette engineered for timeless apparel harmony. Click any hex code to copy for your styling references.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
          <span>✓</span>
          <span>WCAG 2.1 AAA High-Contrast Certified</span>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {palettes.map((p) => (
          <div
            key={p.key}
            className="rounded-2xl overflow-hidden border border-linen-300 dark:border-onyx-800 bg-linen-50 dark:bg-onyx-950 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group"
          >
            {/* Swatch color header */}
            <div className={`h-36 ${p.bgClass} p-4 flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.02]`}>
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded backdrop-blur-md ${p.textColor} bg-black/20 w-fit`}>
                {p.tag}
              </span>
              <div className="flex items-center justify-between">
                <span className={`font-mono text-sm font-bold ${p.textColor}`}>
                  {p.hex}
                </span>
                <button
                  onClick={() => copyHex(p.hex, p.key)}
                  className={`text-[11px] font-bold px-2 py-1 rounded backdrop-blur-md ${p.textColor} bg-black/20 hover:bg-black/40 transition`}
                  title="Copy Hex to clipboard"
                >
                  {copiedKey === p.key ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* Description & role */}
            <div className="p-5 space-y-3 text-xs flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <h4 className="font-editorial text-base font-bold text-onyx-950 dark:text-linen-50">
                  {p.name}
                </h4>
                <p className="text-[11px] text-onyx-600 dark:text-linen-400 leading-relaxed">
                  {p.role}
                </p>
              </div>

              <div className="pt-3 border-t border-linen-200 dark:border-onyx-800 flex items-center justify-between text-[10px] text-onyx-500 dark:text-linen-400">
                <span>Contrast:</span>
                <strong className="text-olive-800 dark:text-camel-300 font-mono">{p.contrast}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}
