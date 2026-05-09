/**
 * Sentiment Analysis Service
 * Aggregates and normalizes sentiment from multiple sources
 */

import type { NewsItem, SentimentSignal, SentimentScore } from "@/types/domain";

/**
 * Sentiment source types
 */
export type SentimentSource = "news" | "social" | "analyst" | "market";

/**
 * Raw sentiment data from a source
 */
export interface RawSentiment {
  source: SentimentSource;
  score: number;        // -1 to 1
  confidence: number;   // 0 to 1
  sampleSize: number;
  timestamp: Date;
}

/**
 * Aggregated sentiment for an asset
 */
export interface AggregatedSentiment {
  symbol: string;
  overallScore: number;       // -1 to 1
  normalizedScore: number;    // 0 to 100
  label: SentimentLabel;
  sources: {
    news?: RawSentiment;
    social?: RawSentiment;
    analyst?: RawSentiment;
    market?: RawSentiment;
  };
  trend: "improving" | "stable" | "declining";
  updatedAt: Date;
}

export type SentimentLabel = "very_bearish" | "bearish" | "neutral" | "bullish" | "very_bullish";

/**
 * Source weights for aggregation
 */
const SOURCE_WEIGHTS: Record<SentimentSource, number> = {
  news: 0.30,
  social: 0.15,
  analyst: 0.35,
  market: 0.20,
};

/**
 * Convert sentiment score (-1 to 1) to label
 */
export function scoreToLabel(score: number): SentimentLabel {
  if (score >= 0.6) return "very_bullish";
  if (score >= 0.2) return "bullish";
  if (score >= -0.2) return "neutral";
  if (score >= -0.6) return "bearish";
  return "very_bearish";
}

/**
 * Convert sentiment score (-1 to 1) to normalized 0-100 scale
 */
export function normalizeScore(score: number): number {
  return Math.round((score + 1) * 50);
}

/**
 * Analyze sentiment from news headlines using keyword-based approach
 * In production, this would use NLP/ML models
 */
export function analyzeNewsHeadline(headline: string): SentimentScore {
  const lowerHeadline = headline.toLowerCase();

  // Positive keywords
  const positiveKeywords = [
    "surge", "soar", "jump", "gain", "rise", "rally", "bull", "growth",
    "profit", "beat", "exceed", "upgrade", "buy", "outperform", "record",
    "strong", "boost", "surge", "breakthrough", "success", "optimism",
    "momentum", "upbeat", "positive", "high", "best", "top", "lead",
  ];

  // Negative keywords
  const negativeKeywords = [
    "fall", "drop", "plunge", "crash", "decline", "loss", "bear", "cut",
    "miss", "downgrade", "sell", "underperform", "weak", "concern", "fear",
    "risk", "warn", "crisis", "problem", "fail", "trouble", "low", "worst",
    "slump", "tumble", "sink", "pessimism", "negative", "downturn",
  ];

  // Strong modifiers
  const strongModifiers = [
    "very", "extremely", "significantly", "sharply", "dramatically",
    "massive", "huge", "major", "critical", "severe",
  ];

  let score = 0;
  let matches = 0;

  // Count positive keywords
  for (const keyword of positiveKeywords) {
    if (lowerHeadline.includes(keyword)) {
      score += 0.15;
      matches++;
    }
  }

  // Count negative keywords
  for (const keyword of negativeKeywords) {
    if (lowerHeadline.includes(keyword)) {
      score -= 0.15;
      matches++;
    }
  }

  // Apply strong modifiers
  for (const modifier of strongModifiers) {
    if (lowerHeadline.includes(modifier)) {
      score *= 1.3;
      break;
    }
  }

  // Clamp score to -1 to 1
  score = Math.max(-1, Math.min(1, score));

  // Confidence based on number of matches
  const confidence = Math.min(1, matches * 0.2);

  return {
    score,
    label: score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral",
    confidence,
  };
}

/**
 * Aggregate sentiment from multiple news items
 */
export function aggregateNewsSentiment(newsItems: NewsItem[]): RawSentiment | null {
  if (newsItems.length === 0) return null;

  let totalScore = 0;
  let totalConfidence = 0;

  for (const item of newsItems) {
    // Weight more recent news higher
    const ageHours = (Date.now() - item.publishedAt.getTime()) / (1000 * 60 * 60);
    const recencyWeight = Math.max(0.3, 1 - ageHours / 168); // Decay over 1 week

    const sentimentScore = item.sentiment.score;
    const confidence = item.sentiment.confidence;

    totalScore += sentimentScore * confidence * recencyWeight;
    totalConfidence += confidence * recencyWeight;
  }

  const avgScore = totalConfidence > 0 ? totalScore / totalConfidence : 0;
  const avgConfidence = totalConfidence / newsItems.length;

  return {
    source: "news",
    score: avgScore,
    confidence: avgConfidence,
    sampleSize: newsItems.length,
    timestamp: new Date(),
  };
}

