"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Icons
const GlobeIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

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

const ClockIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Market data types
interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: string;
  region: "india" | "us" | "europe" | "asia";
}

interface Commodity {
  name: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
}

interface Currency {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
}

interface SectorPerformance {
  name: string;
  change: number;
  topGainer: string;
  topLoser: string;
}

// Mock data
const mockIndices: MarketIndex[] = [
  // India
  { symbol: "NIFTY50", name: "Nifty 50", price: 22156.80, change: 134.25, changePercent: 0.61, high: 22198.45, low: 22022.35, open: 22040.10, previousClose: 22022.55, volume: "18.2B", region: "india" },
  { symbol: "SENSEX", name: "BSE Sensex", price: 73057.40, change: 432.85, changePercent: 0.60, high: 73212.65, low: 72624.55, open: 72705.20, previousClose: 72624.55, volume: "15.8B", region: "india" },
  { symbol: "BANKNIFTY", name: "Bank Nifty", price: 47285.15, change: -123.45, changePercent: -0.26, high: 47512.30, low: 47123.80, open: 47408.55, previousClose: 47408.60, volume: "8.5B", region: "india" },
  { symbol: "NIFTYIT", name: "Nifty IT", price: 35428.90, change: 285.70, changePercent: 0.81, high: 35512.45, low: 35143.25, open: 35180.00, previousClose: 35143.20, volume: "4.2B", region: "india" },
  // US
  { symbol: "SPX", name: "S&P 500", price: 5123.45, change: 28.34, changePercent: 0.56, high: 5135.20, low: 5095.18, open: 5098.45, previousClose: 5095.11, volume: "3.2B", region: "us" },
  { symbol: "DJIA", name: "Dow Jones", price: 38892.12, change: 156.89, changePercent: 0.40, high: 38945.68, low: 38735.23, open: 38742.55, previousClose: 38735.23, volume: "285M", region: "us" },
  { symbol: "IXIC", name: "NASDAQ Composite", price: 16085.92, change: 98.76, changePercent: 0.62, high: 16145.28, low: 15987.14, open: 15992.45, previousClose: 15987.16, volume: "4.8B", region: "us" },
  // Europe
  { symbol: "FTSE", name: "FTSE 100", price: 8148.25, change: -12.45, changePercent: -0.15, high: 8172.35, low: 8125.80, open: 8160.70, previousClose: 8160.70, volume: "675M", region: "europe" },
  { symbol: "DAX", name: "DAX 40", price: 18321.55, change: 85.40, changePercent: 0.47, high: 18365.90, low: 18236.25, open: 18240.15, previousClose: 18236.15, volume: "58M", region: "europe" },
  // Asia
  { symbol: "N225", name: "Nikkei 225", price: 38892.45, change: 345.23, changePercent: 0.90, high: 38978.65, low: 38547.12, open: 38560.00, previousClose: 38547.22, volume: "1.2B", region: "asia" },
  { symbol: "HSI", name: "Hang Seng", price: 17523.40, change: -89.65, changePercent: -0.51, high: 17685.25, low: 17498.35, open: 17613.05, previousClose: 17613.05, volume: "1.8B", region: "asia" },
];

const mockCommodities: Commodity[] = [
  { name: "Gold", price: 2345.80, change: 12.45, changePercent: 0.53, unit: "USD/oz" },
  { name: "Silver", price: 27.85, change: -0.32, changePercent: -1.14, unit: "USD/oz" },
  { name: "Crude Oil (WTI)", price: 78.92, change: 1.23, changePercent: 1.58, unit: "USD/bbl" },
  { name: "Brent Crude", price: 83.45, change: 0.98, changePercent: 1.19, unit: "USD/bbl" },
  { name: "Natural Gas", price: 2.15, change: -0.08, changePercent: -3.59, unit: "USD/MMBtu" },
  { name: "Copper", price: 4.25, change: 0.05, changePercent: 1.19, unit: "USD/lb" },
];

