/**
 * Market Data Service
 * Orchestrates multiple providers with fallback and caching
 */

import type { Quote, OHLCV, Fundamentals, NewsItem, Asset } from "@/types/domain";
import type { 
  MarketDataProvider, 
  ProviderName, 
  OHLCVInterval,
  OrchestratedResponse,
  ProviderHealth 
} from "./types";
import { MockMarketDataProvider } from "./mock-provider";
import { getCache, cacheKeys } from "@/lib/cache";
import { apiConfig } from "@/config/api";

// Provider registry
const providers = new Map<ProviderName, MarketDataProvider>();

// Initialize with mock provider
providers.set("mock", new MockMarketDataProvider());

// Provider health state
const providerHealth = new Map<ProviderName, ProviderHealth>();

/**
 * Register a new provider
 */
export function registerProvider(provider: MarketDataProvider): void {
  providers.set(provider.name, provider);
}

/**
 * Get provider by name
 */
export function getProvider(name: ProviderName): MarketDataProvider | undefined {
  return providers.get(name);
}

/**
 * Get the primary provider for an asset category, with fallback chain
 */
function getProviderChain(symbol: string): ProviderName[] {
  // Determine asset type from symbol
  const isIndian = symbol.endsWith(".NS") || symbol.endsWith(".BO");
  const isCrypto = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "MATIC"].includes(symbol);
  const isMutualFund = symbol.startsWith("MF-");
  
  if (isMutualFund) {
    return ["mfapi", "mock"];
  }
  
  if (isCrypto) {
    return ["coingecko", "binance", "mock"];
  }
  
  if (isIndian) {
    return ["yahoo", "twelvedata", "alphavantage", "mock"];
  }
  
  // US equities
  return ["finnhub", "alphavantage", "twelvedata", "mock"];
}

/**
 * Try providers in order until one succeeds
 */
