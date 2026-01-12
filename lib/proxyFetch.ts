/**
 * Proxy fetch utility for bypassing CORS and WAF restrictions
 */

interface FetchResult {
  success: boolean;
  content?: string;
  error?: string;
  method: string;
  url: string;
}

async function tryFetch(url: string, useProxy: boolean = false): Promise<FetchResult> {
  try {
    const headers = {
      'User-Agent': 'SafeSpace Analyzer (https://safespace.krinc.in)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
    };

    let response: Response;
    let method: string;

    if (useProxy) {
      // For client-side proxy requests
      method = 'proxy';
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
    } else {
      // For server-side direct requests
      method = 'direct';
      response = await fetch(url, {
        method: 'GET',
        headers,
        redirect: 'follow',
      });
    }

    if (!response.ok) {
      return {
        success: false,
        error: `${method} fetch failed: HTTP ${response.status}: ${response.statusText}`,
        method,
        url,
      };
    }

    const html = await response.text();
    return {
      success: true,
      content: html,
      method,
      url,
    };
  } catch (error) {
    return {
      success: false,
      error: `${useProxy ? 'proxy' : 'direct'} fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      method: useProxy ? 'proxy' : 'direct',
      url,
    };
  }
}

export async function fetchWithProxy(url: string): Promise<string> {
  // Normalize URL and generate all possible variants
  let normalizedUrl: URL;
  try {
    normalizedUrl = new URL(url);
  } catch {
    throw new Error(`Invalid URL format: ${url}`);
  }

  // Generate all URL variants to try
  const variants: string[] = [];

  // If no protocol specified (like localhost:3000), try HTTPS first, then HTTP
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    variants.push(`https://${url}`, `http://${url}`);
  } else {
    // If protocol is specified, try the opposite protocol as fallback
    const oppositeProtocol = normalizedUrl.protocol === 'https:' ? 'http:' : 'https:';
    const oppositeUrl = url.replace(normalizedUrl.protocol, oppositeProtocol);
    variants.push(url, oppositeUrl);
  }

  // Try each URL variant with both direct and proxy methods
  const allAttempts: FetchResult[] = [];

  for (const variant of variants) {
    // Try direct fetch first (server-side)
    const directResult = await tryFetch(variant, false);
    allAttempts.push(directResult);

    if (directResult.success) {
      return directResult.content!;
    }

    // Try proxy fetch as fallback
    const proxyResult = await tryFetch(variant, true);
    allAttempts.push(proxyResult);

    if (proxyResult.success) {
      return proxyResult.content!;
    }
  }

  // All attempts failed, return detailed error
  const errorSummary = allAttempts
    .map((result) => `${result.method}(${result.url}): ${result.error}`)
    .join('; ');

  throw new Error(`All fetch attempts failed. Tried: ${errorSummary}`);
}

export async function checkContentAvailability(
  url: string
): Promise<{ available: boolean; error?: string; workingMethod?: string }> {
  try {
    await fetchWithProxy(url);
    return { available: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Extract working method from error message if available
    let workingMethod: string | undefined;
    if (errorMessage.includes('direct(')) {
      workingMethod = 'direct';
    } else if (errorMessage.includes('proxy(')) {
      workingMethod = 'proxy';
    }

    return {
      available: false,
      error: errorMessage,
      workingMethod,
    };
  }
}
