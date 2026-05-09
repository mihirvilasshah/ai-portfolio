/**
 * Unit Tests for Rate Limiting Module
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isRateLimited,
  RATE_LIMITS,
  getRateLimitStatus,
  resetRateLimit,
} from "@/lib/rate-limit";

describe("Rate Limiting", () => {
  beforeEach(() => {
    // Reset rate limits before each test
    resetRateLimit("test-client");
    resetRateLimit("test-client-2");
  });

  describe("isRateLimited", () => {
    it("should allow requests under the limit", () => {
      const result = isRateLimited("test-client", "/api/test", {
        windowMs: 60000,
        maxRequests: 10,
      });

      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(9);
    });

    it("should track request count correctly", () => {
      const config = { windowMs: 60000, maxRequests: 5 };

      for (let i = 0; i < 4; i++) {
        isRateLimited("test-client", "/api/test", config);
      }

      const result = isRateLimited("test-client", "/api/test", config);
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should block requests over the limit", () => {
      const config = { windowMs: 60000, maxRequests: 3 };

      // Make 3 requests (hitting the limit)
      for (let i = 0; i < 3; i++) {
        isRateLimited("test-client", "/api/test", config);
      }

      // 4th request should be blocked
      const result = isRateLimited("test-client", "/api/test", config);
      expect(result.limited).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it("should track different endpoints separately", () => {
      const config = { windowMs: 60000, maxRequests: 2 };

      // Hit limit on endpoint A
      isRateLimited("test-client", "/api/endpointA", config);
      isRateLimited("test-client", "/api/endpointA", config);
      const resultA = isRateLimited("test-client", "/api/endpointA", config);

      // Endpoint B should still work
      const resultB = isRateLimited("test-client", "/api/endpointB", config);

      expect(resultA.limited).toBe(true);
      expect(resultB.limited).toBe(false);
    });

    it("should track different clients separately", () => {
      const config = { windowMs: 60000, maxRequests: 2 };

      // Hit limit for client 1
      isRateLimited("test-client", "/api/test", config);
      isRateLimited("test-client", "/api/test", config);
      const result1 = isRateLimited("test-client", "/api/test", config);

      // Client 2 should still work
      const result2 = isRateLimited("test-client-2", "/api/test", config);

      expect(result1.limited).toBe(true);
      expect(result2.limited).toBe(false);
    });

    it("should provide reset time", () => {
      const config = { windowMs: 60000, maxRequests: 10 };

      const result = isRateLimited("test-client", "/api/test", config);

      expect(result.resetTime).toBeInstanceOf(Date);
      expect(result.resetTime.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("RATE_LIMITS presets", () => {
    it("should have default rate limit", () => {
      expect(RATE_LIMITS.default).toBeDefined();
      expect(RATE_LIMITS.default.windowMs).toBe(60000);
      expect(RATE_LIMITS.default.maxRequests).toBe(100);
    });

    it("should have quotes rate limit", () => {
      expect(RATE_LIMITS.quotes).toBeDefined();
      expect(RATE_LIMITS.quotes.maxRequests).toBe(60);
    });

    it("should have auth rate limit (more restrictive)", () => {
      expect(RATE_LIMITS.auth).toBeDefined();
      expect(RATE_LIMITS.auth.windowMs).toBe(300000); // 5 minutes
      expect(RATE_LIMITS.auth.maxRequests).toBe(20);
    });

    it("should have heavy operations rate limit", () => {
      expect(RATE_LIMITS.heavy).toBeDefined();
      expect(RATE_LIMITS.heavy.maxRequests).toBe(10);
    });

    it("should have search rate limit", () => {
      expect(RATE_LIMITS.search).toBeDefined();
      expect(RATE_LIMITS.search.maxRequests).toBe(30);
    });

    it("should have write operations rate limit", () => {
      expect(RATE_LIMITS.write).toBeDefined();
      expect(RATE_LIMITS.write.maxRequests).toBe(30);
    });
  });

  describe("getRateLimitStatus", () => {
    it("should return full limit for new client", () => {
      const status = getRateLimitStatus("new-client", "/api/test", RATE_LIMITS.default);

      expect(status.remaining).toBe(100);
      expect(status.total).toBe(100);
    });

    it("should reflect used requests", () => {
      const config = { windowMs: 60000, maxRequests: 10 };

      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        isRateLimited("test-client", "/api/test", config);
      }

      const status = getRateLimitStatus("test-client", "/api/test", config);

      expect(status.remaining).toBe(7);
      expect(status.total).toBe(10);
    });
  });

  describe("resetRateLimit", () => {
    it("should reset rate limit for specific endpoint", () => {
      const config = { windowMs: 60000, maxRequests: 2 };

      // Hit the limit
      isRateLimited("test-client", "/api/test", config);
      isRateLimited("test-client", "/api/test", config);

      // Reset
      resetRateLimit("test-client", "/api/test");

      // Should work again
      const result = isRateLimited("test-client", "/api/test", config);
      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(1);
    });

    it("should reset all endpoints for client when endpoint not specified", () => {
      const config = { windowMs: 60000, maxRequests: 2 };

      // Hit limits on multiple endpoints
      isRateLimited("test-client", "/api/a", config);
      isRateLimited("test-client", "/api/a", config);
      isRateLimited("test-client", "/api/b", config);
      isRateLimited("test-client", "/api/b", config);

      // Reset all for client
      resetRateLimit("test-client");

      // Both should work again
      const resultA = isRateLimited("test-client", "/api/a", config);
      const resultB = isRateLimited("test-client", "/api/b", config);

      expect(resultA.limited).toBe(false);
      expect(resultB.limited).toBe(false);
    });
  });
});
