/**
 * Portfolio Simulation Engine
 * Scenario analysis, projections, and risk calculations
 */

import type { OHLCV } from "@/types/domain";

/**
 * Portfolio holding for simulation
 */
export interface SimulationHolding {
  symbol: string;
  name: string;
  quantity: number;
  currentPrice: number;
  avgCost: number;
  weight: number;           // Percentage of portfolio
  expectedReturn?: number;  // Annual expected return
  volatility?: number;      // Annual volatility (std dev)
  beta?: number;
  dividendYield?: number;
  sector?: string;
}

/**
 * Portfolio simulation input
 */
export interface PortfolioSimulationInput {
  holdings: SimulationHolding[];
  totalValue: number;
  cashPosition: number;
  historicalData?: Map<string, OHLCV[]>;
}

/**
 * Scenario definition
 */
export interface Scenario {
  name: string;
  description: string;
  marketReturn: number;       // Expected market return multiplier
  volatilityMultiplier: number;
  sectorImpacts?: Record<string, number>;  // Sector-specific impacts
}

/**
 * Projection timeframe
 */
export type ProjectionPeriod = "1m" | "3m" | "6m" | "1y" | "3y" | "5y";

/**
 * Portfolio metrics
 */
export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  
  // Risk metrics
  portfolioVolatility: number;
  portfolioBeta: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  valueAtRisk95: number;      // 95% VaR
  
  // Diversification
  diversificationScore: number;  // 0-100
  sectorConcentration: number;   // Herfindahl index
  topHoldingWeight: number;
  
  // Income
  expectedDividendYield: number;
  annualDividendIncome: number;
}

/**
 * Scenario result
 */
export interface ScenarioResult {
  scenario: string;
  projectedValue: number;
  projectedReturn: number;
  returnPercent: number;
  probability: number;
  breakdown: Array<{
    symbol: string;
    currentValue: number;
    projectedValue: number;
    returnPercent: number;
  }>;
}

/**
 * Projection result
 */
export interface ProjectionResult {
  period: ProjectionPeriod;
  optimistic: { value: number; returnPercent: number };
  expected: { value: number; returnPercent: number };
  pessimistic: { value: number; returnPercent: number };
  confidenceBand: { lower: number; upper: number };
  monthlyProjections: Array<{
    month: number;
    expected: number;
    lower: number;
    upper: number;
  }>;
}

/**
 * Default scenarios for simulation
 */
export const DEFAULT_SCENARIOS: Scenario[] = [
  {
    name: "Bull Market",
    description: "Strong economic growth, positive sentiment",
    marketReturn: 1.15,
    volatilityMultiplier: 0.8,
    sectorImpacts: {
      Technology: 1.25,
      "Financial Services": 1.15,
      "Consumer Cyclical": 1.20,
      Healthcare: 1.05,
      Utilities: 0.95,
    },
  },
  {
    name: "Base Case",
    description: "Normal market conditions",
    marketReturn: 1.08,
    volatilityMultiplier: 1.0,
  },
  {
    name: "Bear Market",
    description: "Economic slowdown, negative sentiment",
    marketReturn: 0.85,
    volatilityMultiplier: 1.5,
    sectorImpacts: {
      Technology: 0.75,
      "Financial Services": 0.80,
      "Consumer Cyclical": 0.70,
      Healthcare: 0.95,
      Utilities: 1.05,
    },
  },
  {
    name: "High Volatility",
    description: "Increased market uncertainty",
    marketReturn: 1.0,
    volatilityMultiplier: 2.0,
  },
  {
    name: "Stagflation",
    description: "Low growth, high inflation",
    marketReturn: 0.95,
    volatilityMultiplier: 1.3,
    sectorImpacts: {
      Technology: 0.85,
      "Financial Services": 0.90,
      Energy: 1.15,
      Utilities: 1.10,
      "Consumer Defensive": 1.05,
    },
  },
];

/**
 * Calculate portfolio metrics
 */
