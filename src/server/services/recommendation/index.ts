/**
 * Recommendation Scoring Engine
 * AI-powered weighted factor model for investment recommendations
 */

import type {
  FactorScores,
  FactorWeights,
  Signal,
  RiskLevel,
  Horizon,
  ConfidenceLevel,
  ValuationStatus,
  Recommendation,
  RecommendationReason,
  PriceLevels,
  ScoringInput,
  ScoringConfig,
} from "./types";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
} from "@/server/services/indicators";

// Default weights by investment horizon
const HORIZON_WEIGHTS: Record<Horizon, FactorWeights> = {
  short: {
    trend: 0.25,
    momentum: 0.30,
    risk: 0.15,
    valuation: 0.05,
    sentiment: 0.15,
    liquidity: 0.10,
  },
  medium: {
    trend: 0.20,
    momentum: 0.15,
    risk: 0.20,
    valuation: 0.20,
    sentiment: 0.10,
    liquidity: 0.15,
  },
  long: {
    trend: 0.10,
    momentum: 0.05,
    risk: 0.25,
    valuation: 0.35,
    sentiment: 0.05,
    liquidity: 0.20,
  },
};

/**
 * Calculate trend score based on moving average alignment and price action
 */
function calculateTrendScore(input: ScoringInput): number {
  const { ohlcv, quote } = input;
  if (ohlcv.length < 50) return 50; // Neutral if insufficient data

  const closes = ohlcv.map((c) => c.close);
  const currentPrice = quote.price;

  // Calculate moving averages
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const ema12 = calculateEMA(closes, 12);

  if (!sma20 || !sma50 || !ema12) return 50;

  let score = 50;

  // Price above MAs is bullish
  if (currentPrice > sma20) score += 10;
  if (currentPrice > sma50) score += 10;
  if (currentPrice > ema12) score += 5;

  // MA alignment (20 > 50 is bullish)
  if (sma20 > sma50) score += 15;

  // Higher highs and higher lows (last 20 bars)
  const recent20 = ohlcv.slice(-20);
  const highs = recent20.map((c) => c.high);
  const lows = recent20.map((c) => c.low);

  const recentHigh = Math.max(...highs.slice(-5));
  const prevHigh = Math.max(...highs.slice(0, 15));
  const recentLow = Math.min(...lows.slice(-5));
  const prevLow = Math.min(...lows.slice(0, 15));

  if (recentHigh > prevHigh && recentLow > prevLow) {
    score += 10; // Uptrend
  } else if (recentHigh < prevHigh && recentLow < prevLow) {
    score -= 10; // Downtrend
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate momentum score based on RSI, MACD, and rate of change
 */
function calculateMomentumScore(input: ScoringInput): number {
  const { ohlcv, indicators } = input;
  if (ohlcv.length < 26) return 50;

  const closes = ohlcv.map((c) => c.close);
  let score = 50;

  // RSI analysis
  const rsi = indicators?.rsi ?? calculateRSI(closes, 14);
  if (rsi !== null) {
    if (rsi > 70) score -= 15; // Overbought
    else if (rsi > 60) score += 5;
    else if (rsi > 50) score += 10;
    else if (rsi > 40) score += 5;
    else if (rsi > 30) score -= 5;
    else score -= 15; // Oversold (contrarian opportunity but momentum is low)
  }

  // MACD analysis
  const macd = calculateMACD(closes);
  if (macd) {
    if (macd.histogram > 0) {
      score += 10;
      if (macd.macd > macd.signal) score += 5; // Bullish crossover
    } else {
      score -= 10;
      if (macd.macd < macd.signal) score -= 5; // Bearish crossover
    }
  }

  // Rate of change (20-day)
  if (closes.length >= 20) {
    const roc = ((closes[closes.length - 1]! - closes[closes.length - 20]!) / closes[closes.length - 20]!) * 100;
    if (roc > 10) score += 10;
    else if (roc > 5) score += 5;
    else if (roc > 0) score += 2;
    else if (roc > -5) score -= 2;
    else if (roc > -10) score -= 5;
    else score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate risk score (higher score = lower risk)
 */
function calculateRiskScore(input: ScoringInput): number {
  const { ohlcv, quote, fundamentals } = input;
  if (ohlcv.length < 20) return 50;

  let score = 70; // Start with moderate-low risk assumption

  // Volatility analysis using ATR
  const atr = calculateATR(ohlcv, 14);
  if (atr !== null) {
    const atrPercent = (atr / quote.price) * 100;
    if (atrPercent > 5) score -= 20; // High volatility
    else if (atrPercent > 3) score -= 10;
    else if (atrPercent > 2) score -= 5;
    else if (atrPercent < 1) score += 10; // Low volatility
  }

  // Bollinger Band position
  const closes = ohlcv.map((c) => c.close);
  const bb = calculateBollingerBands(closes, 20, 2);
  if (bb) {
    const bbWidth = (bb.upper - bb.lower) / bb.middle;
    if (bbWidth > 0.1) score -= 10; // Wide bands = high volatility
    else if (bbWidth < 0.05) score += 10; // Narrow bands = low volatility
  }

  // Beta (if available from fundamentals)
  if (fundamentals?.beta) {
    if (fundamentals.beta > 1.5) score -= 15;
    else if (fundamentals.beta > 1.2) score -= 10;
    else if (fundamentals.beta > 1) score -= 5;
    else if (fundamentals.beta < 0.8) score += 10;
  }

  // Market cap risk adjustment
  if (fundamentals?.marketCap) {
    const capInBillions = fundamentals.marketCap / 1e9;
    if (capInBillions > 100) score += 10; // Large cap
    else if (capInBillions > 10) score += 5; // Mid cap
    else if (capInBillions < 1) score -= 10; // Small cap
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate valuation score
 */
function calculateValuationScore(input: ScoringInput): number {
  const { fundamentals, sectorAvgPE, sectorAvgPB } = input;
  if (!fundamentals) return 50; // Neutral if no fundamentals

  let score = 50;

  // P/E analysis
  if (fundamentals.peRatio && fundamentals.peRatio > 0) {
    const pe = fundamentals.peRatio;
    const sectorPE = sectorAvgPE ?? 20;

    if (pe < sectorPE * 0.6) score += 20; // Significantly undervalued
    else if (pe < sectorPE * 0.8) score += 15;
    else if (pe < sectorPE) score += 5;
    else if (pe > sectorPE * 1.5) score -= 15;
    else if (pe > sectorPE * 1.2) score -= 10;

    // Absolute PE bounds
    if (pe > 50) score -= 10;
    else if (pe < 10) score += 10;
  }

  // P/B analysis
  if (fundamentals.pbRatio && fundamentals.pbRatio > 0) {
    const pb = fundamentals.pbRatio;
    const sectorPB = sectorAvgPB ?? 3;

    if (pb < 1) score += 15; // Trading below book value
    else if (pb < sectorPB * 0.8) score += 10;
    else if (pb > sectorPB * 1.5) score -= 10;
  }

  // ROE consideration (high ROE justifies higher valuation)
  if (fundamentals.roe && fundamentals.roe > 0) {
    if (fundamentals.roe > 25) score += 10;
    else if (fundamentals.roe > 15) score += 5;
    else if (fundamentals.roe < 5) score -= 10;
  }

  // Dividend yield (value indicator)
  if (fundamentals.dividendYield && fundamentals.dividendYield > 0) {
    if (fundamentals.dividendYield > 5) score += 10;
    else if (fundamentals.dividendYield > 3) score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate sentiment score
 */
function calculateSentimentScore(input: ScoringInput): number {
  const { sentimentScore, marketSentiment, quote } = input;

  // Start with provided sentiment or neutral
  let score = sentimentScore ?? 50;

  // Adjust for market sentiment
  if (marketSentiment !== undefined) {
    score = score * 0.7 + marketSentiment * 0.3;
  }

  // Price change as a sentiment indicator
  if (quote.changePercent > 3) score += 10;
  else if (quote.changePercent > 1) score += 5;
  else if (quote.changePercent < -3) score -= 10;
  else if (quote.changePercent < -1) score -= 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate liquidity score
 */
function calculateLiquidityScore(input: ScoringInput): number {
  const { quote, fundamentals, ohlcv } = input;
  let score = 60;

  // Volume analysis
  if (quote.volume && ohlcv.length >= 20) {
    const avgVolume = ohlcv.slice(-20).reduce((sum, c) => sum + c.volume, 0) / 20;
    const volumeRatio = quote.volume / avgVolume;

    if (volumeRatio > 2) score += 15; // High interest
    else if (volumeRatio > 1.2) score += 10;
    else if (volumeRatio < 0.5) score -= 15; // Low interest
    else if (volumeRatio < 0.8) score -= 5;
  }

  // Market cap as liquidity proxy
  if (fundamentals?.marketCap) {
    const capInBillions = fundamentals.marketCap / 1e9;
    if (capInBillions > 50) score += 15;
    else if (capInBillions > 10) score += 10;
    else if (capInBillions > 1) score += 5;
    else if (capInBillions < 0.1) score -= 15;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate all factor scores
 */
export function calculateFactorScores(input: ScoringInput): FactorScores {
  return {
    trend: calculateTrendScore(input),
    momentum: calculateMomentumScore(input),
    risk: calculateRiskScore(input),
    valuation: calculateValuationScore(input),
    sentiment: calculateSentimentScore(input),
    liquidity: calculateLiquidityScore(input),
  };
}

/**
 * Calculate overall score from factor scores and weights
 */
export function calculateOverallScore(
  factors: FactorScores,
  weights: FactorWeights
): number {
  const score =
    factors.trend * weights.trend +
    factors.momentum * weights.momentum +
    factors.risk * weights.risk +
    factors.valuation * weights.valuation +
    factors.sentiment * weights.sentiment +
    factors.liquidity * weights.liquidity;

  return Math.round(score);
}

/**
 * Determine signal from score
 */
export function getSignal(score: number): Signal {
  if (score >= 80) return "strong_buy";
  if (score >= 65) return "buy";
  if (score >= 45) return "hold";
  if (score >= 30) return "sell";
  return "strong_sell";
}

/**
 * Determine risk level from risk score
 */
export function getRiskLevel(riskScore: number): RiskLevel {
  if (riskScore >= 80) return "very_low";
  if (riskScore >= 65) return "low";
  if (riskScore >= 45) return "moderate";
  if (riskScore >= 30) return "high";
  return "very_high";
}

/**
 * Determine confidence level
 */
export function getConfidence(
  factors: FactorScores,
  dataQuality: number
): ConfidenceLevel {
  // Check factor alignment
  const scores = Object.values(factors);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Lower variance = higher confidence
  let confidence = 70;
  if (stdDev < 10) confidence += 15;
  else if (stdDev < 15) confidence += 10;
  else if (stdDev > 25) confidence -= 15;
  else if (stdDev > 20) confidence -= 10;

  // Adjust for data quality
  confidence = confidence * 0.7 + dataQuality * 0.3;

  if (confidence >= 80) return "very_high";
  if (confidence >= 65) return "high";
  if (confidence >= 45) return "medium";
  return "low";
}

/**
 * Determine valuation status
 */
export function getValuationStatus(valuationScore: number): ValuationStatus {
  if (valuationScore >= 65) return "undervalued";
  if (valuationScore >= 40) return "fairly_valued";
  return "overvalued";
}

/**
 * Calculate price levels
 */
export function calculatePriceLevels(
  input: ScoringInput,
  signal: Signal
): PriceLevels {
  const { quote, ohlcv } = input;
  const currentPrice = quote.price;

  // Calculate ATR for volatility-based targets
  const atr = calculateATR(ohlcv, 14) ?? currentPrice * 0.02;

  // Support/resistance from recent price action
  const recent20 = ohlcv.slice(-20);
  const highs = recent20.map((c) => c.high);
  const lows = recent20.map((c) => c.low);
  const resistance = Math.max(...highs);
  const support = Math.min(...lows);

  // Calculate targets based on signal
  let target1Multiplier = 1.05;
  let target2Multiplier = 1.10;
  let target3Multiplier = 1.20;
  let stopLossMultiplier = 0.95;

  if (signal === "strong_buy") {
    target1Multiplier = 1.08;
    target2Multiplier = 1.15;
    target3Multiplier = 1.25;
    stopLossMultiplier = 0.92;
  } else if (signal === "buy") {
    target1Multiplier = 1.05;
    target2Multiplier = 1.10;
    target3Multiplier = 1.18;
    stopLossMultiplier = 0.94;
  } else if (signal === "hold") {
    target1Multiplier = 1.03;
    target2Multiplier = 1.06;
    stopLossMultiplier = 0.96;
  } else {
    // Sell signals - limited upside
    target1Multiplier = 1.02;
    target2Multiplier = 1.04;
    stopLossMultiplier = 0.97;
  }

  // Entry zone based on support and current price
  const entryLow = Math.min(currentPrice * 0.98, support * 1.01);
  const entryHigh = currentPrice * 1.01;

  return {
    entryZone: { low: Number(entryLow.toFixed(2)), high: Number(entryHigh.toFixed(2)) },
    target1: Number((currentPrice * target1Multiplier).toFixed(2)),
    target2: Number((currentPrice * target2Multiplier).toFixed(2)),
    target3: signal === "strong_buy" || signal === "buy" 
      ? Number((currentPrice * target3Multiplier).toFixed(2)) 
      : undefined,
    stopLoss: Number((currentPrice * stopLossMultiplier).toFixed(2)),
    resistance: Number(resistance.toFixed(2)),
    support: Number(support.toFixed(2)),
  };
}

/**
 * Generate recommendation reasons
 */
export function generateReasons(
  factors: FactorScores,
  input: ScoringInput
): RecommendationReason[] {
  const reasons: RecommendationReason[] = [];

  // Trend reasons
  if (factors.trend >= 70) {
    reasons.push({
      factor: "trend",
      description: "Strong uptrend with price above key moving averages",
      impact: "positive",
      score: factors.trend,
    });
  } else if (factors.trend <= 30) {
    reasons.push({
      factor: "trend",
      description: "Downtrend with price below moving averages",
      impact: "negative",
      score: factors.trend,
    });
  }

  // Momentum reasons
  if (factors.momentum >= 70) {
    reasons.push({
      factor: "momentum",
      description: "Strong momentum with bullish technical indicators",
      impact: "positive",
      score: factors.momentum,
    });
  } else if (factors.momentum <= 30) {
    reasons.push({
      factor: "momentum",
      description: "Weak momentum signals caution",
      impact: "negative",
      score: factors.momentum,
    });
  }

  // Risk reasons
  if (factors.risk >= 70) {
    reasons.push({
      factor: "risk",
      description: "Low volatility and stable price action",
      impact: "positive",
      score: factors.risk,
    });
  } else if (factors.risk <= 30) {
    reasons.push({
      factor: "risk",
      description: "High volatility increases risk",
      impact: "negative",
      score: factors.risk,
    });
  }

  // Valuation reasons
  if (factors.valuation >= 70) {
    reasons.push({
      factor: "valuation",
      description: "Attractive valuation relative to fundamentals",
      impact: "positive",
      score: factors.valuation,
    });
  } else if (factors.valuation <= 30) {
    reasons.push({
      factor: "valuation",
      description: "Premium valuation may limit upside",
      impact: "negative",
      score: factors.valuation,
    });
  }

  // Sentiment reasons
  if (factors.sentiment >= 70) {
    reasons.push({
      factor: "sentiment",
      description: "Positive market sentiment and news flow",
      impact: "positive",
      score: factors.sentiment,
    });
  } else if (factors.sentiment <= 30) {
    reasons.push({
      factor: "sentiment",
      description: "Negative sentiment may weigh on price",
      impact: "negative",
      score: factors.sentiment,
    });
  }

  // Liquidity reasons
  if (factors.liquidity >= 70) {
    reasons.push({
      factor: "liquidity",
      description: "Good trading volume ensures easy entry/exit",
      impact: "positive",
      score: factors.liquidity,
    });
  } else if (factors.liquidity <= 30) {
    reasons.push({
      factor: "liquidity",
      description: "Low liquidity may impact execution",
      impact: "negative",
      score: factors.liquidity,
    });
  }

  return reasons;
}

/**
 * Generate headline and summary
 */
function generateHeadlineAndSummary(
  signal: Signal,
  factors: FactorScores,
  input: ScoringInput
): { headline: string; summary: string } {
  const { asset, quote } = input;
  const name = asset.name;
  const symbol = asset.symbol;

  let headline = "";
  let summary = "";

  switch (signal) {
    case "strong_buy":
      headline = `${name} shows strong buying opportunity`;
      summary = `${symbol} exhibits strong technical momentum and favorable fundamentals. Multiple factors align for a potential upside move. Consider accumulating on dips.`;
      break;
    case "buy":
      headline = `${name} presents buying opportunity`;
      summary = `${symbol} shows positive signals across trend and momentum indicators. Fundamentals support the current price action. Suitable for medium-term accumulation.`;
      break;
    case "hold":
      headline = `${name} in consolidation phase`;
      summary = `${symbol} is currently consolidating with mixed signals. Existing positions can be held, but new entries should wait for clearer direction.`;
      break;
    case "sell":
      headline = `Caution advised on ${name}`;
      summary = `${symbol} shows weakening technical indicators. Consider reducing exposure or tightening stop losses. Wait for stabilization before fresh entries.`;
      break;
    case "strong_sell":
      headline = `Exit recommended for ${name}`;
      summary = `${symbol} exhibits significant weakness across multiple factors. Risk-reward is unfavorable. Consider exiting positions and avoiding new entries.`;
      break;
  }

  return { headline, summary };
}

/**
 * Main scoring function - generates full recommendation
 */
export function generateRecommendation(
  input: ScoringInput,
  config: ScoringConfig = { horizon: "medium" }
): Recommendation {
  const { asset, quote, ohlcv, fundamentals } = input;
  const weights = { ...HORIZON_WEIGHTS[config.horizon], ...config.weights };

  // Calculate all factor scores
  const factorScores = calculateFactorScores(input);

  // Calculate overall score
  const overallScore = calculateOverallScore(factorScores, weights);

  // Derive classifications
  const signal = getSignal(overallScore);
  const riskLevel = getRiskLevel(factorScores.risk);
  const valuation = getValuationStatus(factorScores.valuation);

  // Data quality score (based on available data)
  const dataQuality = 
    (ohlcv.length >= 50 ? 30 : ohlcv.length >= 20 ? 20 : 10) +
    (fundamentals ? 30 : 0) +
    (input.sentimentScore !== undefined ? 20 : 0) +
    (quote.volume ? 20 : 0);

  const confidence = getConfidence(factorScores, dataQuality);

  // Calculate price levels
  const priceLevels = calculatePriceLevels(input, signal);

  // Calculate expected upside
  const expectedUpside = {
    min: ((priceLevels.target1 - quote.price) / quote.price) * 100,
    max: ((priceLevels.target2 - quote.price) / quote.price) * 100,
  };

  // Hold duration based on horizon
  const holdDuration = {
    short: { min: 1, max: 14 },
    medium: { min: 14, max: 90 },
    long: { min: 90, max: 365 },
  }[config.horizon];

  // Allocation suggestion based on score and risk
  const baseAllocation = overallScore >= 70 ? 5 : overallScore >= 50 ? 3 : 1;
  const riskAdjustment = factorScores.risk >= 60 ? 1 : 0.5;
  const allocationSuggestion = Math.round(baseAllocation * riskAdjustment);

  // Generate reasons
  const reasons = generateReasons(factorScores, input);

  // Generate headline and summary
  const { headline, summary } = generateHeadlineAndSummary(signal, factorScores, input);

  // Generate risks list
  const risks: string[] = [];
  if (factorScores.risk < 50) risks.push("High volatility may lead to sudden price swings");
  if (factorScores.valuation < 40) risks.push("Premium valuation leaves limited room for error");
  if (factorScores.liquidity < 50) risks.push("Low liquidity may impact trade execution");
  if (factorScores.momentum < 40) risks.push("Weak momentum could lead to further decline");

  // Generate catalysts
  const catalysts: string[] = [];
  if (factorScores.momentum > 60) catalysts.push("Technical breakout potential");
  if (factorScores.valuation > 60) catalysts.push("Value re-rating opportunity");
  if (factorScores.sentiment > 60) catalysts.push("Positive sentiment may drive buying");
  if (fundamentals?.dividendYield && fundamentals.dividendYield > 3) {
    catalysts.push("Attractive dividend yield");
  }

  return {
    id: `rec_${asset.symbol}_${Date.now()}`,
    symbol: asset.symbol,
    assetName: asset.name,
    assetClass: asset.assetClass,
    overallScore,
    factorScores,
    signal,
    confidence,
    riskLevel,
    horizon: config.horizon,
    valuation,
    priceLevels,
    expectedUpside: {
      min: Number(expectedUpside.min.toFixed(1)),
      max: Number(expectedUpside.max.toFixed(1)),
    },
    holdDuration,
    allocationSuggestion,
    headline,
    summary,
    reasons,
    risks,
    catalysts,
    generatedAt: new Date(),
    dataFreshness: new Date(quote.timestamp),
    version: "1.0.0",
  };
}

export * from "./types";
