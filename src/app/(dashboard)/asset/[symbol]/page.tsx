"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Icons
const ArrowLeftIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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

const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg className={cn("h-5 w-5", filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const BellIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

// Mock asset data
const mockAssets: Record<string, {
  symbol: string;
  name: string;
  market: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  pe: number;
  eps: number;
  dividend: number;
  beta: number;
  week52High: number;
  week52Low: number;
  description: string;
}> = {
  "RELIANCE.NS": {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Limited",
    market: "NSE",
    sector: "Energy",
    price: 2847.50,
    change: 65.30,
    changePercent: 2.34,
    open: 2795.00,
    high: 2865.00,
    low: 2785.00,
    previousClose: 2782.20,
    volume: 12500000,
    avgVolume: 8900000,
    marketCap: 19500000000000,
    pe: 28.5,
    eps: 99.91,
    dividend: 0.35,
    beta: 0.98,
    week52High: 3025.00,
    week52Low: 2220.00,
    description: "Reliance Industries Limited operates as a conglomerate in India. The company operates through Oil to Chemicals, Oil and Gas, Retail, and Digital Services segments.",
  },
  "TCS.NS": {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services Limited",
    market: "NSE",
    sector: "Technology",
    price: 3456.75,
    change: -28.65,
    changePercent: -0.82,
    open: 3485.00,
    high: 3498.00,
    low: 3445.00,
    previousClose: 3485.40,
    volume: 8200000,
    avgVolume: 5600000,
    marketCap: 12600000000000,
    pe: 32.4,
    eps: 106.67,
    dividend: 1.2,
    beta: 0.75,
    week52High: 4045.00,
    week52Low: 3056.00,
    description: "Tata Consultancy Services Limited provides information technology, consulting, and business solutions services worldwide.",
  },
  "AAPL": {
    symbol: "AAPL",
    name: "Apple Inc.",
    market: "NASDAQ",
    sector: "Technology",
    price: 189.45,
    change: 2.91,
    changePercent: 1.56,
    open: 187.20,
    high: 190.15,
    low: 186.80,
    previousClose: 186.54,
    volume: 45200000,
    avgVolume: 52000000,
    marketCap: 2950000000000,
    pe: 29.8,
    eps: 6.36,
    dividend: 0.5,
    beta: 1.29,
    week52High: 199.62,
    week52Low: 164.08,
    description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
  },
  "BTC": {
    symbol: "BTC",
    name: "Bitcoin",
    market: "CRYPTO",
    sector: "Cryptocurrency",
    price: 67845.50,
    change: 1892.35,
    changePercent: 2.87,
    open: 66120.00,
    high: 68250.00,
    low: 65890.00,
    previousClose: 65953.15,
    volume: 28500000000,
    avgVolume: 25000000000,
    marketCap: 1320000000000,
    pe: 0,
    eps: 0,
    dividend: 0,
    beta: 1.5,
    week52High: 73750.00,
    week52Low: 38500.00,
    description: "Bitcoin is a decentralized cryptocurrency originally described in a 2008 whitepaper by Satoshi Nakamoto. It is the first and most valuable cryptocurrency by market capitalization.",
  },
};

// Mock news
const mockNews = [
  { headline: "Company announces quarterly results", source: "Economic Times", time: "2h ago" },
  { headline: "Analyst upgrades rating to buy", source: "Bloomberg", time: "5h ago" },
  { headline: "New product launch expected next quarter", source: "Reuters", time: "1d ago" },
];

// Time period filters for chart
const timePeriods = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y", "ALL"];

function formatCurrency(value: number, currency: "INR" | "USD" = "INR"): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatLargeNumber(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e7) return `${(value / 1e7).toFixed(2)}Cr`;
  if (value >= 1e5) return `${(value / 1e5).toFixed(2)}L`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

function StatRow({ label, value, suffix = "" }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}{suffix}</span>
    </div>
  );
}