const mockCurrencies: Currency[] = [
  { pair: "USD/INR", rate: 83.42, change: 0.12, changePercent: 0.14 },
  { pair: "EUR/INR", rate: 90.15, change: -0.25, changePercent: -0.28 },
  { pair: "GBP/INR", rate: 105.28, change: 0.35, changePercent: 0.33 },
  { pair: "EUR/USD", rate: 1.0807, change: -0.0028, changePercent: -0.26 },
  { pair: "USD/JPY", rate: 151.85, change: 0.45, changePercent: 0.30 },
  { pair: "BTC/USD", rate: 67245, change: 1234, changePercent: 1.87 },
];

const mockSectors: SectorPerformance[] = [
  { name: "Banking", change: 0.85, topGainer: "ICICI Bank (+2.1%)", topLoser: "Kotak (-0.8%)" },
  { name: "IT", change: 1.24, topGainer: "TCS (+1.8%)", topLoser: "Tech Mahindra (-0.4%)" },
  { name: "Pharma", change: -0.45, topGainer: "Sun Pharma (+0.9%)", topLoser: "Dr Reddy's (-1.5%)" },
  { name: "Auto", change: 0.32, topGainer: "Tata Motors (+1.5%)", topLoser: "Hero Moto (-0.6%)" },
  { name: "FMCG", change: -0.18, topGainer: "Nestle (+0.5%)", topLoser: "HUL (-0.9%)" },
  { name: "Energy", change: 0.65, topGainer: "ONGC (+1.2%)", topLoser: "BPCL (-0.3%)" },
  { name: "Metals", change: -0.92, topGainer: "Hindalco (+0.4%)", topLoser: "Tata Steel (-1.8%)" },
  { name: "Realty", change: 1.56, topGainer: "DLF (+2.8%)", topLoser: "Godrej Prop (-0.5%)" },
];

