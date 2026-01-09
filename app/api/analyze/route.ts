import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { analyzeURL } from '@/lib/urlAnalyzer';
import { withRateLimit } from '@/lib/rateLimit';

// Request validation schema
const URLAnalysisRequestSchema = z.object({
  url: z.string().min(1, 'URL is required').max(2000, 'URL too long'),
});

export async function POST(request: NextRequest) {
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
          retryAfter: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
            'Retry-After': Math.ceil(
              (rateLimitResult.reset - Date.now()) / 1000
            ).toString(),
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

    const validationResult = URLAnalysisRequestSchema.safeParse(body);

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

    // Analyze URL with timeout
    const analysisPromise = analyzeURL(url);
    const analysisTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Analysis timeout')), 25000)
    );
    const analysis = await Promise.race([analysisPromise, analysisTimeoutPromise]);

    // Return analysis with rate limit headers
    return NextResponse.json(analysis, {
      status: 200,
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
      },
    });
  } catch (error) {
    console.error('Error analyzing URL:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An error occurred while analyzing the URL',
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
