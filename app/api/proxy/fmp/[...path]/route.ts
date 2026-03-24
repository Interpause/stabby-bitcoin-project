import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FMP_BASE_URL = "https://financialmodelingprep.com";

// e.g. /api/proxy/fmp/stable/treasury-rates?from=2024-01-01&to=2024-02-01
// captures params.path as ['stable', 'treasury-rates']
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const isMockMode = process.env.NEXT_USE_MOCK === 'true';
  const revalidateTime = isMockMode ? 31536000 : 3600;
  const urlPath = resolvedParams.path.join("/");
  const url = new URL(req.url);

  // Reconstruct the search params
  const searchParams = new URLSearchParams(url.searchParams);
  
  // Create a unique cache filename based on path AND query params
  const paramString = Array.from(searchParams.entries())
    .map(([key, value]) => `${key}_${value}`)
    .join('_');
  const cacheDir = path.join(process.cwd(), 'lib/mock/cache/fmp');
  const cacheFileName = `${urlPath.replace(/\//g, '_')}${paramString ? `_${paramString}` : ''}.json`;
  const cacheFile = path.join(cacheDir, cacheFileName);

  if (isMockMode) {
    try {
      const cachedData = await fs.readFile(cacheFile, 'utf-8');
      console.log(`[PROXY] Serving cached data for /${urlPath} from ${cacheFileName}`);
      return NextResponse.json(JSON.parse(cachedData));
    } catch {
      console.log(`[PROXY] Cache miss for /${urlPath}, fetching real data...`);
    }
  }

  // Get API key from env
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FMP_API_KEY is not configured" }, { status: 500 });
  }

  // Append it for FMP
  searchParams.set("apikey", apiKey);

  const targetUrl = `${FMP_BASE_URL}/${urlPath}?${searchParams.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      // Forward useful headers if necessary, or just standard fetch
      headers: {
        "Accept": "application/json",
      },
      next: {
        revalidate: revalidateTime,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `FMP API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (isMockMode) {
      await fs.mkdir(cacheDir, { recursive: true });
      await fs.writeFile(cacheFile, JSON.stringify(data, null, 2));
      console.log(`[PROXY] Successfully cached data to ${cacheFileName}`);
    }
    
    // Add cache control if desired, though SWR handles client-side caching
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `public, s-maxage=${revalidateTime}, stale-while-revalidate=86400`,
      },
    });
  } catch (error) {
    console.error("FMP Proxy Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
