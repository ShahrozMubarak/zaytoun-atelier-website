import React, { useState, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { launchGooglePopupLogin } from '../utils/googleAuth';

/**
 * GoogleAuthModal - Luxury Editorial Authentication Portal for Zaytoun Atelier
 * High-end slow fashion aesthetic with desert camel accents, obsidian glassmorphism,
 * brand monogram crest, an minimalist luxury modal UI,d official Google Identity Services SSO.
 */
export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSuccess,
  pendingItem = null,
  title = "Client Privilege Access",
  subtitle = "Sign in with your Google account to curate your wardrobe, place bespoke orders, and receive private drop allocations."
}) {
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset states on open/close
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setLoading(false);
    }
  }, [isOpen]);

  // Official Google Identity Services Popup Sign-In
  const handleGooglePopupClick = () => {
    setLoading(true);
    setErrorMessage("");

    launchGooglePopupLogin({
      onSuccess: (verifiedUser) => {
        setLoading(false);
        if (onSuccess) onSuccess(verifiedUser);
        if (onClose) onClose();
      },
      onError: (err) => {
        console.warn("Google Sign-In Notice:", err.message);
        setLoading(false);
        setErrorMessage("Google Sign-In popup could not complete. Please ensure popups are enabled and sign in with your Google account.");
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#121110] text-white rounded-none border-2 border-[#C69F6F]/60 shadow-[0_25px_90px_-15px_rgba(198,159,111,0.35)] overflow-hidden transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Shimmer Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8C6D45] via-[#E6D3B3] to-[#C69F6F]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-none text-[#C69F6F]/70 hover:text-white hover:bg-white/10 transition-colors z-10 cursor-pointer"
          aria-label="Close Authentication Portal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-10 relative">
          {/* Subtle Ambient Radial Camel Glow in Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#C69F6F]/10 blur-3xl pointer-events-none rounded-full" />

          {/* Luxury Brand Crest & Monogram */}
          <div className="text-center mb-7 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-14 mb-4 rounded-none border border-[#C69F6F] bg-gradient-to-br from-[#E6D3B3] via-[#C69F6F] to-[#8C6D45] text-black shadow-lg shadow-[#C69F6F]/20 p-2">
              <img 
                src="/images/brand/foolish/arc_emblem.png" 
                alt="FOOLISH ARC" 
                className="w-full h-full object-contain filter brightness-0"
              />
            </div>

            <div className="flex items-center justify-center space-x-2 mb-1.5">
              <span className="h-px w-6 bg-[#C69F6F]/40" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E6D3B3]">
                FOOLISH ARC • Private Portal
              </span>
              <span className="h-px w-6 bg-[#C69F6F]/40" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mt-1">
              {title}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-sm mx-auto leading-relaxed font-sans">
              {subtitle}
            </p>
          </div>

          {/* Pending Item Luxury Preview Card (If triggered by Add to Bag) */}
          {pendingItem && (
            <div className="mb-6 p-4 rounded-none bg-[#1C1814] border border-[#C69F6F]/40 flex items-center space-x-4 shadow-inner">
              <div className="w-14 h-18 rounded-none overflow-hidden bg-black flex-shrink-0 border border-[#C69F6F]/30">
                <img
                  src={
                    pendingItem.images?.[0] ||
                    pendingItem.image ||
                    "/images/catalog/men_barrel_jeans_flat.jpg"
                  }
                  alt={pendingItem.name || "Pending Piece"}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-none bg-[#C69F6F] animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#E6D3B3]">
                    Reserved for your bag
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-white truncate uppercase tracking-wider font-sans">
                  {pendingItem.name}
                </h4>
                <div className="flex items-center space-x-2 text-[11px] text-neutral-400 mt-1 font-mono">
                  <span>Size: <strong className="text-[#E6D3B3]">{pendingItem.selectedSize || 'M'}</strong></span>
                  {pendingItem.selectedColor && (
                    <>
                      <span>•</span>
                      <span>Color: <strong className="text-[#E6D3B3]">{pendingItem.selectedColor}</strong></span>
                    </>
                  )}
                  <span>•</span>
                  <span className="font-black text-white">
                    {formatPrice(pendingItem.price || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Attractive Google Sign-In Action Area */}
          <div className="space-y-4 pt-1">
            <button
              type="button"
              onClick={handleGooglePopupClick}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3.5 py-4 px-6 rounded-none bg-white hover:bg-[#FAF4EB] text-black font-black text-xs uppercase tracking-[0.15em] border-2 border-[#C69F6F] hover:border-white shadow-[0_10px_30px_-5px_rgba(198,159,111,0.4)] transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 cursor-pointer group"
            >
              {/* Official Google 4-Color 'G' Vector */}
              <svg className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loading ? "Authenticating Client..." : "Continue with Google"}</span>
            </button>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-950/60 border border-red-500/50 text-xs text-red-200">
                <p>{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Luxury Atelier Client Pillars */}
          <div className="mt-8 pt-6 border-t border-[#C69F6F]/25 grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <span className="block text-[10px] font-black uppercase tracking-wider text-[#E6D3B3]">
                Drops &amp; Vault
              </span>
              <span className="block text-[10px] text-neutral-400">
                Private release allocations
              </span>
            </div>
            <div className="space-y-1 border-x border-[#C69F6F]/20 px-1">
              <span className="block text-[10px] font-black uppercase tracking-wider text-[#E6D3B3]">
                Express Courier
              </span>
              <span className="block text-[10px] text-neutral-400">
                TCS live tracking
              </span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-black uppercase tracking-wider text-[#E6D3B3]">
                Concierge
              </span>
              <span className="block text-[10px] text-neutral-400">
                Priority order verification
              </span>
            </div>
          </div>

          {/* Secure Protocol Seal */}
          <div className="mt-6 pt-3 text-center">
            <span className="inline-flex items-center space-x-1.5 text-[10px] font-mono font-bold tracking-wider text-[#C69F6F]/70">
              <span className="w-1.5 h-1.5 rounded-none bg-[#C69F6F]" />
              <span>FOOLISH ARC Protocol • Encrypted Client Session</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
