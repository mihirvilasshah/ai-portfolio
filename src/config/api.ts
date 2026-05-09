/**
 * API configuration for rate limiting, caching, and provider settings
 */
export const apiConfig = {
  // Rate limiting
  rateLimit: {
    // Requests per window
    default: {
      requests: 100,
      windowMs: 60 * 1000, // 1 minute
    },
    authenticated: {
      requests: 200,
      windowMs: 60 * 1000,
    },
    // Specific endpoint limits
    quotes: {
      requests: 60,
      windowMs: 60 * 1000,
    },
    recommendations: {
      requests: 30,
      windowMs: 60 * 1000,
    },
    news: {
      requests: 30,
      windowMs: 60 * 1000,
    },
  },

  // Cache TTL (in seconds)
  cache: {
    // Short TTL for real-time data
    quotes: 15,
    marketStatus: 30,
    
    // Medium TTL for semi-static data
    fundamentals: 3600, // 1 hour
    news: 300, // 5 minutes
    sentiment: 600, // 10 minutes
    recommendations: 7200, // 2 hours
    
    // Long TTL for static data
    assetMetadata: 86400, // 24 hours
    exchangeInfo: 86400,
    holidays: 86400 * 7, // 1 week
  },

  // Polling intervals (in milliseconds)
  polling: {
    // Real-time quotes
    equitiesQuotes: 15000, // 15 seconds (can be throttled to 60s)
    cryptoQuotes: 10000, // 10 seconds (can be throttled to 30s)
    
    // Periodic updates
    fundamentals: 86400000, // Daily
    recommendations: 7200000, // Every 2 hours (can be 6h)
    news: 300000, // Every 5 minutes
    sentiment: 600000, // Every 10 minutes
  },

  // HTTP client settings
  http: {
    timeout: 10000, // 10 seconds
    retries: 3,
    retryDelay: 1000, // 1 second base delay (with jitter)
    maxRetryDelay: 30000, // 30 seconds max
  },

  // Provider priority and quotas
  providers: {
    // Indian equities
    indianEquities: {
      primary: "yahoo",
      fallbacks: ["twelvedata", "alphavantage"],
      dailyQuota: {
        yahoo: Infinity, // No limit for Yahoo
        twelvedata: 800,
        alphavantage: 500,
      },
    },
    // US equities
    usEquities: {
      primary: "finnhub",
      fallbacks: ["alphavantage", "twelvedata"],
      dailyQuota: {
        finnhub: 60, // Free tier
        alphavantage: 500,
        twelvedata: 800,
      },
    },
    // Mutual funds
    mutualFunds: {
      primary: "mfapi",
      fallbacks: [],
      dailyQuota: {
        mfapi: Infinity,
      },
    },
    // Crypto
    crypto: {
      primary: "coingecko",
      fallbacks: ["binance"],
      dailyQuota: {
        coingecko: 10000, // Free tier generous
        binance: Infinity,
      },
    },
    // News
    news: {
      primary: "finnhub",
      fallbacks: ["newsapi", "alphavantage"],
      dailyQuota: {
        finnhub: 60,
        newsapi: 100,
        alphavantage: 500,
      },
    },
  },
} as const;

export type ProviderName = 
  | "yahoo" 
  | "twelvedata" 
  | "alphavantage" 
  | "finnhub" 
  | "mfapi" 
  | "coingecko" 
  | "binance" 
  | "newsapi";

export type AssetCategory = 
  | "indianEquities" 
  | "usEquities" 
  | "mutualFunds" 
  | "crypto" 
  | "news";
