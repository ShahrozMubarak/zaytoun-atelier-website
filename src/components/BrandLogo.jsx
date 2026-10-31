import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BrandLogo - FOOLISH ARC Atelier Monogram & Typographic Identity
 * 
 * Uses the authentic Canva logo suite:
 * - Camel & Black Arc Wave emblem (/images/brand/foolish/arc_emblem.png)
 * - Horizontal foolish arc wordmark (/images/brand/foolish/foolish_arc_wordmark.png)
 * - Stacked mark & New York Since 1988
 */
export default function BrandLogo({
  size = 'md',
  showWordmark = true,
  stacked = false,
  className = '',
  asLink = true
}) {
  // Dimensions based on size preset with responsive mobile scaling (refined, smaller, unclipped)
  const sizeMap = {
    sm: { icon: 'h-4 sm:h-5', text: 'text-[11px] sm:text-xs font-bold tracking-[0.14em]' },
    md: { icon: 'h-5 sm:h-6', text: 'text-xs sm:text-sm font-extrabold tracking-[0.16em]' },
    lg: { icon: 'h-6 sm:h-8', text: 'text-sm sm:text-base font-extrabold tracking-[0.18em]' },
    xl: { icon: 'h-8 sm:h-10', text: 'text-base sm:text-xl font-black tracking-[0.2em]' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // The Exquisite Foolish Arc Wave Emblem
  const MonogramEmblem = (
    <div
      className={`relative ${currentSize.icon} flex items-center justify-center select-none group-hover:scale-105 transition-transform duration-300 shrink-0`}
    >
      <img
        src="/images/brand/foolish/arc_emblem.png"
        alt="FOOLISH ARC Emblem"
        className="h-full w-auto object-contain drop-shadow-xs"
        loading="eager"
      />
    </div>
  );

  // The Refined Editorial Wordmark (clean, no tags)
  const Wordmark = showWordmark && (
    <div className={`flex flex-col leading-none ${stacked ? 'items-center text-center mt-1.5' : 'text-left'}`}>
      <span
        className={`font-editorial ${currentSize.text} text-black dark:text-white uppercase transition-colors flex items-center gap-1`}
      >
        <span>FOOLISH</span>
        <span className="text-[#9A6E3E] dark:text-[#E6D3B3]">ARC</span>
      </span>
    </div>
  );

  const innerContent = (
    <div
      className={`inline-flex ${
        stacked ? 'flex-col items-center' : 'items-center space-x-2.5 sm:space-x-3.5'
      } ${className}`}
    >
      {MonogramEmblem}
      {Wordmark}
    </div>
  );

  if (asLink) {
    return (
      <Link
        to="/"
        className="group select-none hover:opacity-95 transition-opacity inline-flex items-center"
      >
        {innerContent}
      </Link>
    );
  }

  return innerContent;
}
