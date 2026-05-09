"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ComplianceDisclaimer } from "@/components/ui/compliance-disclaimer";
import { cn } from "@/lib/utils";

// Icons
const SparklesIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Filter options
const actionFilters = [
  { value: "all", label: "All" },
  { value: "strong_buy", label: "Strong Buy" },
  { value: "buy", label: "Buy" },
  { value: "hold", label: "Hold" },
  { value: "sell", label: "Sell" },
];

const horizonFilters = [
  { value: "all", label: "All Horizons" },
  { value: "short", label: "Short Term" },
  { value: "medium", label: "Medium Term" },
  { value: "long", label: "Long Term" },
];

const riskFilters = [
  { value: "all", label: "All Risk Levels" },
  { value: "low", label: "Low Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "high", label: "High Risk" },
];

// Mock recommendations
const mockRecommendations = [
  {
    id: "rec-1",
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank",
    price: 1623.40,
    score: 87,
    action: "strong_buy" as const,
    confidence: 92,
    riskLevel: "low" as const,
    expectedUpside: { min: 12, max: 18 },
    entryZone: { min: 1580, max: 1650 },
    targetPrice: 1920,
    stopLoss: 1480,
    horizon: "medium" as const,
    holdDuration: "3-6 months",
    keyReasons: [
      "Strong loan growth expected in retail segment",
      "Improving NIM outlook with deposit repricing",
      "Best-in-class asset quality metrics",
    ],
    technicalSummary: "Trading above 50-day and 200-day SMA. RSI at 58 indicates neutral-bullish momentum.",
    fundamentalSummary: "P/E at 21.8x is below 5-year average. ROE of 17.5% is industry-leading.",
    factors: { trend: 82, momentum: 75, risk: 88, valuation: 85, sentiment: 78, liquidity: 95 },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "rec-2",
    symbol: "INFY.NS",
    name: "Infosys",
    price: 1478.25,
    score: 78,
    action: "buy" as const,
    confidence: 85,
    riskLevel: "medium" as const,
    expectedUpside: { min: 8, max: 14 },
    entryZone: { min: 1420, max: 1500 },
    targetPrice: 1680,
    stopLoss: 1350,
    horizon: "medium" as const,
    holdDuration: "3-6 months",
    keyReasons: [
      "Large deal wins accelerating",
      "Cost optimization driving margin expansion",
      "Strong cash generation supports dividend",
    ],
    technicalSummary: "Consolidating near support. MACD showing bullish crossover potential.",
    fundamentalSummary: "P/E at 26.2x is fair. Consistent 3% dividend yield is attractive.",
    factors: { trend: 70, momentum: 68, risk: 75, valuation: 80, sentiment: 72, liquidity: 92 },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
  },
  {
    id: "rec-3",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 378.92,
    score: 84,
    action: "buy" as const,
    confidence: 88,
    riskLevel: "low" as const,
    expectedUpside: { min: 10, max: 16 },
    entryZone: { min: 365, max: 385 },
    targetPrice: 440,
    stopLoss: 340,
    horizon: "long" as const,
    holdDuration: "6-12 months",
    keyReasons: [
      "Azure cloud growth remains strong at 29% YoY",
      "AI integration across products driving adoption",
      "Enterprise spending remains resilient",
    ],
    technicalSummary: "In strong uptrend. RSI at 62 shows healthy momentum without being overbought.",
    fundamentalSummary: "P/E at 35.2x is premium but justified by 15% earnings growth.",
    factors: { trend: 88, momentum: 82, risk: 85, valuation: 72, sentiment: 90, liquidity: 98 },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: "rec-4",
    symbol: "RELIANCE.NS",
    name: "Reliance Industries",
    price: 2847.50,
    score: 72,
    action: "hold" as const,
    confidence: 75,
    riskLevel: "medium" as const,
    expectedUpside: { min: 5, max: 10 },
    entryZone: { min: 2700, max: 2850 },
    targetPrice: 3100,
    stopLoss: 2550,
    horizon: "long" as const,
    holdDuration: "6-12 months",
    keyReasons: [
      "Jio subscriber growth moderating",
      "Retail expansion continues but margin pressure",
      "O2C business benefiting from strong refining margins",
    ],
    technicalSummary: "Trading in range. 200-day SMA providing support at 2650.",
    fundamentalSummary: "P/E at 28.5x is slightly elevated. Diversified business provides stability.",
    factors: { trend: 65, momentum: 60, risk: 70, valuation: 68, sentiment: 75, liquidity: 98 },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: "rec-5",
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 875.28,
    score: 80,
    action: "buy" as const,
    confidence: 82,
    riskLevel: "high" as const,
    expectedUpside: { min: 15, max: 25 },
    entryZone: { min: 820, max: 900 },
    targetPrice: 1050,
    stopLoss: 750,
    horizon: "medium" as const,
    holdDuration: "3-6 months",
    keyReasons: [
      "AI chip demand far exceeding supply",
      "Data center revenue growing 400%+ YoY",
      "Strong moat in AI training infrastructure",
    ],
    technicalSummary: "Strong uptrend but extended. RSI at 72 suggests short-term pullback possible.",
    fundamentalSummary: "P/E at 68.5x is high but earnings growing 200%+. Forward P/E more reasonable at 32x.",
    factors: { trend: 92, momentum: 88, risk: 55, valuation: 60, sentiment: 95, liquidity: 95 },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
];

type Action = "strong_buy" | "buy" | "hold" | "sell" | "strong_sell";
type RiskLevel = "low" | "medium" | "high" | "very_high";
type Horizon = "short" | "medium" | "long";

function formatCurrency(value: number, currency: "INR" | "USD" = "INR"): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function getActionBadge(action: Action) {
  const config = {
    strong_buy: { label: "Strong Buy", className: "bg-green-600 text-white" },
    buy: { label: "Buy", className: "bg-green-500 text-white" },
    hold: { label: "Hold", className: "bg-yellow-500 text-white" },
    sell: { label: "Sell", className: "bg-red-500 text-white" },
    strong_sell: { label: "Strong Sell", className: "bg-red-600 text-white" },
  };
  return config[action];
}

function getRiskBadge(risk: RiskLevel) {
  const config = {
    low: { label: "Low Risk", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    medium: { label: "Medium Risk", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    high: { label: "High Risk", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
    very_high: { label: "Very High", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  };
  return config[risk];
}

function getHorizonLabel(horizon: Horizon): string {
  return {
    short: "Short Term (1-3 months)",
    medium: "Medium Term (3-6 months)",
    long: "Long Term (6-12 months)",
  }[horizon];
}

function ScoreGauge({ score, size = "md" }: { score: number; size?: "sm" | "md" }) {
  const radius = size === "sm" ? 28 : 40;
  const stroke = size === "sm" ? 4 : 6;
  const svgSize = size === "sm" ? 64 : 96;
  const center = svgSize / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg 
        width={svgSize} 
        height={svgSize} 
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className={cn(size === "sm" ? "w-16 h-16" : "w-24 h-24")}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/20"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-500"
        />
      </svg>
      <span className={cn(
        "absolute font-bold",
        size === "sm" ? "text-lg" : "text-2xl"
      )}>
        {score}
      </span>
    </div>
  );
}

function FactorBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            value >= 80 ? "bg-green-500" : value >= 60 ? "bg-yellow-500" : "bg-red-500"
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const [actionFilter, setActionFilter] = useState("all");
  const [horizonFilter, setHorizonFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredRecs = mockRecommendations.filter(rec => {
    if (actionFilter !== "all" && rec.action !== actionFilter) return false;
    if (horizonFilter !== "all" && rec.horizon !== horizonFilter) return false;
    if (riskFilter !== "all" && rec.riskLevel !== riskFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            AI Recommendations
            <Badge variant="secondary" className="text-xs">
              <SparklesIcon />
              <span className="ml-1">AI-Powered</span>
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Data-driven investment insights powered by our AI models
          </p>
        </div>
      </div>

      {/* Compliance Disclaimer */}
      <ComplianceDisclaimer variant="inline" />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Action</label>
              <div className="flex flex-wrap gap-1">
                {actionFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActionFilter(filter.value)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full border transition-colors",
                      actionFilter === filter.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Horizon</label>
              <select
                value={horizonFilter}
                onChange={(e) => setHorizonFilter(e.target.value)}
                className="px-3 py-1.5 text-sm bg-background border border-input rounded-md"
              >
                {horizonFilters.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Risk Level</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-1.5 text-sm bg-background border border-input rounded-md"
              >
                {riskFilters.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredRecs.length} recommendations
      </div>

      {/* Recommendations Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredRecs.map((rec) => {
          const isIndian = rec.symbol.endsWith(".NS");
          const currency = isIndian ? "INR" : "USD";
          const actionBadge = getActionBadge(rec.action);
          const riskBadge = getRiskBadge(rec.riskLevel);
          const isExpanded = expandedId === rec.id;

          return (
            <Card key={rec.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-lg font-bold shrink-0">
                        {rec.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <Link
                          href={`/asset/${rec.symbol}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors"
                        >
                          {rec.symbol.replace(".NS", "")}
                        </Link>
                        <div className="text-sm text-muted-foreground">{rec.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("px-2 py-0.5 text-xs font-medium rounded", actionBadge.className)}>
                            {actionBadge.label}
                          </span>
                          <span className={cn("px-2 py-0.5 text-xs font-medium rounded", riskBadge.className)}>
                            {riskBadge.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ScoreGauge score={rec.score} size="sm" />
                  </div>
                </div>

                {/* Key metrics */}
                <div className="p-4 grid grid-cols-3 gap-4 text-center border-b border-border">
                  <div>
                    <div className="text-xs text-muted-foreground">Current</div>
                    <div className="font-semibold">{formatCurrency(rec.price, currency)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Target</div>
                    <div className="font-semibold text-green-600">{formatCurrency(rec.targetPrice, currency)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Upside</div>
                    <div className="font-semibold text-green-600">
                      {rec.expectedUpside.min}-{rec.expectedUpside.max}%
                    </div>
                  </div>
                </div>

                {/* Key reasons */}
                <div className="p-4 border-b border-border">
                  <div className="text-xs font-medium text-muted-foreground mb-2">KEY REASONS</div>
                  <ul className="space-y-1">
                    {rec.keyReasons.slice(0, 2).map((reason, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="p-4 space-y-4 border-b border-border bg-muted/30">
                    {/* Entry/Exit */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-card rounded-lg">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <ArrowUpIcon /> Entry Zone
                        </div>
                        <div className="font-medium mt-1">
                          {formatCurrency(rec.entryZone.min, currency)} - {formatCurrency(rec.entryZone.max, currency)}
                        </div>
                      </div>
                      <div className="p-3 bg-card rounded-lg">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <ShieldIcon /> Stop Loss
                        </div>
                        <div className="font-medium mt-1 text-red-500">
                          {formatCurrency(rec.stopLoss, currency)}
                        </div>
                      </div>
                    </div>

                    {/* Horizon */}
                    <div className="p-3 bg-card rounded-lg">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <ClockIcon /> Investment Horizon
                      </div>
                      <div className="font-medium mt-1">{getHorizonLabel(rec.horizon)}</div>
                      <div className="text-sm text-muted-foreground">
                        Suggested hold: {rec.holdDuration}
                      </div>
                    </div>

                    {/* Factor scores */}
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">FACTOR SCORES</div>
                      <div className="grid grid-cols-2 gap-3">
                        <FactorBar label="Trend" value={rec.factors.trend} />
                        <FactorBar label="Momentum" value={rec.factors.momentum} />
                        <FactorBar label="Risk" value={rec.factors.risk} />
                        <FactorBar label="Valuation" value={rec.factors.valuation} />
                        <FactorBar label="Sentiment" value={rec.factors.sentiment} />
                        <FactorBar label="Liquidity" value={rec.factors.liquidity} />
                      </div>
                    </div>

                    {/* Analysis */}
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground">TECHNICAL</div>
                        <p className="text-sm mt-1">{rec.technicalSummary}</p>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground">FUNDAMENTAL</div>
                        <p className="text-sm mt-1">{rec.fundamentalSummary}</p>
                      </div>
                    </div>

                    {/* Valid until */}
                    <div className="text-xs text-muted-foreground">
                      Valid until: {rec.validUntil.toLocaleDateString()}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                  >
                    {isExpanded ? "Show less" : "View details"}
                  </Button>
                  <Link href={`/asset/${rec.symbol}`}>
                    <Button variant="outline" size="sm">
                      View Asset
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRecs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No recommendations match your filters.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setActionFilter("all");
                setHorizonFilter("all");
                setRiskFilter("all");
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bottom disclaimer */}
      <div className="text-xs text-muted-foreground text-center py-4 border-t border-border">
        <strong>Important:</strong> AI recommendations are generated using historical data and statistical models.
        They are not a substitute for professional financial advice. Past performance does not guarantee future results.
        Confidence scores reflect model certainty, not guaranteed outcomes.
      </div>
    </div>
  );
}
