import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

/**
 * Navbar - Bold, modern luxury navigation bar.
 * Clean announcement bar, bold typography, strong brand identity, and direct navigation.
 */
export default function Navbar({
  cartCount = 0,
  onOpenCart,
  theme,
  onToggleTheme,
  brandName = "ZAYTOUN"
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Bold navigation link style with Desert Camel active indicator
  const navLinkClass = ({ isActive }) =>
    `text-xs sm:text-sm font-bold uppercase tracking-wider transition-all py-1 ${
      isActive
        ? 'text-olive-800 dark:text-camel-300 border-b-2 border-camel-500 font-extrabold'
        : 'text-neutral-600 dark:text-neutral-300 hover:text-camel-700 dark:hover:text-camel-300'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-onyx-950 border-b border-neutral-200 dark:border-onyx-800 transition-colors shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo (Bold wordmark with Desert Camel accent dot) */}
        <Link
          to="/"
          className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white hover:opacity-90 transition flex items-center space-x-1.5"
        >
          <span className="tracking-tighter">{brandName || "ZAYTOUN"}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-camel-500 ring-2 ring-camel-400/40 shadow-sm shadow-camel-500/50"></span>
        </Link>

        {/* Bold Center Navigation */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
          <NavLink to="/shop?cat=women" className={navLinkClass}>
            Women
          </NavLink>
          <NavLink to="/shop?cat=men" className={navLinkClass}>
            Men
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            Collection
          </NavLink>
          <NavLink to="/story" className={navLinkClass}>
            Story
          </NavLink>
          <NavLink to="/track" className={navLinkClass}>
            Track Order
          </NavLink>
        </nav>

        {/* Right Header Utilities */}
        <div className="flex items-center space-x-3 sm:space-x-5 text-sm text-black dark:text-white">
          
          {/* Currency Switcher */}
          <button
            onClick={() => {
              const order = ['PKR', 'USD', 'EUR'];
              const nextIdx = (order.indexOf(currency) + 1) % order.length;
              setCurrency(order[nextIdx]);
            }}
            className="text-xs font-bold px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white transition uppercase"
            title="Switch Currency"
          >
            {currency}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-full text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
            title={theme === 'dark' ? "Light Mode" : "Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="4" />
                <path strokeLinecap="round" d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Shopping Bag Pill Button (Clean & Bold with Cart Icon) */}
          {/* Shopping Bag Pill Button (Signature Olive & Camel) */}
          <button
            onClick={onOpenCart}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-olive-700 hover:bg-olive-800 text-white border border-camel-400/40 hover:border-camel-400 transition-all font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95"
            title="Shopping Bag"
            aria-label="Shopping Bag"
          >
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Bag</span>
            <span className="w-4 h-4 rounded-full bg-camel-500 text-onyx-950 text-[10px] flex items-center justify-center font-black shadow-sm">
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-black dark:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-onyx-950 border-t border-neutral-200 dark:border-onyx-800 px-6 py-6 space-y-4 font-bold uppercase text-sm">
          <NavLink to="/shop?cat=women" className="block text-black dark:text-white py-1">
            Women
          </NavLink>
          <NavLink to="/shop?cat=men" className="block text-black dark:text-white py-1">
            Men
          </NavLink>
          <NavLink to="/shop" className="block text-black dark:text-white py-1">
            Collection
          </NavLink>
          <NavLink to="/track" className="block text-black dark:text-white py-1">
            Track Order
          </NavLink>
          <NavLink to="/story" className="block text-black dark:text-white py-1">
            Story
          </NavLink>
          <NavLink to="/studio" className="block text-neutral-400 py-1">
            Studio
          </NavLink>
        </div>
      )}
    </header>
  );
}
