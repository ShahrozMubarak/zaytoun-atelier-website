// Initial seed products for Zaytoun Atelier
export const SEED_PRODUCTS = [
  {
    id: "forme-01",
    name: "The Olive Heritage Double-Breasted Trench",
    slug: "olive-heritage-double-breasted-trench",
    person: "women",
    gender: "women",
    category: "Outerwear",
    slot: "outer",
    style: "coat",
    collectionName: "Autumn / Winter Edit",
    price: 18500,
    originalPrice: 22000,
    badge: "Bestseller",
    rating: 4.9,
    reviewCount: 38,
    primaryColor: "Olive Green",
    color: "#364634",
    colorName: "Olive Green",
    colors: [
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" },
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stockPerSize: { XS: 4, S: 8, M: 12, L: 6, XL: 2 },
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Tailored from heavyweight Belgian linen-cotton twill with weather-resistant finishing. Features horn buttons and structured storm flaps.",
    fabric: "70% Organic Cotton Twill, 30% European Washed Linen",
    care: "Dry clean only. Press with low steam.",
    fit: "Relaxed tailored fit with belt cinching."
  },
  {
    id: "forme-02",
    name: "Pure Mongolian Camel Cashmere Knit",
    slug: "pure-mongolian-camel-cashmere-knit",
    person: "women",
    gender: "women",
    category: "Knitwear",
    slot: "top",
    style: "knit",
    collectionName: "Autumn / Winter Edit",
    price: 14200,
    originalPrice: 16500,
    badge: "Pure Luxury",
    rating: 5.0,
    reviewCount: 52,
    primaryColor: "Camel",
    color: "#C69F6F",
    colorName: "Desert Camel",
    colors: [
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Linen White", hex: "#FAF8F5", bgClass: "bg-[#FAF8F5] border border-gray-300" },
      { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stockPerSize: { XS: 3, S: 7, M: 9, L: 4, XL: 2 },
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Spun from 100% Grade-A Mongolian cashmere fibers in a warm camel tone. Ribbed neck and drop shoulders for effortless draping.",
    fabric: "100% Sustainable Grade-A Cashmere",
    care: "Hand wash cold with wool detergent. Dry flat.",
    fit: "Slightly oversized cocoon silhouette."
  },
  {
    id: "forme-03",
    name: "Pleated Wide-Leg Trouser in Desert Camel",
    slug: "pleated-wide-leg-trouser-desert-camel",
    person: "women",
    gender: "women",
    category: "Tailoring",
    slot: "bottom",
    style: "wide",
    collectionName: "Atelier Core",
    price: 12800,
    originalPrice: 14500,
    badge: "New Arrival",
    rating: 4.8,
    reviewCount: 24,
    primaryColor: "Camel",
    color: "#C69F6F",
    colorName: "Desert Camel",
    colors: [
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" },
      { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    stockPerSize: { XS: 5, S: 10, M: 12, L: 8, XL: 3 },
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "High-waisted trousers crafted from worsted wool-linen drape fabric with deep double front pleats.",
    fabric: "55% Worsted Wool, 45% Linen",
    care: "Dry clean only.",
    fit: "High-rise, relaxed wide-leg puddle hem."
  },
  {
    id: "forme-07",
    name: "Artisan Linen Band Collar Kurta-Shirt",
    slug: "artisan-linen-band-collar-kurta-shirt",
    person: "men",
    gender: "men",
    category: "Men's Pret",
    slot: "top",
    style: "shirt",
    collectionName: "Men's Collection",
    price: 11500,
    originalPrice: 13000,
    badge: "Signature Cut",
    rating: 4.9,
    reviewCount: 41,
    primaryColor: "Olive Green",
    color: "#364634",
    colorName: "Olive Green",
    colors: [
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" },
      { name: "Alabaster Linen", hex: "#FAF8F5", bgClass: "bg-[#FAF8F5] border border-gray-300" },
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stockPerSize: { S: 6, M: 14, L: 10, XL: 5, XXL: 2 },
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Refined mandarin collar shirt combining Eastern sartorial heritage with contemporary modern tailoring.",
    fabric: "100% French Natural Washed Linen",
    care: "Machine wash cold gentle cycle. Warm iron.",
    fit: "Comfortable regular tailored silhouette."
  },
  {
    id: "forme-08",
    name: "Desert Camel Structured Trouser",
    slug: "desert-camel-structured-trouser",
    person: "men",
    gender: "men",
    category: "Men's Pret",
    slot: "bottom",
    style: "trouser",
    collectionName: "Men's Collection",
    price: 14200,
    originalPrice: 16000,
    badge: "Essential",
    rating: 4.8,
    reviewCount: 29,
    primaryColor: "Camel",
    color: "#C69F6F",
    colorName: "Desert Camel",
    colors: [
      { name: "Desert Camel", hex: "#C69F6F", bgClass: "bg-[#C69F6F]" },
      { name: "Obsidian Black", hex: "#111315", bgClass: "bg-[#111315]" },
      { name: "Olive Green", hex: "#364634", bgClass: "bg-[#364634]" }
    ],
    sizes: ["30", "32", "34", "36", "38"],
    stockPerSize: { "30": 4, "32": 11, "34": 15, "36": 7, "38": 3 },
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1000&q=80"
    ],
    description: "Crisp tailored trouser with side adjusters, tab closure, and half-lined interior for breathability.",
    fabric: "Wool-Cotton Twill Blend",
    care: "Dry clean.",
    fit: "Mid-rise, tapered ankle break."
  }
];
