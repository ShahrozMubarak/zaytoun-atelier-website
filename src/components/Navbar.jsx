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
  brandName = "ZAYTOUN",
  user = null,
  onOpenAuthModal,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
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
        <div className="flex items-center space-x-2 sm:space-x-4 text-sm text-black dark:text-white">
          
          {/* Currency Switcher (Desktop/Tablet) */}
          <button
            onClick={() => {
              const order = ['PKR', 'USD', 'EUR'];
              const nextIdx = (order.indexOf(currency) + 1) % order.length;
              setCurrency(order[nextIdx]);
            }}
            className="hidden sm:inline-block text-xs font-bold px-2 py-1 rounded-none border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white transition uppercase"
            title="Switch Currency"
          >
            {currency}
          </button>

          {/* Theme Toggle Button (Desktop/Tablet) */}
          <button
            onClick={onToggleTheme}
            className="hidden sm:inline-flex p-1.5 rounded-none text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition items-center justify-center border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700"
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

          {/* Google Sign In / User Profile */}
          {!user ? (
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal({ title: "Sign in with Google", subtitle: "Access your saved bag, couture orders, and concierge." })}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-none border border-neutral-300 dark:border-onyx-700 hover:border-black dark:hover:border-white bg-white dark:bg-onyx-900 text-xs font-bold transition-all shadow-sm active:scale-95 text-neutral-800 dark:text-white"
              title="Sign in with Google"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="hidden sm:inline">Sign In</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-1.5 p-1 pl-1.5 pr-2.5 rounded-full border border-camel-400/50 dark:border-camel-500/40 hover:border-camel-500 bg-linen-50 dark:bg-onyx-900 transition-all text-xs font-bold text-neutral-900 dark:text-white"
                title={`Signed in as ${user.name}`}
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover border border-camel-400/60"
                />
                <span className="max-w-[70px] sm:max-w-[110px] truncate text-left">{user.firstName || user.name}</span>
                <svg className="w-3 h-3 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-onyx-950 border border-neutral-200 dark:border-onyx-800 shadow-2xl py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-onyx-800">
                    <p className="font-bold text-neutral-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                    <span className="inline-flex items-center space-x-1.5 mt-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Google Verified</span>
                    </span>
                  </div>

                  <Link
                    to="/track"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-onyx-900 transition flex items-center justify-between"
                  >
                    <span>Track My Orders</span>
                    <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  <div className="border-t border-neutral-100 dark:border-onyx-800 my-1"></div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition flex items-center justify-between"
                  >
                    <span>Sign Out</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

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
          {user ? (
            <div className="p-3.5 rounded-2xl bg-linen-100 dark:bg-onyx-900 border border-neutral-200 dark:border-onyx-800 mb-2">
              <div className="flex items-center space-x-3 mb-2">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-camel-400"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-neutral-500 truncate normal-case">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full py-2 rounded-xl text-center text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenAuthModal) onOpenAuthModal({ title: "Sign in with Google" });
              }}
              className="w-full py-3 px-4 rounded-xl bg-white dark:bg-onyx-900 border-2 border-neutral-300 dark:border-onyx-700 text-xs font-bold flex items-center justify-center space-x-2 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}

          <NavLink
            to="/shop?cat=women"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-black dark:text-white py-1"
          >
            Women
          </NavLink>
          <NavLink
            to="/shop?cat=men"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-black dark:text-white py-1"
          >
            Men
          </NavLink>
          <NavLink
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-black dark:text-white py-1"
          >
            Collection
          </NavLink>
          <NavLink
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-black dark:text-white py-1"
          >
            Track Order
          </NavLink>
          <NavLink
            to="/story"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-black dark:text-white py-1"
          >
            Story
          </NavLink>

          {/* Mobile Currency & Theme Settings Row */}
          <div className="pt-4 border-t border-neutral-200 dark:border-onyx-800 flex items-center justify-between text-xs font-semibold normal-case">
            <div className="flex items-center space-x-2">
              <span className="text-neutral-500">Currency:</span>
              <button
                type="button"
                onClick={() => {
                  const order = ['PKR', 'USD', 'EUR'];
                  const nextIdx = (order.indexOf(currency) + 1) % order.length;
                  setCurrency(order[nextIdx]);
                }}
                className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-onyx-700 font-bold uppercase text-onyx-950 dark:text-white bg-linen-100 dark:bg-onyx-900"
              >
                {currency}
              </button>
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-onyx-700 bg-linen-100 dark:bg-onyx-900 text-onyx-950 dark:text-white text-xs font-bold"
            >
              <span>{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
