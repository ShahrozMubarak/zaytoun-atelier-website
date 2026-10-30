import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from '../components/ProductCard';
import SymbioteButton from '../components/SymbioteButton';

/**
 * ProductDetailPage - Outfitters-Style Full-Page Product Detail View
 * 
 * Aesthetic Rules:
 * - Pure white studio photography gallery with elongated 3:4 aspect ratio
 * - Zero rounded corners (rounded-none) across containers, swatches, and CTA blocks
 * - Minimalist editorial typography & Pakistan-wide delivery details
 */
export default function ProductDetailPage({
  products = [],
  onAddToCart,
  onToggleWishlist,
  wishlist = [],
  onOpenProductModal
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  // Find product by id or slug
  const product = products.find(p => p.id === id || p.slug === id);

  // Active selections
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('fabric'); // 'fabric' | 'care' | 'delivery'
  const [isZoomed, setIsZoomed] = useState(false);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product) {
      setActiveImageIndex(0);
      setSelectedColor(product.colors?.[0]?.name || product.primaryColor || "");
      setSelectedSize(product.sizes?.[0] || "32");
      setQuantity(1);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-white dark:bg-onyx-950 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-2">
          Garment Not Found
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          The requested atelier piece is unavailable or has been archived from this collection.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-bold uppercase text-xs tracking-widest rounded-none hover:bg-neutral-800 transition"
        >
          Return to All Collections
        </Link>
      </div>
    );
  }

  const productImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || "/images/catalog/men_barrel_jeans_flat.jpg"];

  const colors = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors
    : [{ name: product.colorName || product.primaryColor || 'Default', hex: product.color || '#1E2A38' }];

  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : ['28', '30', '32', '34', '36'];

  const isWishlisted = wishlist.includes(product.id);
  const currentStock = product.stockPerSize?.[selectedSize] !== undefined
    ? Number(product.stockPerSize[selectedSize])
    : (product.stock !== undefined ? Number(product.stock) : 8);

  const handleAddToCart = () => {
    if (onAddToCart) {
      const res = onAddToCart(product, selectedSize, selectedColor, quantity);
      if (res !== false) {
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
      }
    }
  };

  // Related garments
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.person === product.person || p.slot === product.slot))
    .slice(0, 4);

  return (
    <div className="bg-white dark:bg-onyx-950 min-h-screen pt-24 pb-20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-neutral-500 mb-6">
          <Link to="/" className="hover:text-black dark:hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-black dark:hover:text-white transition">
            {product.person ? product.person.toUpperCase() : "COLLECTION"}
          </Link>
          <span>/</span>
          <span className="text-black dark:text-white font-bold line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Hero Grid (60/40 Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT: Multi-image Studio Gallery (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Vertical Thumbnail Strip */}
            {productImages.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 sm:w-20 sm:h-26 rounded-none overflow-hidden border-2 transition active:scale-95 bg-white shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-black dark:border-white shadow-sm'
                        : 'border-neutral-200 dark:border-onyx-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Studio Image */}
            <div
              className={`relative flex-1 aspect-[3/4] bg-white dark:bg-onyx-900 border border-neutral-200 dark:border-onyx-800 overflow-hidden cursor-${isZoomed ? 'zoom-out' : 'zoom-in'}`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={productImages[activeImageIndex] || productImages[0]}
                alt={product.name}
                className={`w-full h-full object-cover object-center transition-transform duration-500 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100'
                }`}
              />

              {product.badge && (
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <span className="text-xs uppercase tracking-widest font-black bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded-none shadow-md">
                    {product.badge}
                  </span>
                </div>
              )}

              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-mono px-2.5 py-1 rounded-none pointer-events-none">
                {isZoomed ? "Click to reset" : "Click to zoom"}
              </div>
            </div>

          </div>

          {/* RIGHT: Garment Purchase Details (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            
            {/* Subtitle & Title */}
            <div>
              <p className="text-xs font-mono font-bold tracking-widest text-neutral-500 uppercase mb-1">
                {product.fitLine || `${(product.fit || 'REGULAR').toUpperCase()} FIT | ${(product.person || 'MEN').toUpperCase()}`}
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
                {product.name}
              </h1>
              <p className="text-xs font-mono text-neutral-400 mt-1 uppercase">
                SKU: {product.id.toUpperCase()} • EDITION 2026
              </p>
            </div>

            {/* Price & Rating */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-onyx-800">
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm font-medium text-neutral-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                <span className="text-amber-500 font-bold">★ {product.rating || "4.9"}</span>
                <span>({product.reviewCount || "48"})</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-light leading-relaxed">
              {product.description}
            </p>

            {/* Color Selection */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2.5">
                <span className="text-neutral-800 dark:text-neutral-200">
                  Selected Wash: <strong className="uppercase">{selectedColor}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-none border text-xs font-mono transition active:scale-95 ${
                      selectedColor === c.name
                        ? 'border-black dark:border-white bg-neutral-100 dark:bg-onyx-800 font-bold shadow-sm'
                        : 'border-neutral-200 dark:border-onyx-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-none border border-neutral-300 shrink-0" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2.5">
                <span className="text-neutral-800 dark:text-neutral-200">
                  Select Size: <strong>{selectedSize}</strong>
                </span>
                <span className="text-[11px] text-neutral-500 uppercase tracking-widest font-mono">
                  {currentStock > 0 ? (
                    currentStock <= 3 ? (
                      <span className="text-amber-600 font-bold">Only {currentStock} left!</span>
                    ) : (
                      <span className="text-emerald-600">{currentStock} in stock</span>
                    )
                  ) : (
                    <span className="text-red-600 font-bold">Sold Out</span>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`h-11 rounded-none text-xs font-mono font-bold border transition active:scale-95 flex items-center justify-center ${
                      selectedSize === s
                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-sm'
                        : 'bg-white dark:bg-onyx-900 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-onyx-700 hover:border-black dark:hover:border-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Add To Bag Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3">
                
                {/* Quantity Pill */}
                <div className="flex items-center border border-neutral-300 dark:border-onyx-700 rounded-none h-12 bg-white dark:bg-onyx-900">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center text-sm font-bold hover:bg-neutral-100 dark:hover:bg-onyx-800 transition"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono text-xs font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-full flex items-center justify-center text-sm font-bold hover:bg-neutral-100 dark:hover:bg-onyx-800 transition"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add to Bag CTA with Symbiote Tether */}
                <SymbioteButton
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  theme="camel"
                  containerClassName="flex-1"
                  className={`w-full h-12 rounded-none font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center space-x-2 active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-700 text-white'
                      : currentStock <= 0
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                        : 'bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black'
                  }`}
                >
                  {isAdded ? (
                    <span>ADDED TO BAG ✓</span>
                  ) : currentStock <= 0 ? (
                    <span>OUT OF STOCK</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M6 7h12l2 14H4L6 7Z" />
                        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                      </svg>
                      <span>ADD TO BAG • {formatPrice(product.price * quantity)}</span>
                    </>
                  )}
                </SymbioteButton>

                {/* Wishlist Heart Button */}
                <button
                  onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                  className={`w-12 h-12 rounded-none border-2 transition active:scale-90 flex items-center justify-center shrink-0 ${
                    isWishlisted
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'border-neutral-300 dark:border-onyx-700 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white'
                  }`}
                  title={isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>

              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-200 dark:border-onyx-800 text-xs font-mono">
              <div className="p-3 bg-neutral-50 dark:bg-onyx-900 border-2 border-neutral-200 dark:border-onyx-800 rounded-none">
                <p className="font-black uppercase text-xs text-neutral-900 dark:text-neutral-100">TCS EXPRESS DELIVERY</p>
                <p className="text-xs font-bold uppercase text-[#C69F6F] mt-1">2-3 DAYS NATIONWIDE</p>
              </div>
              <div className="p-3 bg-neutral-50 dark:bg-onyx-900 border-2 border-neutral-200 dark:border-onyx-800 rounded-none">
                <p className="font-black uppercase text-xs text-neutral-900 dark:text-neutral-100">14-DAY EXCHANGES</p>
                <p className="text-xs font-bold uppercase text-[#C69F6F] mt-1">COMPLIMENTARY RESIZING</p>
              </div>
            </div>

            {/* Elevated Garment Specs Tabs */}
            <div className="pt-2">
              <div className="flex border-b border-neutral-200 dark:border-onyx-800 space-x-6 mb-3 pb-1 font-mono uppercase text-xs">
                <button
                  onClick={() => setActiveTab('fabric')}
                  className={`pb-2 transition ${activeTab === 'fabric' ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-black' : 'text-neutral-400'}`}
                >
                  Fabric & Weave
                </button>
                <button
                  onClick={() => setActiveTab('care')}
                  className={`pb-2 transition ${activeTab === 'care' ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-black' : 'text-neutral-400'}`}
                >
                  Wash & Care
                </button>
                <button
                  onClick={() => setActiveTab('delivery')}
                  className={`pb-2 transition ${activeTab === 'delivery' ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-black' : 'text-neutral-400'}`}
                >
                  Courier & Delivery
                </button>
              </div>

              <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 leading-relaxed">
                {activeTab === 'fabric' && (
                  <p>{product.fabric ? product.fabric.toUpperCase() : "100% AUTHENTIC RING-SPUN COTTON DENIM (13.5OZ SELVEDGE)"}</p>
                )}
                {activeTab === 'care' && (
                  <p>{product.care ? product.care.toUpperCase() : "MACHINE WASH COLD INSIDE OUT • LINE DRY • ZERO TUMBLE"}</p>
                )}
                {activeTab === 'delivery' && (
                  <p>TCS WHITE-GLOVE COURIER • SAME-DAY DISPATCH • REAL-TIME CONSIGNMENT TRACKING</p>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* RELATED GARMENTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-neutral-200 dark:border-onyx-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">Pair With</p>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
                  Complete The Collection
                </h2>
              </div>
              <Link
                to="/shop"
                className="text-xs font-mono uppercase tracking-widest underline underline-offset-4 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              >
                View All Pieces →
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={onAddToCart}
                  onQuickView={onOpenProductModal}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.includes(p.id)}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
