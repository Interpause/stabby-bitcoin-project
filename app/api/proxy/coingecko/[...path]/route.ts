import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  // Await the params object before using its properties
  const params = await context.params;
  const isMockMode = process.env.NEXT_USE_MOCK === 'true';
  const urlPath = params.path.join('/');
  
  const cacheDir = path.join(process.cwd(), 'lib/mock/cache/coingecko');
  // Replace slashes with underscores for a flat file structure, or keep directories
  const cacheFile = path.join(cacheDir, `${urlPath.replace(/\//g, '_')}.json`);

  if (isMockMode) {
    try {
      const cachedData = await fs.readFile(cacheFile, 'utf-8');
      console.log(`[PROXY] Serving cached data for /${urlPath}`);
      return NextResponse.json(JSON.parse(cachedData));
    } catch {
      // File doesn't exist, proceed to fetch
      console.log(`[PROXY] Cache miss for /${urlPath}, fetching real data...`);
    }
  }

  // Fetch from the real API
  const searchParams = new URL(request.url).searchParams;
  
  // Use the secret base URL and API key from environment variables
  const coingeckoBaseUrl = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
  const apiKey = process.env.COINGECKO_API_KEY;
  
  const realUrl = new URL(`${coingeckoBaseUrl}/${urlPath}`);
  searchParams.forEach((val, key) => realUrl.searchParams.append(key, val));
  
  // Apply secret API Key (CoinGecko demo key uses query param)
  if (apiKey) {
    realUrl.searchParams.append('x_cg_demo_api_key', apiKey);
  }

  try {
    const response = await fetch(realUrl.toString());
    const data = await response.json();

    if (isMockMode && response.ok) {
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(cacheFile, JSON.stringify(data, null, 2));
      console.log(`[PROXY] Successfully cached data for /${urlPath}`);
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`[PROXY] Failed to fetch data for /${urlPath}:`, error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
