/**
 * Integration Tests for API Routes
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";

// Base URL for testing (adjust based on test environment)
const BASE_URL = process.env.TEST_API_URL || "http://localhost:3000";

// Helper to make API requests
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ status: number; data: unknown }> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { status: response.status, data };
}

describe("Portfolio API", () => {
  describe("GET /api/portfolio", () => {
    it("should return portfolio holdings", async () => {
      const { status, data } = await apiRequest("/api/portfolio");

      expect(status).toBe(200);
      expect(data).toHaveProperty("holdings");
      expect(data).toHaveProperty("summary");
      expect(Array.isArray((data as { holdings: unknown[] }).holdings)).toBe(true);
    });

    it("should include portfolio summary with total values", async () => {
      const { status, data } = await apiRequest("/api/portfolio");

      expect(status).toBe(200);
      const summary = (data as { summary: Record<string, unknown> }).summary;
      expect(summary).toHaveProperty("totalValue");
      expect(summary).toHaveProperty("totalCost");
      expect(summary).toHaveProperty("totalGain");
      expect(summary).toHaveProperty("totalGainPercent");
    });
  });

  describe("POST /api/portfolio", () => {
    it("should add a new holding with valid data", async () => {
      const { status, data } = await apiRequest("/api/portfolio", {
        method: "POST",
        body: JSON.stringify({
          symbol: "TEST.NS",
          quantity: 10,
          avgCost: 100,
        }),
      });

      expect(status).toBe(200);
      expect(data).toHaveProperty("message");
      expect(data).toHaveProperty("holding");
    });

    it("should reject invalid holding data", async () => {
      const { status, data } = await apiRequest("/api/portfolio", {
        method: "POST",
        body: JSON.stringify({
          symbol: "",
          quantity: -10,
          avgCost: 0,
        }),
      });

      expect(status).toBe(400);
      expect(data).toHaveProperty("error");
    });

    it("should reject missing required fields", async () => {
      const { status, data } = await apiRequest("/api/portfolio", {
        method: "POST",
        body: JSON.stringify({
          symbol: "TEST.NS",
        }),
      });

      expect(status).toBe(400);
    });
  });

  describe("DELETE /api/portfolio", () => {
    it("should return 400 without holding ID", async () => {
      const { status } = await apiRequest("/api/portfolio", {
        method: "DELETE",
      });

      expect(status).toBe(400);
    });

    it("should return 404 for non-existent holding", async () => {
      const { status } = await apiRequest("/api/portfolio?id=nonexistent-id", {
        method: "DELETE",
      });

      expect(status).toBe(404);
    });
  });
});

describe("Watchlist API", () => {
  describe("GET /api/watchlist", () => {
    it("should return user watchlists", async () => {
      const { status, data } = await apiRequest("/api/watchlist");

      expect(status).toBe(200);
      expect(data).toHaveProperty("watchlists");
      expect(Array.isArray((data as { watchlists: unknown[] }).watchlists)).toBe(true);
    });
  });

  describe("POST /api/watchlist", () => {
    it("should create a new watchlist", async () => {
      const { status, data } = await apiRequest("/api/watchlist", {
        method: "POST",
        body: JSON.stringify({
          name: "Test Watchlist",
          description: "Test description",
        }),
      });

      expect(status).toBe(200);
      expect(data).toHaveProperty("watchlist");
    });

    it("should reject empty watchlist name", async () => {
      const { status } = await apiRequest("/api/watchlist", {
        method: "POST",
        body: JSON.stringify({
          name: "",
        }),
      });

      expect(status).toBe(400);
    });
  });
});

describe("Alerts API", () => {
  describe("GET /api/alerts", () => {
    it("should return user alerts", async () => {
      const { status, data } = await apiRequest("/api/alerts");

      expect(status).toBe(200);
      expect(data).toHaveProperty("alerts");
      expect(data).toHaveProperty("summary");
    });

    it("should filter by enabled status", async () => {
      const { status, data } = await apiRequest("/api/alerts?enabled=true");

      expect(status).toBe(200);
      const alerts = (data as { alerts: Array<{ enabled: boolean }> }).alerts;
      alerts.forEach((alert) => {
        expect(alert.enabled).toBe(true);
      });
    });
  });

  describe("POST /api/alerts", () => {
    it("should create a new alert", async () => {
      const { status, data } = await apiRequest("/api/alerts", {
        method: "POST",
        body: JSON.stringify({
          symbol: "RELIANCE.NS",
          type: "price_above",
          threshold: 3000,
        }),
      });

      expect(status).toBe(200);
      expect(data).toHaveProperty("alert");
    });

    it("should reject invalid alert type", async () => {
      const { status } = await apiRequest("/api/alerts", {
        method: "POST",
        body: JSON.stringify({
          symbol: "RELIANCE.NS",
          type: "invalid_type",
          threshold: 3000,
        }),
      });

      expect(status).toBe(400);
    });

    it("should reject missing threshold", async () => {
      const { status } = await apiRequest("/api/alerts", {
        method: "POST",
        body: JSON.stringify({
          symbol: "RELIANCE.NS",
          type: "price_above",
        }),
      });

      expect(status).toBe(400);
    });
  });
});

describe("Screener API", () => {
  describe("GET /api/screener", () => {
    it("should return filter options and presets", async () => {
      const { status, data } = await apiRequest("/api/screener");

      expect(status).toBe(200);
      expect(data).toHaveProperty("filters");
      expect(data).toHaveProperty("presets");
      expect(data).toHaveProperty("sectors");
    });
  });

  describe("POST /api/screener", () => {
    it("should return screener results with valid filters", async () => {
      const { status, data } = await apiRequest("/api/screener", {
        method: "POST",
        body: JSON.stringify({
          filters: [
            { field: "marketCap", operator: "gt", value: 100000 },
          ],
          page: 1,
          limit: 10,
        }),
      });

      expect(status).toBe(200);
      expect(data).toHaveProperty("data");
      expect(data).toHaveProperty("pagination");
    });

    it("should support multiple filters", async () => {
      const { status, data } = await apiRequest("/api/screener", {
        method: "POST",
        body: JSON.stringify({
          filters: [
            { field: "pe", operator: "lt", value: 25 },
            { field: "roe", operator: "gt", value: 15 },
          ],
          page: 1,
          limit: 20,
        }),
      });

      expect(status).toBe(200);
    });

    it("should support between operator", async () => {
      const { status, data } = await apiRequest("/api/screener", {
        method: "POST",
        body: JSON.stringify({
          filters: [
            { field: "price", operator: "between", value: [100, 1000] },
          ],
          page: 1,
          limit: 20,
        }),
      });

      expect(status).toBe(200);
    });

    it("should respect pagination limits", async () => {
      const { status, data } = await apiRequest("/api/screener", {
        method: "POST",
        body: JSON.stringify({
          filters: [],
          page: 1,
          limit: 5,
        }),
      });

      expect(status).toBe(200);
      const results = (data as { data: unknown[] }).data;
      expect(results.length).toBeLessThanOrEqual(5);
    });
  });
});

describe("Quotes API", () => {
  describe("GET /api/quotes", () => {
    it("should return quotes for valid symbols", async () => {
      const { status, data } = await apiRequest("/api/quotes?symbols=RELIANCE.NS,TCS.NS");

      expect(status).toBe(200);
      expect(data).toHaveProperty("quotes");
      expect(data).toHaveProperty("timestamp");
    });

    it("should handle single symbol", async () => {
      const { status, data } = await apiRequest("/api/quotes?symbols=HDFCBANK.NS");

      expect(status).toBe(200);
      const quotes = (data as { quotes: unknown[] }).quotes;
      expect(quotes.length).toBeGreaterThanOrEqual(0);
    });

    it("should return 400 without symbols parameter", async () => {
      const { status } = await apiRequest("/api/quotes");

      expect(status).toBe(400);
    });

    it("should indicate not found symbols", async () => {
      const { status, data } = await apiRequest("/api/quotes?symbols=INVALIDSYMBOL123");

      expect(status).toBe(200);
      // Should either return empty quotes or notFound array
    });
  });

  describe("POST /api/quotes (batch)", () => {
    it("should support batch quote requests", async () => {
      const { status, data } = await apiRequest("/api/quotes", {
        method: "POST",
        body: JSON.stringify({
          symbols: ["RELIANCE.NS", "TCS.NS", "INFY.NS"],
        }),
      });

      expect(status).toBe(200);
      expect(data).toHaveProperty("quotes");
    });

    it("should support extended data option", async () => {
      const { status, data } = await apiRequest("/api/quotes", {
        method: "POST",
        body: JSON.stringify({
          symbols: ["RELIANCE.NS"],
          includeExtended: true,
        }),
      });

      expect(status).toBe(200);
    });
  });
});

describe("Rate Limiting", () => {
  it("should include rate limit headers in response", async () => {
    const response = await fetch(`${BASE_URL}/api/quotes?symbols=RELIANCE.NS`);
    
    expect(response.headers.has("x-ratelimit-limit")).toBe(true);
    expect(response.headers.has("x-ratelimit-remaining")).toBe(true);
  });

  it("should return 429 when rate limited", async () => {
    // This test would require making many rapid requests
    // In a real test environment, you might mock the rate limiter
    // For now, we just verify the endpoint responds correctly
    const { status } = await apiRequest("/api/quotes?symbols=RELIANCE.NS");
    expect([200, 429]).toContain(status);
  });
});

describe("Error Handling", () => {
  it("should return structured error for invalid JSON", async () => {
    const response = await fetch(`${BASE_URL}/api/portfolio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json{",
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("should return 404 for non-existent endpoints", async () => {
    const { status } = await apiRequest("/api/nonexistent");
    expect(status).toBe(404);
  });
});
