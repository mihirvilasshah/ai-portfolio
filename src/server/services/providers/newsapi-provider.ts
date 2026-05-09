/**
 * NewsAPI Provider
 * Provider for market and financial news
 * Free tier: 100 requests/day (requires API key)
 */

import type { NewsItem } from "@/types/domain";
import type {
  MarketDataProvider,
  ProviderCapabilities,
  ProviderHealth,
  OHLCVInterval,
} from "./types";
import type { Quote, OHLCV, Asset } from "@/types/domain";
import { httpClient } from "@/lib/http/client";

const BASE_URL = "https://newsapi.org/v2";

// Get API key from environment
const getApiKey = () => process.env.NEWS_API_KEY || "";

interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

// Financial news sources
const FINANCIAL_SOURCES = [
  "bloomberg",
  "business-insider",
  "financial-times",
  "fortune",
  "the-wall-street-journal",
  "reuters",
  "cnbc",
].join(",");

// Market-related keywords for searches
const MARKET_KEYWORDS = [
  "stock market",
  "nasdaq",
  "dow jones",
  "s&p 500",
  "trading",
  "investor",
  "earnings",
  "fed",
  "interest rate",
];

export class NewsAPIProvider implements MarketDataProvider {
  name = "newsapi" as const;
  
  capabilities: ProviderCapabilities = {
    quotes: false,
    ohlcv: false,
    fundamentals: false,
    news: true,
    search: false,
    realtime: false,
  };

  private errorCount = 0;
  private lastHealthCheck: ProviderHealth | null = null;
  private dailyRequestCount = 0;
  private dailyResetTime = this.getNextMidnight();
  private readonly DAILY_LIMIT = 100; // Free tier limit

  private getNextMidnight(): number {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  }

  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Reset counter at midnight
    if (now >= this.dailyResetTime) {
      this.dailyRequestCount = 0;
      this.dailyResetTime = this.getNextMidnight();
    }
    
    if (this.dailyRequestCount >= this.DAILY_LIMIT) {
      console.warn("[NewsAPI] Daily rate limit reached");
      return false;
    }
    
