/**
 * Core domain types for the AI Portfolio platform
 */

// Asset types
export type AssetClass = "equity" | "etf" | "mutual_fund" | "crypto";
export type Market = "NSE" | "BSE" | "NYSE" | "NASDAQ" | "CRYPTO";
export type Country = "IN" | "US" | "GLOBAL";

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  assetClass: AssetClass;
  market: Market;
  country: Country;
  sector?: string;
  industry?: string;
  currency: "INR" | "USD";
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Quote types
export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  close?: number; // Current session close or last price
  previousClose: number;
  volume: number;
  marketCap?: number;
  timestamp: Date;
  source: string;
}

export interface OHLCV {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Fundamentals
export interface Fundamentals {
  symbol: string;
  // Valuation
  pe?: number; // Trailing P/E ratio (alias for peRatio)
  peRatio?: number;
  pbRatio?: number;
  psRatio?: number;
  evToEbitda?: number;
  pegRatio?: number;
  
  // Risk metrics
  beta?: number;
  
  // Profitability
  roe?: number;
  roa?: number;
  netMargin?: number;
  operatingMargin?: number;
  grossMargin?: number;
  
  // Growth
  revenueGrowth?: number;
  earningsGrowth?: number;
  
  // Dividend
  dividendYield?: number;
  dividendPerShare?: number;
  payoutRatio?: number;
  
  // Financial health
  debtToEquity?: number;
  currentRatio?: number;
  quickRatio?: number;
  
  // Per share
  eps?: number;
  bookValue?: number;
  
  // Size
  marketCap?: number;
  enterpriseValue?: number;
  sharesOutstanding?: number;
  
  // Dates
  fiscalYearEnd?: string;
  latestQuarter?: Date;
  updatedAt: Date;
}

// Technical indicators
export interface IndicatorSet {
  symbol: string;
  timestamp: Date;
  
  // Moving averages
  sma20?: number;
  sma50?: number;
  sma200?: number;
  ema12?: number;
  ema26?: number;
  
  // Momentum
  rsi?: number; // Alias for rsi14
  rsi14?: number;
  macd?: {
    macd: number;
    signal: number;
    histogram: number;
  };
  stochastic?: {
    k: number;
    d: number;
  };
  
  // Volatility
  atr14?: number;
  bollingerBands?: {
    upper: number;
    middle: number;
    lower: number;
  };
  
  // Volume
  volumeSma20?: number;
  obv?: number;
  
  // Trend
  adx?: number;
  trendStrength?: "strong_up" | "up" | "neutral" | "down" | "strong_down";
}

// News and sentiment
export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: Date;
  symbols: string[];
  sentiment: SentimentScore;
  categories: string[];
}

export interface SentimentSignal {
  symbol: string;
  overallScore: number; // -1 to 1
  label: "very_bearish" | "bearish" | "neutral" | "bullish" | "very_bullish";
  newsCount: number;
  socialScore?: number;
  analystRating?: {
    buy: number;
    hold: number;
    sell: number;
    target?: number;
  };
  updatedAt: Date;
}

export interface SentimentScore {
  score: number; // -1 to 1
  label: "negative" | "neutral" | "positive";
  confidence: number; // 0 to 1
}

// Recommendations
export type RecommendationAction = "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
export type RiskLevel = "low" | "medium" | "high" | "very_high";
export type InvestmentHorizon = "short" | "medium" | "long";
export type ValuationBadge = "undervalued" | "fairly_valued" | "overvalued";

export interface Recommendation {
  id: string;
  symbol: string;
  asset: Asset;
  
  // Score and action
  score: number; // 0-100
  action: RecommendationAction;
  confidence: number; // 0-100
  
  // Risk/reward
  riskLevel: RiskLevel;
  expectedUpside: {
    min: number;
    max: number;
  };
  
  // Entry/exit
  entryZone: {
    min: number;
    max: number;
  };
  targetPrice: number;
  stopLoss: number;
  
  // Timing
  horizon: InvestmentHorizon;
  holdDuration: string; // e.g., "3-6 months"
  
  // Allocation
  allocationSuggestion: number; // percentage 0-100
  
  // Valuation
  valuationBadge: ValuationBadge;
  
  // Reasoning
  keyReasons: string[];
  technicalSummary: string;
  fundamentalSummary: string;
  
  // Factor scores
  factors: {
    trend: number;
    momentum: number;
    risk: number;
    valuation: number;
    sentiment: number;
    liquidity: number;
  };
  
  // Compliance
  disclaimer: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  validUntil: Date;
}

// Portfolio types
export interface PortfolioPosition {
  id: string;
  symbol: string;
  asset: Asset;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  currentValue: number;
  totalCost: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  weight: number; // percentage in portfolio
  addedAt: Date;
}

export interface RiskProfile {
  // Overall
  overallRisk: RiskLevel;
  riskScore: number; // 0-100
  
  // Diversification
  diversificationScore: number; // 0-100
  concentrationRisk: number;
  sectorExposure: Record<string, number>;
  countryExposure: Record<string, number>;
  assetClassExposure: Record<AssetClass, number>;
  
  // Volatility
  portfolioVolatility: number;
  beta: number;
  sharpeRatio?: number;
  
  // Drawdown
  maxDrawdown: number;
  currentDrawdown: number;
  
  // Correlation
  correlationMatrix?: Record<string, Record<string, number>>;
}

// Market session
export type SessionStatus = "pre_market" | "open" | "closed" | "after_hours" | "holiday";

export interface MarketSession {
  market: Market;
  status: SessionStatus;
  isOpen: boolean;
  currentTime: Date;
  nextOpen?: Date;
  nextClose?: Date;
  holidayName?: string;
  timezone: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: Date;
    cached: boolean;
    source?: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}
