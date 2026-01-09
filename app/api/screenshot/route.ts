import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  captureScreenshot,
  canCaptureScreenshot,
} from '@/lib/screenshotService';
import { withRateLimit } from '@/lib/rateLimit';

// Request validation schema
const ScreenshotRequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for screenshots)
    const rateLimitResult = withRateLimit(request, {
      maxRequests: 5, // Only 5 screenshots per minute
      interval: 60000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many screenshot requests. Please try again in ${Math.ceil(
            (rateLimitResult.reset - Date.now()) / 1000
          )} seconds.`,
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = ScreenshotRequestSchema.safeParse(body);

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

    // Check if URL can be captured
    if (!canCaptureScreenshot(url)) {
      return NextResponse.json(
        {
          error: 'Invalid URL',
          message: 'URL must use HTTP or HTTPS protocol',
        },
        { status: 400 }
      );
    }

    // Get screenshot timeout from env or use default
    const timeout = parseInt(
      process.env.SCREENSHOT_TIMEOUT || '10000',
      10
    );

    // Capture screenshot
    const result = await captureScreenshot(url, timeout);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
      },
    });
  } catch (error) {
    console.error('Error capturing screenshot:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to capture screenshot',
        format: 'base64' as const,
        timestamp: new Date().toISOString(),
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
