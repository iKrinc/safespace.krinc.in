/**
 * Proxy fetch utility for bypassing CORS restrictions during preview.
 * Includes SSRF protection to block requests to private/internal networks.
 */

interface FetchResult {
  success: boolean;
  content?: string;
  error?: string;
  method: string;
  url: string;
}

/**
 * SSRF protection: block private IPs, localhost, link-local, and .local domains.
 */
export function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '::1' ||
    h === '0.0.0.0' ||
    h.endsWith('.local') ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(h) ||
    /^169\.254\./.test(h) || // link-local
    /^fc00:/i.test(h) || // IPv6 unique local
    /^fe80:/i.test(h) // IPv6 link-local
  );
}

async function tryFetch(url: string, useProxy: boolean = false): Promise<FetchResult> {
  // SSRF protection
  try {
    const parsed = new URL(url);
    if (isBlockedHost(parsed.hostname)) {
      return {
        success: false,
        error: 'blocked: private or internal URL',
        method: useProxy ? 'proxy' : 'direct',
        url,
      };
    }
  } catch {
    return {
      success: false,
      error: 'invalid URL format',
      method: useProxy ? 'proxy' : 'direct',
      url,
    };
  }

  // Abort after 8 seconds per attempt
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

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
      method = 'proxy';
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      response = await fetch(proxyUrl, {
        method: 'GET',
        headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
        signal: controller.signal,
      });
    } else {
      method = 'direct';
      response = await fetch(url, {
        method: 'GET',
        headers,
        redirect: 'follow',
        signal: controller.signal,
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
    return { success: true, content: html, method, url };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `${useProxy ? 'proxy' : 'direct'} fetch error: ${msg}`,
      method: useProxy ? 'proxy' : 'direct',
      url,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchWithProxy(url: string): Promise<string> {
  let normalizedUrl: URL;
  try {
    normalizedUrl = new URL(url);
  } catch {
    throw new Error(`Invalid URL format: ${url}`);
  }

  // SSRF check before attempting fetch
  if (isBlockedHost(normalizedUrl.hostname)) {
    throw new Error('Blocked: private or internal URL not allowed');
  }

  // Generate URL variants (original + opposite protocol)
  const variants: string[] = [];
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    variants.push(`https://${url}`, `http://${url}`);
  } else {
    const opposite = normalizedUrl.protocol === 'https:' ? 'http:' : 'https:';
    variants.push(url, url.replace(normalizedUrl.protocol, opposite));
  }

  const allAttempts: FetchResult[] = [];

  for (const variant of variants) {
    const directResult = await tryFetch(variant, false);
    allAttempts.push(directResult);
    if (directResult.success) return directResult.content!;

    const proxyResult = await tryFetch(variant, true);
    allAttempts.push(proxyResult);
    if (proxyResult.success) return proxyResult.content!;
  }

  const errorSummary = allAttempts
    .map((r) => `${r.method}(${r.url}): ${r.error}`)
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
    const workingMethod = errorMessage.includes('direct(')
      ? 'direct'
      : errorMessage.includes('proxy(')
        ? 'proxy'
        : undefined;
    return { available: false, error: errorMessage, workingMethod };
  }
}
