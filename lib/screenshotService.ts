import { ScreenshotResponse } from '@/types';

/**
 * Screenshot service for SafeSpace
 *
 * Currently returns success: false to use iframe fallback.
 * Iframe preview provides better UX (live, interactive, instant).
 *
 * To enable Puppeteer screenshots:
 * 1. npm install puppeteer-core @sparticuz/chromium
 * 2. Implement browser automation in captureScreenshot()
 * 3. Configure for serverless (Vercel/AWS Lambda)
 */

export async function captureScreenshot(
  _url: string,
  _timeout: number = 10000
): Promise<ScreenshotResponse> {
  const timestamp = new Date().toISOString();

  // Return success: false to trigger iframe fallback
  // This is intentional - iframe provides better preview experience
  return {
    success: false,
    error: 'Screenshot service disabled - using iframe preview',
    format: 'base64',
    timestamp,
  };
}

export function canCaptureScreenshot(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}
