import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const params = await context.params;
  const isMockMode = process.env.NEXT_USE_MOCK === 'true';
  const isDev = process.env.NODE_ENV === 'development';
  const useLocalJsonCache = isMockMode && isDev;
  const revalidateTime = isMockMode ? 31536000 : 3600;
  const urlPath = params.path.join('/');
  const searchParams = new URL(request.url).searchParams;
  
  // Create a unique cache filename based on path AND query params
  const paramString = Array.from(searchParams.entries())
    .map(([key, value]) => `${key}_${value}`)
    .join('_');
  const cacheDir = path.join(process.cwd(), 'lib/mock/cache/coingecko');
  const cacheFileName = `${urlPath.replace(/\//g, '_')}${paramString ? `_${paramString}` : ''}.json`;
  const cacheFile = path.join(cacheDir, cacheFileName);

  if (useLocalJsonCache) {
    try {
      const cachedData = await fs.readFile(cacheFile, 'utf-8');
      console.log(`[PROXY] Serving cached data for /${urlPath} from ${cacheFileName}`);
      return NextResponse.json(JSON.parse(cachedData));
    } catch {
      console.log(`[PROXY] Cache miss for /${urlPath}, fetching real data...`);
    }
  }

  const coingeckoBaseUrl = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
  const apiKey = process.env.COINGECKO_API_KEY;

  const fetchPage = async (page: number) => {
    const realUrl = new URL(`${coingeckoBaseUrl}/${urlPath}`);
    searchParams.forEach((val, key) => realUrl.searchParams.append(key, val));
    if (apiKey) realUrl.searchParams.append('x_cg_demo_api_key', apiKey);
    
    // For entities/list specifically, we might want to override page/per_page for auto-pagination
    if (urlPath === 'entities/list' && isMockMode) {
      realUrl.searchParams.set('page', page.toString());
      realUrl.searchParams.set('per_page', '250');
    }

    const urlString = realUrl.toString();
    
    const res = await fetch(urlString, { next: { revalidate: revalidateTime } });
    
    if (res.status === 429) {
      console.log(`[PROXY] Rate limited (429) on ${urlPath}. Fast failing to client...`);
      throw { status: 429, message: 'CoinGecko API Rate Limited' };
    }
    
    if (!res.ok) throw { status: res.status, message: `API returned ${res.status}` };
    return res.json();
  };

  try {
    let finalData: unknown;

    if (urlPath === 'entities/list' && isMockMode) {
      // Recursive pagination to capture ALL government entities in one cache file
      console.log(`[PROXY] Starting recursive pagination for ${urlPath}...`);
      let allResults: unknown[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        console.log(`[PROXY] Fetching page ${page}...`);
        const pageData = await fetchPage(page);
        allResults = [...allResults, ...pageData];
        // If we got fewer than 250, we've reached the end
        if (pageData.length < 250) {
          hasMore = false;
        } else {
          page++;
        }
      }
      finalData = allResults;
    } else {
      finalData = await fetchPage(Number(searchParams.get('page')) || 1);
    }

    if (useLocalJsonCache) {
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(cacheFile, JSON.stringify(finalData, null, 2));
      console.log(`[PROXY] Successfully cached data to ${cacheFileName}`);
    }

    return NextResponse.json(finalData);
  } catch (error: any) {
    if (typeof error === 'object' && error !== null && 'status' in error) {
      return NextResponse.json({ error: error.message || 'API Error' }, { status: error.status });
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[PROXY] Failed to fetch data:`, errorMessage);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