/**
 * Calculate market-based sentiment from price action
 */
export function calculateMarketSentiment(
  priceChange: number,
  volumeRatio: number,
  breadth?: { advancers: number; decliners: number }
): RawSentiment {
  let score = 0;

  // Price change contribution (-5% to +5% mapped to -0.5 to 0.5)
  score += Math.max(-0.5, Math.min(0.5, priceChange / 10));

  // Volume contribution (high volume amplifies sentiment)
  if (volumeRatio > 1.5) {
    score *= 1.2;
  } else if (volumeRatio < 0.5) {
    score *= 0.8;
  }

  // Market breadth contribution
  if (breadth) {
    const total = breadth.advancers + breadth.decliners;
    if (total > 0) {
      const breadthRatio = (breadth.advancers - breadth.decliners) / total;
      score += breadthRatio * 0.3;
    }
  }

  return {
    source: "market",
    score: Math.max(-1, Math.min(1, score)),
    confidence: 0.7,
    sampleSize: 1,
    timestamp: new Date(),
  };
}

/**
 * Calculate analyst-based sentiment
 */
export function calculateAnalystSentiment(
  ratings: { buy: number; hold: number; sell: number }
): RawSentiment {
  const total = ratings.buy + ratings.hold + ratings.sell;
  if (total === 0) {
    return {
      source: "analyst",
      score: 0,
      confidence: 0,
      sampleSize: 0,
      timestamp: new Date(),
    };
  }

  // Convert ratings to score (-1 to 1)
  // Buy = +1, Hold = 0, Sell = -1
  const score = (ratings.buy - ratings.sell) / total;

  // Confidence based on number of analysts
  const confidence = Math.min(1, total / 10);

  return {
    source: "analyst",
    score,
    confidence,
    sampleSize: total,
    timestamp: new Date(),
  };
}

/**
 * Aggregate sentiment from multiple sources
 */
export function aggregateSentiment(
  symbol: string,
  sources: Partial<Record<SentimentSource, RawSentiment>>,
  previousScore?: number
): AggregatedSentiment {
  let totalScore = 0;
  let totalWeight = 0;

  for (const [source, sentiment] of Object.entries(sources) as [SentimentSource, RawSentiment][]) {
    if (sentiment) {
      const weight = SOURCE_WEIGHTS[source] * sentiment.confidence;
      totalScore += sentiment.score * weight;
      totalWeight += weight;
    }
  }

  const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;

  // Determine trend
  let trend: "improving" | "stable" | "declining" = "stable";
  if (previousScore !== undefined) {
    const diff = overallScore - previousScore;
    if (diff > 0.1) trend = "improving";
    else if (diff < -0.1) trend = "declining";
  }

  return {
    symbol,
    overallScore,
    normalizedScore: normalizeScore(overallScore),
    label: scoreToLabel(overallScore),
    sources,
    trend,
    updatedAt: new Date(),
  };
}

/**
 * Create a SentimentSignal from aggregated sentiment
 */
export function createSentimentSignal(
  agg: AggregatedSentiment,
  analystRating?: { buy: number; hold: number; sell: number; target?: number }
): SentimentSignal {
  return {
    symbol: agg.symbol,
    overallScore: agg.overallScore,
    label: agg.label,
    newsCount: agg.sources.news?.sampleSize ?? 0,
    socialScore: agg.sources.social?.score,
    analystRating,
    updatedAt: agg.updatedAt,
  };
}

/**
 * Get sentiment color for UI
 */
export function getSentimentColor(label: SentimentLabel): string {
  switch (label) {
    case "very_bullish":
      return "text-emerald-500";
    case "bullish":
      return "text-green-500";
    case "neutral":
      return "text-yellow-500";
    case "bearish":
      return "text-orange-500";
    case "very_bearish":
      return "text-red-500";
  }
}

/**
 * Get sentiment badge variant for UI
 */
export function getSentimentBadgeVariant(
  label: SentimentLabel
): "default" | "secondary" | "destructive" | "outline" {
  switch (label) {
    case "very_bullish":
    case "bullish":
      return "default";
    case "neutral":
      return "secondary";
    case "bearish":
    case "very_bearish":
      return "destructive";
  }
}
