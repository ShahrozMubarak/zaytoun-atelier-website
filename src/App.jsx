import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PRODUCTS, COLOR_PALETTE_INFO } from './data/products';
import * as FormeEngine from './engine/formeEngine';
import { CurrencyProvider } from './context/CurrencyContext';
import * as API from './services/api';

// Components
import ScrollProgressBar from './components/ScrollProgressBar';
import Preloader from './components/Preloader';
import MarqueeStrip from './components/MarqueeStrip';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import ProductModal from './components/ProductModal';
import BrandPaletteGuide from './components/BrandPaletteGuide';
import SizeGuideModal from './components/SizeGuideModal';
import FabricTextureModal from './components/FabricTextureModal';
import SearchOverlay from './components/SearchOverlay';
import BackToTop from './components/BackToTop';
import GoogleAuthModal from './components/GoogleAuthModal';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import StudioPage from './pages/StudioPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import GoogleAuthCallbackPage from './pages/GoogleAuthCallbackPage';

export default function App() {
  // Theme Mode: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_theme');
      return saved ? JSON.parse(saved) : 'light';
    } catch {
      return 'light';
    }
  });

  // Theme Brand Configuration (editable in Studio)
  const [themeConfig, setThemeConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_theme_config');
      return saved ? JSON.parse(saved) : {
        brand: "ZAYTOUN",
        olive: "#364634",
        camel: "#C69F6F"
      };
    } catch {
      return {
        brand: "ZAYTOUN",
        olive: "#364634",
        camel: "#C69F6F"
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_theme', JSON.stringify(theme));
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      console.warn("Theme storage error:", e);
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_theme_config', JSON.stringify(themeConfig));
      document.documentElement.style.setProperty('--olive', themeConfig.olive || '#364634');
      document.documentElement.style.setProperty('--camel', themeConfig.camel || '#C69F6F');
      if (themeConfig.linen) {
        document.documentElement.style.setProperty('--linen', themeConfig.linen);
      }
      if (themeConfig.onyx) {
        document.documentElement.style.setProperty('--onyx', themeConfig.onyx);
      }
    } catch (e) {
      console.warn("Theme config storage error:", e);
    }
  }, [themeConfig]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Products catalog (persisted to localStorage)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_products');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_products', JSON.stringify(products));
    } catch (e) {
      console.warn("Products storage error:", e);
    }
  }, [products]);

  // Sync initial state from MongoDB Atlas if available
  useEffect(() => {
    API.fetchProductsFromDB().then(dbProds => {
      if (Array.isArray(dbProds) && dbProds.length > 0) {
        setProducts(dbProds);
      }
    });

    API.fetchOrdersFromDB().then(dbOrders => {
      if (Array.isArray(dbOrders) && dbOrders.length > 0) {
        setOrders(dbOrders);
      }
    });

    API.fetchThemeFromDB().then(dbTheme => {
      if (dbTheme && dbTheme.brand) {
        setThemeConfig(prev => ({ ...prev, ...dbTheme }));
      }
    });
  }, []);

  // Outfits state per mannequin collection (women, men, kids)
  const [outfits, setOutfits] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_outfits');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Outfits storage error:", e);
    }

    return {
      women: {
        top: { id: "forme-02", variant: 0 },
        bottom: { id: "forme-03", variant: 0 }
      },
      men: {
        top: { id: "forme-07", variant: 0 },
        bottom: { id: "forme-08", variant: 0 }
      },
      kids: {
        top: { id: "forme-13", variant: 0 },
        bottom: { id: "forme-14", variant: 0 }
      }
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_outfits', JSON.stringify(outfits));
    } catch (e) {
      console.warn("Outfits storage error:", e);
    }
  }, [outfits]);

  // Currently selected demographic for fitting room
  const [selectedPerson, setSelectedPerson] = useState('women');

  // Shopping Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn("Cart storage error:", e);
    }
  }, [cart]);

  // Wishlist state (array of product IDs)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn("Wishlist storage error:", e);
    }
  }, [wishlist]);

  // Orders state (for Studio & Order management)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Orders storage error:", e);
    }

    return [
      {
        id: "ZYT-2026-9041",
        customer: {
          name: "Ayesha Malik",
          email: "ayesha.malik@lahore.pk",
          phone: "+92 300 8472910",
          address: "18-C Gulberg III, Lahore, Punjab",
          city: "Lahore"
        },
        items: [
          { id: "forme-02", name: "Chunky Ribbed Wool Turtleneck", size: "M", price: 18500, quantity: 1 },
          { id: "forme-03", name: "Pleated Wide-Leg Trouser", size: "M", price: 14800, quantity: 1 }
        ],
        total: 33300,
        paymentMethod: "jazzcash",
        status: "processing",
        courier: "TCS Express",
        trackingNumber: "TCS-99482104-LHE",
        date: "2026-10-14T14:30:00Z"
      },
      {
        id: "ZYT-2026-9040",
        customer: {
          name: "Hamza Tariq",
          email: "hamza.tariq@gmail.com",
          phone: "+92 321 4488921",
          address: "House 42, Street 7, F-8/2, Islamabad",
          city: "Islamabad"
        },
        items: [
          { id: "forme-08", name: "Desert Camel Structured Trouser", size: "L", price: 14200, quantity: 1 }
        ],
        total: 14200,
        paymentMethod: "cod",
        status: "shipped",
        courier: "Leopards Courier",
        trackingNumber: "LEO-7729104-ISB",
        date: "2026-10-13T09:15:00Z"
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('zaytoun_orders', JSON.stringify(orders));
    } catch (e) {
      console.warn("Orders storage error:", e);
    }
  }, [orders]);

  // Client Google User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('zaytoun_client_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('zaytoun_client_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('zaytoun_client_user');
      }
    } catch (e) {
      console.warn("Client user storage error:", e);
    }
  }, [currentUser]);

  // Google Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({
    title: "Sign in with Google to Add to Bag",
    subtitle: "To curate your luxury wardrobe and place orders, please sign in with your Google account.",
    pendingItem: null
  });

  // Toast Notification state
  const [toastNotification, setToastNotification] = useState(null);

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Open Google Auth Modal
  const handleOpenAuthModal = (config = {}) => {
    setAuthModalConfig({
      title: config.title || "Sign in with Google",
      subtitle: config.subtitle || "Welcome to Zaytoun Atelier. Please sign in with your Google account.",
      pendingItem: config.pendingItem || null
    });
    setIsAuthModalOpen(true);
  };

  // On Google Sign In Success
  const handleAuthSuccess = (googleUser) => {
    setCurrentUser(googleUser);
    setIsAuthModalOpen(false);

    // Sync client profile to MongoDB Atlas backend
    API.syncGoogleClientToDB(googleUser);

    // If an item was queued when clicking "Add to Cart":
    if (authModalConfig.pendingItem) {
      const item = authModalConfig.pendingItem;
      addToCartDirect(
        item.product || item,
        item.selectedSize || item.size || 'M',
        item.selectedColor || item.color,
        item.quantity || 1
      );
      setToastNotification({
        title: "Added to Your Bag",
        message: `Welcome, ${googleUser.firstName || googleUser.name}! "${item.name || 'Garment'}" has been added to your bag.`
      });
      setIsCartOpen(true);
    } else {
      setToastNotification({
        title: "Signed In with Google",
        message: `Welcome back to Zaytoun Atelier, ${googleUser.firstName || googleUser.name}!`
      });
    }

    setAuthModalConfig({
      title: "Sign in with Google to Add to Bag",
      subtitle: "To curate your luxury wardrobe and place orders, please sign in with your Google account.",
      pendingItem: null
    });
  };

  // Sign out handler
  const handleLogout = () => {
    setCurrentUser(null);
    setToastNotification({
      title: "Signed Out",
      message: "You have signed out of your Google client account."
    });
  };

  // Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [isPaletteGuideOpen, setIsPaletteGuideOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isFabricModalOpen, setIsFabricModalOpen] = useState(false);

  // Direct Cart Addition (Internal)
  const addToCartDirect = (product, size = 'M', color = null, quantity = 1) => {
    const garmentColor = color || product.colors?.[0]?.name || product.primaryColor || 'Olive';
    setCart(prev => {
      const existing = prev.find(
        item => item.id === product.id && item.selectedSize === size && (item.selectedColor === garmentColor || !item.selectedColor)
      );
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedSize === size && (item.selectedColor === garmentColor || !item.selectedColor)
            ? { ...item, quantity: item.quantity + (quantity || 1) }
            : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          selectedSize: size,
          selectedColor: garmentColor,
          quantity: quantity || 1
        }
      ];
    });
  };

  // Gated Cart Handler: Requires Google Sign-In before anyone can add to cart or buy
  const handleAddToCart = (product, size = 'M', color = null, quantity = 1) => {
    if (!currentUser) {
      const garmentColor = color || product.colors?.[0]?.name || product.primaryColor || 'Olive';
      setAuthModalConfig({
        title: "Sign in with Google to Add to Bag",
        subtitle: `Please sign in with your Google account to add "${product.name || 'this piece'}" to your shopping bag.`,
        pendingItem: {
          product,
          ...product,
          selectedSize: size,
          selectedColor: garmentColor,
          quantity: quantity || 1
        }
      });
      setIsAuthModalOpen(true);
      return false; // Indicates auth required
    }

    addToCartDirect(product, size, color, quantity);
    setIsCartOpen(true);
    return true;
  };

  const handleUpdateQuantity = (itemId, size, delta) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === itemId && item.selectedSize === size) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleRemoveFromCart = (itemId, size) => {
    setCart(prev => prev.filter(item => !(item.id === itemId && item.selectedSize === size)));
  };

  const handleToggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleToggleEquip = (product, variantIndex = 0) => {
    const person = product.person || product.gender || selectedPerson;
    setSelectedPerson(person);

    setOutfits(prev => {
      const currentPersonOutfit = prev[person] || {};
      const slot = product.slot;
      const isAlreadyEquipped = currentPersonOutfit[slot]?.id === product.id;

      if (isAlreadyEquipped && currentPersonOutfit[slot]?.variant === variantIndex) {
        // Unequip item
        const updated = { ...currentPersonOutfit };
        delete updated[slot];
        return { ...prev, [person]: updated };
      }

      // Equip item using Forme replacement logic
      const updated = FormeEngine.equip(currentPersonOutfit, product, variantIndex);
      return { ...prev, [person]: updated };
    });
  };

  const handleSelectVariant = (slot, variantIndex) => {
    setOutfits(prev => {
      const currentPersonOutfit = prev[selectedPerson] || {};
      if (!currentPersonOutfit[slot]) return prev;
      return {
        ...prev,
        [selectedPerson]: {
          ...currentPersonOutfit,
          [slot]: {
            ...currentPersonOutfit[slot],
            variant: variantIndex
          }
        }
      };
    });
  };

  const handleClearOutfit = (person = selectedPerson) => {
    setOutfits(prev => ({
      ...prev,
      [person]: {}
    }));
  };

  const handleResetOutfit = (person = selectedPerson) => {
    const defaults = {
      women: { top: { id: "forme-02", variant: 0 }, bottom: { id: "forme-03", variant: 0 } },
      men: { top: { id: "forme-07", variant: 0 }, bottom: { id: "forme-08", variant: 0 } },
      kids: { top: { id: "forme-13", variant: 0 }, bottom: { id: "forme-14", variant: 0 } }
    };
    setOutfits(prev => ({
      ...prev,
      [person]: defaults[person] || {}
    }));
  };

  const handleAddLookToBag = (person = selectedPerson, size = 'M') => {
    const personOutfit = outfits[person] || {};
    const equippedIds = Object.values(personOutfit).map(item => item?.id).filter(Boolean);
    const lookItems = products.filter(p => equippedIds.includes(p.id));

    if (lookItems.length === 0) return;

    setCart(prev => {
      let updatedCart = [...prev];
      lookItems.forEach(item => {
        const existingIdx = updatedCart.findIndex(
          c => c.id === item.id && c.selectedSize === size
        );
        if (existingIdx >= 0) {
          updatedCart[existingIdx] = {
            ...updatedCart[existingIdx],
            quantity: updatedCart[existingIdx].quantity + 1
          };
        } else {
          updatedCart.push({
            ...item,
            selectedSize: size,
            quantity: 1
          });
        }
      });
      return updatedCart;
    });

    setIsCartOpen(true);
  };

  const handleTryOnProduct = (product) => {
    handleToggleEquip(product);
  };

  // Order Handlers
  const handleConfirmOrder = (orderData) => {
    const orderNumber = orderData.orderNumber || orderData.id || `ZYT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderNumber,
      orderNumber: orderNumber,
      customer: orderData.customer,
      items: orderData.items && orderData.items.length > 0 ? orderData.items : cart,
      total: orderData.total,
      pricing: orderData.pricing,
      paymentMethod: orderData.paymentMethod,
      status: "processing",
      courier: "TCS Express",
      trackingNumber: `TCS-${Math.floor(10000000 + Math.random() * 90000000)}-PK`,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setConfirmedOrder(newOrder);

    // Save directly to MongoDB Atlas
    API.saveOrderToDB(newOrder);

    // Deduct purchased quantities from product inventory
    const purchasedItems = orderData.items && orderData.items.length > 0 ? orderData.items : cart;
    setProducts(prevProducts => {
      return prevProducts.map(p => {
        const matchingPurchased = purchasedItems.filter(item => (item.id === p.id || item.product?.id === p.id));
        if (matchingPurchased.length === 0) return p;

        let newStock = Number(p.stock !== undefined ? p.stock : 12);
        let newStockPerSize = p.stockPerSize ? { ...p.stockPerSize } : null;

        matchingPurchased.forEach(item => {
          const qty = Number(item.quantity || 1);
          newStock = Math.max(0, newStock - qty);
          const sz = item.selectedSize || item.size;
          if (newStockPerSize && sz && newStockPerSize[sz] !== undefined) {
            newStockPerSize[sz] = Math.max(0, Number(newStockPerSize[sz]) - qty);
          }
        });

        const updatedProduct = {
          ...p,
          stock: newStock,
          ...(newStockPerSize ? { stockPerSize: newStockPerSize } : {})
        };
        API.saveProductToDB(updatedProduct);
        return updatedProduct;
      });
    });
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    API.updateOrderStatusInDB(orderId, newStatus);
  };

  // Product Inventory Handlers (for Studio)
  const handleAddProduct = (newProd) => {
    setProducts(prev => [newProd, ...prev]);
    API.saveProductToDB(newProd);
  };

  const handleUpdateProductStock = (id, stock) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === id ? { ...p, stock: Number(stock) } : p));
      const targetProd = updated.find(p => p.id === id);
      if (targetProd) API.saveProductToDB(targetProd);
      return updated;
    });
  };

  const handleUpdateProductPrice = (id, price) => {
    setProducts(prev => {
      const updated = prev.map(p => (p.id === id ? { ...p, price: Number(price) } : p));
      const targetProd = updated.find(p => p.id === id);
      if (targetProd) API.saveProductToDB(targetProd);
      return updated;
    });
  };

  const handleDeleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    API.deleteProductFromDB(id);
  };

  const handleImportCatalog = (importedProducts) => {
    if (Array.isArray(importedProducts) && importedProducts.length > 0) {
      setProducts(importedProducts);
      importedProducts.forEach(p => API.saveProductToDB(p));
    }
  };

  const handleUpdateTheme = (newConfig) => {
    setThemeConfig(prev => {
      const updated = { ...prev, ...newConfig };
      API.saveThemeToDB(updated);
      return updated;
    });
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <BrowserRouter>
      <CurrencyProvider>
        {/* Top Global Scroll Progress Bar */}
        <ScrollProgressBar />

      {/* Luxury Initial Preloader */}
      <Preloader />

      <div className="min-h-screen flex flex-col bg-white dark:bg-onyx-950 text-onyx-950 dark:text-linen-100 transition-colors font-sans antialiased selection:bg-camel-500 selection:text-white">
        
        {/* Minimalist Top Navigation Bar */}
        <Navbar
          cartCount={cartTotalCount}
          onOpenCart={() => setIsCartOpen(true)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          brandName={themeConfig.brand}
          user={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onLogout={handleLogout}
        />

        {/* Multi-Page Routes */}
        <main className="flex-1">
          <Routes>
            {/* Home / Preview Landing Page */}
            <Route
              path="/"
              element={
                <HomePage
                  products={products}
                  onAddToCart={handleAddToCart}
                  onOpenProductModal={(p) => setSelectedProductModal(p)}
                  onToggleWishlist={handleToggleWishlist}
                  wishlist={wishlist}
                  outfits={outfits}
                  themeConfig={themeConfig}
                />
              }
            />

            {/* Shop / Collection Page */}
            <Route
              path="/shop"
              element={
                <ShopPage
                  products={products}
                  onAddToCart={handleAddToCart}
                  onOpenProductModal={(p) => setSelectedProductModal(p)}
                  onToggleWishlist={handleToggleWishlist}
                  wishlist={wishlist}
                  onTryOnProduct={handleTryOnProduct}
                />
              }
            />

            {/* Fitting Room Redirect */}
            <Route path="/fitting-room" element={<Navigate to="/shop" replace />} />

            {/* Story & Palette Page */}
            <Route path="/story" element={<AboutPage />} />
            <Route path="/about" element={<Navigate to="/story" replace />} />

            {/* Concierge & Showroom Page */}
            <Route path="/contact" element={<ContactPage />} />

            {/* Studio / Admin Dashboard Page */}
            <Route
              path="/studio"
              element={
                <StudioPage
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  products={products}
                  onAddProduct={handleAddProduct}
                  onUpdateProductStock={handleUpdateProductStock}
                  onUpdateProductPrice={handleUpdateProductPrice}
                  onDeleteProduct={handleDeleteProduct}
                  onImportCatalog={handleImportCatalog}
                  themeConfig={themeConfig}
                  onUpdateTheme={handleUpdateTheme}
                  onTryOnProduct={handleTryOnProduct}
                />
              }
            />

            {/* Dedicated Admin Portal Route */}
            <Route path="/admin" element={<Navigate to="/studio" replace />} />

            {/* Order Consignment Tracking Pages */}
            <Route path="/track" element={<OrderTrackingPage />} />
            <Route path="/track/:orderId" element={<OrderTrackingPage />} />

            {/* Google OAuth 2.0 Direct Callback */}
            <Route
              path="/auth/google/callback"
              element={<GoogleAuthCallbackPage onAuthSuccess={handleAuthSuccess} />}
            />

            {/* Catch-all route redirects to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer
          onOpenBrandGuide={() => setIsPaletteGuideOpen(true)}
          onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          onOpenFabricModal={() => setIsFabricModalOpen(true)}
        />

        {/* Global Modals & Drawers */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          user={currentUser}
          onOpenAuthModal={handleOpenAuthModal}
          onCheckout={() => {
            if (!currentUser) {
              handleOpenAuthModal({
                title: "Sign in with Google to Checkout",
                subtitle: "Please sign in with your Google account to proceed to checkout and secure your order."
              });
              return;
            }
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          user={currentUser}
          onConfirmOrder={handleConfirmOrder}
        />

        <OrderConfirmationModal
          order={confirmedOrder}
          isOpen={Boolean(confirmedOrder)}
          onClose={() => setConfirmedOrder(null)}
        />

        <ProductModal
          product={selectedProductModal}
          isOpen={Boolean(selectedProductModal)}
          onClose={() => setSelectedProductModal(null)}
          onAddToCart={handleAddToCart}
          onTryOn={handleTryOnProduct}
        />

        <BrandPaletteGuide
          isOpen={isPaletteGuideOpen}
          onClose={() => setIsPaletteGuideOpen(false)}
        />

        <SizeGuideModal
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
        />

        <FabricTextureModal
          isOpen={isFabricModalOpen}
          onClose={() => setIsFabricModalOpen(false)}
        />

        {/* Google Authentication Modal (Required before purchase or adding to bag) */}
        <GoogleAuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          pendingItem={authModalConfig.pendingItem}
          title={authModalConfig.title}
          subtitle={authModalConfig.subtitle}
        />

        {/* Luxury Floating Toast Notification */}
        {toastNotification && (
          <div className="fixed bottom-6 right-6 z-50 animate-fadeIn pointer-events-none">
            <div className="flex items-center space-x-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-3 rounded-2xl shadow-2xl border border-camel-400/50 max-w-sm pointer-events-auto">
              <div className="w-7 h-7 rounded-full bg-camel-500 text-onyx-950 flex items-center justify-center font-bold text-xs flex-shrink-0">
                ✓
              </div>
              <div className="text-xs">
                <p className="font-bold tracking-tight">{toastNotification.title || "Notification"}</p>
                <p className="text-neutral-300 dark:text-neutral-600 mt-0.5 leading-snug">{toastNotification.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Global Catalog Search & Back To Top */}
        <SearchOverlay
          products={products}
          onSelect={(p) => setSelectedProductModal(p)}
        />
        <BackToTop />

      </div>
      </CurrencyProvider>
    </BrowserRouter>
  );
}
