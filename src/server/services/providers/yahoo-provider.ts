/**
 * Yahoo Finance Provider
 * Primary provider for Indian and US equities
 * Uses unofficial Yahoo Finance API (free, no API key required)
 */

import type { Quote, OHLCV, Fundamentals, Asset } from "@/types/domain";
import type {
  MarketDataProvider,
  ProviderCapabilities,
  ProviderHealth,
  OHLCVInterval,
} from "./types";
import { httpClient } from "@/lib/http/client";

const CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const QUOTE_URL = "https://query1.finance.yahoo.com/v7/finance/quote";
const SEARCH_URL = "https://query1.finance.yahoo.com/v1/finance/search";

// Interval mapping for Yahoo Finance
const INTERVAL_MAP: Record<OHLCVInterval, string> = {
  "1m": "1m",
  "5m": "5m",
  "15m": "15m",
  "30m": "30m",
  "1h": "1h",
  "4h": "4h", // Yahoo doesn't support 4h, will use 1h
  "1d": "1d",
  "1w": "1wk",
  "1M": "1mo",
};

// Range mapping based on interval
const RANGE_MAP: Record<OHLCVInterval, string> = {
  "1m": "1d",
  "5m": "5d",
  "15m": "5d",
  "30m": "1mo",
  "1h": "1mo",
  "4h": "3mo",
  "1d": "1y",
  "1w": "2y",
  "1M": "5y",
};

interface YahooQuoteResult {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  regularMarketPreviousClose: number;
  regularMarketTime: number;
  shortName: string;
  longName?: string;
  currency: string;
  marketCap?: number;
  trailingPE?: number;
  forwardPE?: number;
  priceToBook?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  fiftyDayAverage?: number;
  twoHundredDayAverage?: number;
  dividendYield?: number;
  trailingAnnualDividendYield?: number;
}

interface YahooChartResult {
  meta: {
    currency: string;
    symbol: string;
    regularMarketPrice: number;
  };
  timestamp: number[];
  indicators: {
    quote: Array<{
      open: number[];
      high: number[];
      low: number[];
      close: number[];
      volume: number[];
    }>;
  };
}

interface YahooSearchResult {
  quotes: Array<{
    symbol: string;
    shortname: string;
    longname?: string;
    exchange: string;
    quoteType: string;
    sector?: string;
    industry?: string;
  }>;
}

export class YahooFinanceProvider implements MarketDataProvider {
  name = "yahoo" as const;
  
  capabilities: ProviderCapabilities = {
    quotes: true,
    ohlcv: true,
    fundamentals: true,
    news: false, // Yahoo deprecated news API
    search: true,
    realtime: false, // Delayed by 15-20 minutes
  };

  private lastHealthCheck: ProviderHealth | null = null;
  private errorCount = 0;

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();
    
