import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';

/**
 * ProductCard - Compact luxury product div with reduced vertical height.
 * Features:
 * - Shorter 4:3 aspect ratio (reduced card height inspired by reference)
 * - Signature Zaytoun color palette: Olive Green (#364634) & Desert Camel (#C69F6F)
 * - Bottom action div: Bold Price, Strikethrough Original Price, and [ 🛒 Buy Now ] pill button.
 */
export default function ProductCard({
  product,
  onQuickView,
  onAddToCart,
  isWishlisted,
  onToggleWishlist
}) {
  const [selectedColor] = useState(
    product.colors?.[0]?.name || product.primaryColor || ""
  );
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "M");
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { formatPrice } = useCurrency();

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, selectedSize, selectedColor);
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const primaryImage =
    product.images?.[0] ||
    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80";
  const hoverImage = product.images?.[1] || primaryImage;

  return (
    <div
      className="group relative flex flex-col bg-white dark:bg-onyx-950 rounded-2xl p-3 border border-[#E7DFD5] dark:border-onyx-800 hover:border-camel-400 dark:hover:border-camel-400/70 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_-6px_rgba(198,159,111,0.22)] hover:-translate-y-1 transition-all duration-500 ease-out cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onQuickView && onQuickView(product)}
    >
      {/* Reduced Height Image Container (Aspect 4:3 for compact luxury look) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-linen-100 dark:bg-onyx-900">
        <img
          src={primaryImage}
          alt={product.name}
          className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-700 ease-out ${
            isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
          loading="lazy"
        />
        <img
          src={hoverImage}
          alt={`${product.name} alternate view`}
          className={`absolute inset-0 h-full w-full object-cover object-top transition-all duration-700 ease-out ${
            isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
          }`}
          loading="lazy"
        />

        {/* Subtle Luxury Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Wishlist Heart Icon (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) onToggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all duration-300 z-10 active:scale-75 ${
            isWishlisted
              ? 'bg-white/95 text-red-500 shadow-md scale-105'
              : 'bg-white/80 dark:bg-black/60 text-neutral-600 dark:text-neutral-300 hover:text-camel-600 dark:hover:text-camel-400 hover:bg-white'
          }`}
          title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
          aria-label="Wishlist"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isWishlisted ? 'fill-current scale-110' : 'fill-none stroke-current'
            }`}
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </button>

        {/* Floating Quick Size Selector on Hover */}
        {product.sizes && product.sizes.length > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute inset-x-2.5 bottom-2.5 py-1 px-2.5 bg-white/95 dark:bg-onyx-950/95 backdrop-blur-md rounded-lg transition-all duration-300 flex items-center justify-between text-xs z-10 shadow-md border border-camel-400/20 ${
              isHovered
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-camel-700 dark:text-camel-400">
              Select Size
            </span>
            <div className="flex items-center space-x-1">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition ${
                    selectedSize === sz
                      ? 'bg-olive-700 text-white shadow-sm ring-1 ring-camel-400/50'
                      : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Title & Subtitle (Compact & Bold) */}
      <div className="pt-3 pb-1">
        <h3 className="font-sans text-xs sm:text-sm font-bold text-onyx-950 dark:text-linen-50 line-clamp-1 group-hover:text-camel-700 dark:group-hover:text-camel-400 transition-colors">
          {product.name}
        </h3>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-0.5 font-medium">
          {product.primaryColor || product.colors?.[0]?.name || "Pure Fibres"}
        </p>
      </div>

      {/* Product Action Div: Desert Camel Price + Strikethrough + [ 🛒 Buy Now ] in Olive Green */}
      <div className="mt-auto pt-2.5 flex items-center justify-between gap-1.5 border-t border-linen-200 dark:border-onyx-800">
        
        {/* Price Column */}
        <div className="flex items-baseline space-x-1.5">
          <span className="font-sans text-sm sm:text-base font-black text-camel-600 dark:text-camel-300 tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="font-sans text-[11px] text-neutral-400 dark:text-neutral-500 line-through font-normal">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* [ 🛒 Buy Now ] Pill Button in Brand Olive Green with Camel Border Accent */}
        <button
          onClick={handleBuyNow}
          className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center space-x-1.5 active:scale-95 whitespace-nowrap border ${
            justAdded
              ? 'bg-camel-500 text-onyx-950 border-camel-400 shadow-camel-500/30 scale-105'
              : 'bg-olive-700 hover:bg-olive-800 text-white border-camel-400/40 hover:border-camel-400 shadow-olive-900/20 hover:scale-105 hover:shadow-md'
          }`}
          title={`Buy ${product.name}`}
        >
          {justAdded ? (
            <>
              <svg
                className="w-3.5 h-3.5 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Added ✓</span>
            </>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span>Buy Now</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
