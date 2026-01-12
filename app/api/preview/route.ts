/**
 * Preview API Route
 * Uses the proxy to fetch and return page content for preview
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchWithProxy } from '@/lib/proxyFetch';
import { withRateLimit } from '@/lib/rateLimit';

// Request validation schema
const PreviewRequestSchema = z.object({
  url: z.string().min(1, 'URL is required').max(2000, 'URL too long'),
});

async function fetchCSSContent(cssUrl: string, baseDomain: string): Promise<string> {
  try {
    // Convert relative CSS URLs to absolute
    const absoluteCssUrl = cssUrl.startsWith('http')
      ? cssUrl
      : cssUrl.startsWith('/')
        ? `${baseDomain}${cssUrl}`
        : `${baseDomain}/${cssUrl}`;

    // Use proxy to fetch CSS content
    const cssContent = await fetchWithProxy(absoluteCssUrl);

    if (!cssContent) {
      console.warn(`Failed to fetch CSS via proxy: ${absoluteCssUrl}`);
      return '';
    }

    // Process CSS to convert all URLs to absolute URLs
    const processedCss = cssContent
      .replace(/url\(["']?([^"')]+)["']?\)/gi, (match, url) => {
        if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('//')) {
          const absoluteUrl = url.startsWith('/') ? `${baseDomain}${url}` : `${baseDomain}/${url}`;
          return `url("${absoluteUrl}")`;
        } else if (url.startsWith('http') || url.startsWith('//')) {
          // Keep absolute URLs as-is
          return `url("${url}")`;
        }
        return match;
      })
      .replace(/@import\s+url\(["']?([^"')]+)["']?\)/gi, (match, url) => {
        if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('//')) {
          const absoluteUrl = url.startsWith('/') ? `${baseDomain}${url}` : `${baseDomain}/${url}`;
          return `@import url("${absoluteUrl}")`;
        } else if (url.startsWith('http') || url.startsWith('//')) {
          // Keep absolute URLs as-is
          return `@import url("${url}")`;
        }
        return match;
      })
      .replace(/@import\s+["']([^"']+)["']\s*;/gi, (match, url) => {
        if (!url.startsWith('http') && !url.startsWith('data:') && !url.startsWith('//')) {
          const absoluteUrl = url.startsWith('/') ? `${baseDomain}${url}` : `${baseDomain}/${url}`;
          return `@import '${absoluteUrl}';`;
        } else if (url.startsWith('http') || url.startsWith('//')) {
          // Keep absolute URLs as-is
          return `@import '${url}';`;
        }
        return match;
      });

    return processedCss;
  } catch (error) {
    console.warn(`Error fetching CSS ${cssUrl}:`, error);
    return '';
  }
}

async function processHTMLContent(html: string, baseUrl: string): Promise<string> {
  try {
    const url = new URL(baseUrl);
    const baseDomain = `${url.protocol}//${url.host}`;

    // Add base tag to handle relative URLs (only if no existing base tag)
    const baseTag = `<base href="${baseDomain}/">`;
    const headEndIndex = html.toLowerCase().indexOf('</head>');
    const hasExistingBase = html.toLowerCase().includes('<base');

    let processedHtml = html;
    if (headEndIndex !== -1 && !hasExistingBase) {
      // Insert base tag before closing head tag only if no existing base tag
      processedHtml = html.slice(0, headEndIndex) + baseTag + html.slice(headEndIndex);
    } else if (!hasExistingBase) {
      // If no head tag, add base tag at the beginning
      processedHtml = baseTag + html;
    }

    // Extract and fetch CSS files
    const cssRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    const cssMatches = [...processedHtml.matchAll(cssRegex)];

    let combinedCSS = '';
    for (const match of cssMatches) {
      const cssUrl = match[1];
      const cssContent = await fetchCSSContent(cssUrl, baseDomain);
      if (cssContent) {
        combinedCSS += `/* CSS from: ${cssUrl} */\n${cssContent}\n\n`;
      }
      // Remove the original link tag to avoid duplicate loading
      processedHtml = processedHtml.replace(match[0], '');
    }

    // Extract inline style tags and preserve them
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    const styleMatches = [...processedHtml.matchAll(styleRegex)];
    for (const match of styleMatches) {
      combinedCSS += `/* Inline style */\n${match[1]}\n\n`;
    }

    // Remove all original style tags
    processedHtml = processedHtml.replace(styleRegex, '');

    // Add combined CSS in a single style tag in head
    if (combinedCSS) {
      const combinedStyleTag = `<style>\n/* Combined CSS from original website */\n${combinedCSS}</style>`;
      const headInsertPoint = processedHtml.toLowerCase().indexOf('</head>');
      if (headInsertPoint !== -1) {
        processedHtml =
          processedHtml.slice(0, headInsertPoint) +
          combinedStyleTag +
          processedHtml.slice(headInsertPoint);
      } else {
        processedHtml = combinedStyleTag + processedHtml;
      }
    }

    // Process all image-related attributes and tags
    processedHtml = processedHtml.replace(/<img([^>]*)>/gi, (_match, imgAttributes) => {
      let processedAttributes = imgAttributes;

      // Process src attribute
      processedAttributes = processedAttributes.replace(
        /\ssrc=["']([^"']+)["']/gi,
        (srcMatch: any, src: string) => {
          if (!src.startsWith('data:') && !src.startsWith('http') && !src.startsWith('https')) {
            // Only convert relative URLs to absolute URLs
            const absoluteUrl = src.startsWith('/')
              ? `${baseDomain}${src}`
              : `${baseDomain}/${src}`;
            return ` src="${absoluteUrl}"`;
          }
          return srcMatch;
        }
      );

      // Process srcset attribute
      processedAttributes = processedAttributes.replace(
        /\ssrcset=["']([^"']+)["']/gi,
        (_srcsetMatch: any, srcset: string) => {
          const processedSrcset = srcset
            .split(',')
            .map((srcsetItem: string) => {
              const trimmed = srcsetItem.trim();
              const url = trimmed.split(/\s+/)[0];
              const descriptor = trimmed.split(/\s+/).slice(1).join(' ');

              if (!url.startsWith('data:') && !url.startsWith('http') && !url.startsWith('https')) {
                // Only convert relative URLs to absolute URLs
                const absoluteUrl = url.startsWith('/')
                  ? `${baseDomain}${url}`
                  : `${baseDomain}/${url}`;
                return descriptor ? `${absoluteUrl} ${descriptor}` : absoluteUrl;
              }
              return trimmed;
            })
            .join(', ');

          return ` srcset="${processedSrcset}"`;
        }
      );

      // Process other image attributes that might contain URLs
      ['data-src', 'data-srcset', 'poster', 'data-poster'].forEach((attr) => {
        processedAttributes = processedAttributes.replace(
          new RegExp(`\\s${attr}=["']([^"']+)["']`, 'gi'),
          (attrMatch: any, value: string) => {
            if (
              !value.startsWith('data:') &&
              !value.startsWith('http') &&
              !value.startsWith('https')
            ) {
              // Only convert relative URLs to absolute URLs
              const absoluteUrl = value.startsWith('/')
                ? `${baseDomain}${value}`
                : `${baseDomain}/${value}`;
              return ` ${attr}="${absoluteUrl}"`;
            }
            return attrMatch;
          }
        );
      });

      return `<img${processedAttributes}>`;
    });

    // Process source tags within picture elements
    processedHtml = processedHtml.replace(/<source([^>]*)>/gi, (_match, sourceAttributes) => {
      let processedAttributes = sourceAttributes;

      // Process srcset attribute in source tags
      processedAttributes = processedAttributes.replace(
        /\ssrcset=["']([^"']+)["']/gi,
        (_srcsetMatch: any, srcset: string) => {
          const processedSrcset = srcset
            .split(',')
            .map((srcsetItem: string) => {
              const trimmed = srcsetItem.trim();
              const url = trimmed.split(/\s+/)[0];
              const descriptor = trimmed.split(/\s+/).slice(1).join(' ');

              if (!url.startsWith('data:') && !url.startsWith('http') && !url.startsWith('https')) {
                // Only convert relative URLs to absolute URLs
                const absoluteUrl = url.startsWith('/')
                  ? `${baseDomain}${url}`
                  : `${baseDomain}/${url}`;
                return descriptor ? `${absoluteUrl} ${descriptor}` : absoluteUrl;
              }
              return trimmed;
            })
            .join(', ');

          return ` srcset="${processedSrcset}"`;
        }
      );

      // Process src attribute in source tags
      processedAttributes = processedAttributes.replace(
        /\ssrc=["']([^"']+)["']/gi,
        (srcMatch: any, src: string) => {
          if (!src.startsWith('data:') && !src.startsWith('http') && !src.startsWith('https')) {
            // Only convert relative URLs to absolute URLs
            const absoluteUrl = src.startsWith('/')
              ? `${baseDomain}${src}`
              : `${baseDomain}/${src}`;
            return ` src="${absoluteUrl}"`;
          }
          return srcMatch;
        }
      );

      return `<source${processedAttributes}>`;
    });

    // Process video poster attributes
    processedHtml = processedHtml.replace(/<video([^>]*)>/gi, (_match, videoAttributes) => {
      let processedAttributes = videoAttributes;

      processedAttributes = processedAttributes.replace(
        /\sposter=["']([^"']+)["']/gi,
        (posterMatch: any, poster: string) => {
          if (
            !poster.startsWith('data:') &&
            !poster.startsWith('http') &&
            !poster.startsWith('https')
          ) {
            // Only convert relative URLs to absolute URLs
            const absoluteUrl = poster.startsWith('/')
              ? `${baseDomain}${poster}`
              : `${baseDomain}/${poster}`;
            return ` poster="${absoluteUrl}"`;
          }
          return posterMatch;
        }
      );

      return `<video${processedAttributes}>`;
    });

    // Process relative URLs in other common attributes (but skip if already absolute)
    ['href', 'src', 'action', 'data-src', 'data-href'].forEach((attr) => {
      const regex = new RegExp(`([\\s\\w]+${attr})=["']([^"']+)["']`, 'gi');
      processedHtml = processedHtml.replace(regex, (match, beforeAttr, value) => {
        if (
          value &&
          !value.startsWith('data:') &&
          !value.startsWith('//') &&
          !value.startsWith('#') &&
          !value.startsWith('http') &&
          !value.startsWith('https')
        ) {
          const absoluteUrl = value.startsWith('/')
            ? `${baseDomain}${value}`
            : `${baseDomain}/${value}`;
          return `${beforeAttr}="${absoluteUrl}"`;
        }
        return match;
      });
    });

    return processedHtml;
  } catch (error) {
    // If URL parsing fails, return original HTML
    console.error('Error processing HTML:', error);
    return html;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = withRateLimit(request, {
      maxRequests: 15, // 15 preview requests per minute
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

    // Parse and validate request body with timeout
    const bodyPromise = request.json();
    const bodyTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request body timeout')), 5000)
    );
    const body = await Promise.race([bodyPromise, bodyTimeoutPromise]);

    const validationResult = PreviewRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: validationResult.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { url } = validationResult.data;

    // Validate URL format and handle protocol-less URLs
    let targetUrl: URL;
    let normalizedUrl = url;

    try {
      // Handle protocol-less URLs (like localhost:3000)
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        normalizedUrl = `https://${url}`;
      }
      targetUrl = new URL(normalizedUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Only allow http/https
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed' }, { status: 400 });
    }

    // Fetch content using proxy
    const html = await fetchWithProxy(url);

    // Process HTML to fix relative URLs and add base tag
    const processedHtml = await processHTMLContent(html, normalizedUrl);

    // Check size limit (5MB for preview to be more responsive)
    const sizeInMB = processedHtml.length / 1024 / 1024;
    if (sizeInMB > 5) {
      return NextResponse.json(
        {
          error: `Page too large for preview: ${sizeInMB.toFixed(2)}MB (max 5MB)`,
          canProxy: true,
        },
        { status: 413 }
      );
    }

    // Return preview data
    return NextResponse.json(
      {
        success: true,
        url: url, // Use original URL for response
        content: processedHtml,
        size: processedHtml.length,
        sizeFormatted: `${(processedHtml.length / 1024).toFixed(2)}KB`,
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
    console.error('Error fetching preview:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch page preview',
        details: error instanceof Error ? error.message : 'Unknown error',
        canProxy: true,
      },
      { status: 500 }
    );
  }
}

// Return 405 for non-POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed', message: 'Use POST method' },
    { status: 405 }
  );
}
