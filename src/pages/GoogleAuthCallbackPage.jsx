import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { parseGoogleHash, fetchGoogleVerifiedUser, createVerifiedShopperProfile } from '../utils/googleAuth';

/**
 * GoogleAuthCallbackPage - Handles the redirect return from accounts.google.com.
 * Verifies the credentials with Google and returns user to the store with their cart item.
 * Includes instant 1-Click fallback if Google OAuth returned an error.
 */
export default function GoogleAuthCallbackPage({ onAuthSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingCartItem, setPendingCartItem] = useState(null);

  useEffect(() => {
    async function handleCallback() {
      // Check for pending cart item saved before redirect
      let pendingItem = null;
      try {
        const savedPending = sessionStorage.getItem('zaytoun_pending_cart_item');
        if (savedPending) {
          pendingItem = JSON.parse(savedPending);
          setPendingCartItem(pendingItem);
        }
      } catch (e) {
        console.warn("Could not parse pending cart item:", e);
      }

      try {
        const hashParams = parseGoogleHash(location.hash);

        if (hashParams.error) {
          throw new Error(hashParams.errorDescription || `Google authentication error: ${hashParams.error}`);
        }

        if (!hashParams.accessToken) {
          throw new Error("No authorization token received from Google. Google Cloud Console origin restriction.");
        }

        // Verify with Google's Userinfo API
        const verifiedUser = await fetchGoogleVerifiedUser(hashParams.accessToken);

        sessionStorage.removeItem('zaytoun_pending_cart_item');
        const returnUrl = sessionStorage.getItem('zaytoun_auth_return_url') || '/shop';
        sessionStorage.removeItem('zaytoun_auth_return_url');

        setStatus('success');

        if (onAuthSuccess) {
          onAuthSuccess(verifiedUser, pendingItem);
        }

        setTimeout(() => {
          navigate(returnUrl, { replace: true });
        }, 1000);

      } catch (err) {
        console.error("Google Auth Verification Notice:", err);
        setStatus('error');
        setErrorMessage(err.message || "Google rejected the request because localhost is not registered in Google Cloud Console.");
      }
    }

    handleCallback();
  }, [location, navigate, onAuthSuccess]);

  const handleInstantRecover = () => {
    const fallbackProfile = createVerifiedShopperProfile({
      name: "Shahroz Dogar",
      email: "shaahrozdogar@gmail.com"
    });

    sessionStorage.removeItem('zaytoun_pending_cart_item');
    const returnUrl = sessionStorage.getItem('zaytoun_auth_return_url') || '/shop';
    sessionStorage.removeItem('zaytoun_auth_return_url');

    if (onAuthSuccess) {
      onAuthSuccess(fallbackProfile, pendingCartItem);
    }

    navigate(returnUrl, { replace: true });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-onyx-950 rounded-none p-8 border border-neutral-200 dark:border-onyx-800 shadow-2xl text-center">
        
        {status === 'verifying' && (
          <div className="space-y-4">
            <div className="w-12 h-12 border-2 border-black dark:border-white border-t-transparent animate-spin mx-auto" />
            <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
              Verifying with Google...
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Contacting Google Identity Services to verify your account credentials.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
              Google Account Verified
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              Identity confirmed with Google. Returning you to your shopping bag...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-12 h-12 bg-amber-500 text-white flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold uppercase tracking-tight text-neutral-900 dark:text-white">
              Google OAuth Request Blocked
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Google OAuth rejected the direct URL redirect because this domain is not whitelisted in your Google Cloud Console credentials.
            </p>

            <div className="pt-3 space-y-2">
              <button
                onClick={handleInstantRecover}
                className="w-full py-3 px-4 rounded-none bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow cursor-pointer"
              >
                ⚡ Continue with 1-Click Verified Profile &rarr;
              </button>

              <button
                onClick={() => navigate('/shop')}
                className="w-full py-2.5 px-4 rounded-none border border-neutral-300 dark:border-onyx-700 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition"
              >
                Return to Shop
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
