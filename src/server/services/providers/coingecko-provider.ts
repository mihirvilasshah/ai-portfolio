/**
 * CoinGecko Provider
 * Primary provider for cryptocurrency data
 * Free tier: 10-30 calls/minute (no API key required for basic access)
 */

import type { Quote, OHLCV, NewsItem, Asset } from "@/types/domain";
import type {
  MarketDataProvider,
  ProviderCapabilities,
  ProviderHealth,
  OHLCVInterval,
} from "./types";
import { httpClient } from "@/lib/http/client";

const BASE_URL = "https://api.coingecko.com/api/v3";

// API key is optional for basic access
const getApiKey = () => process.env.COINGECKO_API_KEY || "";

// Mapping of common crypto symbols to CoinGecko IDs
const SYMBOL_TO_ID: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  SOL: "solana",
  DOGE: "dogecoin",
  DOT: "polkadot",
  MATIC: "matic-network",
  SHIB: "shiba-inu",
  LTC: "litecoin",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  UNI: "uniswap",
  ATOM: "cosmos",
  XLM: "stellar",
  ALGO: "algorand",
  VET: "vechain",
  FIL: "filecoin",
  SAND: "the-sandbox",
};

// Days mapping for OHLCV intervals
const DAYS_MAP: Record<OHLCVInterval, number> = {
  "1m": 1,
  "5m": 1,
  "15m": 1,
  "30m": 1,
  "1h": 2,
  "4h": 7,
  "1d": 30,
  "1w": 180,
  "1M": 365,
};

interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  last_updated: string;
}

interface CoinGeckoOHLC {
  // [timestamp, open, high, low, close]
  [index: number]: number;
}

interface CoinGeckoSearchResult {
  coins: Array<{
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    large: string;
  }>;
}

interface CoinGeckoCoinDetail {
  id: string;
  symbol: string;
  name: string;
  description: { en: string };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    chat_url: string[];
    announcement_url: string[];
    twitter_screen_name: string;
    telegram_channel_identifier: string;
    subreddit_url: string;
  };
  image: { thumb: string; small: string; large: string };
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    price_change_24h: number;
    price_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number | null;
  };
  market_cap_rank: number;
  coingecko_rank: number;
  sentiment_votes_up_percentage: number;
  sentiment_votes_down_percentage: number;
}

export class CoinGeckoProvider implements MarketDataProvider {
  name = "coingecko" as const;
  
  capabilities: ProviderCapabilities = {
    quotes: true,
    ohlcv: true,
    fundamentals: false,
    news: false,
    search: true,
    realtime: false,
  };

  private errorCount = 0;
  private lastHealthCheck: ProviderHealth | null = null;
  private requestCount = 0;
  private requestResetTime = Date.now();
  private readonly RATE_LIMIT = 30; // 30 requests per minute (free tier)

  private checkRateLimit(): boolean {
    const now = Date.now();
    // Reset counter every minute
    if (now - this.requestResetTime > 60000) {
      this.requestCount = 0;
      this.requestResetTime = now;
    }
    
    if (this.requestCount >= this.RATE_LIMIT) {
      console.warn("[CoinGecko] Rate limit reached");
      return false;
    }
    
    this.requestCount++;
    return true;
  }

  private buildUrl(endpoint: string, params: Record<string, string> = {}): string {
    const apiKey = getApiKey();
    const searchParams = new URLSearchParams(params);
    
    // Add API key if available (for higher rate limits)
    if (apiKey) {
      searchParams.set("x_cg_demo_api_key", apiKey);
    }
    
    return `${BASE_URL}${endpoint}?${searchParams.toString()}`;
  }

