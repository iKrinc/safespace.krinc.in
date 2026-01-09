import { ScreenshotResponse } from '@/types';

// Browser instance singleton for Vercel serverless
let browserInstance: any = null;

export async function initBrowser() {
  // This would initialize Puppeteer in production
  // For now, we'll return null and handle screenshot generation differently
  return null;
}

export async function captureScreenshot(
  _url: string,
  _timeout: number = 10000
): Promise<ScreenshotResponse> {
  const timestamp = new Date().toISOString();

  try {
    // In production, this would use Puppeteer:
    // const browser = await initBrowser();
    // const page = await browser.newPage();
    // await page.goto(_url, { timeout: _timeout, waitUntil: 'networkidle0' });
    // const screenshot = await page.screenshot({ type: 'jpeg', quality: 80 });
    // await page.close();
    // return { success: true, screenshot: screenshot.toString('base64'), format: 'base64', timestamp };

    // For now, we'll return a placeholder response
    // This allows the app to work without Puppeteer installed
    return {
      success: false,
      error: 'Screenshot service not available - using iframe fallback',
      format: 'base64',
      timestamp,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to capture screenshot',
      format: 'base64',
      timestamp,
    };
  }
}

export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

// Helper function to validate URL before screenshot
export function canCaptureScreenshot(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
}
