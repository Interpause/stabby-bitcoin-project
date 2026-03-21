import { baseFetcher } from '../base-client';

/**
 * Custom mutator for CoinGecko API.
 * Handles the 'x_cg_demo_api_key' query parameter requirement.
 */
export const coingeckoInstance = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  // Always use the relative proxy path for the browser
  const baseUrl = '/api/proxy/coingecko';
  
  // If we are on the server (SSR), baseFetcher will automatically try to resolve it
  // or we provide an absolute URL. Since SWR is mostly client side, '/api/proxy' is fine.
  const absoluteBaseUrl = typeof window !== 'undefined' 
    ? window.location.origin + baseUrl 
    : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + baseUrl;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] Fetching CoinGecko data via Proxy: ${url}`);
  }

  return baseFetcher<T>(url, {
    ...options,
    baseUrl: absoluteBaseUrl,
  });
};

export default coingeckoInstance;
