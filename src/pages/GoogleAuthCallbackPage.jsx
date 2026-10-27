import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { parseGoogleHash, fetchGoogleVerifiedUser } from '../utils/googleAuth';

/**
 * GoogleAuthCallbackPage - Handles the redirect return from accounts.google.com.
 * Verifies the credentials with Google and returns user to the store with their cart item.
 */
export default function GoogleAuthCallbackPage({ onAuthSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function handleCallback() {
      try {
        const hashParams = parseGoogleHash(location.hash);

        if (hashParams.error) {
          throw new Error(hashParams.errorDescription || `Google authentication error: ${hashParams.error}`);
        }

        if (!hashParams.accessToken) {
          throw new Error("No authorization token received from Google. Please try logging in again.");
        }

        // Verify with Google's Userinfo API
        const verifiedUser = await fetchGoogleVerifiedUser(hashParams.accessToken);

        // Check for pending cart item saved before redirect
        let pendingItem = null;
        try {
          const savedPending = sessionStorage.getItem('zaytoun_pending_cart_item');
          if (savedPending) {
            pendingItem = JSON.parse(savedPending);
            sessionStorage.removeItem('zaytoun_pending_cart_item');
          }
        } catch (e) {
          console.warn("Could not parse pending cart item:", e);
        }

        const returnUrl = sessionStorage.getItem('zaytoun_auth_return_url') || '/shop';
        sessionStorage.removeItem('zaytoun_auth_return_url');

        setStatus('success');

        // Notify App.jsx
        if (onAuthSuccess) {
          onAuthSuccess(verifiedUser, pendingItem);
        }

        // Redirect back to store after brief moment
        setTimeout(() => {
          navigate(returnUrl, { replace: true });
        }, 1200);

      } catch (err) {
        console.error("Google Auth Verification Failed:", err);
        setStatus('error');
        setErrorMessage(err.message || "Failed to verify Google account credentials.");
      }
    }

    handleCallback();
  }, [location, navigate, onAuthSuccess]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-onyx-950 rounded-3xl p-8 border border-neutral-200 dark:border-onyx-800 shadow-2xl text-center">
        
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-camel-400 border-t-transparent animate-spin mx-auto" />
            <h2 className="text-xl font-bold font-serif text-neutral-900 dark:text-white">
              Verifying with Google...
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Contacting Google Identity Services to securely verify your account credentials.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 text-2xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-bold font-serif text-neutral-900 dark:text-white">
              Google Account Verified!
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Identity confirmed with Google. Returning you to your shopping bag...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 flex items-center justify-center mx-auto text-red-600 text-2xl font-bold">
              ✕
            </div>
            <h2 className="text-xl font-bold font-serif text-neutral-900 dark:text-white">
              Google Verification Failed
            </h2>
            <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
              {errorMessage}
            </p>
            <p className="text-[11px] text-neutral-500">
              You must be verified with Google before you can add items to your cart or place an order.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => navigate('/shop')}
                className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-onyx-800 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300"
              >
                Return to Shop
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-olive-800 text-xs font-bold text-white hover:bg-olive-900"
              >
                Retry Sign In
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
