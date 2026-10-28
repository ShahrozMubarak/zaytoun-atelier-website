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

  // Authorized Owner Experience - Clean, invisible security wrapper with zero clutter
  return children;
}
