import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BrandLogo - Bespoke Haute Couture Atelier Monogram & Typographic Identity
 * 
 * Features:
 * - Geometric interlocking dual-faceted monogram insignia ("Z" & "A" convergence)
 * - Precision vector geometry with architectural chamfered diamond shield
 * - Balanced luxury proportions with ultra-wide tracking and serif typography
 * - Responsive sizing modes: 'sm', 'md', 'lg', 'xl'
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
    sm: { icon: 'w-6 h-6 sm:w-8 sm:h-8', text: 'text-xs sm:text-base', sub: 'text-[8px] sm:text-[10px]' },
    md: { icon: 'w-7 h-7 sm:w-10 sm:h-10', text: 'text-sm sm:text-xl lg:text-2xl', sub: 'text-[9px] sm:text-xs' },
    lg: { icon: 'w-9 h-9 sm:w-14 sm:h-14', text: 'text-lg sm:text-3xl', sub: 'text-[10px] sm:text-sm' },
    xl: { icon: 'w-12 h-12 sm:w-20 sm:h-20', text: 'text-xl sm:text-4xl', sub: 'text-xs sm:text-sm' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // The Exquisite Monogram Emblem (SVG)
  const MonogramEmblem = (
    <div
      className={`relative ${currentSize.icon} flex items-center justify-center select-none group-hover:scale-105 transition-transform duration-300 shrink-0`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Outer Architectural Octagonal / Diamond Frame */}
        <polygon
          points="50,4 96,50 50,96 4,50"
          className="stroke-black dark:stroke-[#E6D3B3] transition-colors"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Inner Concentric Fine Inset Frame */}
        <polygon
          points="50,11 89,50 50,89 11,50"
          className="stroke-[#E6D3B3] dark:stroke-black opacity-90 transition-colors"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Center Geometric Solid Diamond Ground */}
        <polygon
          points="50,16 84,50 50,84 16,50"
          className="fill-black dark:fill-[#E6D3B3] transition-colors"
        />

        {/* Interlocking Couture Z & A Monogram */}
        {/* Top Z bar */}
        <path
          d="M32 35 H68 L36 65 H68"
          className="stroke-[#E6D3B3] dark:stroke-black transition-colors"
          strokeWidth="4"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />

        {/* Architectural Atelier Apex A Crossbeam */}
        <path
          d="M50 26 L50 74"
          className="stroke-[#E6D3B3] dark:stroke-black transition-colors"
          strokeWidth="1.5"
          strokeDasharray="2 3"
        />

        {/* Corner Micro-Accents */}
        <circle cx="50" cy="4" r="2" className="fill-[#E6D3B3] dark:fill-black" />
        <circle cx="96" cy="50" r="2" className="fill-[#E6D3B3] dark:fill-black" />
        <circle cx="50" cy="96" r="2" className="fill-[#E6D3B3] dark:fill-black" />
        <circle cx="4" cy="50" r="2" className="fill-[#E6D3B3] dark:fill-black" />
      </svg>
    </div>
  );

  // The Wide-Tracked Editorial Wordmark
  const Wordmark = showWordmark && (
    <div className={`flex flex-col leading-none ${stacked ? 'items-center text-center mt-3' : 'text-left'}`}>
      <span
        className={`font-editorial ${currentSize.text} font-black tracking-[0.16em] sm:tracking-[0.28em] text-black dark:text-white uppercase transition-colors`}
      >
        ZAYTOUN
      </span>
      <span
        className={`${currentSize.sub} font-bold tracking-[0.28em] sm:tracking-[0.45em] text-[#A6865A] dark:text-[#E6D3B3] uppercase mt-0.5 sm:mt-1 transition-colors`}
      >
        ATELIER
      </span>
    </div>
  );

  const innerContent = (
    <div
      className={`inline-flex ${
        stacked ? 'flex-col items-center' : 'items-center space-x-2 sm:space-x-3.5'
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