function IndexCard({ index }: { index: MarketIndex }) {
  const isPositive = index.change >= 0;
  
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="font-semibold">{index.symbol}</div>
            <div className="text-xs text-muted-foreground">{index.name}</div>
          </div>
          <Badge variant="outline" className="text-[10px]">{index.region.toUpperCase()}</Badge>
        </div>
        <div className="text-xl font-bold mb-1">
          {index.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          isPositive ? "text-green-600" : "text-red-600"
        )}>
          {isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
          <span>{isPositive ? "+" : ""}{index.change.toFixed(2)}</span>
          <span>({isPositive ? "+" : ""}{index.changePercent.toFixed(2)}%)</span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground flex justify-between">
          <span>H: {index.high.toLocaleString()}</span>
          <span>L: {index.low.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function MarketHeatmap({ sectors }: { sectors: SectorPerformance[] }) {
  const maxAbsChange = Math.max(...sectors.map(s => Math.abs(s.change)));
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {sectors.map((sector) => {
        const intensity = Math.abs(sector.change) / maxAbsChange;
        const isPositive = sector.change >= 0;
        
        return (
          <div
            key={sector.name}
            className={cn(
              "p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity",
              isPositive
                ? `bg-green-${Math.round(intensity * 500) || 100}`
                : `bg-red-${Math.round(intensity * 500) || 100}`
            )}
            style={{
              backgroundColor: isPositive
                ? `rgba(34, 197, 94, ${0.1 + intensity * 0.4})`
                : `rgba(239, 68, 68, ${0.1 + intensity * 0.4})`,
            }}
          >
            <div className="font-medium text-sm">{sector.name}</div>
            <div className={cn(
              "text-lg font-bold",
              isPositive ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
            )}>
              {isPositive ? "+" : ""}{sector.change.toFixed(2)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MarketsPage() {
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [lastUpdate] = useState(new Date());

  const regions = [
    { value: "all", label: "All Markets" },
    { value: "india", label: "India" },
    { value: "us", label: "United States" },
    { value: "europe", label: "Europe" },
    { value: "asia", label: "Asia" },
  ];

  const filteredIndices = selectedRegion === "all"
    ? mockIndices
    : mockIndices.filter(i => i.region === selectedRegion);

  // Market status (simplified)
  const now = new Date();
  const hours = now.getUTCHours();
  const isIndiaOpen = hours >= 4 && hours < 10; // IST 9:30 AM - 3:30 PM approx
  const isUSOpen = hours >= 14 && hours < 21;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GlobeIcon />
            Markets Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global market indices, commodities, and currencies
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ClockIcon />
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshIcon />
            Refresh
          </Button>
        </div>
      </div>

      {/* Market Status */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            isIndiaOpen ? "bg-green-500 animate-pulse" : "bg-gray-400"
          )} />
          <span className="text-sm">
            Indian Markets: {isIndiaOpen ? "Open" : "Closed"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            isUSOpen ? "bg-green-500 animate-pulse" : "bg-gray-400"
          )} />
          <span className="text-sm">
            US Markets: {isUSOpen ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      {/* Region Filter */}
      <div className="flex flex-wrap gap-2">
        {regions.map((region) => (
          <button
            key={region.value}
            onClick={() => setSelectedRegion(region.value)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full border transition-colors",
              selectedRegion === region.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/50"
            )}
          >
            {region.label}
          </button>
        ))}
      </div>

      {/* Indices Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Market Indices</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {filteredIndices.map((index) => (
            <IndexCard key={index.symbol} index={index} />
          ))}
        </div>
      </div>

      {/* Sector Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sector Performance (India)</CardTitle>
        </CardHeader>
        <CardContent>
          <MarketHeatmap sectors={mockSectors} />
        </CardContent>
      </Card>

      {/* Commodities & Currencies */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Commodities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Commodities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCommodities.map((commodity) => {
                const isPositive = commodity.change >= 0;
                return (
                  <div key={commodity.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <div className="font-medium">{commodity.name}</div>
                      <div className="text-xs text-muted-foreground">{commodity.unit}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${commodity.price.toLocaleString()}</div>
                      <div className={cn(
                        "text-sm",
                        isPositive ? "text-green-600" : "text-red-600"
                      )}>
                        {isPositive ? "+" : ""}{commodity.change.toFixed(2)} ({isPositive ? "+" : ""}{commodity.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Currencies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Currencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCurrencies.map((currency) => {
                const isPositive = currency.change >= 0;
                return (
                  <div key={currency.pair} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="font-medium">{currency.pair}</div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {currency.rate.toLocaleString(undefined, { 
                          minimumFractionDigits: currency.rate >= 100 ? 2 : 4,
                          maximumFractionDigits: currency.rate >= 100 ? 2 : 4
                        })}
                      </div>
                      <div className={cn(
                        "text-sm",
                        isPositive ? "text-green-600" : "text-red-600"
                      )}>
                        {isPositive ? "+" : ""}{currency.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Movers by Sector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sector Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">Sector</th>
                  <th className="text-right py-2 font-medium">Change</th>
                  <th className="text-left py-2 font-medium pl-4">Top Gainer</th>
                  <th className="text-left py-2 font-medium pl-4">Top Loser</th>
                </tr>
              </thead>
              <tbody>
                {mockSectors.map((sector) => {
                  const isPositive = sector.change >= 0;
                  return (
                    <tr key={sector.name} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-3 font-medium">{sector.name}</td>
                      <td className={cn(
                        "py-3 text-right font-semibold",
                        isPositive ? "text-green-600" : "text-red-600"
                      )}>
                        {isPositive ? "+" : ""}{sector.change.toFixed(2)}%
                      </td>
                      <td className="py-3 pl-4 text-green-600">{sector.topGainer}</td>
                      <td className="py-3 pl-4 text-red-600">{sector.topLoser}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground text-center py-4 border-t border-border">
        Market data is delayed by 15-20 minutes. For real-time data, please use a premium data provider.
        This information is for educational purposes only and should not be considered investment advice.
      </div>
    </div>
  );
}
