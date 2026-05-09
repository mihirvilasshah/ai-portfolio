/**
 * Market Data Provider Interface
 * Unified contract for all market data sources
 */

import type { Quote, OHLCV, Fundamentals, NewsItem, Asset } from "@/types/domain";

// Provider identification
export type ProviderName = 
  | "yahoo" 
  | "twelvedata" 
  | "alphavantage" 
  | "finnhub" 
  | "mfapi" 
  | "coingecko" 
  | "binance" 
  | "newsapi"
  | "mock";

// Provider capabilities
export interface ProviderCapabilities {
  quotes: boolean;
  ohlcv: boolean;
  fundamentals: boolean;
  news: boolean;
  search: boolean;
  realtime: boolean;
}

// Provider health status
export interface ProviderHealth {
  provider: ProviderName;
  isHealthy: boolean;
  latencyMs: number;
  lastCheck: Date;
  errorCount: number;
  quotaRemaining?: number;
  quotaResetAt?: Date;
}

// Base provider interface
export interface MarketDataProvider {
  name: ProviderName;
  capabilities: ProviderCapabilities;
  
  // Health check
  healthCheck(): Promise<ProviderHealth>;
  
  // Quote data
  getQuote(symbol: string): Promise<Quote | null>;
  getQuotes(symbols: string[]): Promise<Map<string, Quote>>;
  
  // Historical data
  getOHLCV(symbol: string, interval: OHLCVInterval, limit?: number): Promise<OHLCV[]>;
  
  // Fundamentals (if supported)
  getFundamentals?(symbol: string): Promise<Fundamentals | null>;
  
  // News (if supported)
  getNews?(symbol?: string, limit?: number): Promise<NewsItem[]>;
  
  // Search (if supported)
  searchAssets?(query: string, limit?: number): Promise<Asset[]>;
}

// OHLCV intervals
export type OHLCVInterval = 
  | "1m" | "5m" | "15m" | "30m" | "1h" | "4h" 
  | "1d" | "1w" | "1M";

// Provider response wrapper
export interface ProviderResponse<T> {
  data: T | null;
  provider: ProviderName;
  cached: boolean;
  timestamp: Date;
  error?: string;
}

// Multi-provider orchestration result
export interface OrchestratedResponse<T> {
  data: T | null;
  primaryProvider: ProviderName;
  fallbackUsed: boolean;
  fallbackProvider?: ProviderName;
  cached: boolean;
  timestamp: Date;
}

// Provider factory function type
export type ProviderFactory = () => MarketDataProvider;

// Provider registry
export interface ProviderRegistry {
  register(provider: MarketDataProvider): void;
  get(name: ProviderName): MarketDataProvider | undefined;
  getAll(): MarketDataProvider[];
  getHealthy(): MarketDataProvider[];
}
