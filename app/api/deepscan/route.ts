/**
 * /api/deepscan
 * Fetches the target page, extracts inline + linked JS, runs static analysis.
 * Returns findings without calling AI (base /api/analyze already covers that).
 */

import { NextRequest, NextResponse } from 'next/server';
import { isBlockedHost } from '@/lib/proxyFetch';
import { analyzeScripts, calcOverallRisk, ScriptFinding, OverallRisk } from '@/lib/deepScanner';
import { withRateLimit } from '@/lib/rateLimit';

const MAX_HTML_BYTES = 512 * 1024;  // 512 KB
const MAX_JS_BYTES   = 200 * 1024;  // 200 KB per file
const MAX_JS_FILES   = 6;
const HTML_TIMEOUT   = 10_000;      // 10 s
const JS_TIMEOUT     = 4_000;       // 4 s per file

export interface DeepScanResponse {
  htmlSize: number;
  scriptCount: number;
  fetchedJsFiles: number;
  findings: ScriptFinding[];
  overallRisk: OverallRisk;
  fetchError?: string;
}

async function timedFetch(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'SafeSpace-DeepScanner/1.0 (https://safespace.krinc.in)',
        Accept: 'text/html,application/xhtml+xml,application/javascript,*/*',
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: NextRequest) {
  const rateLimit = withRateLimit(req, { maxRequests: 10, interval: 60_000 });
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  const { url } = await req.json().catch(() => ({}));
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url required' }, { status: 400 });
  }

  let parsed: URL;
  try { parsed = new URL(url); }
  catch { return NextResponse.json({ error: 'invalid url' }, { status: 400 }); }

  if (isBlockedHost(parsed.hostname)) {
    return NextResponse.json({ error: 'blocked host' }, { status: 403 });
  }

  const scripts: string[] = [];
  let htmlSize = 0;
  let fetchedJsFiles = 0;
  let fetchError: string | undefined;

  try {
    // ── 1. Fetch HTML ─────────────────────────────────────────────────────
    const resp = await timedFetch(url, HTML_TIMEOUT);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const buf  = await resp.arrayBuffer();
    htmlSize   = buf.byteLength;
    const html = new TextDecoder().decode(buf.slice(0, MAX_HTML_BYTES));

    // ── 2. Extract inline scripts ─────────────────────────────────────────
    const inlineRe = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
    let m: RegExpExecArray | null;
    while ((m = inlineRe.exec(html)) !== null) {
      const src = m[1].trim();
      if (src) scripts.push(src);
    }

    // ── 3. Collect external script src URLs ───────────────────────────────
    const srcRe  = /<script[^>]+src\s*=\s*['"]([^'"]+)['"]/gi;
    const jsURLs: string[] = [];
    while ((m = srcRe.exec(html)) !== null) {
      try {
        const abs = new URL(m[1], url).href;
        if (abs.startsWith('http')) jsURLs.push(abs);
      } catch { /* ignore relative or malformed */ }
    }

    // ── 4. Fetch JS files in parallel (limited) ───────────────────────────
    const toFetch = jsURLs.slice(0, MAX_JS_FILES);
    const results = await Promise.allSettled(
      toFetch.map(async (jsUrl) => {
        try {
          const r = await timedFetch(jsUrl, JS_TIMEOUT);
          if (!r.ok) return '';
          const bytes = await r.arrayBuffer();
          if (bytes.byteLength > MAX_JS_BYTES) return '';
          fetchedJsFiles++;
          return new TextDecoder().decode(bytes);
        } catch { return ''; }
      })
    );
    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value) scripts.push(r.value);
    });

  } catch (err) {
    fetchError = err instanceof Error ? err.message : 'fetch failed';
  }

  const findings    = analyzeScripts(scripts);
  const overallRisk = calcOverallRisk(findings);

  return NextResponse.json({
    htmlSize,
    scriptCount: scripts.length,
    fetchedJsFiles,
    findings,
    overallRisk,
    fetchError,
  } satisfies DeepScanResponse);
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST' }, { status: 405 });
}
