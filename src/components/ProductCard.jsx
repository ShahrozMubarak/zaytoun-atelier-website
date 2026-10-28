import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';

/**
 * ProductCard - Outfitters-Style Clean Editorial Fashion Card
 * 
 * Aesthetic Rules:
 * - Elongated 3:4 vertical block aspect ratio (pure editorial fashion length)
 * - Solid pure white studio background
 * - Zero rounded corners (rounded-none across container, images, swatches)
 * - Absolutely NO zoom animations on hover (crisp static/fade transition)
 * - NO "Buy Now" button on the card div (clean shopping experience)
 * - Clean metadata underneath:
 *   1. Product Name in uppercase bold sans-serif
 *   2. Fit & Category subtitle in subtle uppercase gray (e.g. "BARREL FIT | MEN")
 *   3. Bold Price in PKR (with strikethrough if discounted)
 *   4. Square denim/color swatches
 */
export default function ProductCard({
  product,
  onQuickView,
  isWishlisted,
  onToggleWishlist
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { formatPrice } = useCurrency();

  const primaryImage =
    product.images?.[0] ||
    "/images/catalog/men_barrel_jeans_flat.jpg";
  const hoverImage = product.images?.[1] || primaryImage;

  // Fit & demographic subtitle
  const fitSubtitle = product.fitLine || 
    `${(product.fit || product.style || 'REGULAR FIT').toUpperCase().replace(' FIT', '')} FIT | ${(product.person || product.gender || 'MEN').toUpperCase()}`;

  // Denim & garment color swatches
  const swatches = product.colors || [
    { name: 'Light Blue', hex: '#8FA9C4' },
    { name: 'Dark Indigo', hex: '#1E2A38' }
  ];

  return (
    <div
      className="group relative flex flex-col bg-white dark:bg-onyx-950 rounded-none border border-neutral-200 dark:border-onyx-800 transition-colors cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onQuickView && onQuickView(product)}
      id={`product-${product.id}`}
    >
      {/* Tall 3:4 Vertical Image Container with Zero Rounded Corners */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-white dark:bg-onyx-900 rounded-none border-b border-neutral-100 dark:border-onyx-900">
        
        {/* Primary Product Studio Image (No Zoom Scale) */}
        <img
          src={primaryImage}
          alt={product.name}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ease-in-out ${
            isHovered && hoverImage !== primaryImage ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
        />

        {/* Secondary / Alternate Hover Image (Model View or Alternate Angle, No Zoom Scale) */}
        {hoverImage !== primaryImage && (
          <img
            src={hoverImage}
            alt={`${product.name} model view`}
            className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ease-in-out ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />
        )}

        {/* Subtle Badge (e.g. "NEW ARRIVAL", "BESTSELLER") - Minimalist sharp box */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            <span className="text-[9px] uppercase tracking-widest font-black bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded-none shadow-sm">
              {product.badge}
            </span>
          </div>
        )}

      </div>

      {/* Product Details Block - Exactly Styled like Outfitters */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-grow bg-white dark:bg-onyx-950">
        
        {/* 1. Product Title (Uppercase sans-serif) */}
        <h3 className="font-sans text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide line-clamp-1 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
          {product.name}
        </h3>

        {/* 2. Fit & Demographics Subtitle (e.g. BARREL FIT | MEN) */}
        <p className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider mt-0.5">
          {fitSubtitle}
        </p>

        {/* 3. Price in PKR (Bold with strikethrough if on sale) */}
        <div className="mt-2 flex items-baseline space-x-2">
          <span className="font-sans text-xs sm:text-sm font-black text-black dark:text-white tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="font-sans text-[10px] sm:text-xs text-neutral-400 line-through font-normal">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* 4. Color Swatches (Small sharp square boxes, matching Outfitters) */}
        {swatches && swatches.length > 0 && (
          <div className="mt-2.5 flex items-center space-x-1.5 pt-0.5">
            {swatches.map((color, idx) => (
              <span
                key={color.name || idx}
                title={color.name}
                style={{ backgroundColor: color.hex || '#1E2A38' }}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-none border border-neutral-300 dark:border-neutral-700 inline-block shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
