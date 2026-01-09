import { LRUCache } from 'lru-cache';
import { RateLimitResult } from '@/types';

interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per interval
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Create LRU cache for rate limiting
// Stores IP address -> { count, resetTime }
const rateLimitCache = new LRUCache<string, RateLimitEntry>({
  max: 500, // Store up to 500 IPs
  ttl: 60000, // 1 minute TTL
});

const defaultOptions: RateLimitOptions = {
  interval: 60000, // 1 minute
  maxRequests: 10, // 10 requests per minute
};

export function rateLimit(
  identifier: string,
  options: Partial<RateLimitOptions> = {}
): RateLimitResult {
  const { interval, maxRequests } = { ...defaultOptions, ...options };
  const now = Date.now();

  // Get current entry or create new one
  let entry = rateLimitCache.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry if none exists or if reset time passed
    entry = {
      count: 1,
      resetTime: now + interval,
    };
    rateLimitCache.set(identifier, entry);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  rateLimitCache.set(identifier, entry);

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - entry.count,
    reset: entry.resetTime,
  };
}

// Helper to get client IP from request
export function getClientIP(request: Request): string {
  // Try various headers for client IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback to a default identifier
  return 'unknown';
}

// Middleware-style function for Next.js API routes
export function withRateLimit(
  request: Request,
  options?: Partial<RateLimitOptions>
): RateLimitResult {
  const clientIP = getClientIP(request);
  return rateLimit(clientIP, options);
}