    this.dailyRequestCount++;
    return true;
  }

  private buildUrl(endpoint: string, params: Record<string, string> = {}): string {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn("[NewsAPI] No API key configured");
      return "";
    }
    
    const searchParams = new URLSearchParams({
      ...params,
      apiKey,
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
      const url = this.buildUrl("/top-headlines", {
        country: "us",
        category: "business",
        pageSize: "1",
      });
      
      const response = await fetch(url, {
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
        quotaRemaining: this.DAILY_LIMIT - this.dailyRequestCount,
        quotaResetAt: new Date(this.dailyResetTime),
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

  // News-only provider - these methods return empty/null
  async getQuote(): Promise<Quote | null> {
    return null;
  }

  async getQuotes(): Promise<Map<string, Quote>> {
    return new Map();
  }

  async getOHLCV(): Promise<OHLCV[]> {
    return [];
  }

  async searchAssets(): Promise<Asset[]> {
    return [];
  }

  async getNews(symbol?: string, limit: number = 20): Promise<NewsItem[]> {
    if (!this.checkRateLimit()) return [];
    
    const apiKey = getApiKey();
    if (!apiKey) return [];
    
    try {
      let url: string;
      
      if (symbol) {
        // Company-specific news
        const companyName = this.getCompanyName(symbol);
        url = this.buildUrl("/everything", {
          q: `"${companyName}" OR "${symbol}"`,
          sortBy: "publishedAt",
          language: "en",
          pageSize: limit.toString(),
        });
      } else {
        // General financial news - use top headlines
        url = this.buildUrl("/top-headlines", {
          category: "business",
          country: "us",
          pageSize: limit.toString(),
        });
      }
      
      const response = await httpClient.get<NewsAPIResponse>(url);
      
      if (response.status !== "ok") {
        return [];
      }
      
      return response.articles
        .filter(article => article.title && article.title !== "[Removed]")
        .map((article) => ({
          id: this.generateId(article),
          title: article.title,
          summary: article.description || "",
          source: article.source.name,
          url: article.url,
          imageUrl: article.urlToImage || undefined,
          publishedAt: new Date(article.publishedAt),
          symbols: symbol ? [symbol] : [],
          sentiment: this.inferSentiment(article.title, article.description || ""),
        }));
    } catch (error) {
      console.error(`[NewsAPI] Failed to get news:`, error);
      return [];
    }
  }

  async getMarketNews(limit: number = 20): Promise<NewsItem[]> {
    if (!this.checkRateLimit()) return [];
    
    const apiKey = getApiKey();
    if (!apiKey) return [];
    
    try {
      // Use everything endpoint with market keywords
      const url = this.buildUrl("/everything", {
        q: MARKET_KEYWORDS.slice(0, 3).join(" OR "),
        sortBy: "publishedAt",
        language: "en",
        pageSize: limit.toString(),
      });
      
      const response = await httpClient.get<NewsAPIResponse>(url);
      
      if (response.status !== "ok") {
        return [];
      }
      
      return response.articles
        .filter(article => article.title && article.title !== "[Removed]")
        .map((article) => ({
          id: this.generateId(article),
          title: article.title,
          summary: article.description || "",
          source: article.source.name,
          url: article.url,
          imageUrl: article.urlToImage || undefined,
          publishedAt: new Date(article.publishedAt),
          symbols: this.extractSymbols(article.title, article.description || ""),
          sentiment: this.inferSentiment(article.title, article.description || ""),
        }));
    } catch (error) {
      console.error(`[NewsAPI] Failed to get market news:`, error);
      return [];
    }
  }

  async getTopHeadlines(
    category: "business" | "technology" = "business",
    country: string = "us",
    limit: number = 20
  ): Promise<NewsItem[]> {
    if (!this.checkRateLimit()) return [];
    
    const apiKey = getApiKey();
    if (!apiKey) return [];
    
    try {
      const url = this.buildUrl("/top-headlines", {
        category,
        country,
        pageSize: limit.toString(),
      });
      
      const response = await httpClient.get<NewsAPIResponse>(url);
      
      if (response.status !== "ok") {
        return [];
      }
      
      return response.articles
        .filter(article => article.title && article.title !== "[Removed]")
        .map((article) => ({
          id: this.generateId(article),
          title: article.title,
          summary: article.description || "",
          source: article.source.name,
          url: article.url,
          imageUrl: article.urlToImage || undefined,
          publishedAt: new Date(article.publishedAt),
          symbols: [],
          sentiment: this.inferSentiment(article.title, article.description || ""),
        }));
    } catch (error) {
      console.error(`[NewsAPI] Failed to get top headlines:`, error);
      return [];
    }
  }

  private generateId(article: NewsAPIArticle): string {
    // Generate a consistent ID from URL
    return Buffer.from(article.url).toString("base64").slice(0, 20);
  }

  private getCompanyName(symbol: string): string {
    // Map common symbols to company names for better search
    const symbolToName: Record<string, string> = {
      "AAPL": "Apple",
      "MSFT": "Microsoft",
      "GOOGL": "Google Alphabet",
      "AMZN": "Amazon",
      "NVDA": "NVIDIA",
      "META": "Meta Facebook",
      "TSLA": "Tesla",
      "BTC": "Bitcoin",
      "ETH": "Ethereum",
      "RELIANCE.NS": "Reliance Industries",
      "TCS.NS": "Tata Consultancy Services",
      "HDFCBANK.NS": "HDFC Bank",
      "INFY.NS": "Infosys",
    };
    
    return symbolToName[symbol] || symbol.replace(".NS", "").replace(".BSE", "");
  }

  private extractSymbols(title: string, description: string): string[] {
    const text = (title + " " + description).toUpperCase();
    const symbols: string[] = [];
    
    // Common stock symbols to look for
    const knownSymbols = [
      "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA",
      "JPM", "BAC", "V", "MA", "BTC", "ETH",
    ];
    
    for (const symbol of knownSymbols) {
      if (text.includes(symbol)) {
        symbols.push(symbol);
      }
    }
    
    return symbols;
  }

  private inferSentiment(title: string, description: string): "positive" | "negative" | "neutral" {
    const text = (title + " " + description).toLowerCase();
    
    const positiveWords = [
      "surge", "jump", "rally", "gain", "rise", "soar", "boom", "bullish",
      "record", "breakthrough", "growth", "profit", "success", "beat", "strong",
      "optimistic", "upgrade", "buy", "outperform",
    ];
    
    const negativeWords = [
      "fall", "drop", "crash", "decline", "slump", "bearish", "loss",
      "miss", "fail", "warning", "risk", "concern", "fear", "crisis",
      "downgrade", "sell", "cut", "weak", "recession", "inflation",
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
export const newsAPIProvider = new NewsAPIProvider();
