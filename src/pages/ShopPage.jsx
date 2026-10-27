import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryFilter, { GENDER_FILTERS, SLOT_FILTERS } from '../components/CategoryFilter';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';

export default function ShopPage({
  products = [],
  onAddToCart,
  onOpenProductModal,
  onToggleWishlist,
  wishlist = [],
  onTryOnProduct
}) {
  const navigate = useNavigate();

  // Filter & Search states
  const [activeGender, setActiveGender] = useState('all');
  const [activeSlot, setActiveSlot] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showOnlyWishlist, setShowOnlyWishlist] = useState(false);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Gender filter
      if (activeGender !== 'all' && product.gender !== activeGender && product.person !== activeGender) {
        return false;
      }
      // 2. Slot filter
      if (activeSlot !== 'all' && product.slot !== activeSlot) {
        return false;
      }
      // 3. Wishlist filter
      if (showOnlyWishlist && !wishlist.includes(product.id)) {
        return false;
      }
      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name?.toLowerCase().includes(q);
        const matchesDesc = product.description?.toLowerCase().includes(q);
        const matchesColor = product.colorName?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesColor) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0; // featured default
    });
  }, [products, activeGender, activeSlot, showOnlyWishlist, wishlist, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-linen-100 dark:bg-onyx-950 text-onyx-950 dark:text-linen-100 transition-colors py-8 sm:py-12">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Page Header */}
        <div className="mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-camel-600 dark:text-camel-400">
            Atelier Catalog
          </span>
          <h1 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-onyx-950 dark:text-linen-50 mt-1">
            The Complete Collection
          </h1>
          <p className="text-sm text-onyx-600 dark:text-linen-400 max-w-xl font-light mt-2">
            Tailored in Lahore. Pure natural fibres, timeless earth tones, and interchangeable silhouettes.
          </p>
        </div>

        {/* Filter Bar with Demographics & Slot Tabs */}
        <div className="mb-6 space-y-4">
          <CategoryFilter
            activeGender={activeGender}
            onSelectGender={setActiveGender}
            activeSlot={activeSlot}
            onSelectSlot={setActiveSlot}
            totalCount={products.length}
          />

          {/* Search, Sort, and Wishlist Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-linen-300 dark:border-onyx-800">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search garments, fabrics, colors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-full text-xs bg-linen-200/80 dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 text-onyx-900 dark:text-linen-100 placeholder-onyx-400 dark:placeholder-onyx-600 focus:outline-none focus:border-olive-800 dark:focus:border-camel-400 transition"
              />
              <svg className="w-3.5 h-3.5 text-onyx-500 dark:text-linen-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="m21 21-4.35-4.35" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-onyx-500 hover:text-onyx-800 dark:hover:text-linen-200"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Right Controls: Sort & Wishlist */}
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              {/* Wishlist filter toggle */}
              <button
                onClick={() => setShowOnlyWishlist(!showOnlyWishlist)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  showOnlyWishlist
                    ? 'bg-camel-600 text-linen-100 border-camel-600 dark:bg-camel-500 dark:text-onyx-950'
                    : 'bg-linen-100 dark:bg-onyx-900 text-onyx-700 dark:text-linen-300 border-linen-300 dark:border-onyx-800 hover:bg-linen-200 dark:hover:bg-onyx-800'
                }`}
              >
                <span>♥ Wishlist</span>
                <span className="font-mono text-[10px]">({wishlist.length})</span>
              </button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-full text-xs bg-linen-100 dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 text-onyx-800 dark:text-linen-200 focus:outline-none cursor-pointer"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>

              {/* Total results count */}
              <span className="text-[11px] font-mono text-onyx-500 dark:text-linen-400 hidden md:inline">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
              </span>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-linen-200/40 dark:bg-onyx-900/40 rounded-3xl border border-dashed border-linen-300 dark:border-onyx-800">
            <p className="text-sm text-onyx-600 dark:text-linen-400">
              No garments matched your active filters.
            </p>
            <button
              onClick={() => {
                setActiveGender('all');
                setActiveSlot('all');
                setSearchQuery('');
                setShowOnlyWishlist(false);
              }}
              className="px-4 py-2 rounded-full bg-olive-800 text-linen-100 text-xs uppercase tracking-wider font-medium hover:bg-olive-900 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product, idx) => (
              <ScrollReveal
                key={product.id}
                delay={Math.min((idx % 4) * 0.1, 0.35)}
                distance={32}
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onQuickView={onOpenProductModal}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.includes(product.id)}
                />
              </ScrollReveal>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
