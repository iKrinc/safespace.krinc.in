/**
 * CORS Proxy API Route
 * Fetches URLs server-side to bypass browser CORS restrictions and WAF/origin issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = withRateLimit(request);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${Math.ceil(
            (rateLimitResult.reset - Date.now()) / 1000
          )} seconds.`,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Get target URL from query params
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
    }

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Only allow http/https
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed' }, { status: 400 });
    }

    // Fetch the target URL with timeout and HTTP fallback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response: Response | null = null;
    let finalUrl = url;

    // Try HTTPS first, then HTTP if HTTPS fails
    const urlsToTry = [url];
    if (url.startsWith('https://')) {
      urlsToTry.push(url.replace('https://', 'http://'));
    }

    let lastError: Error | null = null;

    for (const attemptUrl of urlsToTry) {
      try {
        response = await fetch(attemptUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
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
          },
          redirect: 'follow',
        });

        if (response.ok) {
          finalUrl = attemptUrl;
          break; // Success, exit the loop
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // If this is the first attempt (HTTPS) and it failed, continue to HTTP
        if (attemptUrl === url && url.startsWith('https://')) {
          continue;
        }

        // If this was HTTP or the last attempt, break and throw the error
        break;
      }
    }

    clearTimeout(timeoutId);

    // Check if we got a successful response
    if (!response || !response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch: ${lastError?.message || 'Unknown error'}`,
          details: {
            url: finalUrl,
            status: response?.status,
            statusText: response?.statusText,
          },
        },
        { status: 500 }
      );
    }

    const html = await response!.text();

    // Check size limit (10MB)
    const sizeInMB = html.length / 1024 / 1024;
    if (sizeInMB > 10) {
      return NextResponse.json(
        { error: `Response too large: ${sizeInMB.toFixed(2)}MB (max 10MB)` },
        { status: 413 }
      );
    }

    // Return HTML with CORS headers
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store, must-revalidate',
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout (30 seconds)' }, { status: 408 });
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
