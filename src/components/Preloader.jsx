import React, { useState, useEffect } from 'react';
import { isReducedMotionPreferred } from '../config/animations';

/**
 * Preloader - High-fashion entry splash screen with logo reveal
 */
export default function Preloader({ onComplete }) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // If reduced motion or already seen in session, skip or shorten
    if (isReducedMotionPreferred()) {
      setVisible(false);
      if (onComplete) onComplete();
      return;
    }

    const hasSeen = sessionStorage.getItem('zaytoun_preloader_seen');
    if (hasSeen) {
      setVisible(false);
      if (onComplete) onComplete();
      return;
    }

    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 450);

    const removeTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('zaytoun_preloader_seen', 'true');
      if (onComplete) onComplete();
    }, 700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-linen-100 dark:bg-onyx-950 transition-opacity duration-700 ease-in-out pointer-events-none ${
        fading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex flex-col items-center text-center space-y-4 px-6">
        {/* Monogram Seal */}
        <div className="w-16 h-16 rounded-full border border-camel-500/30 flex items-center justify-center relative mb-2">
          <div className="w-12 h-12 rounded-full border border-olive-800/40 dark:border-camel-400/40 flex items-center justify-center">
            <span className="font-editorial text-2xl font-bold text-olive-900 dark:text-camel-300">
              Z
            </span>
          </div>
          <div className="absolute inset-0 rounded-full border border-t-camel-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>

        {/* Brand Name with Staggered Tracking */}
        <h1 className="font-editorial text-3xl sm:text-4xl tracking-[0.25em] font-light text-onyx-950 dark:text-linen-100 uppercase">
          ZAYTOUN & CO.
        </h1>

        <p className="text-[10px] uppercase font-mono tracking-[0.35em] text-camel-600 dark:text-camel-400">
          Slow Luxury • Atelier Editions
        </p>

        {/* Minimal Progress Line */}
        <div className="w-32 h-[1.5px] bg-linen-300 dark:bg-onyx-800 overflow-hidden rounded-full mt-4">
          <div className="w-full h-full bg-camel-500 origin-left animate-[progress_1.1s_cubic-bezier(0.16,1,0.3,1)_forwards]" />
        </div>
      </div>
    </div>
  );
}
