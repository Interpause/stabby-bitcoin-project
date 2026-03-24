import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  const isMockMode = process.env.NEXT_USE_MOCK === 'true';
  const isDev = process.env.NODE_ENV === 'development';
  const useLocalJsonCache = isMockMode && isDev;
  const revalidateTime = isMockMode ? 31536000 : 3600;
  const urlHash = crypto.createHash('md5').update(targetUrl).digest('hex');
  const cacheDir = path.join(process.cwd(), 'lib/mock/cache/opengraph');
  const cacheFile = path.join(cacheDir, `${urlHash}.json`);

  // Simple file cache (for mock mode or general caching depending on requirement, user asked to "please cache this")
  if (useLocalJsonCache) {
    try {
      const cachedData = await fs.readFile(cacheFile, 'utf-8');
      console.log(`[PROXY] Serving cached OpenGraph for ${targetUrl}`);
      return NextResponse.json(JSON.parse(cachedData));
    } catch {
      console.log(`[PROXY] Cache miss for OpenGraph ${targetUrl}`);
    }
  }

  try {
    const microlinkUrl = `https://api.microlink.io?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(microlinkUrl, {
      signal: AbortSignal.timeout(10000),
      // Adding next.js standard fetch cache to avoid rapid hits globally (1 year for permanent caching if mock mode)
      next: { revalidate: revalidateTime } 
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch URL: ${res.status}`);
    }

    const json = await res.json();
    const { status, data } = json;

    if (status !== 'success' || !data) {
      throw new Error('Microlink failed to parse data properly');
    }

    let domain = data.publisher || '';
    if (!domain) {
      try {
        domain = new URL(targetUrl).hostname.replace('www.', '');
      } catch (e) {
        // ignore
      }
    }

    const previewData = {
      url: targetUrl,
      title: data.title || '',
      snippet: data.description || '',
      socialimage: data.image?.url || data.logo?.url || '',
      domain,
    };

    if (useLocalJsonCache) {
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(cacheFile, JSON.stringify(previewData, null, 2));
      console.log(`[PROXY] Cached OpenGraph for ${targetUrl} as ${urlHash}.json`);
    }

    return NextResponse.json(previewData);
  } catch (error: any) {
    console.error(`[PROXY] Failed to extract OpenGraph for ${targetUrl}:`, error.message);
    return NextResponse.json({ 
      error: 'Failed to extract OpenGraph',
      url: targetUrl,
      // fallback so the UI handles it gracefully
      title: targetUrl,
      domain: (() => {
        try { return new URL(targetUrl).hostname.replace('www.', '') } catch { return 'unknown' }
      })()
    }, { status: 200 }); // Return 200 with fallback data so UI doesn't break
  }
}
