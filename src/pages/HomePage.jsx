import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import { subscribeNewsletter } from '../services/api';

/**
 * HomePage - High-Impact Luxury Storefront
 * Structure:
 * 1. Clean, Unobstructed White-Background Model Video Hero (No text blocking the video)
 * 2. Bold Headline & CTAs arranged directly below the video
 * 3. Trust & Quality Banner ("Exceptional Quality Handcrafted")
 * 4. 3 Featured Postures Showcase (Wide curved editorial clothing cards: Trench, Cashmere, Silk Dress)
 * 5. Curated Products Grid (Clean divs with Price, Strikethrough, and [ 🛒 Buy Now ] button)
 * 6. Minimalist Gazette Subscription
 */
export default function HomePage({
  products = [],
  onAddToCart,
  onOpenProductModal,
  onToggleWishlist,
  wishlist = []
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [homeEmail, setHomeEmail] = useState('');
  const [homeSubscribed, setHomeSubscribed] = useState(false);
  const [homeLoading, setHomeLoading] = useState(false);
  const videoRef = useRef(null);

  // Lucid-Style Panoramic Banner Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const categoryScrollRef = useRef(null);
  const newArrivalsScrollRef = useRef(null);

  const bannerSlides = [
    {
      id: 'lucid-silk',
      headline: 'LUCID',
      subtitle: "PAKISTAN'S FIRST 19-MOMME LIQUID SILK GOWN",
      description: 'Artisan bias-cut couture tailored in deep olive green and fluid desert camel tones.',
      image: '/images/couture_silk_dress.jpg',
      ctaText: 'EXPLORE NOW',
      ctaLink: '/shop?cat=women',
      tag: 'PURE SILK'
    },
    {
      id: 'sahara-trench',
      headline: 'TRENCH',
      subtitle: 'HEAVYWEIGHT BELGIAN TWILL & WEATHERPROOF LINEN',
      description: 'Double-breasted storm flap silhouette cinched with natural horn buttons and bespoke tailoring.',
      image: '/images/heritage_trench_coat.jpg',
      ctaText: 'EXPLORE NOW',
      ctaLink: '/shop?cat=outerwear',
      tag: 'BELGIAN LINEN'
    },
    {
      id: 'mongolian-knit',
      headline: 'CASHMERE',
      subtitle: '100% GRADE-A PURE MONGOLIAN FIBER TURTLENECK',
      description: 'Spun from raw Mongolian cashmere fibers with olive ribbed neck trim and effortless fluid drape.',
      image: '/images/camel_cashmere_knit.jpg',
      ctaText: 'EXPLORE NOW',
      ctaLink: '/shop?cat=knitwear',
      tag: 'RAW FIBER'
    },
    {
      id: 'palazzo-pret',
      headline: 'PALAZZO',
      subtitle: 'HIGH-WAISTED PLEATED DESERT CAMEL TROUSERS',
      description: 'Architectural twin pleats cut from soft Lyocell twill paired with liquid olive silk blouses.',
      image: '/images/women_camel_palazzo.jpg',
      ctaText: 'EXPLORE NOW',
      ctaLink: '/shop?cat=women',
      tag: 'PLEATED PRET'
    },
    {
      id: 'resort-linen',
      headline: 'RESORT',
      subtitle: 'FRENCH FLAX CAMP SHIRTS & GABARDINE TROUSERS',
      description: 'Airy summer layering crafted from pure Normandy flax linen with horn buttons and relaxed tailoring.',
      image: '/images/men_linen_shirt.jpg',
      ctaText: 'EXPLORE NOW',
      ctaLink: '/shop?cat=men',
      tag: 'FLAX LINEN'
    },
    {
      id: 'editorial-capsule',
      headline: 'ATELIER',
      subtitle: 'AUTUMN / WINTER QUIET LUXURY RUNWAY EDIT',
      description: 'An architectural study of desert camel trench coats, tailored linen trousers, and artisanal craftsmanship.',
      image: '/images/editorial_camel_banner.jpg',
      ctaText: 'EXPLORE NOW',
      ctaLink: '/shop',
      tag: 'RUNWAY EDIT'
    }
  ];

  // Auto-advance banner carousel every 6s unless hovered
  useEffect(() => {
    if (isSlidePaused) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isSlidePaused, bannerSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const scrollCategory = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollNewArrivals = (direction) => {
    if (newArrivalsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      newArrivalsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const clothingThumbnails = [
    {
      id: 'all',
      title: 'All Pieces',
      subtitle: 'Curated',
      image: '/images/editorial_camel_banner.jpg',
      filter: 'all'
    },
    {
      id: 'trench',
      title: 'Trench Coats',
      subtitle: 'Belgian Linen',
      image: '/images/heritage_trench_coat.jpg',
      filter: 'outerwear'
    },
    {
      id: 'cashmere',
      title: 'Cashmere Knit',
      subtitle: 'Mongolian',
      image: '/images/camel_cashmere_knit.jpg',
      filter: 'knitwear'
    },
    {
      id: 'silk-gowns',
      title: 'Silk Gowns',
      subtitle: 'Couture',
      image: '/images/couture_silk_dress.jpg',
      filter: 'women'
    },
    {
      id: 'palazzo',
      title: 'Camel Trousers',
      subtitle: 'Pleated Pret',
      image: '/images/women_camel_palazzo.jpg',
      filter: 'women'
    },
    {
      id: 'silk-shirts',
      title: 'Raw Silk Shirts',
      subtitle: 'Artisanal',
      image: '/images/women_olive_silk_shirt.jpg',
      filter: 'women'
    },
    {
      id: 'blazers',
      title: 'Onyx Blazers',
      subtitle: 'Tailored Wool',
      image: '/images/women_onyx_blazer.jpg',
      filter: 'outerwear'
    },
    {
      id: 'men-resort',
      title: "Men's Linen",
      subtitle: 'French Flax',
      image: '/images/men_linen_shirt.jpg',
      filter: 'men'
    },
    {
      id: 'men-tailored',
      title: "Men's Trousers",
      subtitle: 'Gabardine',
      image: '/images/men_camel_trouser.jpg',
      filter: 'men'
    },
    {
      id: 'men-safari',
      title: 'Safari Jackets',
      subtitle: 'Brushed Cotton',
      image: '/images/men_olive_safari.jpg',
      filter: 'outerwear'
    }
  ];

  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'women') return p.person === 'women' || p.gender === 'women';
    if (selectedCategory === 'men') return p.person === 'men' || p.gender === 'men';
    if (selectedCategory === 'outerwear') return p.slot === 'outer';
    if (selectedCategory === 'knitwear') return p.style === 'knit' || p.category === 'Knitwear';
    return true;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-onyx-950 text-black dark:text-white transition-colors">
      
      {/* =========================================================================
          1. CLEAN, UNOBSTRUCTED WHITE-BACKGROUND STUDIO MODEL VIDEO HERO
          (Zero text on the video for pure cinematic clarity)
      ========================================================================= */}
      <section className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pt-4 sm:pt-6">
        <div className="relative w-full h-[65vh] sm:h-[80vh] overflow-hidden rounded-3xl bg-neutral-100 dark:bg-onyx-900 border border-neutral-200 dark:border-onyx-800 shadow-sm">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="/images/hero_white_model_poster.jpg"
            className="w-full h-full object-cover object-center"
          >
            <source src="/videos/hero_white_model.mp4" type="video/mp4" />
            <img
              src="/images/hero_white_model_poster.jpg"
              alt="Zaytoun Atelier Model"
              className="w-full h-full object-cover object-center"
            />
          </video>
        </div>
      </section>

      {/* =========================================================================
          2. BOLD HEADLINE & CTAS (ARRANGED DIRECTLY BELOW VIDEO WITH CAMEL TOUCHES)
      ========================================================================= */}
      <section className="w-full max-w-4xl mx-auto text-center py-10 sm:py-14 px-4 space-y-5">
        <ScrollReveal distance={20}>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-black dark:text-white leading-tight">
            Wear Less, Wear Longer.
          </h1>
          <p className="text-sm sm:text-base font-medium text-neutral-600 dark:text-neutral-300 max-w-lg mx-auto pt-1">
            Organic Belgian linen, pure Mongolian cashmere, and artisan hand-tailored garments.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15} distance={16}>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/shop?cat=women"
              className="px-7 py-3 rounded-full bg-olive-700 hover:bg-olive-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95 border border-olive-600"
            >
              Shop Women
            </Link>
            <Link
              to="/shop?cat=men"
              className="px-7 py-3 rounded-full bg-camel-500 hover:bg-camel-400 text-onyx-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:scale-105 active:scale-95 border border-camel-400"
            >
              Shop Men
            </Link>
            <Link
              to="/shop"
              className="px-6 py-3 rounded-full bg-linen-200 dark:bg-onyx-900 text-onyx-900 dark:text-linen-100 hover:bg-camel-100 dark:hover:bg-onyx-800 text-xs font-bold uppercase tracking-wider transition-all border border-linen-300 dark:border-onyx-800"
            >
              All Pieces
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* =========================================================================
          3. CLOTHING CATEGORY POSTERS & THUMBNAILS STRIP
          (Horizontal scrollable bar of clothes miniatures with quick category filter)
      ========================================================================= */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pb-10 sm:pb-14">
        <div className="relative group/strip">
          
          {/* Scroll Navigation Arrows */}
          <button
            onClick={() => scrollCategory('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-onyx-900/90 shadow-md border border-linen-300 dark:border-onyx-800 text-onyx-900 dark:text-linen-100 flex items-center justify-center z-10 opacity-0 group-hover/strip:opacity-100 transition-opacity hover:scale-105"
            aria-label="Scroll Categories Left"
          >
            ←
          </button>
          <button
            onClick={() => scrollCategory('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-onyx-900/90 shadow-md border border-linen-300 dark:border-onyx-800 text-onyx-900 dark:text-linen-100 flex items-center justify-center z-10 opacity-0 group-hover/strip:opacity-100 transition-opacity hover:scale-105"
            aria-label="Scroll Categories Right"
          >
            →
          </button>

          {/* Thumbnails Container */}
          <div
            ref={categoryScrollRef}
            className="flex items-center space-x-6 sm:space-x-8 overflow-x-auto py-2 px-1 scrollbar-none scroll-smooth"
          >
            {clothingThumbnails.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedCategory(item.filter)}
                className="group flex flex-col items-center flex-shrink-0 focus:outline-none transition-transform active:scale-95"
              >
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 transition-all duration-300 ${
                    selectedCategory === item.filter
                      ? 'ring-2 ring-camel-500 scale-105'
                      : 'ring-1 ring-linen-300 dark:ring-onyx-800 group-hover:ring-camel-400 group-hover:scale-105'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-linen-200 dark:bg-onyx-900">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-onyx-900 dark:text-linen-100 mt-2.5 group-hover:text-camel-700 dark:group-hover:text-camel-300 transition-colors">
                  {item.title}
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                  {item.subtitle}
                </span>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. LUCID-STYLE PANORAMIC BANNER CAROUSEL (WITH NEXT/PREV ARROWS & DOTS)
          (Changeable high-fashion postures in signature Camel & Olive tones)
      ========================================================================= */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pb-14 sm:pb-20">
        <div
          className="relative w-full rounded-3xl overflow-hidden min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] border border-camel-400/30 shadow-2xl group"
          onMouseEnter={() => setIsSlidePaused(true)}
          onMouseLeave={() => setIsSlidePaused(false)}
        >
          {/* Active Slide Image */}
          <img
            src={bannerSlides[currentSlide].image}
            alt={bannerSlides[currentSlide].headline}
            className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out"
          />

          {/* Deep Ambient Luxury Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

          {/* Left/Prev Arrow Button */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/50 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-camel-400 text-white flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110 active:scale-90 z-20"
            aria-label="Previous Slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right/Next Arrow Button */}
          <button
            onClick={handleNextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/50 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-camel-400 text-white flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110 active:scale-90 z-20"
            aria-label="Next Slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Slide Text Content Overlay (Styled like LUCID banner) */}
          <div className="absolute inset-0 p-8 sm:p-14 lg:p-20 flex flex-col justify-end text-white max-w-2xl space-y-3 sm:space-y-4 z-10">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white font-editorial drop-shadow-md">
              {bannerSlides[currentSlide].headline}
            </h2>
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.2em] text-camel-300">
              {bannerSlides[currentSlide].subtitle}
            </p>
            <p className="text-xs sm:text-sm text-neutral-300 font-medium max-w-lg hidden sm:block leading-relaxed">
              {bannerSlides[currentSlide].description}
            </p>
            <div className="pt-2">
              <Link
                to={bannerSlides[currentSlide].ctaLink}
                className="inline-flex items-center px-8 py-3 rounded-full bg-white text-black hover:bg-camel-500 hover:text-black font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95"
              >
                <span>{bannerSlides[currentSlide].ctaText}</span>
                <span className="ml-2 font-bold">→</span>
              </Link>
            </div>
          </div>

          {/* Bottom Pagination Dots / Indicator Bar */}
          <div className="absolute bottom-5 inset-x-0 flex items-center justify-center space-x-2 z-20">
            {bannerSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 transition-all duration-300 rounded-full ${
                  idx === currentSlide
                    ? 'w-8 bg-camel-500'
                    : 'w-2 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Jump to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. NEW ARRIVALS HORIZONTAL PRODUCT SHOWCASE SHELF
          (Smoothly scrollable product carousel with Next/Prev arrow buttons)
      ========================================================================= */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pb-14 sm:pb-20">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-200 dark:border-onyx-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              NEW <span className="text-camel-600 dark:text-camel-400">ARRIVALS</span>
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => scrollNewArrivals('left')}
              className="w-8 h-8 rounded-full border border-neutral-300 dark:border-onyx-700 hover:border-camel-400 hover:text-camel-600 text-sm font-bold flex items-center justify-center transition"
              aria-label="Scroll New Arrivals Left"
            >
              ←
            </button>
            <button
              onClick={() => scrollNewArrivals('right')}
              className="w-8 h-8 rounded-full border border-neutral-300 dark:border-onyx-700 hover:border-camel-400 hover:text-camel-600 text-sm font-bold flex items-center justify-center transition"
              aria-label="Scroll New Arrivals Right"
            >
              →
            </button>
            <Link
              to="/shop"
              className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:text-camel-600 dark:hover:text-camel-400 px-3.5 py-1.5 rounded-full bg-linen-200 dark:bg-onyx-900 border border-linen-300 dark:border-onyx-800 transition"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Scrollable Products Row */}
        <div
          ref={newArrivalsScrollRef}
          className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-4 scrollbar-none scroll-smooth snap-x snap-mandatory"
        >
          {products.slice(0, 8).map((product) => (
            <div
              key={product.id}
              className="min-w-[240px] sm:min-w-[280px] max-w-[280px] snap-start flex-shrink-0"
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onQuickView={onOpenProductModal}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. FEATURED CLOTHING POSTURES SHOWCASE
          (3 distinct sizes: Trench Coat, 1:1 Square Cashmere, and 3:4 Silk Gown)
      ========================================================================= */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pb-14 sm:pb-20">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Posture 1: TRENCH */}
          <ScrollReveal delay={0.1} distance={32}>
            <Link
              to="/shop?cat=outerwear"
              className="group relative h-[380px] sm:h-[440px] rounded-3xl overflow-hidden block shadow-lg hover:shadow-2xl transition-all duration-700 border border-linen-300 dark:border-onyx-800 hover:border-camel-400"
            >
              <img
                src="/images/heritage_trench_coat.jpg"
                alt="Trench Outerwear"
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
                <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-linen-50">
                  TRENCH
                </h3>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span className="bg-black/60 px-2 py-0.5 rounded-full border border-camel-400/20 text-linen-100">Double-Breasted</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded-full border border-camel-400/20 text-linen-100">Weather-Resistant</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded-full border border-camel-400/20 text-linen-100">Horn Buttons</span>
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Posture 2: CASHMERE (1:1 Ratio Custom Luxury AI Asset) */}
          <ScrollReveal delay={0.2} distance={32}>
            <Link
              to="/shop?cat=knitwear"
              className="group relative h-[380px] sm:h-[440px] rounded-3xl overflow-hidden block shadow-lg hover:shadow-2xl transition-all duration-700 border border-linen-300 dark:border-onyx-800 hover:border-camel-400"
            >
              <img
                src="/images/camel_cashmere_knit.jpg"
                alt="Mongolian Cashmere"
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
                <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-linen-50">
                  CASHMERE
                </h3>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span className="bg-black/60 px-2 py-0.5 rounded-full border border-camel-400/20 text-linen-100">12-Gauge Knit</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded-full border border-camel-400/20 text-linen-100">Zero Synthetics</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded-full border border-camel-400/20 text-linen-100">Natural Camel</span>
                </div>
              </div>
            </Link>
          </ScrollReveal>

          {/* Posture 3: SILK DRESS (3:4 Ratio Custom Luxury AI Asset) */}
          <ScrollReveal delay={0.3} distance={32}>
            <Link
              to="/shop?cat=women"
              className="group relative h-[380px] sm:h-[440px] rounded-3xl overflow-hidden block shadow-lg hover:shadow-2xl transition-all duration-700 border border-linen-300 dark:border-onyx-800 hover:border-camel-400"
            >
              <img
                src="/images/couture_silk_dress.jpg"
                alt="Silk Dress"
                className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
                <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-linen-50">
                  SILK DRESS
                </h3>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span className="bg-black/60 px-2 py-0.5 rounded-full border border-camel-400/20 text-linen-100">Bias Cut Drape</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded-full border border-camel-400/20 text-linen-100">Grade 6A Silk</span>
                  <span className="bg-black/60 px-2 py-0.5 rounded-full border border-camel-400/20 text-linen-100">Bespoke Finish</span>
                </div>
              </div>
            </Link>
          </ScrollReveal>

        </div>

      </section>

      {/* =========================================================================
          5. CURATED PRODUCTS GRID (CLEAN DIVS: PRICE, STRIKETHROUGH & BUY NOW)
      ========================================================================= */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-16">
        
        {/* Category Header Bar */}
        <ScrollReveal distance={20}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-onyx-800 gap-4">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
              Collection
            </h2>

            <div className="flex items-center space-x-6 text-xs sm:text-sm font-bold uppercase tracking-wider overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All' },
                { id: 'women', label: 'Women' },
                { id: 'men', label: 'Men' },
                { id: 'outerwear', label: 'Outerwear' },
                { id: 'knitwear', label: 'Knitwear' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`transition-colors whitespace-nowrap py-1 ${
                    selectedCategory === tab.id
                      ? 'text-camel-700 dark:text-camel-300 border-b-2 border-camel-500 font-extrabold'
                      : 'text-neutral-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Clean 4-Column Product Grid with Staggered Scroll Animations */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product, index) => (
            <ScrollReveal
              key={product.id}
              delay={Math.min((index % 4) * 0.1, 0.35)}
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

      </section>

      {/* =========================================================================
          6. NEWSLETTER SUBSCRIPTION
      ========================================================================= */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 border-t border-neutral-200 dark:border-onyx-800 text-center">
        <ScrollReveal distance={28}>
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
              Join the Gazette
            </h2>
            <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Receive private invitations to new releases, fabric archives, and exclusive showroom previews.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const clean = (homeEmail || '').trim();
                if (clean && clean.includes('@')) {
                  setHomeLoading(true);
                  const result = await subscribeNewsletter(clean, 'homepage_cta');
                  setHomeLoading(false);
                  if (result && result.error) {
                    alert(result.error);
                  } else {
                    setHomeSubscribed(true);
                    setTimeout(() => {
                      setHomeEmail('');
                      setHomeSubscribed(false);
                    }, 4000);
                  }
                }
              }}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                value={homeEmail}
                onChange={(e) => setHomeEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-700 rounded-full text-xs sm:text-sm text-black dark:text-white focus:outline-none focus:border-olive-700 dark:focus:border-camel-400 transition"
              />
              <button
                type="submit"
                disabled={homeLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-olive-700 hover:bg-olive-800 text-white text-xs font-bold uppercase tracking-wider transition whitespace-nowrap disabled:opacity-50 shadow-sm shadow-olive-900/20"
              >
                {homeSubscribed ? '✓ Subscribed' : homeLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}
