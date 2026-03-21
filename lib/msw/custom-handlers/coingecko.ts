import { RequestHandler } from 'msw';

// CoinGecko is now mocked and cached via the Next.js Route Handler Proxy at app/api/proxy/coingecko/...
// We no longer need to intercept these on the client with MSW.
export const coingeckoHandlers: RequestHandler[] = [];
