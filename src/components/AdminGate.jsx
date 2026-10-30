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

  // If visitor is unauthenticated, render clean minimalist luxury Admin Sign-In screen (White and Camel)
  if (!activeUser) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <style>{`
          @keyframes luxuryEntrance {
            0% { opacity: 0; transform: translateY(20px) scale(0.97); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-luxury-entrance {
            animation: luxuryEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .luxury-card-white {
            background: #ffffff;
            border: 1px solid rgba(198, 159, 111, 0.4);
            box-shadow: 0 20px 40px -15px rgba(198, 159, 111, 0.15), 0 0 2px rgba(0, 0, 0, 0.05);
          }
          .luxury-button-camel {
            background: #C69F6F;
            color: #ffffff;
            border: 1px solid #b58f5f;
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            overflow: hidden;
          }
          .luxury-button-camel:hover {
            background: #b58f5f;
            transform: translateY(-2px);
            box-shadow: 0 10px 24px -6px rgba(198, 159, 111, 0.4);
          }
          .luxury-button-camel:active {
            transform: translateY(0) scale(0.98);
          }
        `}</style>

        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[500px] h-[500px] bg-[#E6D3B3]/25 rounded-full blur-[140px] transform -translate-y-12"></div>
        </div>

        <div className="luxury-card-white animate-luxury-entrance max-w-md w-full p-10 md:p-12 rounded-3xl text-center relative z-10">
          <div className="mx-auto mb-6 w-14 h-14 rounded-full border border-[#C69F6F]/40 flex items-center justify-center bg-[#F5EFE6] text-[#C69F6F]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <span className="text-[11px] font-bold tracking-[0.35em] text-[#A6865A] uppercase block mb-2">
            Zaytoun Atelier
          </span>
          <h1 className="text-2xl md:text-3xl font-serif text-[#1A1A1A] font-light tracking-wide mb-3">
            Admin Studio
          </h1>
          <div className="text-xs font-black uppercase tracking-widest text-[#C69F6F] mb-8">
            AUTHENTICATED ATELIER ACCESS ONLY
          </div>

          <button
            onClick={() => onOpenAuthModal && onOpenAuthModal()}
            className="luxury-button-camel w-full py-4 px-6 rounded-none text-xs font-black tracking-[0.2em] uppercase flex items-center justify-center gap-3 cursor-pointer group shadow-sm"
          >
            <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.545,6.477,2.545,12s4.476,10,10,10c5.768,0,9.545-4.056,9.545-9.727c0-0.652-0.065-1.282-0.183-1.884H12.545z" />
            </svg>
            <span>SIGN IN WITH GOOGLE</span>
          </button>

          <div className="mt-8 pt-6 border-t border-[#EFE9DF] text-[10px] tracking-[0.25em] text-neutral-400 uppercase font-black">
            PROTECTED AREA • CONCIERGE ACCESS ONLY
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
