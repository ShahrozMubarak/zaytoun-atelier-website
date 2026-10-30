import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { COLOR_PALETTE_INFO } from '../data/products';

export default function AboutPage() {
  const [copiedHex, setCopiedHex] = useState(null);
  const [activeTab, setActiveTab] = useState('philosophy');

  const handleCopyHex = (hex) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const paletteArray = Object.values(COLOR_PALETTE_INFO || {});

  const craftSteps = [
    {
      num: "01",
      title: "Botanical Sourcing & Fiber Purity",
      subtitle: "Raw Material Provenance",
      description: "We work directly with certified organic growers in Belgium for long-staple flax, and nomadic Mongolian cooperatives for Grade-A cashmere. Synthetics and petrochemical blends are strictly forbidden.",
      details: "Zero polyester • 100% biodegradable organic staples"
    },
    {
      num: "02",
      title: "Artisanal River-Washed Natural Dyes",
      subtitle: "Non-Toxic Chemistry",
      description: "Our signature Olive Green, Desert Camel, and Obsidian tones are derived from river-washed crushed botanical husks and mineral oxides. The fibers develop an authentic, nuanced patina that deepens with wear.",
      details: "Gentle natural enzymes • Zero heavy metal effluents"
    },
    {
      num: "03",
      title: "Architectural 3D Draping & Patternmaking",
      subtitle: "Structural Engineering",
      description: "Every pattern is draped on both physical mannequin forms and calibrated digital 3D body meshes. We obsess over the drop of the shoulder, high armhole articulation, and the pendulum swing of hems.",
      details: "Calibrated 360° fit • French interior bound seams"
    },
    {
      num: "04",
      title: "Generational Longevity & Care Guarantee",
      subtitle: "Permanent Wardrobe Capsule",
      description: "Each garment is finished with reinforced stress bar-tacks and hand-turned water buffalo horn buttons. Built to be worn repeatedly, cared for simply, and handed down across generations.",
      details: "Heirloom grade • Complimentary lifetime seam repairs"
    }
  ];

  const fiberShowcases = [
    {
      name: "Belgian Organic Flax Linen",
      origin: "Kortrijk, Belgium",
      weight: "320 GSM Heavyweight Twill",
      description: "Vintage slow-shuttle woven flax that grows softer, cooler, and more supple with every laundering cycle.",
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Grade-A Mongolian Cashmere",
      origin: "Alashan Plateau, Inner Mongolia",
      weight: "2-Ply 12-Gauge Fine Knit",
      description: "Hand-combed underfleece with exceptional thermal insulation and cloud-soft handfeel against bare skin.",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Kurabo Shuttle-Loomed Denim",
      origin: "Okayama, Japan",
      weight: "14oz Selvedge Denim",
      description: "Old-world shuttle-loomed ring-spun cotton with raw selvedge ID, finished with natural indigo mineral wash.",
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Full-Grain Calf Nappa Leather",
      origin: "Ethical Tannery, Lahore",
      weight: "1.2mm Hand-Buffed Nappa",
      description: "Supple, uncorrected grain calfskin hand-finished with organic beeswax for rich natural drape and weather resistance.",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-linen-100 dark:bg-onyx-950 text-onyx-950 dark:text-linen-100 transition-colors py-10 sm:py-16">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12 space-y-24">
        
        {/* =========================================================================
            1. ATELIER HERO SECTION
        ========================================================================= */}
        <section className="relative overflow-hidden pt-4 pb-8 border-b border-linen-300 dark:border-onyx-800">
          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-linen-200/80 dark:bg-onyx-900/80 text-olive-900 dark:text-camel-300 border border-linen-300 dark:border-onyx-800 text-xs font-mono tracking-widest uppercase shadow-xs">
              <img 
                src="/images/brand/foolish/arc_emblem.png" 
                alt="FOOLISH ARC Emblem" 
                className="w-5 h-2.5 object-contain opacity-90 invert dark:invert-0" 
              />
              <span>FOOLISH ARC Manifesto • Slow Luxury</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-onyx-950 dark:text-linen-50 leading-[1.05]">
              Architectural drape, shaped by earth and patience.
            </h1>

            <p className="text-base sm:text-lg text-onyx-700 dark:text-linen-300 font-light leading-relaxed max-w-3xl">
              FOOLISH ARC was founded as an unapologetic antidote to fast fashion disposable culture. 
              We craft high-character, permanent garments in an intentional four-tone palette: Olive Green, Desert Camel, 
              Obsidian Black, and Alabaster Linen White. Every silhouette is sculpted to be worn, loved, and passed down across decades.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="px-8 py-3.5 rounded-none bg-black hover:bg-neutral-900 text-white dark:bg-white dark:text-black font-black text-xs uppercase tracking-widest transition shadow-md"
              >
                EXPLORE COLLECTION
              </Link>
              <Link
                to="/shop?cat=women"
                className="px-8 py-3.5 rounded-none border-2 border-black dark:border-white text-black dark:text-white font-black text-xs uppercase tracking-widest transition hover:bg-neutral-100 dark:hover:bg-onyx-900"
              >
                WOMEN'S COLLECTION →
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. THE 4-TONE HARMONIC EARTH PALETTE SYSTEM
        ========================================================================= */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-linen-300 dark:border-onyx-800 pb-5">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#C69F6F] block">
                COLOR ARCHITECTURE
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight mt-1 text-black dark:text-white">
                THE 4-TONE EARTH SPECTRUM
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paletteArray.map((c) => {
              const isCopied = copiedHex === c.hex;
              return (
                <div
                  key={c.name}
                  onClick={() => handleCopyHex(c.hex)}
                  className="group cursor-pointer rounded-3xl overflow-hidden border border-linen-300 dark:border-onyx-800 bg-linen-100 dark:bg-onyx-900 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5"
                >
                  {/* Color Swatch Block */}
                  <div
                    className="h-44 w-full relative p-5 flex flex-col justify-between transition-transform duration-500 group-hover:scale-102"
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-black/30 text-white backdrop-blur-md self-start font-bold">
                      {isCopied ? 'Copied ✓' : 'Click to copy'}
                    </span>
                    <span className="text-xs font-mono text-white/95 drop-shadow-md self-end font-bold">
                      {c.hex}
                    </span>
                  </div>

                  {/* Swatch Metadata */}
                  <div className="p-6 space-y-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-camel-600 dark:text-camel-400 block font-bold">
                        {c.role}
                      </span>
                      <h4 className="font-editorial text-xl font-bold text-onyx-950 dark:text-linen-50 mt-0.5">
                        {c.name}
                      </h4>
                    </div>

                    <div className="text-[11px] font-mono text-onyx-600 dark:text-linen-400 space-y-1 pt-1 border-t border-linen-200 dark:border-onyx-800">
                      <div>RGB: {c.rgb}</div>
                      <div>CMYK: {c.cmyk}</div>
                      <div>Contrast: {c.contrastOnWhite || c.contrastOnBlack}</div>
                    </div>

                    <p className="text-xs text-onyx-700 dark:text-linen-300 font-light leading-relaxed pt-1">
                      {c.application}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            3. SUSTAINABLE TEXTILE & FIBER PROVENANCE
        ========================================================================= */}
        <section className="space-y-8">
          <div className="border-b border-linen-300 dark:border-onyx-800 pb-5">
            <span className="text-xs font-mono uppercase tracking-widest text-camel-600 dark:text-camel-400 font-semibold">
              Textile Provenance
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold mt-1 text-onyx-950 dark:text-linen-50">
              Four Raw Master Fibers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fiberShowcases.map((fiber) => (
              <div
                key={fiber.name}
                className="rounded-3xl overflow-hidden border border-linen-300 dark:border-onyx-800 bg-linen-100 dark:bg-onyx-900 flex flex-col justify-between shadow-sm group hover:shadow-lg transition"
              >
                <div>
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={fiber.image}
                      alt={fiber.name}
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-onyx-950/70 backdrop-blur-md text-white text-[10px] font-mono">
                      {fiber.origin}
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-camel-600 dark:text-camel-400 font-bold block">
                      {fiber.weight}
                    </span>
                    <h3 className="font-editorial text-xl font-bold text-onyx-950 dark:text-linen-50">
                      {fiber.name}
                    </h3>
                    <p className="text-xs text-onyx-600 dark:text-linen-400 font-light leading-relaxed">
                      {fiber.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            4. THE 4-STEP ATELIER BENCHMARK METHODOLOGY
        ========================================================================= */}
        <section className="space-y-10">
          <div className="border-b border-linen-300 dark:border-onyx-800 pb-5">
            <span className="text-xs font-mono uppercase tracking-widest text-camel-600 dark:text-camel-400 font-semibold">
              Atelier Methodology
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold mt-1 text-onyx-950 dark:text-linen-50">
              How We Build Wearable Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {craftSteps.map((step) => (
              <div
                key={step.num}
                className="p-8 sm:p-10 rounded-3xl bg-linen-200/40 dark:bg-onyx-900/40 border border-linen-300 dark:border-onyx-800 space-y-4 hover:border-camel-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="font-editorial text-4xl font-bold text-olive-800 dark:text-camel-400">
                    {step.num}
                  </span>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-linen-200 dark:bg-onyx-800 text-onyx-800 dark:text-linen-200 font-bold">
                    {step.details}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-camel-600 dark:text-camel-400 font-semibold block">
                    {step.subtitle}
                  </span>
                  <h3 className="font-editorial text-2xl font-bold text-onyx-950 dark:text-linen-50 mt-0.5">
                    {step.title}
                  </h3>
                </div>

                <p className="text-sm text-onyx-700 dark:text-linen-300 font-light leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            5. APPOINTMENT-ONLY LAHORE ATELIER BANNER
        ========================================================================= */}
        <section className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-olive-900 via-olive-950 to-onyx-950 text-linen-100 border border-olive-800/40 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-camel-400 font-semibold block">
              Private Sittings • Gulberg, Lahore
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold tracking-tight text-linen-50">
              Experience the Atelier in Person.
            </h2>
            <p className="text-sm text-linen-300 font-light leading-relaxed">
              Touch raw fabric bolts, consult on custom sleeve draping, and review color swatch swatches alongside master patternmakers. 
              By private appointment only.
            </p>
          </div>

          <div className="shrink-0 flex items-center space-x-4">
            <Link
              to="/contact"
              className="px-8 py-4 rounded-full bg-camel-500 hover:bg-camel-600 text-onyx-950 font-bold text-xs uppercase tracking-widest transition shadow-lg active:scale-95"
            >
              Request Private Consultation
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
