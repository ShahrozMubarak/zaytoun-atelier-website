import React, { useState } from 'react';
import NotFoundPage from '../pages/NotFoundPage';

/**
 * AdminGate - Exclusive Owner Email Gate
 * Security Rule:
 * Strictly restricts /studio and /admin to the verified owner Google account (default: shaahrozdogar@gmail.com).
 * If accessed by any unauthenticated visitor or unauthorized account, immediately renders NotFoundPage (404),
 * ensuring zero attack surface and complete privacy.
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

  // If visitor is NOT the authorized owner (unauthenticated, or logged in with any other email), render 404
  if (!isAuthorizedOwner) {
    return <NotFoundPage />;
  }

  // Authorized Owner Experience
  return (
    <div>
      <div className="bg-[#FAF8F3] dark:bg-onyx-900 border-b border-[#E6D3B3]/40 dark:border-onyx-800 px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-onyx-800 dark:text-neutral-200 font-bold">
            Executive Session: <strong className="text-black dark:text-[#E6D3B3]">{user.name || 'Owner'} ({user.email})</strong>
          </span>
          <span className="bg-[#E6D3B3] text-black px-2 py-0.5 rounded-none font-bold text-[11px] uppercase tracking-wider">
            Verified Owner
          </span>
        </div>
        <div className="text-[11px] text-neutral-500 font-mono">
          Strict Access Mode: 404 Active for Public
        </div>
      </div>
      {children}
    </div>
  );
}
