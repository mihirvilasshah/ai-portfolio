"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const TrendingUpIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
  </svg>
);

const LightbulbIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Mock AI insights
interface MarketInsight {
  id: string;
  title: string;
  summary: string;
  details: string[];
  sentiment: "bullish" | "bearish" | "neutral";
  confidence: number;
  category: "market" | "sector" | "macro" | "technical";
  generatedAt: Date;
}

const mockInsights: MarketInsight[] = [
  {
    id: "1",
    title: "Indian Markets Outlook: Positive Momentum Expected",
    summary: "Indian equity markets are positioned for continued strength driven by robust domestic demand, improving corporate earnings, and sustained foreign institutional investor interest.",
    details: [
      "Nifty 50 is trading above key moving averages, indicating strong technical support",
      "FII inflows have remained positive for 15 consecutive sessions",
      "Banking sector earnings are outperforming expectations by 8% on average",
      "Inflation trends suggest RBI may maintain accommodative stance longer than expected",
    ],
    sentiment: "bullish",
    confidence: 78,
    category: "market",
    generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "2",
    title: "IT Sector: Mixed Signals Ahead of Quarterly Results",
    summary: "Technology sector faces near-term headwinds from slower deal closures, but AI-related spending provides a silver lining for companies with strong capabilities.",
    details: [
      "Deal pipeline remains robust but conversion timelines have extended",
      "AI and cloud services are driving incremental revenue growth",
      "Margin pressure expected from wage hikes but offset by operational efficiency",
      "US client spending shows signs of stabilization after previous quarter weakness",
    ],
    sentiment: "neutral",
    confidence: 65,
    category: "sector",
    generatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: "3",
    title: "Risk Alert: Global Macro Uncertainties",
    summary: "Elevated geopolitical tensions and uncertainty around US Federal Reserve policy trajectory warrant cautious positioning in equity portfolios.",
    details: [
      "Middle East tensions continue to pose risk to oil prices and inflation",
      "Fed officials sending mixed signals on rate cut timeline",
      "US 10-year Treasury yields showing volatility above 4.5%",
      "Currency fluctuations may impact IT and pharma sector earnings",
    ],
    sentiment: "bearish",
    confidence: 72,
    category: "macro",
    generatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: "4",
    title: "Technical Analysis: Key Support Levels to Watch",
    summary: "Markets are approaching critical technical levels that could determine near-term direction. A breakout above resistance could trigger further momentum.",
    details: [
      "Nifty 50 immediate support at 21,800 with resistance at 22,200",
      "RSI at 62 indicates healthy momentum without overbought conditions",
      "Bank Nifty showing bullish flag pattern with target at 48,500",
      "Breadth indicators suggest broader market participation improving",
    ],
    sentiment: "bullish",
    confidence: 70,
    category: "technical",
    generatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
];

// Investment thesis
interface InvestmentThesis {
  asset: string;
  thesis: string;
  bullCase: string[];
  bearCase: string[];
  recommendation: "buy" | "hold" | "sell";
  timeframe: string;
}

const investmentTheses: InvestmentThesis[] = [
  {
    asset: "HDFC Bank",
    thesis: "Market leader in private banking with best-in-class asset quality and improving growth trajectory post-merger.",
    bullCase: [
      "Merger integration ahead of schedule unlocking synergies",
      "Net interest margins expanding with deposit repricing",
      "Strong retail loan book growth at 18% YoY",
      "Industry-leading ROE of 17.5%",
    ],
    bearCase: [
      "Competition from fintech players in digital lending",
      "Potential NPA stress from SME segment",
      "Regulatory scrutiny on lending practices",
    ],
    recommendation: "buy",
    timeframe: "12-18 months",
  },
  {
    asset: "Infosys",
    thesis: "Well-positioned to capture enterprise AI and digital transformation spending with improving deal momentum.",
    bullCase: [
      "Large deal wins accelerating in AI/cloud services",
      "Margin expansion through pyramid optimization",
      "Strong cash generation supporting 3% dividend yield",
      "Topaz AI platform gaining client traction",
    ],
    bearCase: [
      "Discretionary IT spending remains under pressure",
      "Competition from Accenture and TCS in large deals",
      "Talent retention challenges in AI skills",
    ],
    recommendation: "hold",
    timeframe: "6-12 months",
  },
];

function getSentimentIcon(sentiment: MarketInsight["sentiment"]) {
  switch (sentiment) {
    case "bullish":
      return <TrendingUpIcon />;
    case "bearish":
      return <TrendingDownIcon />;
    default:
      return <LightbulbIcon />;
  }
}

function getSentimentColor(sentiment: MarketInsight["sentiment"]) {
  switch (sentiment) {
    case "bullish":
      return "text-green-600 bg-green-100 dark:bg-green-900/30";
    case "bearish":
      return "text-red-600 bg-red-100 dark:bg-red-900/30";
    default:
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
  }
}

function formatTimeAgo(date: Date): string {
  const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function InsightCard({ insight }: { insight: MarketInsight }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg", getSentimentColor(insight.sentiment))}>
                {getSentimentIcon(insight.sentiment)}
              </div>
              <div>
                <Badge variant="secondary" className="text-xs">{insight.category}</Badge>
                <span className="text-xs text-muted-foreground ml-2">
                  {formatTimeAgo(insight.generatedAt)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Confidence</div>
              <div className="font-bold text-lg">{insight.confidence}%</div>
            </div>
          </div>
          
          <h3 className="font-semibold text-lg mb-2">{insight.title}</h3>
          <p className="text-muted-foreground text-sm mb-3">{insight.summary}</p>
          
          {expanded && (
            <div className="space-y-2 mb-3">
              {insight.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-1">•</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "Read more"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ThesisCard({ thesis }: { thesis: InvestmentThesis }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{thesis.asset}</CardTitle>
          <Badge
            className={cn(
              thesis.recommendation === "buy" && "bg-green-600",
              thesis.recommendation === "hold" && "bg-yellow-600",
              thesis.recommendation === "sell" && "bg-red-600"
            )}
          >
            {thesis.recommendation.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{thesis.thesis}</p>
        
        <div>
          <div className="text-xs font-medium text-green-600 mb-2 flex items-center gap-1">
            <TrendingUpIcon /> Bull Case
          </div>
          <ul className="space-y-1">
            {thesis.bullCase.map((point, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-green-500 mt-0.5">+</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <div className="text-xs font-medium text-red-600 mb-2 flex items-center gap-1">
            <ShieldIcon /> Bear Case / Risks
          </div>
          <ul className="space-y-1">
            {thesis.bearCase.map((point, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span className="text-red-500 mt-0.5">-</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">Timeframe: {thesis.timeframe}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InsightsPage() {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  // Market sentiment gauge
  const overallSentiment = mockInsights.reduce((acc, insight) => {
    if (insight.sentiment === "bullish") return acc + insight.confidence;
    if (insight.sentiment === "bearish") return acc - insight.confidence;
    return acc;
  }, 0) / mockInsights.length;

  const sentimentLabel = overallSentiment > 20 ? "Bullish" : overallSentiment < -20 ? "Bearish" : "Neutral";
  const sentimentColor = overallSentiment > 20 ? "text-green-600" : overallSentiment < -20 ? "text-red-600" : "text-yellow-600";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <SparklesIcon />
            AI Insights
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-generated market analysis and investment insights
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} className="gap-2">
          <RefreshIcon />
          Refresh Insights
        </Button>
      </div>

      {/* Compliance Disclaimer */}
      <ComplianceDisclaimer variant="inline" />

      {/* Market Sentiment Overview */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Overall Market Sentiment</div>
              <div className={cn("text-3xl font-bold", sentimentColor)}>
                {sentimentLabel}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {mockInsights.filter(i => i.sentiment === "bullish").length}
                </div>
                <div className="text-xs text-muted-foreground">Bullish Signals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {mockInsights.filter(i => i.sentiment === "neutral").length}
                </div>
                <div className="text-xs text-muted-foreground">Neutral Signals</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {mockInsights.filter(i => i.sentiment === "bearish").length}
                </div>
                <div className="text-xs text-muted-foreground">Bearish Signals</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Market Insights */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Market Insights</h2>
          {mockInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>

        {/* Investment Theses */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Investment Theses</h2>
          {investmentTheses.map((thesis, idx) => (
            <ThesisCard key={idx} thesis={thesis} />
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-xs text-muted-foreground text-center py-4 border-t border-border">
        <p>Last refreshed: {lastRefresh.toLocaleString()}</p>
        <p className="mt-2">
          <strong>Important:</strong> AI insights are generated using machine learning models and historical data patterns.
          They should not be considered as financial advice. Always conduct your own research and consult with a qualified
          financial advisor before making investment decisions.
        </p>
      </div>
    </div>
  );
}