export default function AssetDetailPage() {
  const params = useParams();
  const symbol = typeof params.symbol === "string" ? decodeURIComponent(params.symbol) : "";
  
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("1M");
  const [watchlisted, setWatchlisted] = useState(false);
  
  const asset = mockAssets[symbol];
  const isIndian = symbol.endsWith(".NS") || symbol.endsWith(".BO");
  const isCrypto = asset?.market === "CRYPTO";
  const currency = isIndian ? "INR" : "USD";

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="space-y-6">
        <Link href="/screener" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeftIcon />
          Back to Screener
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Asset not found</h2>
            <p className="text-muted-foreground">
              The asset &quot;{symbol}&quot; could not be found.
            </p>
            <Link href="/screener">
              <Button className="mt-4">Browse Assets</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/screener" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeftIcon />
        Back to Screener
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center text-xl font-bold shrink-0">
            {symbol.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{symbol.replace(".NS", "").replace(".BO", "")}</h1>
              <Badge variant="secondary">{asset.market}</Badge>
              <Badge variant="outline">{asset.sector}</Badge>
            </div>
            <p className="text-muted-foreground">{asset.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWatchlisted(!watchlisted)}
            className="gap-2"
          >
            <StarIcon filled={watchlisted} />
            {watchlisted ? "Watchlisted" : "Add to Watchlist"}
          </Button>
          <Button variant="outline" size="sm">
            <BellIcon />
          </Button>
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-wrap items-baseline gap-4">
        <span className="text-4xl font-bold">
          {formatCurrency(asset.price, currency)}
        </span>
        <div className={cn(
          "flex items-center gap-1 text-lg font-medium",
          asset.change >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {asset.change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
          <span>
            {asset.change >= 0 ? "+" : ""}{formatCurrency(asset.change, currency)}
          </span>
          <span>({asset.change >= 0 ? "+" : ""}{asset.changePercent.toFixed(2)}%)</span>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart area */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="text-base">Price Chart</CardTitle>
              <div className="flex gap-1">
                {timePeriods.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-md transition-colors",
                      selectedPeriod === period
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Chart placeholder */}
            <div className="h-80 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-sm">Interactive chart coming soon</p>
                <p className="text-xs">TradingView or Recharts integration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Key Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              <StatRow label="Open" value={formatCurrency(asset.open, currency)} />
              <StatRow label="High" value={formatCurrency(asset.high, currency)} />
              <StatRow label="Low" value={formatCurrency(asset.low, currency)} />
              <StatRow label="Prev Close" value={formatCurrency(asset.previousClose, currency)} />
              <StatRow label="Volume" value={formatLargeNumber(asset.volume)} />
              <StatRow label="Avg Volume" value={formatLargeNumber(asset.avgVolume)} />
              <StatRow label="52W High" value={formatCurrency(asset.week52High, currency)} />
              <StatRow label="52W Low" value={formatCurrency(asset.week52Low, currency)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary content grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Fundamentals */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fundamentals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              <StatRow label="Market Cap" value={`${isIndian ? "₹" : "$"}${formatLargeNumber(asset.marketCap)}`} />
              {!isCrypto && (
                <>
                  <StatRow label="P/E Ratio" value={asset.pe.toFixed(2)} />
                  <StatRow label="EPS" value={formatCurrency(asset.eps, currency)} />
                  <StatRow label="Dividend Yield" value={asset.dividend.toFixed(2)} suffix="%" />
                </>
              )}
              <StatRow label="Beta" value={asset.beta.toFixed(2)} />
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {asset.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* News */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Latest News</CardTitle>
          <Link href="/news" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {mockNews.map((news, idx) => (
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
        <strong>Disclaimer:</strong> The information provided is for educational purposes only and should not be considered as financial advice.
        Please consult a qualified financial advisor before making any investment decisions.
      </div>
    </div>
  );
}
