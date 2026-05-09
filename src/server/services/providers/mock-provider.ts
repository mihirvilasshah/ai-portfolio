/**
 * Mock Market Data Provider
 * Returns realistic sample data for development and testing
 */

import type { Quote, OHLCV, Fundamentals, NewsItem, Asset } from "@/types/domain";
import type { 
  MarketDataProvider, 
  ProviderCapabilities, 
  ProviderHealth,
  OHLCVInterval 
} from "./types";

// Sample price data for different assets
const MOCK_PRICES: Record<string, { price: number; currency: "INR" | "USD" }> = {
  // Indian Equities
  "RELIANCE.NS": { price: 2847.50, currency: "INR" },
  "TCS.NS": { price: 3456.75, currency: "INR" },
  "HDFCBANK.NS": { price: 1623.40, currency: "INR" },
  "INFY.NS": { price: 1478.25, currency: "INR" },
  "ICICIBANK.NS": { price: 1089.60, currency: "INR" },
  "HINDUNILVR.NS": { price: 2534.80, currency: "INR" },
  "SBIN.NS": { price: 756.30, currency: "INR" },
  "BHARTIARTL.NS": { price: 1567.90, currency: "INR" },
  "KOTAKBANK.NS": { price: 1834.55, currency: "INR" },
  "ITC.NS": { price: 438.20, currency: "INR" },
  
  // US Equities
  "AAPL": { price: 189.45, currency: "USD" },
  "MSFT": { price: 378.92, currency: "USD" },
  "GOOGL": { price: 141.56, currency: "USD" },
  "AMZN": { price: 178.34, currency: "USD" },
  "NVDA": { price: 875.28, currency: "USD" },
  "META": { price: 485.67, currency: "USD" },
  "TSLA": { price: 245.89, currency: "USD" },
  "JPM": { price: 198.45, currency: "USD" },
  "V": { price: 276.34, currency: "USD" },
  "JNJ": { price: 156.78, currency: "USD" },
  
  // Crypto
  "BTC": { price: 67845.50, currency: "USD" },
  "ETH": { price: 3456.78, currency: "USD" },
  "BNB": { price: 567.89, currency: "USD" },
  "SOL": { price: 145.67, currency: "USD" },
  "XRP": { price: 0.5234, currency: "USD" },
  "ADA": { price: 0.4567, currency: "USD" },
  "DOGE": { price: 0.1234, currency: "USD" },
  "MATIC": { price: 0.8765, currency: "USD" },
};

// Generate random price movement
function generatePriceChange(basePrice: number): { change: number; changePercent: number } {
  const changePercent = (Math.random() - 0.5) * 6; // -3% to +3%
  const change = basePrice * (changePercent / 100);
  return { change, changePercent };
}

// Generate OHLCV data
function generateOHLCV(
  basePrice: number,
  interval: OHLCVInterval,
  count: number
): OHLCV[] {
  const data: OHLCV[] = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  // Interval to milliseconds
  const intervalMs: Record<OHLCVInterval, number> = {
    "1m": 60 * 1000,
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "30m": 30 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "1w": 7 * 24 * 60 * 60 * 1000,
    "1M": 30 * 24 * 60 * 60 * 1000,
  };
  
  for (let i = count - 1; i >= 0; i--) {
    const volatility = 0.02; // 2% volatility
    const change = (Math.random() - 0.5) * 2 * volatility;
    const open = currentPrice;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * volatility);
    const low = Math.min(open, close) * (1 - Math.random() * volatility);
    const volume = Math.floor(100000 + Math.random() * 900000);
    
    data.push({
      timestamp: new Date(now.getTime() - i * intervalMs[interval]),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
    });
    
    currentPrice = close;
  }
  
  return data;
}

// Mock fundamentals data
const MOCK_FUNDAMENTALS: Record<string, Partial<Fundamentals>> = {
  "RELIANCE.NS": {
    peRatio: 28.5,
    pbRatio: 2.8,
    dividendYield: 0.35,
    marketCap: 19500000000000,
    eps: 99.91,
    roe: 9.8,
    debtToEquity: 0.45,
  },
  "TCS.NS": {
    peRatio: 32.4,
    pbRatio: 14.2,
    dividendYield: 1.2,
    marketCap: 12600000000000,
    eps: 106.67,
    roe: 48.5,
    debtToEquity: 0.05,
  },
  "AAPL": {
    peRatio: 29.8,
    pbRatio: 47.5,
    dividendYield: 0.5,
    marketCap: 2950000000000,
    eps: 6.36,
    roe: 160.9,
    debtToEquity: 1.81,
  },
  "MSFT": {
    peRatio: 35.2,
    pbRatio: 12.8,
    dividendYield: 0.72,
    marketCap: 2810000000000,
    eps: 10.76,
    roe: 38.5,
    debtToEquity: 0.35,
  },
};

