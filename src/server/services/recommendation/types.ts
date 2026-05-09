/**
 * Recommendation Service Types
 * Types for the AI-powered recommendation scoring engine
 */

import type { Asset, Quote, Fundamentals, IndicatorSet, OHLCV } from "@/types/domain";

/**
 * Factor scores that make up the overall recommendation
 */
export interface FactorScores {
  trend: number;        // 0-100: Price trend strength (MA alignment, higher highs)
  momentum: number;     // 0-100: RSI, MACD, rate of change
  risk: number;         // 0-100: Volatility-adjusted score (higher = lower risk)
  valuation: number;    // 0-100: P/E, P/B relative to sector/history
  sentiment: number;    // 0-100: News sentiment, social sentiment
  liquidity: number;    // 0-100: Volume, bid-ask spread, market cap
}

/**
 * Factor weights for different investment horizons
 */
export interface FactorWeights {
  trend: number;
  momentum: number;
  risk: number;
  valuation: number;
  sentiment: number;
  liquidity: number;
}

/**
 * Recommendation signal classification
 */
export type Signal = "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";

/**
 * Risk level classification
 */
export type RiskLevel = "very_low" | "low" | "moderate" | "high" | "very_high";

/**
 * Investment horizon
 */
export type Horizon = "short" | "medium" | "long";

/**
 * Confidence level for recommendations
 */
export type ConfidenceLevel = "low" | "medium" | "high" | "very_high";

/**
 * Valuation status
 */
export type ValuationStatus = "undervalued" | "fairly_valued" | "overvalued";

/**
 * Key reason for the recommendation
 */
export interface RecommendationReason {
  factor: keyof FactorScores;
  description: string;
  impact: "positive" | "negative" | "neutral";
  score: number;
}

/**
 * Price targets and levels
 */
export interface PriceLevels {
  entryZone: { low: number; high: number };
  target1: number;      // Conservative target
  target2: number;      // Moderate target
  target3?: number;     // Aggressive target (optional)
  stopLoss: number;
  resistance?: number;
  support?: number;
}

/**
 * Full recommendation payload
 */
export interface Recommendation {
  id: string;
  symbol: string;
  assetName: string;
  assetClass: string;
  
  // Core scores
  overallScore: number;           // 0-100
  factorScores: FactorScores;
  
  // Classification
  signal: Signal;
  confidence: ConfidenceLevel;
  riskLevel: RiskLevel;
  horizon: Horizon;
  valuation: ValuationStatus;
  
  // Actionable insights
  priceLevels: PriceLevels;
  expectedUpside: { min: number; max: number };   // Percentage
  holdDuration: { min: number; max: number };     // Days
  allocationSuggestion: number;                   // Percentage of portfolio
  
  // Explanations
  headline: string;
  summary: string;
  reasons: RecommendationReason[];
  risks: string[];
  catalysts: string[];
  
  // Metadata
  generatedAt: Date;
  dataFreshness: Date;
  version: string;
}

/**
 * Input data required for scoring
 */
export interface ScoringInput {
  asset: Asset;
  quote: Quote;
  ohlcv: OHLCV[];
  fundamentals?: Fundamentals;
  indicators?: IndicatorSet;
  sentimentScore?: number;        // 0-100
  sectorAvgPE?: number;
  sectorAvgPB?: number;
  marketSentiment?: number;       // 0-100
}

/**
 * Scoring configuration
 */
export interface ScoringConfig {
  horizon: Horizon;
  weights?: Partial<FactorWeights>;
  minConfidenceThreshold?: number;
  includeHighRisk?: boolean;
}

/**
 * Batch recommendation request
 */
export interface BatchRecommendationRequest {
  symbols: string[];
  config?: ScoringConfig;
  limit?: number;
  sortBy?: "score" | "upside" | "confidence" | "risk";
  sortOrder?: "asc" | "desc";
}

/**
 * Recommendation snapshot for persistence
 */
export interface RecommendationSnapshot {
  id: string;
  symbol: string;
  recommendation: Recommendation;
  createdAt: Date;
  expiresAt: Date;
  version: string;
}