export function calculatePortfolioMetrics(
  input: PortfolioSimulationInput
): PortfolioMetrics {
  const { holdings, totalValue, cashPosition } = input;

  // Basic P&L calculations
  let totalCost = cashPosition;
  for (const h of holdings) {
    totalCost += h.quantity * h.avgCost;
  }
  const unrealizedPnL = totalValue - totalCost;
  const unrealizedPnLPercent = totalCost > 0 ? (unrealizedPnL / totalCost) * 100 : 0;

  // Portfolio volatility (weighted average for simplicity)
  let portfolioVolatility = 0;
  let portfolioBeta = 0;
  let expectedDividendYield = 0;

  for (const h of holdings) {
    const weight = h.weight / 100;
    portfolioVolatility += (h.volatility ?? 0.20) * weight;
    portfolioBeta += (h.beta ?? 1.0) * weight;
    expectedDividendYield += (h.dividendYield ?? 0) * weight;
  }

  // Sharpe ratio (assuming risk-free rate of 5%)
  const riskFreeRate = 0.05;
  const expectedReturn = holdings.reduce(
    (sum, h) => sum + (h.expectedReturn ?? 0.08) * (h.weight / 100),
    0
  );
  const sharpeRatio = portfolioVolatility > 0
    ? (expectedReturn - riskFreeRate) / portfolioVolatility
    : 0;

  // Sortino ratio (using downside deviation approximation)
  const downsideDeviation = portfolioVolatility * 0.7; // Approximation
  const sortinoRatio = downsideDeviation > 0
    ? (expectedReturn - riskFreeRate) / downsideDeviation
    : 0;

  // Max drawdown estimation based on volatility
  const maxDrawdown = portfolioVolatility * 2.5; // Rough estimation

  // Value at Risk (95%)
  const valueAtRisk95 = totalValue * portfolioVolatility * 1.65 / Math.sqrt(252);

  // Diversification score
  const diversificationScore = calculateDiversificationScore(holdings);

  // Sector concentration (Herfindahl index)
  const sectorWeights = new Map<string, number>();
  for (const h of holdings) {
    const sector = h.sector ?? "Other";
    sectorWeights.set(sector, (sectorWeights.get(sector) ?? 0) + h.weight);
  }
  const sectorConcentration = Array.from(sectorWeights.values()).reduce(
    (sum, w) => sum + Math.pow(w / 100, 2),
    0
  );

  // Top holding weight
  const topHoldingWeight = Math.max(...holdings.map((h) => h.weight), 0);

  // Annual dividend income
  const annualDividendIncome = (totalValue - cashPosition) * expectedDividendYield;

  return {
    totalValue,
    totalCost,
    unrealizedPnL,
    unrealizedPnLPercent,
    portfolioVolatility,
    portfolioBeta,
    sharpeRatio,
    sortinoRatio,
    maxDrawdown,
    valueAtRisk95,
    diversificationScore,
    sectorConcentration,
    topHoldingWeight,
    expectedDividendYield,
    annualDividendIncome,
  };
}

/**
 * Calculate diversification score (0-100)
 */
export function calculateDiversificationScore(holdings: SimulationHolding[]): number {
  if (holdings.length === 0) return 0;
  if (holdings.length === 1) return 20;

  let score = 0;

  // Number of holdings factor (max 30 points)
  const holdingsScore = Math.min(30, holdings.length * 3);
  score += holdingsScore;

  // Weight distribution factor (max 30 points)
  const weights = holdings.map((h) => h.weight);
  const maxWeight = Math.max(...weights);
  const weightScore = 30 * (1 - maxWeight / 100);
  score += weightScore;

  // Sector diversification (max 20 points)
  const sectors = new Set(holdings.map((h) => h.sector ?? "Unknown"));
  const sectorScore = Math.min(20, sectors.size * 4);
  score += sectorScore;

  // Correlation factor approximation (max 20 points)
  // Higher beta spread = better diversification
  const betas = holdings.map((h) => h.beta ?? 1);
  const betaSpread = Math.max(...betas) - Math.min(...betas);
  const correlationScore = Math.min(20, betaSpread * 20);
  score += correlationScore;

  return Math.round(score);
}

