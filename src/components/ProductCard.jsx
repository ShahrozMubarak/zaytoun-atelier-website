import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  onAddToCart,
  isWishlisted,
  onToggleWishlist
}) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
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

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);
    if (onAddToCart) {
      onAddToCart(product);
    }
    setTimeout(() => {
      setIsAdding(false);
      setJustAdded(true);
    }, 300);
    setTimeout(() => {
      setJustAdded(false);
    }, 2200);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      className="group relative flex flex-col bg-white dark:bg-onyx-950 rounded-none border border-neutral-200 dark:border-onyx-800 transition-colors cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
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
            <span className="text-xs uppercase tracking-widest font-black bg-black text-white dark:bg-white dark:text-black px-2.5 py-1 rounded-none shadow-sm flex items-center gap-1.5 border-l-2 border-[#C69F6F]">
              {['EXCLUSIVE', 'ATELIER', 'RAW SILK'].some(b => (product.badge || '').toUpperCase().includes(b)) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C69F6F]"></span>
              )}
              <span>{product.badge}</span>
            </span>
          </div>
        )}

        {/* Wishlist Button - Little Motion Pop Interaction */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-none bg-white/90 dark:bg-onyx-900/90 backdrop-blur-sm border border-neutral-200 dark:border-onyx-700 flex items-center justify-center text-xs transition-transform active:scale-90 hover:border-black dark:hover:border-white shadow-sm"
          >
            <span className={`transition-transform duration-200 ${isWishlisted ? 'text-red-500 scale-110' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}>
              {isWishlisted ? '♥' : '♡'}
            </span>
          </button>
        )}

        {/* Quick Add to Bag Action with Little Motion Tactile Animation */}
        {onAddToCart && (
          <div className="absolute inset-x-2.5 bottom-2.5 z-20 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Add ${product.name} to bag`}
              className={`w-full py-2.5 px-3 rounded-none font-black text-[11px] uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer ${
                justAdded
                  ? 'bg-[#9A6E3E] text-white'
                  : 'bg-black/90 hover:bg-[#9A6E3E] text-white backdrop-blur-xs'
              }`}
            >
              {justAdded ? (
                <>
                  <span className="text-white text-xs">✓</span>
                  <span>Added to Bag</span>
                </>
              ) : isAdding ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M6 7h12l2 14H4L6 7Z" />
                    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                  </svg>
                  <span>+ Add to Bag</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>

      {/* Product Details Block - Exactly Styled like Outfitters */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-grow bg-white dark:bg-onyx-950">
        
        {/* 1. Product Title (Uppercase sans-serif) */}
        <h3 className="font-sans text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide line-clamp-1 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
          {product.name}
        </h3>

        {/* 2. Fit & Demographics Subtitle (e.g. BARREL FIT | MEN) */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wider mt-1">
          {fitSubtitle}
        </p>

        {/* 3. Price in PKR (Bold with strikethrough if on sale) */}
        <div className="mt-2.5 flex items-baseline space-x-2">
          <span className="font-sans text-sm sm:text-base font-black text-black dark:text-white tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="font-sans text-xs sm:text-sm text-neutral-400 line-through font-normal">
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
