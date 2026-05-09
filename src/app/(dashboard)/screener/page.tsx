"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Icons
const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg className={cn("h-4 w-4", filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

// Market filter options
const marketFilters = [
  { value: "all", label: "All Markets" },
  { value: "nse", label: "NSE" },
  { value: "bse", label: "BSE" },
  { value: "us", label: "US Stocks" },
  { value: "crypto", label: "Crypto" },
];

// Asset class filters
const assetClassFilters = [
  { value: "all", label: "All" },
  { value: "equity", label: "Equity" },
  { value: "etf", label: "ETF" },
  { value: "mutual_fund", label: "Mutual Funds" },
  { value: "crypto", label: "Crypto" },
];

// Sector filters
const sectorFilters = [
  { value: "all", label: "All Sectors" },
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "energy", label: "Energy" },
  { value: "consumer", label: "Consumer" },
];

// Sort options
const sortOptions = [
  { value: "change_desc", label: "Top Gainers" },
  { value: "change_asc", label: "Top Losers" },
  { value: "volume_desc", label: "Most Active" },
  { value: "mcap_desc", label: "Market Cap" },
  { value: "name_asc", label: "Name A-Z" },
];

// Mock stocks data
const mockStocks = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", market: "NSE", sector: "Energy", price: 2847.50, change: 2.34, volume: 12500000, mcap: 19500000000000, pe: 28.5, watchlisted: true },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", market: "NSE", sector: "Technology", price: 3456.75, change: -0.82, volume: 8200000, mcap: 12600000000000, pe: 32.4, watchlisted: false },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", market: "NSE", sector: "Finance", price: 1623.40, change: 1.15, volume: 9800000, mcap: 8900000000000, pe: 21.8, watchlisted: true },
  { symbol: "INFY.NS", name: "Infosys", market: "NSE", sector: "Technology", price: 1478.25, change: -1.56, volume: 6500000, mcap: 6100000000000, pe: 26.2, watchlisted: false },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", market: "NSE", sector: "Finance", price: 1089.60, change: 0.78, volume: 11200000, mcap: 7600000000000, pe: 18.5, watchlisted: false },
  { symbol: "AAPL", name: "Apple Inc.", market: "NASDAQ", sector: "Technology", price: 189.45, change: 1.56, volume: 45200000, mcap: 2950000000000, pe: 29.8, watchlisted: true },
  { symbol: "MSFT", name: "Microsoft Corporation", market: "NASDAQ", sector: "Technology", price: 378.92, change: 0.92, volume: 22100000, mcap: 2810000000000, pe: 35.2, watchlisted: true },
  { symbol: "NVDA", name: "NVIDIA Corporation", market: "NASDAQ", sector: "Technology", price: 875.28, change: 4.21, volume: 32100000, mcap: 2150000000000, pe: 68.5, watchlisted: false },
  { symbol: "BTC", name: "Bitcoin", market: "CRYPTO", sector: "Crypto", price: 67845.50, change: 2.87, volume: 28500000000, mcap: 1320000000000, pe: 0, watchlisted: true },
  { symbol: "ETH", name: "Ethereum", market: "CRYPTO", sector: "Crypto", price: 3456.78, change: 3.45, volume: 12800000000, mcap: 415000000000, pe: 0, watchlisted: false },
];

function formatCurrency(value: number, currency: "INR" | "USD" = "INR"): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e7) return `${(value / 1e7).toFixed(2)}Cr`;
  if (value >= 1e5) return `${(value / 1e5).toFixed(2)}L`;
  return value.toLocaleString();
}

function formatVolume(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

export default function ScreenerPage() {
  const [search, setSearch] = useState("");
  const [market, setMarket] = useState("all");
  const [assetClass, setAssetClass] = useState("all");
  const [sector, setSector] = useState("all");
  const [sortBy, setSortBy] = useState("change_desc");
  const [showFilters, setShowFilters] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<string>>(
    new Set(mockStocks.filter(s => s.watchlisted).map(s => s.symbol))
  );

  // Filter and sort stocks
  const filteredStocks = mockStocks
    .filter(stock => {
      if (search && !stock.name.toLowerCase().includes(search.toLowerCase()) && 
          !stock.symbol.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (market !== "all") {
        const marketMap: Record<string, string[]> = {
          nse: ["NSE"],
          bse: ["BSE"],
          us: ["NASDAQ", "NYSE"],
          crypto: ["CRYPTO"],
        };
        if (!marketMap[market]?.includes(stock.market)) return false;
      }
      if (sector !== "all" && stock.sector.toLowerCase() !== sector) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "change_desc": return b.change - a.change;
        case "change_asc": return a.change - b.change;
        case "volume_desc": return b.volume - a.volume;
        case "mcap_desc": return b.mcap - a.mcap;
        case "name_asc": return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Stock Screener</h1>
        <p className="text-sm text-muted-foreground">
          Search and filter stocks across Indian and US markets
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <SearchIcon />
                </div>
                <Input
                  placeholder="Search by name or symbol..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <FilterIcon />
                Filters
              </Button>
            </div>

            {/* Filter chips (always visible) */}
            <div className="flex flex-wrap gap-2">
              {marketFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setMarket(filter.value)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full border transition-colors",
                    market === filter.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="grid gap-4 pt-4 border-t border-border md:grid-cols-3">
                {/* Asset Class */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Asset Class
                  </label>
                  <select
                    value={assetClass}
                    onChange={(e) => setAssetClass(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
                  >
                    {assetClassFilters.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sector */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Sector
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
                  >
                    {sectorFilters.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredStocks.length} of {mockStocks.length} assets
      </div>

      {/* Results table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Asset
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Price
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Change
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Volume
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Market Cap
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  P/E
                </th>
                <th className="text-center py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">
                  
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStocks.map((stock) => {
                const isIndian = stock.symbol.endsWith(".NS") || stock.symbol.endsWith(".BO");
                const isCrypto = stock.market === "CRYPTO";
                const currency = isIndian ? "INR" : "USD";

                return (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link href={`/asset/${stock.symbol}`} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">
                            {stock.symbol.replace(".NS", "").replace(".BO", "")}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {stock.name}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-sm">
                        {formatCurrency(stock.price, currency)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={cn(
                          "text-sm font-medium",
                          stock.change >= 0 ? "text-green-600" : "text-red-600"
                        )}
                      >
                        {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {isCrypto ? `$${formatVolume(stock.volume)}` : formatVolume(stock.volume)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {isIndian ? "₹" : "$"}{formatMarketCap(stock.mcap)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {stock.pe > 0 ? stock.pe.toFixed(1) : "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWatchlist(stock.symbol);
                        }}
                        className="p-1 hover:bg-accent rounded transition-colors"
                      >
                        <StarIcon filled={watchlist.has(stock.symbol)} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStocks.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No assets found matching your filters.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setMarket("all");
                setSector("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