/**
 * Run scenario analysis
 */
export function runScenarioAnalysis(
  input: PortfolioSimulationInput,
  scenarios: Scenario[] = DEFAULT_SCENARIOS
): ScenarioResult[] {
  const { holdings, totalValue, cashPosition } = input;
  const results: ScenarioResult[] = [];

  for (const scenario of scenarios) {
    let projectedValue = cashPosition; // Cash is unaffected
    const breakdown: ScenarioResult["breakdown"] = [];

    for (const h of holdings) {
      const currentValue = h.quantity * h.currentPrice;

      // Calculate return based on scenario and sector
      let returnMultiplier = scenario.marketReturn;

      // Adjust for sector-specific impact
      if (scenario.sectorImpacts && h.sector) {
        returnMultiplier = scenario.sectorImpacts[h.sector] ?? returnMultiplier;
      }

      // Adjust for beta
      const beta = h.beta ?? 1.0;
      const marketExcess = scenario.marketReturn - 1;
      const holdingReturn = 1 + marketExcess * beta;
      returnMultiplier = (returnMultiplier + holdingReturn) / 2;

      const projectedHoldingValue = currentValue * returnMultiplier;
      projectedValue += projectedHoldingValue;

      breakdown.push({
        symbol: h.symbol,
        currentValue,
        projectedValue: projectedHoldingValue,
        returnPercent: (returnMultiplier - 1) * 100,
      });
    }

    const projectedReturn = projectedValue - totalValue;
    const returnPercent = (projectedReturn / totalValue) * 100;

    // Assign probability based on scenario type
    let probability = 0.20;
    if (scenario.name === "Base Case") probability = 0.40;
    else if (scenario.name === "Bull Market") probability = 0.25;
    else if (scenario.name === "Bear Market") probability = 0.15;

    results.push({
      scenario: scenario.name,
      projectedValue,
      projectedReturn,
      returnPercent,
      probability,
      breakdown,
    });
  }

  return results;
}

/**
 * Generate portfolio projection
 */
export function generateProjection(
  input: PortfolioSimulationInput,
  period: ProjectionPeriod = "1y"
): ProjectionResult {
  const { holdings, totalValue } = input;

  // Calculate weighted expected return and volatility
  let expectedReturn = 0;
  let volatility = 0;
  for (const h of holdings) {
    const weight = h.weight / 100;
    expectedReturn += (h.expectedReturn ?? 0.08) * weight;
    volatility += (h.volatility ?? 0.20) * weight;
  }

  // Period in years
  const periodYears: Record<ProjectionPeriod, number> = {
    "1m": 1 / 12,
    "3m": 0.25,
    "6m": 0.5,
    "1y": 1,
    "3y": 3,
    "5y": 5,
  };
  const years = periodYears[period];

  // Calculate projections
  const expectedGrowth = Math.pow(1 + expectedReturn, years);
  const optimisticGrowth = Math.pow(1 + expectedReturn + volatility, years);
  const pessimisticGrowth = Math.pow(1 + expectedReturn - volatility, years);

  const expectedValue = totalValue * expectedGrowth;
  const optimisticValue = totalValue * optimisticGrowth;
  const pessimisticValue = totalValue * pessimisticGrowth;

  // Confidence band (95%)
  const confidenceMultiplier = 1.96 * volatility * Math.sqrt(years);
  const confidenceBand = {
    lower: totalValue * Math.exp((expectedReturn - 0.5 * volatility * volatility) * years - confidenceMultiplier),
    upper: totalValue * Math.exp((expectedReturn - 0.5 * volatility * volatility) * years + confidenceMultiplier),
  };

  // Monthly projections
  const monthlyProjections: ProjectionResult["monthlyProjections"] = [];
  const totalMonths = Math.round(years * 12);

  for (let month = 1; month <= totalMonths; month++) {
    const t = month / 12;
    const monthExpected = totalValue * Math.pow(1 + expectedReturn, t);
    const monthConfidence = 1.96 * volatility * Math.sqrt(t);
    const drift = (expectedReturn - 0.5 * volatility * volatility) * t;

    monthlyProjections.push({
      month,
      expected: Math.round(monthExpected),
      lower: Math.round(totalValue * Math.exp(drift - monthConfidence)),
      upper: Math.round(totalValue * Math.exp(drift + monthConfidence)),
    });
  }

  return {
    period,
    optimistic: {
      value: Math.round(optimisticValue),
      returnPercent: Number(((optimisticGrowth - 1) * 100).toFixed(1)),
    },
    expected: {
      value: Math.round(expectedValue),
      returnPercent: Number(((expectedGrowth - 1) * 100).toFixed(1)),
    },
    pessimistic: {
      value: Math.round(pessimisticValue),
      returnPercent: Number(((pessimisticGrowth - 1) * 100).toFixed(1)),
    },
    confidenceBand: {
      lower: Math.round(confidenceBand.lower),
      upper: Math.round(confidenceBand.upper),
    },
    monthlyProjections,
  };
}

