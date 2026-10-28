import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { parseGoogleHash, fetchGoogleVerifiedUser, redirectToGoogleLogin } from '../utils/googleAuth';

/**
 * GoogleAuthCallbackPage - Handles the redirect return from accounts.google.com.
 * Strictly verifies the credentials with Google and returns user to the store with their cart item.
 * No alternate, guest, or unverified logins are allowed.
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
          throw new Error("No authorization token received from Google. Please sign in with your Google account.");
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
        setErrorMessage(err.message || "Google rejected the request. Please retry logging in with your Google account.");
      }
    }

    handleCallback();
  }, [location, navigate, onAuthSuccess]);

  const handleRetryGoogleLogin = () => {
    try {
      redirectToGoogleLogin({ pendingItem: pendingCartItem });
    } catch {
      navigate('/shop');
    }
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
              Google Sign-In Required
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {errorMessage || "Authentic Google verification is strictly required to access your cart and place orders. No unverified logins are permitted."}
            </p>

            <div className="pt-3 space-y-2">
              <button
                onClick={handleRetryGoogleLogin}
                className="w-full py-3 px-4 rounded-none bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow cursor-pointer flex items-center justify-center space-x-2"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Retry Google Sign-In</span>
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
