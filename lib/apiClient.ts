/**
 * Centralized API client that handles token expiration
 * Automatically renews tokens when they expire
 * Tokens are stored in httpOnly cookies (not localStorage)
 */

import { User } from '@/types/User';

let logoutCallback: (() => void) | null = null;
let refreshCallback: ((user: User) => void) | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function resolveApiUrl(url: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return url;
  
  // Clean up the base URL (remove trailing slash)
  const cleanBase = base.replace(/\/$/, '');
  
  // If the incoming URL is already absolute, return it
  if (url.startsWith('http')) return url;

  // Handle /api prefix smartly to avoid duplication
  // If base already contains /api, and url starts with /api
  if (cleanBase.endsWith('/api') && url.startsWith('/api/')) {
    return `${cleanBase}${url.substring(4)}`;
  }

  // Standard case: append relative path to base
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${path}`;
}

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

export function clearLogoutCallback() {
  logoutCallback = null;
}

export function setRefreshCallback(callback: (user: User) => void) {
  refreshCallback = callback;
}

export function clearRefreshCallback() {
  refreshCallback = null;
}

/**
 * Handles logout and redirects to home page
 * Calls server-side logout endpoint to revoke refresh token,
 * clears user from localStorage, calls logoutCallback if provided,
 * and performs delayed redirect to '/' only when pathname !== '/'
 */
async function handleLogoutRedirect() {
  // 1. Clear client-side state immediately
  localStorage.removeItem('user');

  if (logoutCallback) {
    try {
      logoutCallback();
    } catch (e) {
      console.error('Logout callback error:', e);
    }
  }

  // 2. Perform redirect as soon as possible
  if (globalThis.window && globalThis.location.pathname !== '/') {
    globalThis.location.href = '/';
  }

  // 3. Call server-side logout in the background (fire and forget)
  // This revokes the refresh token on the server
  fetch(resolveApiUrl('/api/auth/logout'), {
    method: 'POST',
    credentials: 'include',
  }).catch(error => {
    console.error('Background logout API call failed:', error);
  });
}

/**
 * Attempts to refresh the expired token using refresh token from httpOnly cookie
 * Returns true if refresh was successful, false otherwise
 */
async function refreshToken(): Promise<boolean> {
  // If already refreshing, wait for the existing refresh
  if (refreshPromise) {
    return refreshPromise;
  }

  // Start refresh process
  // Refresh token is sent automatically via httpOnly cookie
  refreshPromise = (async () => {
    try {
      const response = await fetch(resolveApiUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in request
      });

      if (!response.ok) {
        // Refresh failed - user needs to log in again
        handleLogoutRedirect();
        return false;
      }

      const data = await response.json();

      // Update user in localStorage
      // Access token and refresh token are automatically updated in httpOnly cookies by server
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        // Notify refresh callback to update user state
        if (refreshCallback) {
          refreshCallback(data.user);
        }
      }
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Don't logout on network errors; the server may just be temporarily unreachable.
      // Only return false so the caller can handle it gracefully (e.g. SWR retry).
      return false;
    } finally {
      // Clear refresh promise so future requests can trigger refresh again
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Fetcher function that handles authentication and token expiration
 * Automatically refreshes expired tokens
 */
/**
 * Helper to determine if a URL is an authentication-related endpoint
 */
const isAuthEndpoint = (url: string) => 
  ['/auth/refresh', '/auth/login', '/auth/register'].some(path => url.includes(path));

/**
 * Helper to extract a human-readable error message from a response
 */
async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const errorData = await response.json();
    return errorData.message || errorData.error || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

/**
 * Fetcher function that handles authentication and token expiration
 * Automatically refreshes expired tokens
 */
export async function apiFetcher<T = unknown>(url: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
  if (globalThis.window === undefined) {
    throw new TypeError('apiFetcher can only be used on the client side');
  }

  const resolvedUrl = resolveApiUrl(url);
  const headers = new Headers(options.headers);

  const response = await fetch(resolvedUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  // 1. Handle Successful Response
  if (response.ok) return response.json();

  // 2. Handle Unauthorized (401)
  if (response.status === 401) {
    if (isAuthEndpoint(resolvedUrl)) {
      handleLogoutRedirect();
      throw new Error('Authentication failed. Please log in again.');
    }

    if (retryCount === 0 && await refreshToken()) {
      return apiFetcher<T>(url, options, retryCount + 1);
    }

    throw new Error('Session expired. Please log in again.');
  }

  // 3. Handle General Errors
  throw new Error(await parseErrorMessage(response));
}

/**
 * SWR-compatible fetcher
 */
export const swrFetcher = (url: string) => apiFetcher<any>(url);

/**
 * SWR fetcher that proactively refreshes the auth token before fetching.
 * Use for endpoints that gracefully degrade instead of returning 401
 * (e.g. leaderboard returns myRank:null instead of Unauthorized).
 * Without this, the accessToken cookie can expire and the auto-refresh
 * never fires because there's no 401 to trigger it.
 */
export const proactiveSwrFetcher = async (url: string) => {
  await refreshToken().catch(() => { /* noop — endpoint works without auth */ });
  return apiFetcher<any>(url);
};

/**
 * Convenience object for API calls
 */
export const apiClient = {
  get: <T = unknown>(url: string, options: RequestInit = {}) => 
    apiFetcher<T>(url, { ...options, method: 'GET' }),
  
  post: <T = unknown>(url: string, data?: any, options: RequestInit = {}) => 
    apiFetcher<T>(url, { 
      ...options, 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    }),
  
  put: <T = unknown>(url: string, data?: any, options: RequestInit = {}) => 
    apiFetcher<T>(url, { 
      ...options, 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    }),
  
  patch: <T = unknown>(url: string, data?: any, options: RequestInit = {}) => 
    apiFetcher<T>(url, { 
      ...options, 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    }),
  
  delete: <T = unknown>(url: string, options: RequestInit = {}) => 
    apiFetcher<T>(url, { ...options, method: 'DELETE' }),
};
