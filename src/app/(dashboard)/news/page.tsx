"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Icons
const NewspaperIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Category filters
const categories = [
  { value: "all", label: "All News" },
  { value: "markets", label: "Markets" },
  { value: "earnings", label: "Earnings" },
  { value: "economy", label: "Economy" },
  { value: "crypto", label: "Crypto" },
  { value: "technology", label: "Technology" },
  { value: "commodities", label: "Commodities" },
];

// Mock news data
interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: Date;
  symbols: string[];
  sentiment: "positive" | "neutral" | "negative";
  category: string;
}

const mockNews: NewsItem[] = [
  {
    id: "1",
    headline: "Nifty 50 crosses 22,000 mark for the first time on strong FII inflows",
    summary: "Indian benchmark indices hit fresh all-time highs as foreign institutional investors continue to pour money into emerging market equities amid global optimism about interest rate cuts.",
    source: "Economic Times",
    url: "#",
    publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    symbols: ["NIFTY50", "RELIANCE.NS", "HDFCBANK.NS"],
    sentiment: "positive",
    category: "markets",
  },
  {
    id: "2",
    headline: "TCS reports strong Q4 earnings, beats street estimates",
    summary: "Tata Consultancy Services reported better-than-expected quarterly results with revenue growth of 4.5% and margin expansion of 50 basis points driven by cost optimization measures.",
    source: "Mint",
    url: "#",
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    symbols: ["TCS.NS"],
    sentiment: "positive",
    category: "earnings",
  },
  {
    id: "3",
    headline: "RBI maintains repo rate at 6.5%, signals cautious stance on inflation",
    summary: "The Reserve Bank of India kept benchmark interest rates unchanged for the sixth consecutive time while maintaining focus on bringing inflation sustainably within the 4% target.",
    source: "Business Standard",
    url: "#",
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    symbols: ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS"],
    sentiment: "neutral",
    category: "economy",
  },
  {
    id: "4",
    headline: "Bitcoin surges past $67,000 as ETF inflows reach record levels",
    summary: "Bitcoin rallied sharply as spot ETF products saw their highest single-day inflows since launch, signaling growing institutional adoption of cryptocurrencies.",
    source: "CoinDesk",
    url: "#",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    symbols: ["BTC", "ETH"],
    sentiment: "positive",
    category: "crypto",
  },
  {
    id: "5",
    headline: "NVIDIA unveils next-gen AI chips, shares hit new record high",
    summary: "NVIDIA announced its latest generation of AI accelerators claiming 30x performance improvement, sending shares to all-time highs amid the ongoing AI infrastructure buildout.",
    source: "Reuters",
    url: "#",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    symbols: ["NVDA", "AMD"],
    sentiment: "positive",
    category: "technology",
  },
  {
    id: "6",
    headline: "Reliance Jio announces 5G rollout expansion to 100 new cities",
    summary: "Reliance Jio will expand its 5G coverage to 100 additional cities by Q2, targeting 85% urban coverage as it invests in next-generation telecom infrastructure.",
    source: "Financial Express",
    url: "#",
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    symbols: ["RELIANCE.NS"],
    sentiment: "positive",
    category: "technology",
  },
  {
    id: "7",
    headline: "Crude oil prices stabilize as OPEC+ signals production discipline",
    summary: "Oil prices found support after OPEC+ members indicated continued commitment to production cuts, balancing concerns about global demand slowdown.",
    source: "Bloomberg",
    url: "#",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    symbols: ["RELIANCE.NS", "ONGC.NS"],
    sentiment: "neutral",
    category: "commodities",
  },
  {
    id: "8",
    headline: "Infosys wins major digital transformation deal worth $500 million",
    summary: "Infosys secured a multi-year digital transformation contract with a Fortune 500 company, boosting confidence in the IT services sector's deal pipeline.",
    source: "Moneycontrol",
    url: "#",
    publishedAt: new Date(Date.now() - 15 * 60 * 60 * 1000),
    symbols: ["INFY.NS", "TCS.NS"],
    sentiment: "positive",
    category: "technology",
  },
  {
    id: "9",
    headline: "US Fed hints at possible rate cuts in second half of 2024",
    summary: "Federal Reserve Chair signaled potential interest rate reductions later this year if inflation continues its downward trajectory, boosting global equity sentiment.",
    source: "CNBC",
    url: "#",
    publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    symbols: ["AAPL", "MSFT", "GOOGL"],
    sentiment: "positive",
    category: "economy",
  },
  {
    id: "10",
    headline: "HDFC Bank merger integration progressing ahead of schedule",
    summary: "HDFC Bank management indicated that the merger integration with HDFC Ltd is proceeding better than expected, with synergies likely to materialize earlier than projected.",
    source: "Economic Times",
    url: "#",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    symbols: ["HDFCBANK.NS"],
    sentiment: "positive",
    category: "earnings",
  },
];

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getSentimentBadge(sentiment: NewsItem["sentiment"]) {
  const config = {
    positive: { label: "Bullish", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    neutral: { label: "Neutral", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
    negative: { label: "Bearish", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  };
  return config[sentiment];
}

function NewsCard({ news, featured = false }: { news: NewsItem; featured?: boolean }) {
  const sentimentBadge = getSentimentBadge(news.sentiment);

  if (featured) {
    return (
      <Card className="overflow-hidden">
        <div className="md:flex">
          <div className="md:w-2/5 bg-muted h-48 md:h-auto flex items-center justify-center">
            <NewspaperIcon />
          </div>
          <div className="p-6 md:w-3/5">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">{news.category}</Badge>
              <span className={cn("px-2 py-0.5 text-xs font-medium rounded", sentimentBadge.className)}>
                {sentimentBadge.label}
              </span>
            </div>
            <h2 className="text-xl font-bold mb-2 hover:text-primary transition-colors cursor-pointer">
              {news.headline}
            </h2>
            <p className="text-muted-foreground mb-4 line-clamp-2">
              {news.summary}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{news.source}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ClockIcon />
                  {formatTimeAgo(news.publishedAt)}
                </span>
              </div>
              <div className="flex gap-1">
                {news.symbols.slice(0, 3).map((symbol) => (
                  <Badge key={symbol} variant="outline" className="text-xs">
                    {symbol.replace(".NS", "")}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-2 mb-2">
          <Badge variant="secondary" className="text-xs shrink-0">{news.category}</Badge>
          <span className={cn("px-2 py-0.5 text-xs font-medium rounded shrink-0", sentimentBadge.className)}>
            {sentimentBadge.label}
          </span>
        </div>
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
          {news.headline}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {news.summary}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{news.source}</span>
            <span>•</span>
            <span>{formatTimeAgo(news.publishedAt)}</span>
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          {news.symbols.slice(0, 2).map((symbol) => (
            <Badge key={symbol} variant="outline" className="text-[10px]">
              {symbol.replace(".NS", "")}
            </Badge>
          ))}
          {news.symbols.length > 2 && (
            <Badge variant="outline" className="text-[10px]">
              +{news.symbols.length - 2}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function NewsPage() {
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter news
  const filteredNews = mockNews.filter(news => {
    if (category !== "all" && news.category !== category) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        news.headline.toLowerCase().includes(query) ||
        news.summary.toLowerCase().includes(query) ||
        news.symbols.some(s => s.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const featuredNews = filteredNews[0];
  const otherNews = filteredNews.slice(1);

  // Sentiment stats
  const positiveCount = mockNews.filter(n => n.sentiment === "positive").length;
  const negativeCount = mockNews.filter(n => n.sentiment === "negative").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <NewspaperIcon />
            Market News
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Latest news and sentiment analysis for your investments
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-medium">{positiveCount}</span>
            <span className="text-muted-foreground">Bullish</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-medium">{negativeCount}</span>
            <span className="text-muted-foreground">Bearish</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <SearchIcon />
          </div>
          <Input
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-full border transition-colors",
                category === cat.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary/50"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured News */}
      {featuredNews && <NewsCard news={featuredNews} featured />}

      {/* News Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {otherNews.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>

      {filteredNews.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <NewspaperIcon />
            <p className="text-muted-foreground mt-2">No news found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setCategory("all");
                setSearchQuery("");
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {filteredNews.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load More News
          </Button>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground text-center py-4 border-t border-border">
        <strong>Note:</strong> News sentiment analysis is AI-generated and may not reflect actual market implications.
        Always verify information from multiple sources before making investment decisions.
      </div>
    </div>
  );
}
