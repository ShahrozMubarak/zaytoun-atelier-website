import React, { useState, useEffect } from 'react';

/**
 * NotificationPromptModal - Elegant prompt for browser notification permissions
 * Appears when opening the website to allow notifications for order dispatch & drops.
 */
export default function NotificationPromptModal({ onEnabled }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show prompt promptly on website open unless dismissed in this active browsing session
    if (typeof window !== 'undefined') {
      const sessionDismissed = sessionStorage.getItem('zaytoun_notif_modal_dismissed');
      if (!sessionDismissed) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAllow = async () => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Instant confirmation notification
          try {
            new Notification("ZAYTOUN ATELIER", {
              body: "Notifications enabled! You'll receive real-time order tracking & drop alerts.",
              icon: "/images/catalog/men_barrel_jeans_flat.jpg"
            });
          } catch (e) {
            console.log("Notification dispatch note:", e);
          }
          if (onEnabled) onEnabled(true);
        }
      }
    } catch (err) {
      console.warn("Notification permission error:", err);
    } finally {
      sessionStorage.setItem('zaytoun_notif_modal_dismissed', 'true');
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('zaytoun_notif_modal_dismissed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-onyx-950 border border-neutral-900 dark:border-onyx-700 rounded-none shadow-2xl p-6 sm:p-8 text-black dark:text-white">
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-onyx-800">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
            Official Atelier Notice
          </span>
          <button
            onClick={handleDismiss}
            className="text-neutral-400 hover:text-black dark:hover:text-white text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="pt-5 space-y-3">
          <div className="w-10 h-10 bg-black text-white dark:bg-white dark:text-black flex items-center justify-center rounded-none shadow-sm mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            Enable Notifications
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-normal leading-relaxed">
            Allow notifications to receive automated order confirmation receipts, courier dispatch tracking (TCS Express), and early access to limited denim drops.
          </p>
        </div>

        {/* Action Buttons (Sharp rectangular blocks) */}
        <div className="pt-6 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleAllow}
            className="w-full sm:flex-1 py-3 px-5 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-none transition shadow-sm active:scale-95 cursor-pointer"
          >
            Allow Notifications
          </button>
          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto py-3 px-5 border border-neutral-300 dark:border-onyx-700 hover:bg-neutral-100 dark:hover:bg-onyx-900 text-neutral-600 dark:text-neutral-300 text-xs font-bold uppercase tracking-wider rounded-none transition cursor-pointer"
          >
            Maybe Later
          </button>
        </div>

      </div>
    </div>
  );
}
