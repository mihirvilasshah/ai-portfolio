/**
 * Finnhub Provider
 * Primary provider for US equities and real-time news
 * Requires API key (free tier: 60 calls/minute)
 */

import type { Quote, OHLCV, NewsItem, Asset } from "@/types/domain";
import type {
  MarketDataProvider,
  ProviderCapabilities,
  ProviderHealth,
  OHLCVInterval,
} from "./types";
import { httpClient } from "@/lib/http/client";

const BASE_URL = "https://finnhub.io/api/v1";

// Get API key from environment
const getApiKey = () => process.env.FINNHUB_API_KEY || "";

// Resolution mapping for Finnhub
const RESOLUTION_MAP: Record<OHLCVInterval, string> = {
  "1m": "1",
  "5m": "5",
  "15m": "15",
  "30m": "30",
  "1h": "60",
  "4h": "240", // Not supported, closest is 60
  "1d": "D",
  "1w": "W",
  "1M": "M",
};

interface FinnhubQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

interface FinnhubCandles {
  c: number[]; // Close prices
  h: number[]; // High prices
  l: number[]; // Low prices
  o: number[]; // Open prices
  v: number[]; // Volume
  t: number[]; // Timestamps
  s: string;   // Status
}

interface FinnhubNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface FinnhubSymbolSearch {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
}

interface FinnhubCompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

export class FinnhubProvider implements MarketDataProvider {
  name = "finnhub" as const;
  
  capabilities: ProviderCapabilities = {
    quotes: true,
    ohlcv: true,
    fundamentals: true,
    news: true,
    search: true,
    realtime: true, // Finnhub offers websocket for real-time
  };

  private errorCount = 0;
  private lastHealthCheck: ProviderHealth | null = null;
  private requestCount = 0;
  private requestResetTime = Date.now();
  private readonly RATE_LIMIT = 60; // 60 requests per minute

  private checkRateLimit(): boolean {
    const now = Date.now();
    // Reset counter every minute
    if (now - this.requestResetTime > 60000) {
      this.requestCount = 0;
      this.requestResetTime = now;
    }
    
    if (this.requestCount >= this.RATE_LIMIT) {
      console.warn("[Finnhub] Rate limit reached");
      return false;
    }
    
    this.requestCount++;
    return true;
  }

  private buildUrl(endpoint: string, params: Record<string, string> = {}): string {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn("[Finnhub] No API key configured");
    }
    
    const searchParams = new URLSearchParams({
      ...params,
      token: apiKey,
    });
    
    return `${BASE_URL}${endpoint}?${searchParams.toString()}`;
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    const apiKey = getApiKey();
    
    if (!apiKey) {
      this.lastHealthCheck = {
        provider: this.name,
        isHealthy: false,
        latencyMs: 0,
        lastCheck: new Date(),
        errorCount: this.errorCount,
      };
      return this.lastHealthCheck;
    }
    