// Mock news data
function generateMockNews(symbol?: string): NewsItem[] {
  const baseNews: Omit<NewsItem, "id">[] = [
    {
      headline: "Markets rally on strong earnings reports",
      summary: "Major indices closed higher as tech companies reported better-than-expected quarterly results, boosting investor confidence.",
      source: "Financial Times",
      url: "https://example.com/news/1",
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      symbols: ["AAPL", "MSFT", "GOOGL"],
      sentiment: { score: 0.7, label: "positive", confidence: 0.85 },
      categories: ["earnings", "technology"],
    },
    {
      headline: "RBI maintains repo rate, signals cautious stance",
      summary: "The Reserve Bank of India kept the repo rate unchanged at 6.5% while maintaining a focus on inflation management.",
      source: "Economic Times",
      url: "https://example.com/news/2",
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      symbols: ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS"],
      sentiment: { score: 0.1, label: "neutral", confidence: 0.75 },
      categories: ["monetary-policy", "banking"],
    },
    {
      headline: "Bitcoin surges past $67,000 on ETF inflows",
      summary: "Cryptocurrency markets showed strength as institutional investors continue to pour money into spot Bitcoin ETFs.",
      source: "CoinDesk",
      url: "https://example.com/news/3",
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      symbols: ["BTC", "ETH"],
      sentiment: { score: 0.8, label: "positive", confidence: 0.9 },
      categories: ["crypto", "etf"],
    },
    {
      headline: "IT sector outlook remains positive despite global headwinds",
      summary: "Analysts maintain bullish view on Indian IT companies citing strong deal pipelines and margin improvements.",
      source: "Mint",
      url: "https://example.com/news/4",
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      symbols: ["TCS.NS", "INFY.NS"],
      sentiment: { score: 0.6, label: "positive", confidence: 0.8 },
      categories: ["technology", "india"],
    },
    {
      headline: "Oil prices stabilize amid supply concerns",
      summary: "Crude oil prices found support as OPEC+ members signaled continued production discipline.",
      source: "Reuters",
      url: "https://example.com/news/5",
      publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      symbols: ["RELIANCE.NS"],
      sentiment: { score: 0.2, label: "neutral", confidence: 0.7 },
      categories: ["commodities", "energy"],
    },
  ];
  
  let news = baseNews.map((n, i) => ({ ...n, id: `news-${i + 1}` }));
  
  if (symbol) {
    news = news.filter(n => n.symbols.includes(symbol));
  }
  
  return news;
}

export class MockMarketDataProvider implements MarketDataProvider {
  name: "mock" = "mock";
  
  capabilities: ProviderCapabilities = {
    quotes: true,
    ohlcv: true,
    fundamentals: true,
    news: true,
    search: true,
    realtime: false,
  };
  
  async healthCheck(): Promise<ProviderHealth> {
    return {
      provider: "mock",
      isHealthy: true,
      latencyMs: 5,
      lastCheck: new Date(),
      errorCount: 0,
    };
  }
  
  async getQuote(symbol: string): Promise<Quote | null> {
    const priceData = MOCK_PRICES[symbol];
    if (!priceData) return null;
    
    const { change, changePercent } = generatePriceChange(priceData.price);
    const price = priceData.price + change;
    
    return {
      symbol,
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      open: Number((price * 0.998).toFixed(2)),
      high: Number((price * 1.015).toFixed(2)),
      low: Number((price * 0.985).toFixed(2)),
      previousClose: priceData.price,
      volume: Math.floor(1000000 + Math.random() * 5000000),
      marketCap: MOCK_FUNDAMENTALS[symbol]?.marketCap,
      timestamp: new Date(),
      source: "mock",
    };
  }
  
  async getQuotes(symbols: string[]): Promise<Map<string, Quote>> {
    const quotes = new Map<string, Quote>();
    
    for (const symbol of symbols) {
      const quote = await this.getQuote(symbol);
      if (quote) {
        quotes.set(symbol, quote);
      }
    }
    
    return quotes;
  }
  
  async getOHLCV(
    symbol: string,
    interval: OHLCVInterval,
    limit = 100
  ): Promise<OHLCV[]> {
    const priceData = MOCK_PRICES[symbol];
    if (!priceData) return [];
    
    return generateOHLCV(priceData.price, interval, limit);
  }
  
  async getFundamentals(symbol: string): Promise<Fundamentals | null> {
    const base = MOCK_FUNDAMENTALS[symbol];
    if (!base) {
      // Generate random fundamentals for unknown symbols
      return {
        symbol,
        peRatio: 15 + Math.random() * 30,
        pbRatio: 1 + Math.random() * 10,
        dividendYield: Math.random() * 3,
        marketCap: Math.floor(Math.random() * 1000000000000),
        eps: Math.random() * 100,
        roe: Math.random() * 30,
        debtToEquity: Math.random() * 2,
        updatedAt: new Date(),
      };
    }
    
    return {
      symbol,
      ...base,
      updatedAt: new Date(),
    };
  }
  
  async getNews(symbol?: string, limit = 10): Promise<NewsItem[]> {
    const news = generateMockNews(symbol);
    return news.slice(0, limit);
  }
  
  async searchAssets(query: string, limit = 10): Promise<Asset[]> {
    // Mock search - filter from known symbols
    const allSymbols = Object.keys(MOCK_PRICES);
    const queryLower = query.toLowerCase();
    
    const matches = allSymbols
      .filter(s => s.toLowerCase().includes(queryLower))
      .slice(0, limit)
      .map(symbol => {
        const isIndian = symbol.endsWith(".NS");
        const isCrypto = ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "MATIC"].includes(symbol);
        
        return {
          id: symbol,
          symbol,
          name: symbol.replace(".NS", ""),
          assetClass: isCrypto ? "crypto" : "equity",
          market: isCrypto ? "CRYPTO" : isIndian ? "NSE" : "NYSE",
          country: isCrypto ? "GLOBAL" : isIndian ? "IN" : "US",
          currency: isIndian ? "INR" : "USD",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Asset;
      });
    
    return matches;
  }
}

// Export singleton instance
export const mockProvider = new MockMarketDataProvider();
