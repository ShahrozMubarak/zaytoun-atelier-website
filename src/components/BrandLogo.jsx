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
  // Dimensions based on size preset with responsive mobile scaling
  const sizeMap = {
    sm: { icon: 'h-6 sm:h-7', text: 'text-xs sm:text-base', sub: 'text-[8px] sm:text-[10px]', wordmarkImg: 'h-5 sm:h-6' },
    md: { icon: 'h-7 sm:h-9', text: 'text-sm sm:text-xl lg:text-2xl', sub: 'text-[9px] sm:text-xs', wordmarkImg: 'h-6 sm:h-8' },
    lg: { icon: 'h-9 sm:h-12', text: 'text-lg sm:text-3xl', sub: 'text-[10px] sm:text-sm', wordmarkImg: 'h-8 sm:h-11' },
    xl: { icon: 'h-12 sm:h-16', text: 'text-xl sm:text-4xl', sub: 'text-xs sm:text-sm', wordmarkImg: 'h-10 sm:h-14' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // The Exquisite Foolish Arc Wave Emblem
  const MonogramEmblem = (
    <div
      className={`relative ${currentSize.icon} flex items-center justify-center select-none group-hover:scale-105 transition-transform duration-300 shrink-0`}
    >
      <img
        src="/images/brand/foolish/arc_emblem.png"
        alt="Foolish Arc Emblem"
        className="h-full w-auto object-contain drop-shadow-xs"
        loading="eager"
      />
    </div>
  );

  // The Wide-Tracked Editorial Wordmark
  const Wordmark = showWordmark && (
    <div className={`flex flex-col leading-none ${stacked ? 'items-center text-center mt-2.5' : 'text-left'}`}>
      <span
        className={`font-editorial ${currentSize.text} font-black tracking-[0.16em] sm:tracking-[0.24em] text-black dark:text-white uppercase transition-colors flex items-center gap-1.5`}
      >
        <span>FOOLISH</span>
        <span className="text-[#9A6E3E] dark:text-[#E6D3B3]">ARC</span>
      </span>
      <span
        className={`${currentSize.sub} font-bold tracking-[0.28em] sm:tracking-[0.38em] text-[#7C6A58] dark:text-[#D8CEBF] uppercase mt-0.5 transition-colors`}
      >
        NEW YORK • SINCE 1988
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
