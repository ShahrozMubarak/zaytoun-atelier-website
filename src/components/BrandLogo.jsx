import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BrandLogo - FOOLISH ARC Atelier Monogram & Identity
 * 
 * Uses the authentic Canva logo suite:
 * - Primary Lockup (showWordmark=true): The authentic 3rd logo graphic (/images/brand/foolish/foolish_arc_stacked.png)
 * - Emblem Only (showWordmark=false): Camel & Black Arc Wave emblem (/images/brand/foolish/arc_emblem.png)
 */
export default function BrandLogo({
  size = 'md',
  showWordmark = true,
  stacked = false,
  className = '',
  asLink = true
}) {
  // Dimensions calibrated for crisp display without overflow
  const sizeMap = {
    sm: { height: 'h-6 sm:h-7', iconOnly: 'h-5 sm:h-6' },
    md: { height: 'h-7 sm:h-8', iconOnly: 'h-6 sm:h-7' },
    lg: { height: 'h-9 sm:h-11', iconOnly: 'h-8 sm:h-9' },
    xl: { height: 'h-12 sm:h-14', iconOnly: 'h-10 sm:h-12' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const innerContent = (
    <div
      className={`relative inline-flex items-center select-none group-hover:scale-105 transition-transform duration-300 ${className}`}
    >
      {showWordmark ? (
        <img
          src="/images/brand/foolish/foolish_arc_stacked.png"
          alt="FOOLISH ARC"
          className={`${currentSize.height} w-auto object-contain drop-shadow-xs dark:brightness-110`}
          loading="eager"
        />
      ) : (
        <img
          src="/images/brand/foolish/arc_emblem.png"
          alt="FOOLISH ARC Emblem"
          className={`${currentSize.iconOnly} w-auto object-contain drop-shadow-xs`}
          loading="eager"
        />
      )}
      <span className="sr-only">FOOLISH ARC</span>
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