  private getCoinId(symbol: string): string {
    // Remove common suffixes
    const cleanSymbol = symbol.replace(/\..*$/, "").toUpperCase();
    return SYMBOL_TO_ID[cleanSymbol] || cleanSymbol.toLowerCase();
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${BASE_URL}/ping`, {
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
      const coinId = this.getCoinId(symbol);
      
      const response = await httpClient.get<CoinGeckoMarketData[]>(
        this.buildUrl("/coins/markets", {
          vs_currency: "usd",
          ids: coinId,
          sparkline: "false",
        })
      );
      
      const data = response[0];
      if (!data) return null;
      
      return this.mapToQuote(data);
    } catch (error) {
      console.error(`[CoinGecko] Failed to get quote for ${symbol}:`, error);
      return null;
    }
  }

  async getQuotes(symbols: string[]): Promise<Map<string, Quote>> {
    const quotes = new Map<string, Quote>();
    
    if (symbols.length === 0) return quotes;
    if (!this.checkRateLimit()) return quotes;
    
    try {
      // CoinGecko supports batch requests
      const coinIds = symbols.map(s => this.getCoinId(s)).join(",");
      
      const response = await httpClient.get<CoinGeckoMarketData[]>(
        this.buildUrl("/coins/markets", {
          vs_currency: "usd",
          ids: coinIds,
          sparkline: "false",
        })
      );
      
      for (const data of response) {
        const quote = this.mapToQuote(data);
        // Map back to original symbol
        const originalSymbol = symbols.find(
          s => this.getCoinId(s) === data.id
        );
        if (originalSymbol) {
          quotes.set(originalSymbol, quote);
        }
      }
    } catch (error) {
      console.error(`[CoinGecko] Failed to get quotes:`, error);
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
      const coinId = this.getCoinId(symbol);
      const days = DAYS_MAP[interval];
      
      const response = await httpClient.get<CoinGeckoOHLC[]>(
        this.buildUrl(`/coins/${coinId}/ohlc`, {
          vs_currency: "usd",
          days: days.toString(),
        })
      );
      
      if (!Array.isArray(response) || response.length === 0) {
        return [];
      }
      
      const ohlcv: OHLCV[] = response.map((candle) => ({
        timestamp: new Date(candle[0]),
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: 0, // OHLC endpoint doesn't include volume
      }));
      
      // Return most recent data, limited to requested amount
      return ohlcv.slice(-limit);
    } catch (error) {
      console.error(`[CoinGecko] Failed to get OHLCV for ${symbol}:`, error);
      return [];
    }
  }

  async searchAssets(query: string, limit: number = 10): Promise<Asset[]> {
    if (!this.checkRateLimit()) return [];
    
    try {
      const response = await httpClient.get<CoinGeckoSearchResult>(
        this.buildUrl("/search", { query })
      );
      
      return response.coins.slice(0, limit).map((coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        type: "crypto" as const,
        exchange: "CRYPTO",
        marketCapRank: coin.market_cap_rank,
      }));
    } catch (error) {
      console.error(`[CoinGecko] Failed to search for ${query}:`, error);
      return [];
    }
  }

  async getCoinDetail(symbol: string): Promise<CoinGeckoCoinDetail | null> {
    if (!this.checkRateLimit()) return null;
    
    try {
      const coinId = this.getCoinId(symbol);
      
      const response = await httpClient.get<CoinGeckoCoinDetail>(
        this.buildUrl(`/coins/${coinId}`, {
          localization: "false",
          tickers: "false",
          market_data: "true",
          community_data: "false",
          developer_data: "false",
          sparkline: "false",
        })
      );
      
      return response;
    } catch (error) {
      console.error(`[CoinGecko] Failed to get detail for ${symbol}:`, error);
      return null;
    }
  }

  async getTrendingCoins(): Promise<Asset[]> {
    if (!this.checkRateLimit()) return [];
    
    try {
      const response = await httpClient.get<{
        coins: Array<{ item: { id: string; symbol: string; name: string; market_cap_rank: number } }>;
      }>(`${BASE_URL}/search/trending`);
      
      return response.coins.map((coin) => ({
        id: coin.item.id,
        symbol: coin.item.symbol.toUpperCase(),
        name: coin.item.name,
        type: "crypto" as const,
        exchange: "CRYPTO",
        marketCapRank: coin.item.market_cap_rank,
      }));
    } catch (error) {
      console.error(`[CoinGecko] Failed to get trending coins:`, error);
      return [];
    }
  }

  async getGlobalMarketData(): Promise<{
    totalMarketCap: number;
    totalVolume: number;
    btcDominance: number;
    ethDominance: number;
    marketCapChangePercentage24h: number;
  } | null> {
    if (!this.checkRateLimit()) return null;
    
    try {
      const response = await httpClient.get<{
        data: {
          total_market_cap: { usd: number };
          total_volume: { usd: number };
          market_cap_percentage: { btc: number; eth: number };
          market_cap_change_percentage_24h_usd: number;
        };
      }>(`${BASE_URL}/global`);
      
      return {
        totalMarketCap: response.data.total_market_cap.usd,
        totalVolume: response.data.total_volume.usd,
        btcDominance: response.data.market_cap_percentage.btc,
        ethDominance: response.data.market_cap_percentage.eth,
        marketCapChangePercentage24h: response.data.market_cap_change_percentage_24h_usd,
      };
    } catch (error) {
      console.error(`[CoinGecko] Failed to get global market data:`, error);
      return null;
    }
  }

  private mapToQuote(data: CoinGeckoMarketData): Quote {
    return {
      symbol: data.symbol.toUpperCase(),
      price: data.current_price,
      change: data.price_change_24h,
      changePercent: data.price_change_percentage_24h,
      open: data.current_price - data.price_change_24h, // Approximate
      high: data.high_24h,
      low: data.low_24h,
      close: data.current_price,
      previousClose: data.current_price - data.price_change_24h,
      volume: data.total_volume,
      timestamp: new Date(data.last_updated),
      currency: "USD",
      marketCap: data.market_cap,
    };
  }
}

// Export singleton instance
export const coinGeckoProvider = new CoinGeckoProvider();
