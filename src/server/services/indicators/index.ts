/**
 * Technical Indicators Service
 * Calculate common technical indicators from OHLCV data
 */

import type { OHLCV, IndicatorSet } from "@/types/domain";

/**
 * Calculate Simple Moving Average
 */
export function calculateSMA(data: number[], period: number): number | null {
  if (data.length < period) return null;
  
  const slice = data.slice(-period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return sum / period;
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(data: number[], period: number): number | null {
  if (data.length < period) return null;
  
  const multiplier = 2 / (period + 1);
  
  // Initialize EMA with SMA
  let ema = calculateSMA(data.slice(0, period), period);
  if (ema === null) return null;
  
  // Calculate EMA for remaining data
  for (let i = period; i < data.length; i++) {
    ema = (data[i]! - ema) * multiplier + ema;
  }
  
  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(closePrices: number[], period: number = 14): number | null {
  if (closePrices.length < period + 1) return null;
  
  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < closePrices.length; i++) {
    changes.push(closePrices[i]! - closePrices[i - 1]!);
  }
  
  // Separate gains and losses
  const gains = changes.map(c => (c > 0 ? c : 0));
  const losses = changes.map(c => (c < 0 ? Math.abs(c) : 0));
  
  // Calculate initial average gain/loss (first period)
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  // Smooth the averages
  for (let i = period; i < changes.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]!) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]!) / period;
  }
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  closePrices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number; signal: number; histogram: number } | null {
  if (closePrices.length < slowPeriod + signalPeriod) return null;
  
  const ema12 = calculateEMA(closePrices, fastPeriod);
  const ema26 = calculateEMA(closePrices, slowPeriod);
  
  if (ema12 === null || ema26 === null) return null;
  
  const macd = ema12 - ema26;
  
  // Calculate MACD line history for signal line
  const macdHistory: number[] = [];
  for (let i = slowPeriod; i <= closePrices.length; i++) {
    const slice = closePrices.slice(0, i);
    const fast = calculateEMA(slice, fastPeriod);
    const slow = calculateEMA(slice, slowPeriod);
    if (fast !== null && slow !== null) {
      macdHistory.push(fast - slow);
    }
  }
  
  const signal = calculateEMA(macdHistory, signalPeriod);
  if (signal === null) return null;
  
  return {
    macd,
    signal,
    histogram: macd - signal,
  };
}

/**
 * Calculate Stochastic Oscillator
 */
export function calculateStochastic(
  highPrices: number[],
  lowPrices: number[],
  closePrices: number[],
  kPeriod: number = 14,
  _dPeriod: number = 3 // Reserved for future SMA calculation of K values
): { k: number; d: number } | null {
  if (closePrices.length < kPeriod) return null;
  
  const recentHighs = highPrices.slice(-kPeriod);
  const recentLows = lowPrices.slice(-kPeriod);
  
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  
  const currentClose = closePrices[closePrices.length - 1]!;
  
  if (highestHigh === lowestLow) return { k: 50, d: 50 };
  
  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  
  // Calculate %D (SMA of %K)
  // For simplicity, we'll use current K value for D
  const d = k; // In a full implementation, this would be SMA of K values
  
  return { k, d };
}

/**
 * Calculate Average True Range (ATR)
 */
