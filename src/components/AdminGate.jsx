import React from 'react';
import NotFoundPage from '../pages/NotFoundPage';

/**
 * AdminGate - Exclusive Owner Email Gate
 * Security Rule:
 * Strictly restricts /studio and /admin to the verified owner Google account (default: shaahrozdogar@gmail.com).
 * If accessed by an unauthenticated visitor, renders a refined, minimalist luxury Admin Sign-In screen.
 * If accessed by an unauthorized logged-in user, renders NotFoundPage (404).
 */
export default function AdminGate({ children, user = null, onOpenAuthModal }) {
  // Configured authorized owner email (configurable via localStorage / Studio Settings)
  const configuredAdminEmail = (() => {
    try {
      return (localStorage.getItem('zaytoun_admin_email') || 'shaahrozdogar@gmail.com').toLowerCase().trim();
    } catch {
      return 'shaahrozdogar@gmail.com';
    }
  })();

  // Retrieve user from prop or synchronously from active Google auth storage
  const activeUser = user || (() => {
    try {
      const stored = localStorage.getItem('zaytoun_client_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const currentUserEmail = activeUser?.email ? activeUser.email.toLowerCase().trim() : '';
  const isAuthorizedOwner = Boolean(activeUser && currentUserEmail && currentUserEmail === configuredAdminEmail);

  // If visitor is unauthenticated, render clean minimalist luxury Admin Sign-In screen
  if (!activeUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-stone-200 flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <style>{`
          @keyframes luxuryEntrance {
            0% { opacity: 0; transform: translateY(20px) scale(0.97); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-luxury-entrance {
            animation: luxuryEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .luxury-card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(212, 175, 55, 0.15);
            box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.76), 0 0 40px -10px rgba(212, 175, 55, 0.08);
          }
          .luxury-button {
            background: linear-gradient(135deg, #1c1917 0%, #0c0a09 100%);
            border: 1px solid rgba(212, 175, 55, 0.3);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
          }
          .luxury-button::before {
            content: '';
            position: absolute;
            top: 0; left: -100%; width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent);
            transition: left 0.7s ease;
          }
          .luxury-button:hover::before {
            left: 100%;
          }
          .luxury-button:hover {
            border-color: rgba(212, 175, 55, 0.8);
            transform: translateY(-2px);
            box-shadow: 0 12px 28px -6px rgba(212, 175, 55, 0.25);
            color: #fef3c7;
          }
          .luxury-button:active {
            transform: translateY(0) scale(0.98);
          }
        `}</style>

        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[120px] transform -translate-y-12"></div>
        </div>

        <div className="luxury-card animate-luxury-entrance max-w-md w-full p-10 md:p-12 rounded-3xl text-center relative z-10">
          <div className="mx-auto mb-6 w-14 h-14 rounded-full border border-amber-500/30 flex items-center justify-center bg-amber-500/5 text-amber-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <span className="text-[11px] font-medium tracking-[0.35em] text-amber-400/80 uppercase block mb-2">
            Zaytoun Atelier
          </span>
          <h1 className="text-2xl md:text-3xl font-serif text-stone-100 font-light tracking-wide mb-3">
            Admin Studio
          </h1>
          <p className="text-stone-400 text-xs leading-relaxed max-w-xs mx-auto mb-8 tracking-wide">
            Private owner portal. Please sign in with authorized owner credentials to access management console.
          </p>

          <button
            onClick={() => onOpenAuthModal && onOpenAuthModal()}
            className="luxury-button w-full py-4 px-6 rounded-xl text-stone-200 text-xs font-medium tracking-[0.2em] uppercase flex items-center justify-center gap-3 cursor-pointer group"
          >
            <svg className="w-4 h-4 text-amber-400/90 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.545,6.477,2.545,12s4.476,10,10,10c5.768,0,9.545-4.056,9.545-9.727c0-0.652-0.065-1.282-0.183-1.884H12.545z" />
            </svg>
            <span>Sign In with Google</span>
          </button>

          <div className="mt-8 pt-6 border-t border-stone-800/50 text-[10px] tracking-[0.25em] text-stone-500 uppercase">
            Protected Area • Authorized Personnel Only
          </div>
        </div>
      </div>
    );
  }

  // If visitor is logged in with any other email, render 404
  if (!isAuthorizedOwner) {
    return <NotFoundPage />;
  }

  // Authorized Owner Experience - Clean, invisible security wrapper with zero clutter
  return children;
}
