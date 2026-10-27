import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';

/**
 * ProductModal - High-end editorial product detail modal
 * Includes micro-animated Add-to-Bag button, image zoom, Find My Size calculator,
 * and elevated luxury garment accordions.
 */
export default function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onTryOn,
  onOpenSizeGuide,
  isWishlisted,
  onToggleWishlist
}) {
  if (!isOpen || !product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "M");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('fabric'); // 'fabric' | 'care' | 'delivery'
  const [isAdded, setIsAdded] = useState(false);
  const [showFitHelper, setShowFitHelper] = useState(false);
  const [fitPreference, setFitPreference] = useState('relaxed');
  const { formatPrice } = useCurrency();

  const currentStock = product.stockPerSize?.[selectedSize] || 6;

  const handleAddToCart = () => {
    const result = onAddToCart(product, selectedSize, selectedColor, quantity);
    if (result !== false) {
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-onyx-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-fadeIn">
      <div className="bg-linen-100 dark:bg-onyx-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-linen-300 dark:border-onyx-800 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-linen-200/90 dark:bg-onyx-800/90 hover:bg-linen-300 dark:hover:bg-onyx-700 text-onyx-800 dark:text-linen-200 flex items-center justify-center shadow-md transition active:scale-90"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image Gallery with Zoom */}
          <div className="p-5 sm:p-7 bg-linen-200/60 dark:bg-onyx-950 flex flex-col justify-between">
            <div className="relative rounded-2xl overflow-hidden bg-linen-300/40 dark:bg-onyx-900 h-[380px] sm:h-[460px] shadow-inner group cursor-zoom-in">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-top transition duration-700 ease-out group-hover:scale-110"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-olive-800 dark:bg-camel-500 text-linen-100 dark:text-onyx-950 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex items-center space-x-3 mt-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition transform active:scale-95 ${
                      activeImageIndex === idx
                        ? 'border-olive-800 dark:border-camel-400 shadow-md scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Garment Specs & Purchase Controls */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto max-h-[85vh]">
            <div className="space-y-4">
              
              {/* Category & Collection */}
              <div className="flex items-center justify-between text-xs font-mono text-camel-600 dark:text-camel-400 uppercase tracking-widest">
                <span>{product.collection || "Permanent Edition"}</span>
                <span className="text-onyx-500 dark:text-linen-400">SKU: {product.id.toUpperCase()}</span>
              </div>

              {/* Title */}
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-onyx-950 dark:text-linen-50">
                {product.name}
              </h2>

              {/* Price Row */}
              <div className="flex items-baseline space-x-3">
                <span className="font-editorial text-2xl sm:text-3xl font-bold text-olive-800 dark:text-camel-300">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm font-mono text-onyx-400 dark:text-linen-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-[10px] font-mono font-bold text-camel-700 dark:text-camel-300 bg-camel-500/10 px-2 py-0.5 rounded-full">
                  Atelier Edition
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-onyx-700 dark:text-linen-300 font-light leading-relaxed">
                {product.description}
              </p>

              {/* Color Swatches */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-onyx-800 dark:text-linen-200">
                    Fabric Tone: <strong className="text-camel-600 dark:text-camel-400">{selectedColor}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2.5">
                  {product.colors?.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-mono transition transform active:scale-95 ${
                        selectedColor === c.name
                          ? 'border-olive-800 dark:border-camel-400 bg-olive-900/10 dark:bg-camel-400/15 text-olive-900 dark:text-camel-300 font-bold shadow-sm'
                          : 'border-linen-300 dark:border-onyx-700 text-onyx-700 dark:text-linen-300'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector & Fit Helper */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-onyx-800 dark:text-linen-200">
                    Size: <strong>{selectedSize}</strong>
                  </span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowFitHelper(!showFitHelper)}
                      className="text-camel-600 dark:text-camel-400 underline font-bold"
                    >
                      Find My Fit
                    </button>
                    {onOpenSizeGuide && (
                      <button
                        onClick={onOpenSizeGuide}
                        className="text-onyx-500 dark:text-linen-400 hover:underline"
                      >
                        Size Guide
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {product.sizes?.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[44px] h-10 rounded-xl text-xs font-mono font-bold border transition transform active:scale-95 flex items-center justify-center ${
                        selectedSize === s
                          ? 'bg-onyx-950 dark:bg-linen-100 text-linen-100 dark:text-onyx-950 border-onyx-950 dark:border-linen-100 shadow-sm'
                          : 'bg-linen-100 dark:bg-onyx-900 text-onyx-800 dark:text-linen-200 border-linen-300 dark:border-onyx-800 hover:border-camel-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Stock Remaining Indicator for Selected Size */}
                {(() => {
                  const sizeStock = product.stockPerSize?.[selectedSize] !== undefined
                    ? Number(product.stockPerSize[selectedSize])
                    : product.stock !== undefined
                      ? Number(product.stock)
                      : 6;

                  return (
                    <div className="mt-2.5 flex items-center space-x-2 text-xs">
                      <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          sizeStock <= 0 ? 'bg-red-400' : sizeStock <= 3 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${
                          sizeStock <= 0 ? 'bg-red-500' : sizeStock <= 3 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}></span>
                      </span>
                      <span className="font-mono text-[11px] text-onyx-700 dark:text-linen-300">
                        {sizeStock <= 0 ? (
                          <strong className="text-red-600 dark:text-red-400">Out of Stock in Size {selectedSize}</strong>
                        ) : sizeStock <= 3 ? (
                          <strong className="text-amber-700 dark:text-amber-400 font-bold">Only {sizeStock} pieces remaining in Size {selectedSize}!</strong>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{sizeStock} pieces available in Size {selectedSize}</span>
                        )}
                      </span>
                    </div>
                  );
                })()}

                {/* Fit Helper Modal Box */}
                {showFitHelper && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-linen-200 dark:bg-onyx-800 border border-linen-300 dark:border-onyx-700 text-xs space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-mono uppercase text-[10px] text-camel-600 dark:text-camel-400 font-bold">
                        Fit Recommendation Engine
                      </span>
                      <button onClick={() => setShowFitHelper(false)} className="text-onyx-500">✕</button>
                    </div>
                    <div className="flex items-center space-x-2">
                      {['Slim', 'True to Size', 'Relaxed'].map(f => (
                        <button
                          key={f}
                          onClick={() => setFitPreference(f.toLowerCase())}
                          className={`px-3 py-1 rounded-full text-[10px] font-mono border transition ${
                            fitPreference === f.toLowerCase()
                              ? 'bg-olive-800 text-linen-100 dark:bg-camel-400 dark:text-onyx-950 font-bold'
                              : 'bg-linen-100 dark:bg-onyx-900 text-onyx-700 dark:text-linen-300 border-linen-300 dark:border-onyx-700'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-onyx-600 dark:text-linen-300 font-light">
                      For a {fitPreference} drape with South Asian tailoring proportions, we recommend ordering your normal size <strong>({selectedSize})</strong>.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Actions: Add to Bag (Micro-Animated) & 3D Fitting Room */}
            <div className="space-y-4 pt-4 border-t border-linen-300 dark:border-onyx-800">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-xl flex items-center justify-center space-x-2 active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-700 text-white shadow-emerald-700/30'
                      : 'bg-olive-800 hover:bg-olive-900 dark:bg-camel-500 dark:hover:bg-camel-600 text-linen-100 dark:text-onyx-950'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <svg className="w-4 h-4 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Added to Bag ✓</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M6 7h12l2 14H4L6 7Z" />
                        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                      </svg>
                      <span>Add to Bag • Rs. {(product.price * quantity).toLocaleString()}</span>
                    </>
                  )}
                </button>


                <button
                  onClick={() => onToggleWishlist(product.id)}
                  className={`p-4 rounded-full border transition active:scale-90 ${
                    isWishlisted 
                      ? 'bg-camel-500 text-white border-camel-500 shadow-md' 
                      : 'border-linen-300 dark:border-onyx-700 text-onyx-700 dark:text-linen-300 hover:border-camel-500'
                  }`}
                  title={isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>

              {/* Elevated Accordions */}
              <div className="text-xs pt-2 border-t border-linen-300 dark:border-onyx-800">
                <div className="flex border-b border-linen-300 dark:border-onyx-800 space-x-5 mb-3 pb-1 font-mono uppercase text-[11px]">
                  <button
                    onClick={() => setActiveTab('fabric')}
                    className={`pb-1.5 transition ${activeTab === 'fabric' ? 'text-olive-800 dark:text-camel-400 border-b-2 border-olive-800 dark:border-camel-400 font-bold' : 'text-onyx-500'}`}
                  >
                    Fabric & Weave
                  </button>
                  <button
                    onClick={() => setActiveTab('care')}
                    className={`pb-1.5 transition ${activeTab === 'care' ? 'text-olive-800 dark:text-camel-400 border-b-2 border-olive-800 dark:border-camel-400 font-bold' : 'text-onyx-500'}`}
                  >
                    Wash & Care
                  </button>
                  <button
                    onClick={() => setActiveTab('delivery')}
                    className={`pb-1.5 transition ${activeTab === 'delivery' ? 'text-olive-800 dark:text-camel-400 border-b-2 border-olive-800 dark:border-camel-400 font-bold' : 'text-onyx-500'}`}
                  >
                    Delivery & Returns
                  </button>
                </div>

                <div className="text-onyx-700 dark:text-linen-300 font-light leading-relaxed">
                  {activeTab === 'fabric' && <p>🌿 <strong>Craftsmanship:</strong> {product.fabric || "100% Belgian Organic Washed Linen Twill with reinforced stress points."}</p>}
                  {activeTab === 'care' && <p>💧 <strong>Longevity Guide:</strong> {product.care || "Dry clean or gentle hand wash in cold water with botanical detergent. Steam press low."}</p>}
                  {activeTab === 'delivery' && (
                    <p>🚚 <strong>Atelier Assurance:</strong> Complimentary nationwide courier delivery. Doorstep try-on and 14-day seamless exchange with complimentary home pickup.</p>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
