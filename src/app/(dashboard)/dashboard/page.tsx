"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Simple icon components
const TrendingUpIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Mock market session data
const marketSessions = [
  { market: "NSE", status: "open", time: "15:23 IST", statusColor: "success" as const },
  { market: "NYSE", status: "closed", time: "Opens in 8h", statusColor: "danger" as const },
  { market: "CRYPTO", status: "24/7", time: "Always open", statusColor: "success" as const },
];

// Mock trending stocks
const trendingStocks = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", price: 2847.50, change: 2.34, volume: "12.5M" },
  { symbol: "TCS.NS", name: "Tata Consultancy", price: 3456.75, change: -0.82, volume: "8.2M" },
  { symbol: "AAPL", name: "Apple Inc.", price: 189.45, change: 1.56, volume: "45.2M" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.28, change: 4.21, volume: "32.1M" },
  { symbol: "BTC", name: "Bitcoin", price: 67845.50, change: 2.87, volume: "$28.5B" },
];

// Mock portfolio summary
const portfolioSummary = {
  totalValue: 1254789.45,
  dayChange: 12456.78,
  dayChangePercent: 1.01,
  investedValue: 1150000,
  totalReturns: 104789.45,
  returnsPercent: 9.11,
};

// Mock recommendations
const topRecommendations = [
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", score: 85, action: "BUY", upside: "12-15%" },
  { symbol: "MSFT", name: "Microsoft", score: 82, action: "BUY", upside: "10-14%" },
  { symbol: "INFY.NS", name: "Infosys", score: 78, action: "HOLD", upside: "5-8%" },
];

// Mock recent news
const recentNews = [
  { headline: "RBI maintains repo rate, markets rally", source: "Economic Times", time: "2h ago" },
  { headline: "Tech stocks surge on AI optimism", source: "Bloomberg", time: "4h ago" },
  { headline: "Bitcoin breaks $67,000 resistance", source: "CoinDesk", time: "6h ago" },
];

function MarketStatusBadge({ status, color }: { status: string; color: "success" | "danger" | "warning" }) {
  const colorClasses = {
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  return (
    <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", colorClasses[color])}>
      {status}
    </span>
  );
}

function formatCurrency(value: number, currency: "INR" | "USD" = "INR"): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format large numbers in Indian style (kept for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatCompactNumber(value: number): string {
  if (value >= 1e7) return `${(value / 1e7).toFixed(1)}Cr`;
  if (value >= 1e5) return `${(value / 1e5).toFixed(1)}L`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here&apos;s your market overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshIcon />
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Market Session Status */}
      <div className="flex flex-wrap gap-3">
        {marketSessions.map((session) => (
          <div
            key={session.market}
            className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg border border-border"
          >
            <span className="font-medium text-sm">{session.market}</span>
            <MarketStatusBadge status={session.status} color={session.statusColor} />
            <span className="text-xs text-muted-foreground">{session.time}</span>
          </div>
        ))}
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Portfolio Value</div>
            <div className="text-2xl font-bold mt-1">
              {formatCurrency(portfolioSummary.totalValue)}
            </div>
            <div className={cn(
              "flex items-center gap-1 text-sm mt-1",
              portfolioSummary.dayChangePercent >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {portfolioSummary.dayChangePercent >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              <span>
                {portfolioSummary.dayChangePercent >= 0 ? "+" : ""}
                {formatCurrency(portfolioSummary.dayChange)} ({portfolioSummary.dayChangePercent.toFixed(2)}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Total Returns</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              +{formatCurrency(portfolioSummary.totalReturns)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              +{portfolioSummary.returnsPercent.toFixed(2)}% all time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Invested Value</div>
            <div className="text-2xl font-bold mt-1">
              {formatCurrency(portfolioSummary.investedValue)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Across 15 holdings
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">AI Recommendations</div>
            <div className="text-2xl font-bold mt-1">12</div>
            <div className="text-sm text-muted-foreground mt-1">
              3 new this week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trending Stocks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Trending Stocks</CardTitle>
            <Link href="/screener" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trendingStocks.map((stock) => (
                <Link
                  key={stock.symbol}
                  href={`/asset/${stock.symbol}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{stock.symbol.replace(".NS", "")}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {stock.symbol.includes(".NS")
                        ? formatCurrency(stock.price)
                        : formatCurrency(stock.price, "USD")}
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-end gap-1 text-xs",
                        stock.change >= 0 ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {stock.change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              <span className="flex items-center gap-2">
                AI Picks
                <Badge variant="secondary" className="text-[10px]">AI</Badge>
              </span>
            </CardTitle>
            <Link href="/recommendations" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRecommendations.map((rec) => (
                <Link
                  key={rec.symbol}
                  href={`/asset/${rec.symbol}`}
                  className="block p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{rec.symbol.replace(".NS", "")}</span>
                    <Badge
                      variant={rec.action === "BUY" ? "default" : "secondary"}
                    >
                      {rec.action}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Score: {rec.score}/100</span>
                    <span className="text-green-600">↑ {rec.upside}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* News Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Latest News</CardTitle>
          <Link href="/news" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {recentNews.map((news, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              >
                <h4 className="font-medium text-sm line-clamp-2">{news.headline}</h4>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>{news.source}</span>
                  <span>•</span>
                  <span>{news.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground text-center py-4 border-t border-border">
        <strong>Disclaimer:</strong> This information is for educational purposes only and does not constitute financial advice.
        Past performance does not guarantee future results. Please consult a qualified financial advisor before making investment decisions.
      </div>
    </div>
  );
}
