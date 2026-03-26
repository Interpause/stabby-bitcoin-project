import { NextResponse } from 'next/server';
import { MOCK_GDELT_DATA } from '@/lib/mock/cache/gdeltData';
import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  // --- HARDCODE OVERRIDE START ---
  // This forces the route to return your specific Bitcoin JSON if it exists.
  try {
    // We check for 'gdelt_data.json' inside 'lib/mock/cache/gdelt'
    console.log(`[PROXY] Serving hardcoded GDELT data from gdeltData.ts`);
    return NextResponse.json(MOCK_GDELT_DATA);
  } catch (err) {
    // If the file isn't there (e.g. not yet downloaded), it falls back to the original logic below.
    console.warn(`[PROXY] Hardcoded file not found at lib/mock/cache/gdelt/gdelt_data.json. Falling back to live logic.`);
  }
  // --- HARDCODE OVERRIDE END ---

  const isMockMode = process.env.NEXT_USE_MOCK === 'true';
  const isDev = process.env.NODE_ENV === 'development';
  const useLocalJsonCache = isMockMode && isDev;
  const revalidateTime = isMockMode ? 31536000 : 3600;
  const searchParams = new URL(request.url).searchParams;
  
  // Create cache filename based on query params
  const paramString = Array.from(searchParams.entries())
    .map(([key, value]) => `${key}_${value}`)
    .join('_');
    
  const safeParamString = paramString.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cacheDir = path.join(process.cwd(), 'lib/mock/cache/gdelt');
  const cacheFileName = `gdelt${safeParamString ? `_${safeParamString}` : ''}.json`;
  const cacheFile = path.join(cacheDir, cacheFileName);

  if (useLocalJsonCache) {
    try {
      const cachedData = await fs.readFile(cacheFile, 'utf-8');
      console.log(`[PROXY] Serving cached GDelt data from ${cacheFileName}`);
      return NextResponse.json(JSON.parse(cachedData));
    } catch {
      console.log(`[PROXY] Cache miss for GDelt, fetching real data...`);
    }
  }

  const gdeltUrl = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
  searchParams.forEach((val, key) => gdeltUrl.searchParams.append(key, val));

  console.log(`[PROXY] Fetching from GDelt: ${gdeltUrl.toString()}`);
  
  const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 1): Promise<Response> => {
    const res = await fetch(url, options);
    if (res.status === 429 && retries > 0) {
      console.log(`[PROXY] Rate limited (429) on GDelt. Waiting 5s to retry...`);
      await new Promise(resolve => setTimeout(resolve, 5500));
      return fetchWithRetry(url, options, retries - 1);
    }
    return res;
  };

  try {
    const res = await fetchWithRetry(gdeltUrl.toString(), { next: { revalidate: revalidateTime } });
    const resText = await res.text();

    if (res.status === 429) {
      throw { status: 429, message: 'GDelt API Rate Limited after retry' };
    }

    if (!res.ok) {
      console.error(`[PROXY] GDelt API returned ${res.status}: ${resText.slice(0, 500)}`);
      throw { status: res.status, message: `API returned ${res.status}: ${resText.slice(0, 100)}` };
    }
    
    let gdeltData;
    try {
      gdeltData = JSON.parse(resText);
    } catch {
      console.error(`[PROXY] Failed to parse GDelt JSON. Raw response: ${resText.slice(0, 500)}`);
      throw { status: 500, message: 'Invalid JSON response from GDELT' };
    }

    let finalData = gdeltData;

    if (finalData.articles && Array.isArray(finalData.articles)) {
      finalData.articles = (finalData.articles as { language?: string }[]).filter((a) => 
        !a.language || a.language.toLowerCase() === 'english'
      ).slice(0, 15); 
    }

    if (finalData.articles && Array.isArray(finalData.articles)) {
      console.log(`[PROXY] Scraping Open Graph snippets for ${finalData.articles.length} articles...`);
      
      const enrichedArticles = await Promise.all(
        finalData.articles.map(async (item: unknown) => {
          const article = item as { url?: unknown; snippet?: string; [key: string]: unknown; language?: string };
          if (!article || typeof article.url !== 'string') return article;
          try {
            const articleRes = await fetch(article.url, {
              headers: { 'User-Agent': 'Twitterbot/1.0' },
              signal: AbortSignal.timeout(5000),
              next: { revalidate: revalidateTime }
            });
            if (articleRes.ok) {
              const html = await articleRes.text();
              const $ = cheerio.load(html);
              let snippet = $('meta[property="og:description"]').attr('content') || 
                            $('meta[name="description"]').attr('content') || '';
                            
              if (!snippet) {
                snippet = $('meta[name="twitter:description"]').attr('content') || '';
              }
              article.snippet = snippet;
            }
          } catch {
            console.log(`[PROXY] Failed to scrape snippet for ${article.url}`);
          }
          return article;
        })
      );
      finalData = { ...finalData, articles: enrichedArticles };
    }

    if (useLocalJsonCache) {
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(cacheFile, JSON.stringify(finalData, null, 2));
      console.log(`[PROXY] Successfully cached GDelt data to ${cacheFileName}`);
    }

    return NextResponse.json(finalData);
  } catch (error: unknown) {
    let errorMessage = 'Unknown error';
    let statusCode = 500;

    const errorObj = error as Record<string, unknown>;
    const cause = errorObj.cause ? JSON.stringify(errorObj.cause) : 'No cause';

    if (typeof error === 'object' && error !== null) {
      if ('message' in errorObj) errorMessage = errorObj.message as string;
      if ('status' in errorObj) statusCode = errorObj.status as number;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    console.error(`[PROXY] GDelt Error:`, errorMessage, `Cause:`, cause);
    return NextResponse.json({ error: errorMessage, cause }, { status: statusCode });
  }
}
