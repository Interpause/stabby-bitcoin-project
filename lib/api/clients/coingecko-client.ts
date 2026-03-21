import { baseFetcher } from '../base-client';

/**
 * Custom mutator for CoinGecko API.
 * Handles the 'x_cg_demo_api_key' query parameter requirement.
 */
export const coingeckoInstance = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] CoinGecko API Key found: ${apiKey ? 'Yes (starts with ' + apiKey.slice(0, 5) + '...)' : 'No'}`);
  }

  // CoinGecko Demo API requires the key as a query param
  const params: Record<string, string | undefined> = {};
  if (apiKey) {
    params['x_cg_demo_api_key'] = apiKey;
  }

  return baseFetcher<T>(url, {
    ...options,
    baseUrl,
    params,
  });
};

export default coingeckoInstance;
