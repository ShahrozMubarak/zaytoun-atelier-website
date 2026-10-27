import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { redirectToGoogleLogin } from '../utils/googleAuth';

/**
 * GoogleAuthModal - Luxury Sign in with Google modal for Zaytoun Atelier.
 * Required before adding any item to the cart or checking out.
 */
export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSuccess,
  pendingItem = null,
  title = "Sign in with Google to Add to Bag",
  subtitle = "To curate your luxury wardrobe and place orders, please sign in with your Google account."
}) {
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  // Reset states on open/close
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setLoading(false);
    }
  }, [isOpen]);

  // Handler for Continue with Google button (Redirects directly to accounts.google.com)
  const handleContinueWithGoogleClick = () => {
    setLoading(true);
    setErrorMessage("");

    if (googleClientId) {
      try {
        redirectToGoogleLogin({
          pendingItem,
          returnUrl: window.location.pathname + window.location.search
        });
        return;
      } catch (err) {
        setErrorMessage("Could not redirect to Google: " + err.message);
        setLoading(false);
        return;
      }
    }

    // If Client ID is missing in environment
    setTimeout(() => {
      setLoading(false);
      setErrorMessage(
        "Google OAuth Client ID is not configured. Please ensure VITE_GOOGLE_CLIENT_ID is set in your environment variables."
      );
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-onyx-950/75 backdrop-blur-md transition-all duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-onyx-950 rounded-3xl border border-neutral-200 dark:border-onyx-800 shadow-2xl overflow-hidden transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Accent Bar (Olive & Desert Camel) */}
        <div className="h-1.5 w-full bg-gradient-to-r from-olive-800 via-camel-500 to-olive-900" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-onyx-900 transition-colors z-10"
          aria-label="Close Sign In Dialog"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-1.5 mb-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-onyx-950 dark:text-white">
                ZAYTOUN ATELIER
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-camel-500 shadow-sm shadow-camel-500/50" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-camel-600 dark:text-camel-400 mb-2">
              Client Concierge & Sign In
            </p>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 dark:text-white">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-1.5 max-w-sm mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Pending Item Preview Card (If triggered by Add to Cart) */}
          {pendingItem && (
            <div className="mb-6 p-3.5 rounded-2xl bg-linen-100 dark:bg-onyx-900 border border-camel-200/60 dark:border-onyx-800 flex items-center space-x-3.5">
              <div className="w-14 h-16 rounded-xl overflow-hidden bg-neutral-200 dark:bg-onyx-800 flex-shrink-0 border border-neutral-300 dark:border-onyx-700">
                <img
                  src={
                    pendingItem.images?.[0] ||
                    pendingItem.image ||
                    "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=300&q=80"
                  }
                  alt={pendingItem.name || "Pending Piece"}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Will be added upon sign in
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                  {pendingItem.name}
                </h4>
                <div className="flex items-center space-x-2 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  <span>Size: <strong className="text-neutral-800 dark:text-neutral-200">{pendingItem.selectedSize || 'M'}</strong></span>
                  {pendingItem.selectedColor && (
                    <>
                      <span>•</span>
                      <span>Color: <strong className="text-neutral-800 dark:text-neutral-200">{pendingItem.selectedColor}</strong></span>
                    </>
                  )}
                  <span>•</span>
                  <span className="font-bold text-olive-800 dark:text-camel-400">
                    {formatPrice(pendingItem.price || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
              <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Single Google Sign-In Action */}
          <div className="space-y-4 pt-1">
            <button
              type="button"
              onClick={handleContinueWithGoogleClick}
              disabled={loading}
              className="w-full relative flex items-center justify-center space-x-3.5 py-4 px-6 rounded-2xl bg-white dark:bg-onyx-900 border-2 border-neutral-300 dark:border-onyx-700 hover:border-camel-500 dark:hover:border-camel-500 text-neutral-800 dark:text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] disabled:opacity-60 cursor-pointer group"
            >
              {/* Official Google 'G' SVG Logo */}
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>

              <span className="tracking-wide">
                {loading ? "Connecting to Google..." : "Continue with Google"}
              </span>

              <svg className="w-4 h-4 text-neutral-400 group-hover:text-camel-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Privacy & Trust Footer */}
          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-onyx-800 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
            <span className="flex items-center space-x-1">
              <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
              <span>256-bit SSL Secure Auth</span>
            </span>
            <span>Zaytoun Atelier & Co.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
