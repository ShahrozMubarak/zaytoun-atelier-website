import React, { useState, useEffect } from 'react';
import { isReducedMotionPreferred } from '../config/animations';
import BrandLogo from './BrandLogo';

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
      <div className="flex flex-col items-center text-center space-y-6 px-6">
        {/* Bespoke Luxury Atelier Logo Monogram */}
        <BrandLogo size="lg" stacked={true} asLink={false} />

        {/* Minimal Progress Line */}
        <div className="w-32 h-[1.5px] bg-neutral-200 dark:bg-onyx-800 overflow-hidden rounded-none mt-2">
          <div className="w-full h-full bg-[#E6D3B3] origin-left animate-[progress_1.1s_cubic-bezier(0.16,1,0.3,1)_forwards]" />
        </div>
      </div>
    </div>
  );
}