    try {
      // Test with a reliable symbol
      const response = await fetch(`${QUOTE_URL}?symbols=AAPL`, {
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
    try {
      const response = await httpClient.get<{
        quoteResponse: { result: YahooQuoteResult[] };
      }>(`${QUOTE_URL}?symbols=${encodeURIComponent(symbol)}`);
      
      const result = response.quoteResponse?.result?.[0];
      if (!result) return null;
      
      return this.mapToQuote(result);
    } catch (error) {
      console.error(`[YahooFinance] Failed to get quote for ${symbol}:`, error);
      return null;
    }
  }

  async getQuotes(symbols: string[]): Promise<Map<string, Quote>> {
    const quotes = new Map<string, Quote>();
    
    if (symbols.length === 0) return quotes;
    
    try {
      // Yahoo supports batch requests
      const symbolsStr = symbols.map(s => encodeURIComponent(s)).join(",");
      const response = await httpClient.get<{
        quoteResponse: { result: YahooQuoteResult[] };
      }>(`${QUOTE_URL}?symbols=${symbolsStr}`);
      
      const results = response.quoteResponse?.result || [];
      
      for (const result of results) {
        const quote = this.mapToQuote(result);
        if (quote) {
          quotes.set(result.symbol, quote);
        }
      }
    } catch (error) {
      console.error(`[YahooFinance] Failed to get quotes:`, error);
    }
    
    return quotes;
  }

  async getOHLCV(
    symbol: string,
    interval: OHLCVInterval,
    limit: number = 100
  ): Promise<OHLCV[]> {
    try {
      const yahooInterval = INTERVAL_MAP[interval];
      const range = RANGE_MAP[interval];
      
      const url = `${CHART_URL}/${encodeURIComponent(symbol)}?interval=${yahooInterval}&range=${range}`;
      const response = await httpClient.get<{
        chart: { result: YahooChartResult[] };
      }>(url);
      
      const result = response.chart?.result?.[0];
      if (!result?.timestamp || !result?.indicators?.quote?.[0]) {
        return [];
      }
      
      const { timestamp, indicators } = result;
      const quote = indicators.quote[0];
      
      if (!quote) return [];
      
      const ohlcv: OHLCV[] = [];
      
      for (let i = 0; i < timestamp.length && ohlcv.length < limit; i++) {
        const ts = timestamp[i];
        const open = quote.open?.[i];
        const high = quote.high?.[i];
        const low = quote.low?.[i];
        const close = quote.close?.[i];
        const volume = quote.volume?.[i];
        
        // Skip null values
        if (
          ts == null ||
          open == null ||
          high == null ||
          low == null ||
          close == null
        ) {
          continue;
        }
        
        ohlcv.push({
          timestamp: new Date(ts * 1000),
          open,
          high,
          low,
          close,
          volume: volume || 0,
        });
      }
      
      // Return most recent data first, limited to requested amount
      return ohlcv.slice(-limit);
    } catch (error) {
      console.error(`[YahooFinance] Failed to get OHLCV for ${symbol}:`, error);
      return [];
    }
  }

  async getFundamentals(symbol: string): Promise<Fundamentals | null> {
    try {
      // Get extended quote data which includes fundamentals
      const response = await httpClient.get<{
        quoteResponse: { result: YahooQuoteResult[] };
      }>(`${QUOTE_URL}?symbols=${encodeURIComponent(symbol)}&fields=regularMarketPrice,marketCap,trailingPE,forwardPE,priceToBook,dividendYield,fiftyTwoWeekHigh,fiftyTwoWeekLow,fiftyDayAverage,twoHundredDayAverage`);
      
      const result = response.quoteResponse?.result?.[0];
      if (!result) return null;
      
      return {
        symbol: result.symbol,
        marketCap: result.marketCap,
        pe: result.trailingPE,
        peRatio: result.trailingPE,
        pbRatio: result.priceToBook,
        dividendYield: result.dividendYield || result.trailingAnnualDividendYield,
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error(`[YahooFinance] Failed to get fundamentals for ${symbol}:`, error);
      return null;
    }
  }

  async searchAssets(query: string, limit: number = 10): Promise<Asset[]> {
    try {
      const response = await httpClient.get<YahooSearchResult>(
        `${SEARCH_URL}?q=${encodeURIComponent(query)}&quotesCount=${limit}&newsCount=0`
      );
      
      const quotes = response.quotes || [];
      const now = new Date();
      
      return quotes.map((q) => ({
        id: q.symbol,
        symbol: q.symbol,
        name: q.longname || q.shortname,
        assetClass: this.mapQuoteType(q.quoteType) === "etf" ? "etf" as const : "equity" as const,
        market: this.mapExchange(q.exchange) as "NSE" | "BSE" | "NYSE" | "NASDAQ" | "CRYPTO",
        country: this.getCountry(q.exchange) as "IN" | "US" | "GLOBAL",
        currency: this.getCurrency(q.exchange) as "INR" | "USD",
        sector: q.sector,
        industry: q.industry,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      }));
    } catch (error) {
      console.error(`[YahooFinance] Failed to search for ${query}:`, error);
      return [];
    }
  }

  private getCountry(exchange: string): string {
    if (exchange === "NSE" || exchange === "BSE" || exchange === "NSI" || exchange === "BOM") {
      return "IN";
    }
    return "US";
  }

  private getCurrency(exchange: string): string {
    if (exchange === "NSE" || exchange === "BSE" || exchange === "NSI" || exchange === "BOM") {
      return "INR";
    }
    return "USD";
  }

  private mapToQuote(result: YahooQuoteResult): Quote {
    return {
      symbol: result.symbol,
      price: result.regularMarketPrice,
      change: result.regularMarketChange,
      changePercent: result.regularMarketChangePercent,
      open: result.regularMarketOpen,
      high: result.regularMarketDayHigh,
      low: result.regularMarketDayLow,
      close: result.regularMarketPrice, // Current price is the close for the day
      previousClose: result.regularMarketPreviousClose,
      volume: result.regularMarketVolume,
      timestamp: new Date(result.regularMarketTime * 1000),
      currency: result.currency as "INR" | "USD",
    };
  }

  private mapQuoteType(quoteType: string): "stock" | "etf" | "mf" | "crypto" {
    switch (quoteType?.toUpperCase()) {
      case "EQUITY":
        return "stock";
      case "ETF":
        return "etf";
      case "MUTUALFUND":
        return "mf";
      case "CRYPTOCURRENCY":
        return "crypto";
      default:
        return "stock";
    }
  }

  private mapExchange(exchange: string): string {
    // Map Yahoo exchange codes to our standard codes
    const exchangeMap: Record<string, string> = {
      "NSI": "NSE",
      "NSE": "NSE",
      "BOM": "BSE",
      "BSE": "BSE",
      "NMS": "NASDAQ",
      "NGM": "NASDAQ",
      "NYQ": "NYSE",
      "NYS": "NYSE",
      "CCC": "CRYPTO",
    };
    
    return exchangeMap[exchange] || exchange;
  }
}

// Export singleton instance
export const yahooFinanceProvider = new YahooFinanceProvider();