export function calculateATR(ohlcv: OHLCV[], period: number = 14): number | null {
  if (ohlcv.length < period + 1) return null;
  
  const trueRanges: number[] = [];
  
  for (let i = 1; i < ohlcv.length; i++) {
    const current = ohlcv[i]!;
    const previous = ohlcv[i - 1]!;
    
    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previous.close),
      Math.abs(current.low - previous.close)
    );
    
    trueRanges.push(tr);
  }
  
  return calculateSMA(trueRanges, period);
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  closePrices: number[],
  period: number = 20,
  standardDeviations: number = 2
): { upper: number; middle: number; lower: number } | null {
  if (closePrices.length < period) return null;
  
  const recentPrices = closePrices.slice(-period);
  const middle = calculateSMA(recentPrices, period);
  if (middle === null) return null;
  
  // Calculate standard deviation
  const squaredDiffs = recentPrices.map(p => Math.pow(p - middle, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const stdDev = Math.sqrt(variance);
  
  return {
    upper: middle + standardDeviations * stdDev,
    middle,
    lower: middle - standardDeviations * stdDev,
  };
}

/**
 * Calculate On-Balance Volume (OBV)
 */
export function calculateOBV(ohlcv: OHLCV[]): number | null {
  if (ohlcv.length < 2) return null;
  
  let obv = 0;
  
  for (let i = 1; i < ohlcv.length; i++) {
    const current = ohlcv[i]!;
    const previous = ohlcv[i - 1]!;
    
    if (current.close > previous.close) {
      obv += current.volume;
    } else if (current.close < previous.close) {
      obv -= current.volume;
    }
    // If equal, OBV remains unchanged
  }
  
  return obv;
}

/**
 * Determine trend strength based on price relative to moving averages
 */
export function determineTrendStrength(
  price: number,
  sma20?: number | null,
  sma50?: number | null,
  sma200?: number | null
): "strong_up" | "up" | "neutral" | "down" | "strong_down" {
  if (!sma20 || !sma50 || !sma200) return "neutral";
  
  const aboveSma20 = price > sma20;
  const aboveSma50 = price > sma50;
  const aboveSma200 = price > sma200;
  const smaAligned = sma20 > sma50 && sma50 > sma200;
  const smaInverse = sma20 < sma50 && sma50 < sma200;
  
  if (aboveSma20 && aboveSma50 && aboveSma200 && smaAligned) {
    return "strong_up";
  }
  
  if (aboveSma20 && aboveSma50 && aboveSma200) {
    return "up";
  }
  
  if (!aboveSma20 && !aboveSma50 && !aboveSma200 && smaInverse) {
    return "strong_down";
  }
  
  if (!aboveSma20 && !aboveSma50 && !aboveSma200) {
    return "down";
  }
  
  return "neutral";
}

/**
 * Calculate all technical indicators for a symbol
 */
export function calculateIndicators(symbol: string, ohlcv: OHLCV[]): IndicatorSet {
  if (ohlcv.length === 0) {
    return {
      symbol,
      timestamp: new Date(),
    };
  }
  
  const closePrices = ohlcv.map(d => d.close);
  const highPrices = ohlcv.map(d => d.high);
  const lowPrices = ohlcv.map(d => d.low);
  const currentPrice = closePrices[closePrices.length - 1]!;
  
  // Moving averages
  const sma20 = calculateSMA(closePrices, 20);
  const sma50 = calculateSMA(closePrices, 50);
  const sma200 = calculateSMA(closePrices, 200);
  const ema12 = calculateEMA(closePrices, 12);
  const ema26 = calculateEMA(closePrices, 26);
  
  // Momentum
  const rsi14 = calculateRSI(closePrices, 14);
  const macd = calculateMACD(closePrices);
  const stochastic = calculateStochastic(highPrices, lowPrices, closePrices);
  
  // Volatility
  const atr14 = calculateATR(ohlcv, 14);
  const bollingerBands = calculateBollingerBands(closePrices);
  
  // Volume
  const volumes = ohlcv.map(d => d.volume);
  const volumeSma20 = calculateSMA(volumes, 20);
  const obv = calculateOBV(ohlcv);
  
  // Trend
  const trendStrength = determineTrendStrength(currentPrice, sma20, sma50, sma200);
  
  return {
    symbol,
    timestamp: new Date(),
    sma20: sma20 ?? undefined,
    sma50: sma50 ?? undefined,
    sma200: sma200 ?? undefined,
    ema12: ema12 ?? undefined,
    ema26: ema26 ?? undefined,
    rsi14: rsi14 ?? undefined,
    macd: macd ?? undefined,
    stochastic: stochastic ?? undefined,
    atr14: atr14 ?? undefined,
    bollingerBands: bollingerBands ?? undefined,
    volumeSma20: volumeSma20 ?? undefined,
    obv: obv ?? undefined,
    trendStrength,
  };
}

/**
 * Generate trading signals based on indicators
 */
export interface TradingSignal {
  indicator: string;
  signal: "bullish" | "bearish" | "neutral";
  description: string;
}

export function generateSignals(indicators: IndicatorSet): TradingSignal[] {
  const signals: TradingSignal[] = [];
  
  // RSI signals
  if (indicators.rsi14 !== undefined) {
    if (indicators.rsi14 < 30) {
      signals.push({
        indicator: "RSI",
        signal: "bullish",
        description: "Oversold (RSI below 30)",
      });
    } else if (indicators.rsi14 > 70) {
      signals.push({
        indicator: "RSI",
        signal: "bearish",
        description: "Overbought (RSI above 70)",
      });
    } else {
      signals.push({
        indicator: "RSI",
        signal: "neutral",
        description: `RSI at ${indicators.rsi14.toFixed(1)}`,
      });
    }
  }
  
  // MACD signals
  if (indicators.macd) {
    if (indicators.macd.histogram > 0 && indicators.macd.macd > indicators.macd.signal) {
      signals.push({
        indicator: "MACD",
        signal: "bullish",
        description: "MACD above signal line",
      });
    } else if (indicators.macd.histogram < 0 && indicators.macd.macd < indicators.macd.signal) {
      signals.push({
        indicator: "MACD",
        signal: "bearish",
        description: "MACD below signal line",
      });
    } else {
      signals.push({
        indicator: "MACD",
        signal: "neutral",
        description: "MACD crossing signal line",
      });
    }
  }
  
  // Bollinger Bands signals
  if (indicators.bollingerBands && indicators.sma20) {
    // This would need the current price, which we don't have in IndicatorSet
    signals.push({
      indicator: "Bollinger Bands",
      signal: "neutral",
      description: `Middle band at ${indicators.bollingerBands.middle.toFixed(2)}`,
    });
  }
  
  // Trend signals
  if (indicators.trendStrength) {
    const trendMap: Record<string, TradingSignal["signal"]> = {
      strong_up: "bullish",
      up: "bullish",
      neutral: "neutral",
      down: "bearish",
      strong_down: "bearish",
    };
    signals.push({
      indicator: "Trend",
      signal: trendMap[indicators.trendStrength]!,
      description: `Trend: ${indicators.trendStrength.replace("_", " ")}`,
    });
  }
  
  return signals;
}