/**
 * Calculate optimal allocation suggestion
 */
export function suggestOptimalAllocation(
  holdings: SimulationHolding[],
  riskTolerance: "conservative" | "moderate" | "aggressive"
): Map<string, number> {
  const targetVolatility: Record<typeof riskTolerance, number> = {
    conservative: 0.10,
    moderate: 0.15,
    aggressive: 0.25,
  };

  const target = targetVolatility[riskTolerance];
  const suggestions = new Map<string, number>();

  // Simple risk-parity-like allocation
  let totalInverseVol = 0;
  for (const h of holdings) {
    const vol = h.volatility ?? 0.20;
    totalInverseVol += 1 / vol;
  }

  for (const h of holdings) {
    const vol = h.volatility ?? 0.20;
    const riskParityWeight = (1 / vol) / totalInverseVol;

    // Adjust based on expected return (tilt towards higher return assets)
    const expectedReturn = h.expectedReturn ?? 0.08;
    const sharpe = (expectedReturn - 0.05) / vol;
    const sharpeTilt = Math.max(0.5, Math.min(1.5, 1 + sharpe * 0.2));

    const suggestedWeight = riskParityWeight * sharpeTilt * 100;
    suggestions.set(h.symbol, Math.round(suggestedWeight * 10) / 10);
  }

  // Normalize to 100%
  const totalWeight = Array.from(suggestions.values()).reduce((a, b) => a + b, 0);
  for (const [symbol, weight] of suggestions) {
    suggestions.set(symbol, Math.round((weight / totalWeight) * 1000) / 10);
  }

  return suggestions;
}

/**
 * Calculate rebalancing trades needed
 */
export function calculateRebalancingTrades(
  holdings: SimulationHolding[],
  targetWeights: Map<string, number>,
  totalValue: number
): Array<{
  symbol: string;
  action: "buy" | "sell";
  shares: number;
  value: number;
  currentWeight: number;
  targetWeight: number;
}> {
  const trades: ReturnType<typeof calculateRebalancingTrades> = [];

  for (const h of holdings) {
    const targetWeight = targetWeights.get(h.symbol) ?? h.weight;
    const currentValue = h.quantity * h.currentPrice;
    const targetValue = totalValue * (targetWeight / 100);
    const difference = targetValue - currentValue;

    if (Math.abs(difference) > totalValue * 0.01) { // Only if > 1% of portfolio
      const shares = Math.abs(Math.round(difference / h.currentPrice));
      trades.push({
        symbol: h.symbol,
        action: difference > 0 ? "buy" : "sell",
        shares,
        value: Math.abs(difference),
        currentWeight: h.weight,
        targetWeight,
      });
    }
  }

  return trades.sort((a, b) => b.value - a.value);
}
