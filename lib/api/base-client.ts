/**
 * Shared base client for all third-party API mutators.
 * Provides consistent error handling and fetch configuration.
 */

export interface CustomInstanceOptions {
  baseUrl?: string;
  headers?: HeadersInit;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function baseFetcher<T>(
  url: string,
  options: RequestInit & CustomInstanceOptions
): Promise<T> {
  const { baseUrl, params, ...fetchOptions } = options;

  // 1. Build Final URL
  // We need to be careful with trailing/leading slashes to prevent root-relative URL jumping
  const baseUrlWithSlash = baseUrl && !baseUrl.endsWith('/') ? `${baseUrl}/` : baseUrl;
  const relativeUrlWithoutSlash = url.startsWith('/') ? url.slice(1) : url;
  const fullUrl = new URL(relativeUrlWithoutSlash, baseUrlWithSlash || window.location.origin);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        fullUrl.searchParams.append(key, String(value));
      }
    });
  }

  // 2. Execute Fetch
  const response = await fetch(fullUrl.toString(), fetchOptions);

  // 3. Handle Errors
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: errorBody.message || `API Request failed with status ${response.status}`,
      data: errorBody,
    };
  }

  // 4. Parse Response
  const body = [204, 205, 304].includes(response.status) ? null : await response.json();
  
  return {
    data: body,
    status: response.status,
    headers: response.headers,
  } as T;
}
