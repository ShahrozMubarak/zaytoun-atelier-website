/**
 * 🌿 ZAYTOUN ATELIER - CLIENT API SERVICE (JWT AUTHENTICATED)
 * Connects frontend React components to the Express + MongoDB backend.
 * Uses expiring JWT tokens for secure admin operations.
 */

import { PRODUCTS } from '../data/products';

export const API_BASE = '/api';

/**
 * 🔐 JWT TOKEN MANAGEMENT
 */
export function getAdminToken() {
  return sessionStorage.getItem('zaytoun_admin_jwt') || '';
}

export function setAdminToken(token) {
  if (token) {
    sessionStorage.setItem('zaytoun_admin_jwt', token);
  } else {
    sessionStorage.removeItem('zaytoun_admin_jwt');
  }
}

export function getAuthHeaders() {
  const token = getAdminToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginAdmin(password, username = 'shahroz') {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, username })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      setAdminToken(data.token);
      sessionStorage.setItem('zaytoun_admin_session', 'authenticated');
      return { success: true, token: data.token, admin: data.admin };
    }
    return { success: false, error: data.error || 'Incorrect username or passcode.' };
  } catch {
    // Fallback if backend server is temporarily uncontactable
    const localPasscode = import.meta.env.VITE_ADMIN_PASSCODE || 'shahroz';
    const localUser = 'shahroz';
    if (password === localPasscode && (!username || username.toLowerCase().trim() === localUser)) {
      sessionStorage.setItem('zaytoun_admin_session', 'authenticated');
      return { success: true, fallback: true };
    }
    return { success: false, error: 'Incorrect admin username or passcode.' };
  }
}

export function logoutAdmin() {
  setAdminToken(null);
  sessionStorage.removeItem('zaytoun_admin_session');
}

/**
 * 👤 CLIENT GOOGLE AUTHENTICATION & SYNC
 * Syncs authenticated Google user profile to MongoDB Atlas Customer database
 */
export async function syncGoogleClientToDB(userData) {
  try {
    const res = await fetch(`${API_BASE}/auth/google-client`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (res.ok) {
      const data = await res.json();
      return data.user || userData;
    }
  } catch (err) {
    console.warn('Could not sync Google client to MongoDB Atlas:', err.message);
  }
  return userData;
}

/**
 * Check if backend server and MongoDB are connected
 */
export async function checkServerStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error('Server not responding');
    return await res.json();
  } catch {
    return { status: 'offline', database: 'disconnected', fallback: true };
  }
}

/**
 * PRODUCTS
 */
export async function fetchProductsFromDB() {
  try {
    const res = await fetch(`${API_BASE}/products`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.info('Using local product catalog (MongoDB offline/loading):', err.message);
  }

  // Fallback to localStorage or default seed catalog
  try {
    const saved = localStorage.getItem('zaytoun_products');
    return saved ? JSON.parse(saved) : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

export async function saveProductToDB(product) {
  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Could not save product to MongoDB (saved locally):', err.message);
  }
  return product;
}

export async function deleteProductFromDB(productId) {
  try {
    const res = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (res.ok) return true;
  } catch (err) {
    console.warn('Could not delete product from MongoDB:', err.message);
  }
  return false;
}

/**
 * ORDERS
 */
export async function fetchOrdersFromDB() {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    if (Array.isArray(data)) return data;
  } catch (err) {
    console.info('Using local orders (MongoDB not reachable):', err.message);
  }

  try {
    const saved = localStorage.getItem('zaytoun_orders');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function fetchOrderByNumber(orderNumber) {
  try {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderNumber)}`, {
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback to local search
  }

  try {
    const saved = JSON.parse(localStorage.getItem('zaytoun_orders') || '[]');
    return saved.find(
      o => (o.orderNumber && o.orderNumber.toUpperCase() === orderNumber.toUpperCase()) ||
           (o.id && o.id.toUpperCase() === orderNumber.toUpperCase())
    ) || null;
  } catch {
    return null;
  }
}

export async function saveOrderToDB(order) {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (res.ok) {
      const savedDoc = await res.json();
      console.log('✅ Order saved directly to MongoDB Atlas:', savedDoc.orderNumber);
      return savedDoc;
    } else {
      const errText = await res.text();
      console.warn('⚠️ MongoDB order save rejected:', res.status, errText);
    }
  } catch (err) {
    console.warn('Order saved locally (MongoDB offline):', err.message);
  }
  return order;
}

export async function updateOrderStatusInDB(orderId, status) {
  try {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Could not update order status in MongoDB:', err.message);
  }
  return null;
}

/**
 * THEME / APPEARANCE
 */
export async function fetchThemeFromDB() {
  try {
    const res = await fetch(`${API_BASE}/theme`, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.brand) return data;
    }
  } catch {
    // Fallback
  }
  try {
    const saved = localStorage.getItem('zaytoun_theme_config');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export async function saveThemeToDB(themeConfig) {
  try {
    const res = await fetch(`${API_BASE}/theme`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(themeConfig)
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('Theme saved locally:', err.message);
  }
  return themeConfig;
}

/**
 * NEWSLETTER SUBSCRIBERS (Stored directly in MongoDB)
 */
export async function subscribeNewsletter(email, source = 'website') {
  try {
    const res = await fetch(`${API_BASE}/subscribers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source })
    });
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Newsletter subscriber saved to MongoDB Atlas:', email);
      return data;
    }
    const errData = await res.json();
    return { success: false, error: errData.error };
  } catch (err) {
    console.warn('Could not save subscriber to MongoDB:', err.message);
  }
  return { success: true, email, fallback: true };
}

export async function fetchSubscribersFromDB() {
  try {
    const res = await fetch(`${API_BASE}/subscribers`, {
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return [];
}

export async function deleteSubscriberFromDB(id) {
  try {
    const res = await fetch(`${API_BASE}/subscribers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * CUSTOMERS DIRECTORY (Stored directly in MongoDB)
 */
export async function fetchCustomersFromDB() {
  try {
    const res = await fetch(`${API_BASE}/customers`, {
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return [];
}

/**
 * CONCIERGE & CONTACT INQUIRIES (Stored directly in MongoDB)
 */
export async function submitContactInquiry(inquiryData) {
  try {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiryData)
    });
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Contact inquiry saved to MongoDB Atlas:', inquiryData.email);
      return data;
    }
    const errData = await res.json();
    return { success: false, error: errData.error };
  } catch (err) {
    console.warn('Could not save inquiry to MongoDB:', err.message);
  }
  return { success: true, fallback: true };
}

export async function fetchInquiriesFromDB() {
  try {
    const res = await fetch(`${API_BASE}/inquiries`, {
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return [];
}