async function tryProviders<T>(
  symbol: string,
  operation: (provider: MarketDataProvider) => Promise<T | null>
): Promise<OrchestratedResponse<T>> {
  const chain = getProviderChain(symbol);
  let primaryProvider = chain[0] ?? "mock";
  let fallbackUsed = false;
  let fallbackProvider: ProviderName | undefined;
  
  for (const providerName of chain) {
    const provider = providers.get(providerName);
    if (!provider) continue;
    
    // Check provider health
    const health = providerHealth.get(providerName);
    if (health && !health.isHealthy && providerName !== "mock") {
      continue;
    }
    
    try {
      const data = await operation(provider);
      if (data !== null) {
        if (providerName !== primaryProvider) {
          fallbackUsed = true;
          fallbackProvider = providerName;
        }
        return {
          data,
          primaryProvider,
          fallbackUsed,
          fallbackProvider,
          cached: false,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      // Mark provider as unhealthy
      providerHealth.set(providerName, {
        provider: providerName,
        isHealthy: false,
        latencyMs: 0,
        lastCheck: new Date(),
        errorCount: (providerHealth.get(providerName)?.errorCount ?? 0) + 1,
      });
      continue;
    }
  }
  
  // All providers failed
  return {
    data: null,
    primaryProvider,
    fallbackUsed: true,
    fallbackProvider: "mock",
    cached: false,
    timestamp: new Date(),
  };
}

/**
 * Get quote with caching and fallback
 */
export async function getQuote(symbol: string): Promise<OrchestratedResponse<Quote>> {
  const cache = getCache();
  const cacheKey = cacheKeys.quote(symbol);
  
  // Check cache
  const cached = cache.get<Quote>(cacheKey);
  if (cached && !cached.isStale) {
    return {
      data: cached.data,
      primaryProvider: "mock",
      fallbackUsed: false,
      cached: true,
      timestamp: new Date(),
    };
  }
  
  // Fetch from providers
  const result = await tryProviders(symbol, (provider) => provider.getQuote(symbol));
  
  // Cache the result
  if (result.data) {
    cache.set(cacheKey, result.data, { 
      ttl: apiConfig.cache.quotes,
      staleTime: apiConfig.cache.quotes * 2 
    });
  }
  
  return result;
}

/**
 * Get multiple quotes
 */
export async function getQuotes(symbols: string[]): Promise<Map<string, Quote>> {
  const results = new Map<string, Quote>();
  
  // Batch by provider chain (optimization)
  const promises = symbols.map(async (symbol) => {
    const result = await getQuote(symbol);
    if (result.data) {
      results.set(symbol, result.data);
    }
  });
  
  await Promise.all(promises);
  return results;
}

/**
 * Get OHLCV data with caching
 */
export async function getOHLCV(
  symbol: string,
  interval: OHLCVInterval = "1d",
  limit = 100
): Promise<OrchestratedResponse<OHLCV[]>> {
  const cache = getCache();
  const cacheKey = cacheKeys.ohlcv(symbol, interval);
  
  // Check cache
  const cached = cache.get<OHLCV[]>(cacheKey);
  if (cached && !cached.isStale) {
    return {
      data: cached.data,
      primaryProvider: "mock",
      fallbackUsed: false,
      cached: true,
      timestamp: new Date(),
    };
  }
  
  // Fetch from providers
  const result = await tryProviders(symbol, (provider) => 
    provider.getOHLCV(symbol, interval, limit)
  );
  
  // Cache the result (longer TTL for historical data)
  if (result.data && result.data.length > 0) {
    cache.set(cacheKey, result.data, { 
      ttl: interval === "1d" ? 3600 : 300, // 1 hour for daily, 5 min for intraday
    });
  }
  
  return result;
}

/**
 * Get fundamentals with caching
 */
export async function getFundamentals(symbol: string): Promise<OrchestratedResponse<Fundamentals>> {
  const cache = getCache();
  const cacheKey = cacheKeys.fundamentals(symbol);
  
  // Check cache
  const cached = cache.get<Fundamentals>(cacheKey);
  if (cached && !cached.isStale) {
    return {
      data: cached.data,
      primaryProvider: "mock",
      fallbackUsed: false,
      cached: true,
      timestamp: new Date(),
    };
  }
  
  // Fetch from providers
  const result = await tryProviders(symbol, (provider) => 
    provider.getFundamentals?.(symbol) ?? Promise.resolve(null)
  );
  
  // Cache the result
  if (result.data) {
    cache.set(cacheKey, result.data, { 
      ttl: apiConfig.cache.fundamentals,
    });
  }
  
  return result;
}

/**
 * Get news with caching
 */
export async function getNews(
  symbol?: string,
  limit = 20
): Promise<OrchestratedResponse<NewsItem[]>> {
  const cache = getCache();
  const cacheKey = cacheKeys.news(symbol);
  
  // Check cache
  const cached = cache.get<NewsItem[]>(cacheKey);
  if (cached && !cached.isStale) {
    return {
      data: cached.data,
      primaryProvider: "mock",
      fallbackUsed: false,
      cached: true,
      timestamp: new Date(),
    };
  }
  
  // For news, use mock provider directly for now
  const mockProvider = providers.get("mock");
  if (!mockProvider) {
    return {
      data: [],
      primaryProvider: "mock",
      fallbackUsed: false,
      cached: false,
      timestamp: new Date(),
    };
  }
  
  const news = await mockProvider.getNews?.(symbol, limit) ?? [];
  
  // Cache the result
  cache.set(cacheKey, news, { 
    ttl: apiConfig.cache.news,
  });
  
  return {
    data: news,
    primaryProvider: "mock",
    fallbackUsed: false,
    cached: false,
    timestamp: new Date(),
  };
}

/**
 * Search assets
 */
export async function searchAssets(query: string, limit = 10): Promise<Asset[]> {
  const mockProvider = providers.get("mock");
  if (!mockProvider?.searchAssets) {
    return [];
  }
  return mockProvider.searchAssets(query, limit);
}

/**
 * Get all provider health status
 */
export async function getProvidersHealth(): Promise<ProviderHealth[]> {
  const healthPromises = Array.from(providers.values()).map(async (provider) => {
    try {
      const health = await provider.healthCheck();
      providerHealth.set(provider.name, health);
      return health;
    } catch {
      const unhealthy: ProviderHealth = {
        provider: provider.name,
        isHealthy: false,
        latencyMs: 0,
        lastCheck: new Date(),
        errorCount: (providerHealth.get(provider.name)?.errorCount ?? 0) + 1,
      };
      providerHealth.set(provider.name, unhealthy);
      return unhealthy;
    }
  });
  
  return Promise.all(healthPromises);
}

// Export types
export type { OrchestratedResponse, ProviderHealth };
