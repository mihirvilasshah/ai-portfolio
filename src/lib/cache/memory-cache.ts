/**
 * In-memory cache with TTL support
 * Supports stale-while-revalidate pattern
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  staleTime?: number;
}

interface CacheOptions {
  ttl: number; // Time to live in seconds
  staleTime?: number; // Time after which data is stale but still usable
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;
    const isExpired = age > entry.ttl * 1000;
    const isStale = entry.staleTime ? age > entry.staleTime * 1000 : isExpired;

    // If completely expired and no stale-while-revalidate, return null
    if (isExpired && !entry.staleTime) {
      this.cache.delete(key);
      return null;
    }

    // If past stale time + ttl buffer, delete
    if (entry.staleTime && age > (entry.staleTime + entry.ttl) * 1000) {
      this.cache.delete(key);
      return null;
    }

    return { data: entry.data, isStale };
  }

  /**
   * Set a value in cache
   */
  set<T>(key: string, data: T, options: CacheOptions): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: options.ttl,
      staleTime: options.staleTime,
    });
  }

  /**
   * Delete a value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear entries matching a prefix
   */
  clearByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get or fetch with stale-while-revalidate
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ): Promise<T> {
    const cached = this.get<T>(key);

    // Fresh cache hit
    if (cached && !cached.isStale) {
      return cached.data;
    }

    // Stale cache - return stale data and refresh in background
    if (cached && cached.isStale) {
      // Trigger background refresh (fire and forget)
      fetcher()
        .then((data) => this.set(key, data, options))
        .catch((error) => {
          console.error(`Background refresh failed for ${key}:`, error);
        });
      
      return cached.data;
    }

    // No cache - fetch and store
    const data = await fetcher();
    this.set(key, data, options);
    return data;
  }

  /**
   * Get cache stats
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      const maxAge = entry.staleTime 
        ? (entry.staleTime + entry.ttl) * 1000 
        : entry.ttl * 1000;
      
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Stop cleanup interval (for testing)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Singleton instance
let cacheInstance: MemoryCache | null = null;

export function getCache(): MemoryCache {
  if (!cacheInstance) {
    cacheInstance = new MemoryCache();
  }
  return cacheInstance;
}

// Cache key builders
export const cacheKeys = {
  quote: (symbol: string) => `quote:${symbol}`,
  quotes: (symbols: string[]) => `quotes:${symbols.sort().join(",")}`,
  fundamentals: (symbol: string) => `fundamentals:${symbol}`,
  indicators: (symbol: string) => `indicators:${symbol}`,
  ohlcv: (symbol: string, interval: string) => `ohlcv:${symbol}:${interval}`,
  news: (symbol?: string) => symbol ? `news:${symbol}` : "news:market",
  sentiment: (symbol: string) => `sentiment:${symbol}`,
  recommendations: (filter?: string) => filter ? `recommendations:${filter}` : "recommendations:all",
  recommendation: (symbol: string) => `recommendation:${symbol}`,
  marketSession: (market: string) => `session:${market}`,
  assetMetadata: (symbol: string) => `asset:${symbol}`,
  watchlist: (userId: string) => `watchlist:${userId}`,
  portfolio: (userId: string, portfolioId: string) => `portfolio:${userId}:${portfolioId}`,
};

export { MemoryCache };
export type { CacheOptions, CacheEntry };
