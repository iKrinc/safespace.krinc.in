/**
 * Preview API Route
 * Fetches page HTML, inlines CSS (parallel fetch with per-file timeout),
 * and injects a <base> tag for remaining relative resource resolution.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchWithProxy } from '@/lib/proxyFetch';
import { withRateLimit } from '@/lib/rateLimit';

const PreviewRequestSchema = z.object({
  url: z.string().min(1, 'URL is required').max(2000, 'URL too long'),
});

async function fetchCSS(cssUrl: string, baseDomain: string): Promise<string> {
  const absolute = cssUrl.startsWith('http')
    ? cssUrl
    : cssUrl.startsWith('//')
      ? `https:${cssUrl}`
      : cssUrl.startsWith('/')
        ? `${baseDomain}${cssUrl}`
        : `${baseDomain}/${cssUrl}`;

  try {
    // 4s per CSS file — short enough not to block, long enough to succeed
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(absolute, {
      headers: { 'User-Agent': 'SafeSpace Analyzer (https://safespace.krinc.in)' },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!resp.ok) return '';
    const css = await resp.text();

    // Rewrite relative url() references inside the CSS to absolute
    return css.replace(/url\(["']?([^"')]+)["']?\)/gi, (match, u) => {
      if (u.startsWith('data:') || u.startsWith('http') || u.startsWith('//')) return match;
      const abs = u.startsWith('/') ? `${baseDomain}${u}` : `${baseDomain}/${u}`;
      return `url("${abs}")`;
    });
  } catch {
    return '';
  }
}

async function processHTMLContent(html: string, baseUrl: string): Promise<string> {
  try {
    const url = new URL(baseUrl);
    const baseDomain = `${url.protocol}//${url.host}`;

    // Inject <base> tag for anything we don't inline (images, scripts, etc.)
    const baseTag = `<base href="${baseDomain}/" target="_self">`;
    let processed = html;

    if (!html.toLowerCase().includes('<base')) {
      const headEnd = html.toLowerCase().indexOf('</head>');
      processed =
        headEnd !== -1
          ? html.slice(0, headEnd) + baseTag + html.slice(headEnd)
          : baseTag + html;
    }

    // Collect all external CSS link hrefs
    const cssLinkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    const cssUrls: Array<{ match: string; href: string }> = [];
    let m: RegExpExecArray | null;
    while ((m = cssLinkRegex.exec(processed)) !== null) {
      cssUrls.push({ match: m[0], href: m[1] });
    }

    // Fetch all CSS files in parallel
    const cssContents = await Promise.all(
      cssUrls.map(({ href }) => fetchCSS(href, baseDomain))
    );

    // Remove <link> tags for CSS files we successfully fetched
    for (let i = 0; i < cssUrls.length; i++) {
      if (cssContents[i]) {
        processed = processed.replace(cssUrls[i].match, '');
      }
    }

    // Collect inline <style> blocks
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    const inlineStyles: string[] = [];
    let sm: RegExpExecArray | null;
    while ((sm = styleRegex.exec(processed)) !== null) {
      inlineStyles.push(sm[1]);
    }
    processed = processed.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Build combined CSS
    const allCSS = [
      ...cssContents.filter(Boolean),
      ...inlineStyles,
    ].join('\n\n');

    if (allCSS) {
      const styleTag = `<style>\n${allCSS}\n</style>`;
      const headInsert = processed.toLowerCase().indexOf('</head>');
      processed =
        headInsert !== -1
          ? processed.slice(0, headInsert) + styleTag + processed.slice(headInsert)
          : styleTag + processed;
    }

    return processed;
  } catch {
    return html;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = withRateLimit(request, {
      maxRequests: 15,
      interval: 60000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many preview requests. Please try again in ${Math.ceil(
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

    const body = await Promise.race([
      request.json(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request body timeout')), 5000)),
    ]);

    const validationResult = PreviewRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', message: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { url } = validationResult.data;

    let normalizedUrl: string;
    try {
      normalizedUrl = url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url}`;
      const parsed = new URL(normalizedUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const html = await Promise.race([
      fetchWithProxy(url),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Preview fetch timeout')), 12000)
      ),
    ]);

    const processedHtml = await processHTMLContent(html, normalizedUrl);

    const sizeInMB = processedHtml.length / 1024 / 1024;
    if (sizeInMB > 5) {
      return NextResponse.json(
        { error: `Page too large for preview: ${sizeInMB.toFixed(2)}MB (max 5MB)` },
        { status: 413 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        url,
        content: processedHtml,
        size: processedHtml.length,
        sizeFormatted: `${(processedHtml.length / 1024).toFixed(1)}KB`,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Preview fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch page preview',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Use POST method' },
    { status: 405 }
  );
}
