import React from 'react';
import NotFoundPage from '../pages/NotFoundPage';
import { isOwnerAuthorized } from '../utils/adminAuth';

/**
 * AdminGate - Exclusive Owner Security Gate
 * 
 * Strict Security Rules:
 * 1. Restricts /studio, /admin, and all administrative tools strictly to the verified owner.
 * 2. If any unauthorized user or visitor attempts to visit /studio or /admin, they are
 *    presented with the standard Error 404 Not Found page.
 * 3. Only the authenticated owner (shaahrozdogar@gmail.com) can view children.
 */
export default function AdminGate({ children, user = null, onOpenAuthModal }) {
  const isAuthorized = isOwnerAuthorized(user);

  // If not authorized, strictly render Error 404 Not Found page
  if (!isAuthorized) {
    return <NotFoundPage onOpenAuthModal={onOpenAuthModal} />;
  }

  // Authorized Owner Experience
  return children;
}
