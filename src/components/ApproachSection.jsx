import React from 'react';

export default function ApproachSection({ onOpenSizeGuide }) {
  const steps = [
    {
      num: "01",
      title: "Choose your form",
      description: "Switch seamlessly between women, men, and kids collections to explore the atelier edit on our 2D vector mannequins."
    },
    {
      num: "02",
      title: "Find your combination",
      description: "Tap any garment to drape it on the mannequin. Experiment with Belgian linen coats over Mongolian cashmere knits and raw silk trousers."
    },
    {
      num: "03",
      title: "Make it your everyday",
      description: "Add the complete look to your bag in one click with complimentary doorstep delivery and flexible atelier checkout."
    }
  ];

  const testimonials = [
    {
      name: "Sahar Al-Mansoor",
      city: "Lahore (DHA Phase 5)",
      quote: "The Olive Heritage trench arrived in 2 days via Leopards Courier. The Belgian twill drape is unmatched, and paying through JazzCash was seamless.",
      item: "Olive Heritage Double-Breasted Trench",
      rating: 5
    },
    {
      name: "Danyal Farooq",
      city: "Karachi (Clifton)",
      quote: "Being able to preview the cashmere knit on the 3D model before buying was brilliant. The fit was true to size and delivery was pristine.",
      item: "Pure Mongolian Camel Cashmere Knit",
      rating: 5
    },
    {
      name: "Zainab Tariq",
      city: "Islamabad (F-7/2)",
      quote: "The quad-color palette of olive, camel, black and linen white makes mixing outfits so intuitive. The 3D-Secure card checkout was instantaneous.",
      item: "Minimalist Onyx Tailored Wool Blazer",
      rating: 5
    }
  ];

  return (
    <div className="space-y-16 py-12">
      
      {/* 3-Step Atelier Approach Banner */}
      <section id="approach" className="rounded-3xl bg-olive-900 text-linen-100 p-8 sm:p-14 shadow-2xl relative overflow-hidden border border-olive-800">
        
        {/* Decorative ambient glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-camel-500/15 blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] uppercase tracking-widest font-bold text-camel-300">
              Style, Without The Guesswork
            </span>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold leading-tight text-white">
              A Wardrobe. <br />
              <span className="italic font-normal text-camel-300">Your point of view.</span>
            </h2>
            <p className="text-xs sm:text-sm text-linen-200 leading-relaxed font-light">
              Sometimes all it takes is seeing it together. Our interactive atelier allows you to style your silhouette before it ever leaves our workshop.
            </p>
          </div>

          {/* 3 Steps Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-olive-800/80">
            {steps.map((st) => (
              <div key={st.num} className="space-y-3">
                <span className="font-editorial text-3xl sm:text-4xl font-bold text-camel-400 block border-b border-olive-800 pb-3">
                  {st.num}
                </span>
                <h3 className="font-editorial text-lg font-bold text-white">
                  {st.title}
                </h3>
                <p className="text-xs text-linen-300 leading-relaxed font-light">
                  {st.description}
                </p>
              </div>
            ))}
          </div>

        </div>

      </section>

      {/* Sustainable Materials & Craft Manifesto */}
      <section className="bg-white dark:bg-onyx-900 rounded-3xl border border-linen-300 dark:border-onyx-800 p-8 sm:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-camel-700 dark:text-camel-400">
              Ethical Atelier Craftsmanship
            </span>
            <h3 className="font-editorial text-2xl sm:text-4xl font-bold text-onyx-950 dark:text-linen-50 leading-tight">
              Honoring Natural Fibers & Timeless Drapes
            </h3>
            <p className="text-xs sm:text-sm text-onyx-600 dark:text-linen-300 leading-relaxed">
              Every garment in our collection is cut from handpicked organic Belgian linen, Mongolian cashmere, or handspun raw silk. We believe in creating pieces that soften with wear and remain foundational for decades.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenSizeGuide}
                className="inline-flex items-center space-x-2 text-xs font-bold text-olive-800 dark:text-camel-400 underline underline-offset-4 hover:opacity-80 transition"
              >
                <span>View Precision Sizing & Fit Measurements</span>
                <span>→</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-2xl bg-linen-50 dark:bg-onyx-950 border border-linen-200 dark:border-onyx-800 space-y-2">
              <div className="w-9 h-9 rounded-full bg-olive-700/10 text-olive-700 dark:text-camel-300 flex items-center justify-center font-bold text-sm">
                🌿
              </div>
              <h4 className="font-bold text-sm text-onyx-950 dark:text-linen-50">Belgian Flax Linen</h4>
              <p className="text-[11px] text-onyx-600 dark:text-linen-400 leading-relaxed">
                Breathable, thermoregulating twill woven from European certified flax fibers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-linen-50 dark:bg-onyx-950 border border-linen-200 dark:border-onyx-800 space-y-2">
              <div className="w-9 h-9 rounded-full bg-camel-500/15 text-camel-700 dark:text-camel-300 flex items-center justify-center font-bold text-sm">
                🐑
              </div>
              <h4 className="font-bold text-sm text-onyx-950 dark:text-linen-50">Grade-A Cashmere</h4>
              <p className="text-[11px] text-onyx-600 dark:text-linen-400 leading-relaxed">
                Combed from free-roaming Mongolian goats. 12-gauge softness that never pills.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-linen-50 dark:bg-onyx-950 border border-linen-200 dark:border-onyx-800 space-y-2">
              <div className="w-9 h-9 rounded-full bg-onyx-900/10 dark:bg-white/10 text-onyx-900 dark:text-linen-100 flex items-center justify-center font-bold text-sm">
                ✨
              </div>
              <h4 className="font-bold text-sm text-onyx-950 dark:text-linen-50">Handspun Raw Silk</h4>
              <p className="text-[11px] text-onyx-600 dark:text-linen-400 leading-relaxed">
                Artisan slub textures with natural sheen, tailored with tonal silk piped seams.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Verified Customer Reviews & Real Fits */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-camel-700 dark:text-camel-400">
            Client Impressions
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-onyx-950 dark:text-linen-50">
            Loved Across Pakistan
          </h3>
          <p className="text-xs text-onyx-600 dark:text-linen-400">
            Real feedback from verified purchasers in Lahore, Karachi, and Islamabad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-onyx-900 p-6 rounded-2xl border border-linen-300 dark:border-onyx-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-1 text-amber-500 text-xs">
                  {'★'.repeat(t.rating)}
                </div>
                <p className="text-xs text-onyx-700 dark:text-linen-300 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-linen-200 dark:border-onyx-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-onyx-950 dark:text-linen-50">{t.name}</div>
                  <div className="text-[11px] text-onyx-500 dark:text-linen-400">{t.city}</div>
                </div>
                <span className="text-[10px] bg-linen-100 dark:bg-onyx-800 text-olive-800 dark:text-camel-400 font-semibold px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
