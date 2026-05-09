/**
 * Rate Limiting Middleware
 * In-memory rate limiter with sliding window algorithm
 * For production, consider using Redis-based rate limiting
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  message?: string;      // Custom error message
}

// Store for tracking requests (in-memory)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
  lastCleanup = now;
}

// Default rate limits by endpoint type
export const RATE_LIMITS = {
  // General API calls
  default: {
    windowMs: 60000,    // 1 minute
    maxRequests: 100,   // 100 requests per minute
  },
  // Quote/market data endpoints
  quotes: {
    windowMs: 60000,
    maxRequests: 60,    // 60 requests per minute (1 per second)
  },
  // Search endpoints
  search: {
    windowMs: 60000,
    maxRequests: 30,    // 30 requests per minute
  },
  // Auth endpoints (more restrictive)
  auth: {
    windowMs: 300000,   // 5 minutes
    maxRequests: 20,    // 20 attempts per 5 minutes
  },
  // Write operations (create, update, delete)
  write: {
    windowMs: 60000,
    maxRequests: 30,    // 30 writes per minute
  },
  // Heavy operations (screener, batch)
  heavy: {
    windowMs: 60000,
    maxRequests: 10,    // 10 heavy operations per minute
  },
} as const;

/**
 * Get client identifier from request
 * Uses IP address or session ID
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a header that might contain user ID
  const userId = request.headers.get("x-user-id");
  if (userId) {
    return `user:${userId}`;
  }
  
  // Default fallback
  return "anonymous";
}

/**
 * Check if request is rate limited
 */
export function isRateLimited(
  clientId: string,
  endpoint: string,
  config: RateLimitConfig
): { limited: boolean; remaining: number; resetTime: Date } {
  cleanupExpiredEntries();
  
  const key = `${clientId}:${endpoint}`;
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Create new entry if doesn't exist or expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
    
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetTime: new Date(entry.resetTime),
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetTime: new Date(entry.resetTime),
    };
  }
  
  // Increment counter
  entry.count++;
  
  return {
    limited: false,
    remaining: config.maxRequests - entry.count,
    resetTime: new Date(entry.resetTime),
  };
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  config: RateLimitConfig = RATE_LIMITS.default
) {
  return function rateLimit(
    handler: (request: NextRequest) => Promise<NextResponse>
  ) {
    return async function rateLimitedHandler(
      request: NextRequest
    ): Promise<NextResponse> {
      const clientId = getClientId(request);
      const endpoint = new URL(request.url).pathname;
      
      const { limited, remaining, resetTime } = isRateLimited(
        clientId,
        endpoint,
        config
      );
      
      // Add rate limit headers to response
      const addRateLimitHeaders = (response: NextResponse) => {
        response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
        response.headers.set("X-RateLimit-Remaining", remaining.toString());
        response.headers.set("X-RateLimit-Reset", resetTime.toISOString());
        return response;
      };
      
      if (limited) {
        const response = NextResponse.json(
          {
            error: "Too Many Requests",
            message: config.message || "Rate limit exceeded. Please try again later.",
            statusCode: 429,
            retryAfter: Math.ceil((resetTime.getTime() - Date.now()) / 1000),
          },
          { status: 429 }
        );
        
        response.headers.set("Retry-After", Math.ceil((resetTime.getTime() - Date.now()) / 1000).toString());
        
        return addRateLimitHeaders(response);
      }
      
      const response = await handler(request);
      return addRateLimitHeaders(response);
    };
  };
}

/**
 * Simple rate limit check function for use in API routes
 */
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.default
): NextResponse | null {
  const clientId = getClientId(request);
  const endpoint = new URL(request.url).pathname;
  
  const { limited, remaining, resetTime } = isRateLimited(
    clientId,
    endpoint,
    config
  );
  
  if (limited) {
    const response = NextResponse.json(
      {
        error: "Too Many Requests",
        message: config.message || "Rate limit exceeded. Please try again later.",
        statusCode: 429,
        retryAfter: Math.ceil((resetTime.getTime() - Date.now()) / 1000),
      },
      { status: 429 }
    );
    
    response.headers.set("X-RateLimit-Limit", config.maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", resetTime.toISOString());
    response.headers.set("Retry-After", Math.ceil((resetTime.getTime() - Date.now()) / 1000).toString());
    
    return response;
  }
  
  return null; // Not rate limited
}

/**
 * Get current rate limit status for a client/endpoint
 */
export function getRateLimitStatus(
  clientId: string,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMITS.default
): { remaining: number; resetTime: Date; total: number } {
  const key = `${clientId}:${endpoint}`;
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < Date.now()) {
    return {
      remaining: config.maxRequests,
      resetTime: new Date(Date.now() + config.windowMs),
      total: config.maxRequests,
    };
  }
  
  return {
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: new Date(entry.resetTime),
    total: config.maxRequests,
  };
}

/**
 * Reset rate limit for a specific client/endpoint
 */
export function resetRateLimit(clientId: string, endpoint?: string): void {
  if (endpoint) {
    rateLimitStore.delete(`${clientId}:${endpoint}`);
  } else {
    // Reset all entries for this client
    for (const key of rateLimitStore.keys()) {
      if (key.startsWith(`${clientId}:`)) {
        rateLimitStore.delete(key);
      }
    }
  }
}
