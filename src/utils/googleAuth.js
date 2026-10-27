/**
 * 🌐 Official Google OAuth 2.0 Redirect Service for Zaytoun Atelier
 * Redirects directly to accounts.google.com and verifies the response.
 */

export const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

export function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
}

/**
 * Initiates the real redirect to Google's official accounts.google.com login screen.
 * @param {Object} options - { pendingItem, returnUrl }
 */
export function redirectToGoogleLogin({ pendingItem = null, returnUrl = window.location.pathname } = {}) {
  const clientId = getGoogleClientId();

  // Save pending intent in session storage so it survives the redirect to Google and back
  if (pendingItem) {
    sessionStorage.setItem('zaytoun_pending_cart_item', JSON.stringify(pendingItem));
  } else {
    sessionStorage.removeItem('zaytoun_pending_cart_item');
  }

  sessionStorage.setItem('zaytoun_auth_return_url', returnUrl);

  if (!clientId) {
    throw new Error("MISSING_CLIENT_ID");
  }

  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const state = encodeURIComponent(JSON.stringify({ returnUrl, timestamp: Date.now() }));
  const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "token",
    scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
    prompt: "select_account",
    state: state
  });

  const fullUrl = `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`;
  console.log("🔗 Redirecting to Google Login:", fullUrl);
  window.location.href = fullUrl;
}

/**
 * Parses URL hash returned by Google after redirection
 * e.g. #access_token=...&id_token=...&state=...
 */
export function parseGoogleHash(hash) {
  if (!hash) return {};
  const cleanHash = hash.startsWith('#') ? hash.substring(1) : hash;
  const params = new URLSearchParams(cleanHash);
  return {
    accessToken: params.get('access_token'),
    idToken: params.get('id_token'),
    tokenType: params.get('token_type'),
    expiresIn: params.get('expires_in'),
    error: params.get('error'),
    errorDescription: params.get('error_description'),
    state: params.get('state')
  };
}

/**
 * Verifies the access token directly with Google's servers and returns verified profile.
 * Google verifies that the user is authentic and email is verified.
 */
export async function fetchGoogleVerifiedUser(accessToken) {
  if (!accessToken) throw new Error("No access token provided");

  const res = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error_description || "Failed to verify identity with Google.");
  }

  const data = await res.json();
  
  if (!data.email_verified && data.email_verified !== undefined) {
    throw new Error("Google account email is not verified by Google.");
  }

  const parts = (data.name || '').trim().split(' ');
  const firstName = data.given_name || parts[0] || 'Client';
  const lastName = data.family_name || parts.slice(1).join(' ') || '';

  return {
    name: data.name || data.email.split('@')[0],
    firstName,
    lastName,
    email: data.email.toLowerCase(),
    avatar: data.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || data.email)}`,
    googleId: data.sub,
    email_verified: Boolean(data.email_verified),
    authProvider: 'google',
    verified: true,
    verifiedAt: new Date().toISOString()
  };
}