    try {
      const response = await fetch(this.buildUrl("/quote", { symbol: "AAPL" }), {
        signal: AbortSignal.timeout(5000),
      });
      
      const isHealthy = response.ok;
      const latencyMs = Date.now() - startTime;
      
      if (isHealthy) {
        this.errorCount = 0;
      } else {
        this.errorCount++;
      }
      
      this.lastHealthCheck = {
        provider: this.name,
        isHealthy,
        latencyMs,
        lastCheck: new Date(),
        errorCount: this.errorCount,
        quotaRemaining: this.RATE_LIMIT - this.requestCount,
        quotaResetAt: new Date(this.requestResetTime + 60000),
      };
      
      return this.lastHealthCheck;
    } catch (error) {
      this.errorCount++;
      
      this.lastHealthCheck = {
        provider: this.name,
        isHealthy: false,
        latencyMs: Date.now() - startTime,
        lastCheck: new Date(),
        errorCount: this.errorCount,
      };
      
      return this.lastHealthCheck;
    }
  }

  async getQuote(symbol: string): Promise<Quote | null> {
    if (!this.checkRateLimit()) return null;
    
    try {
      const response = await httpClient.get<FinnhubQuote>(
        this.buildUrl("/quote", { symbol })
      );
      
      // Finnhub returns empty object or zeros for invalid symbols
      if (!response.c || response.c === 0) return null;
      
      return {
        symbol,
        price: response.c,
        change: response.d,
        changePercent: response.dp,
        open: response.o,
        high: response.h,
        low: response.l,
        close: response.c,
        previousClose: response.pc,
        volume: 0, // Quote endpoint doesn't include volume
        timestamp: new Date(response.t * 1000),
        source: "finnhub",
      };
    } catch (error) {
      console.error(`[Finnhub] Failed to get quote for ${symbol}:`, error);
      return null;
    }
  }

  async getQuotes(symbols: string[]): Promise<Map<string, Quote>> {
    const quotes = new Map<string, Quote>();
    
    // Finnhub doesn't support batch quote requests
    // Process in parallel with rate limiting
    const batchSize = Math.min(10, this.RATE_LIMIT - this.requestCount);
    
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(symbol => this.getQuote(symbol))
      );
      
      results.forEach((quote, index) => {
        const sym = batch[index];
        if (quote && sym) {
          quotes.set(sym, quote);
        }
      });
    }
    
    return quotes;
  }

  async getOHLCV(
    symbol: string,
    interval: OHLCVInterval,
    limit: number = 100
  ): Promise<OHLCV[]> {
    if (!this.checkRateLimit()) return [];
    
    try {
      const resolution = RESOLUTION_MAP[interval];
      const now = Math.floor(Date.now() / 1000);
      
      // Calculate from timestamp based on interval
      const intervalSeconds: Record<OHLCVInterval, number> = {
        "1m": 60,
        "5m": 300,
        "15m": 900,
        "30m": 1800,
        "1h": 3600,
        "4h": 14400,
        "1d": 86400,
        "1w": 604800,
        "1M": 2592000,
      };
      
      const from = now - (limit * intervalSeconds[interval]);
      
      const response = await httpClient.get<FinnhubCandles>(
        this.buildUrl("/stock/candle", {
          symbol,
          resolution,
          from: from.toString(),
          to: now.toString(),
        })
      );
      
      if (response.s !== "ok" || !response.t) {
        return [];
      }
      
      const ohlcv: OHLCV[] = [];
      
      for (let i = 0; i < response.t.length && ohlcv.length < limit; i++) {
        const timestamp = response.t[i];
        const open = response.o[i];
        const high = response.h[i];
        const low = response.l[i];
        const close = response.c[i];
        const volume = response.v[i];
        
        if (timestamp !== undefined && open !== undefined && high !== undefined && 
            low !== undefined && close !== undefined && volume !== undefined) {
          ohlcv.push({
            timestamp: new Date(timestamp * 1000),
            open,
            high,
            low,
            close,
            volume,
          });
        }
      }
      
      return ohlcv;
    } catch (error) {
      console.error(`[Finnhub] Failed to get OHLCV for ${symbol}:`, error);
      return [];
    }
  }

  async getNews(symbol?: string, limit: number = 20): Promise<NewsItem[]> {
    if (!this.checkRateLimit()) return [];
    
    try {
      let url: string;
      
      if (symbol) {
        // Company-specific news
        const from = new Date();
        from.setDate(from.getDate() - 7);
        const to = new Date();
        
        const fromStr = from.toISOString().split("T")[0];
        const toStr = to.toISOString().split("T")[0];
        
        url = this.buildUrl("/company-news", {
          symbol,
          from: fromStr || "",
          to: toStr || "",
        });
      } else {
        // General market news
        url = this.buildUrl("/news", { category: "general" });
      }
      
      const response = await httpClient.get<FinnhubNews[]>(url);
      
      return response.slice(0, limit).map((news) => ({
        id: news.id.toString(),
        headline: news.headline,
        summary: news.summary,
        source: news.source,
        url: news.url,
        imageUrl: news.image || undefined,
        publishedAt: new Date(news.datetime * 1000),
        symbols: news.related ? news.related.split(",") : [],
        sentiment: this.inferSentiment(news.headline, news.summary),
        categories: ["market"],
      }));
    } catch (error) {
      console.error(`[Finnhub] Failed to get news:`, error);
      return [];
    }
  }

  async searchAssets(query: string, limit: number = 10): Promise<Asset[]> {
    if (!this.checkRateLimit()) return [];
    
    try {
      const response = await httpClient.get<FinnhubSymbolSearch>(
        this.buildUrl("/search", { q: query })
      );
      
      const now = new Date();
      return response.result.slice(0, limit).map((item) => ({
        id: item.symbol,
        symbol: item.symbol,
        name: item.description,
        assetClass: this.mapType(item.type) === "etf" ? "etf" as const : "equity" as const,
        market: "NYSE" as const,
        country: "US" as const,
        currency: "USD" as const,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }));
    } catch (error) {
      console.error(`[Finnhub] Failed to search for ${query}:`, error);
      return [];
    }
  }

  async getCompanyProfile(symbol: string): Promise<FinnhubCompanyProfile | null> {
    if (!this.checkRateLimit()) return null;
    
    try {
      const response = await httpClient.get<FinnhubCompanyProfile>(
        this.buildUrl("/stock/profile2", { symbol })
      );
      
      if (!response.ticker) return null;
      
      return response;
    } catch (error) {
      console.error(`[Finnhub] Failed to get profile for ${symbol}:`, error);
      return null;
    }
  }

  private mapType(type: string): "stock" | "etf" | "mf" | "crypto" {
    const typeMap: Record<string, "stock" | "etf" | "mf" | "crypto"> = {
      "Common Stock": "stock",
      "ADR": "stock",
      "ETF": "etf",
      "Crypto": "crypto",
    };
    
    return typeMap[type] || "stock";
  }

  private inferSentiment(headline: string, summary: string): "positive" | "negative" | "neutral" {
    const text = (headline + " " + summary).toLowerCase();
    
    const positiveWords = [
      "surge", "jump", "rally", "gain", "rise", "soar", "boom", "bullish",
      "record", "breakthrough", "growth", "profit", "success", "beat",
    ];
    
    const negativeWords = [
      "fall", "drop", "crash", "decline", "slump", "bearish", "loss",
      "miss", "fail", "warning", "risk", "concern", "fear", "crisis",
    ];
    
    let score = 0;
    
    for (const word of positiveWords) {
      if (text.includes(word)) score++;
    }
    
    for (const word of negativeWords) {
      if (text.includes(word)) score--;
    }
    
    if (score > 0) return "positive";
    if (score < 0) return "negative";
    return "neutral";
  }
}

// Export singleton instance
export const finnhubProvider = new FinnhubProvider();
