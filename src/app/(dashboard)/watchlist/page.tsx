"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Icons
const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg className={cn("h-5 w-5", filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const BellIcon = ({ active }: { active?: boolean }) => (
  <svg className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Mock watchlist data
interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  addedAt: Date;
  alerts: Alert[];
}

interface Alert {
  id: string;
  type: "price_above" | "price_below" | "change_percent";
  value: number;
  triggered: boolean;
}

const initialWatchlist: WatchlistItem[] = [
  {
    id: "1",
    symbol: "RELIANCE.NS",
    name: "Reliance Industries",
    price: 2847.50,
    change: 65.30,
    changePercent: 2.34,
    volume: 12500000,
    marketCap: 19500000000000,
    addedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    alerts: [{ id: "a1", type: "price_above", value: 3000, triggered: false }],
  },
  {
    id: "2",
    symbol: "TCS.NS",
    name: "Tata Consultancy Services",
    price: 3456.75,
    change: -28.65,
    changePercent: -0.82,
    volume: 8200000,
    marketCap: 12600000000000,
    addedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    alerts: [{ id: "a2", type: "price_below", value: 3300, triggered: true }],
  },
  {
    id: "3",
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank",
    price: 1623.40,
    change: 18.50,
    changePercent: 1.15,
    volume: 9800000,
    marketCap: 8900000000000,
    addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    alerts: [],
  },
  {
    id: "4",
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 189.45,
    change: 2.91,
    changePercent: 1.56,
    volume: 45200000,
    marketCap: 2950000000000,
    addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    alerts: [
      { id: "a3", type: "price_above", value: 200, triggered: false },
      { id: "a4", type: "price_below", value: 180, triggered: false },
    ],
  },
  {
    id: "5",
    symbol: "BTC",
    name: "Bitcoin",
    price: 67845.50,
    change: 1892.35,
    changePercent: 2.87,
    volume: 28500000000,
    marketCap: 1320000000000,
    addedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    alerts: [{ id: "a5", type: "change_percent", value: 5, triggered: false }],
  },
];

// Available assets for search
const searchableAssets = [
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 875.28 },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 378.92 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 141.56 },
  { symbol: "INFY.NS", name: "Infosys", price: 1478.25 },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", price: 1089.60 },
  { symbol: "ETH", name: "Ethereum", price: 3456.78 },
];

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
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

function getAlertTypeLabel(type: Alert["type"]): string {
  switch (type) {
    case "price_above": return "Price Above";
    case "price_below": return "Price Below";
    case "change_percent": return "Change %";
  }
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(initialWatchlist);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState({ type: "price_above" as Alert["type"], value: "" });

  // Filter watchlist
  const filteredWatchlist = watchlist.filter(item =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Search results for adding new items
  const searchResults = searchableAssets.filter(asset =>
    !watchlist.some(w => w.symbol === asset.symbol) &&
    (asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
     asset.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRemove = (id: string) => {
    setWatchlist(watchlist.filter(w => w.id !== id));
  };

  const handleAddToWatchlist = (asset: typeof searchableAssets[0]) => {
    const newItem: WatchlistItem = {
      id: Date.now().toString(),
      symbol: asset.symbol,
      name: asset.name,
      price: asset.price,
      change: asset.price * 0.01, // Mock 1% change
      changePercent: 1.0,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: asset.price * 1000000000,
      addedAt: new Date(),
      alerts: [],
    };
    setWatchlist([newItem, ...watchlist]);
    setSearchQuery("");
    setShowSearch(false);
  };

  const handleAddAlert = (itemId: string) => {
    if (!newAlert.value) return;
    
    setWatchlist(watchlist.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          alerts: [
            ...item.alerts,
            {
              id: Date.now().toString(),
              type: newAlert.type,
              value: parseFloat(newAlert.value),
              triggered: false,
            },
          ],
        };
      }
      return item;
    }));
    
    setNewAlert({ type: "price_above", value: "" });
    setShowAlertModal(null);
  };

  const handleRemoveAlert = (itemId: string, alertId: string) => {
    setWatchlist(watchlist.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          alerts: item.alerts.filter(a => a.id !== alertId),
        };
      }
      return item;
    }));
  };

  // Count active alerts
  const totalAlerts = watchlist.reduce((sum, item) => sum + item.alerts.length, 0);
  const triggeredAlerts = watchlist.reduce(
    (sum, item) => sum + item.alerts.filter(a => a.triggered).length, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <StarIcon filled />
            Watchlist
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your favorite assets and set price alerts
          </p>
        </div>
        <Button onClick={() => setShowSearch(!showSearch)} className="gap-2">
          <PlusIcon />
          Add Asset
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Watching</div>
            <div className="text-2xl font-bold">{watchlist.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Active Alerts</div>
            <div className="text-2xl font-bold">{totalAlerts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Triggered</div>
            <div className="text-2xl font-bold text-yellow-600">{triggeredAlerts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Gainers Today</div>
            <div className="text-2xl font-bold text-green-600">
              {watchlist.filter(w => w.change > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search/Add Panel */}
      {showSearch && (
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <SearchIcon />
              </div>
              <Input
                placeholder="Search assets to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            {searchQuery && searchResults.length > 0 && (
              <div className="mt-3 space-y-2">
                {searchResults.slice(0, 5).map((asset) => (
                  <div
                    key={asset.symbol}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => handleAddToWatchlist(asset)}
                  >
                    <div>
                      <div className="font-medium">{asset.symbol}</div>
                      <div className="text-sm text-muted-foreground">{asset.name}</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <PlusIcon />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {searchQuery && searchResults.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground text-center py-4">
                No assets found or already in watchlist
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Watchlist Table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Your Watchlist</CardTitle>
            <div className="relative w-64">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <SearchIcon />
              </div>
              <Input
                placeholder="Filter watchlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-xs font-medium text-muted-foreground uppercase">Asset</th>
                  <th className="text-right py-3 text-xs font-medium text-muted-foreground uppercase">Price</th>
                  <th className="text-right py-3 text-xs font-medium text-muted-foreground uppercase">Change</th>
                  <th className="text-right py-3 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Volume</th>
                  <th className="text-center py-3 text-xs font-medium text-muted-foreground uppercase">Alerts</th>
                  <th className="text-center py-3 text-xs font-medium text-muted-foreground uppercase w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredWatchlist.map((item) => {
                  const isIndian = item.symbol.endsWith(".NS");
                  const currency = isIndian ? "INR" : "USD";
                  const hasTriggeredAlert = item.alerts.some(a => a.triggered);

                  return (
                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3">
                        <Link href={`/asset/${item.symbol}`} className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                            {item.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-sm hover:text-primary transition-colors">
                              {item.symbol.replace(".NS", "")}
                            </div>
                            <div className="text-xs text-muted-foreground">{item.name}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 text-right">
                        <div className="font-medium text-sm">
                          {formatCurrency(item.price, currency)}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className={cn(
                          "flex items-center justify-end gap-1 text-sm font-medium",
                          item.change >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {item.change >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                          {item.change >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="py-3 text-right hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {formatLargeNumber(item.volume)}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {item.alerts.length > 0 ? (
                          <button
                            onClick={() => setShowAlertModal(item.id)}
                            className="inline-flex items-center gap-1"
                          >
                            <BellIcon active={hasTriggeredAlert} />
                            <Badge variant={hasTriggeredAlert ? "default" : "secondary"} className="text-xs">
                              {item.alerts.length}
                            </Badge>
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowAlertModal(item.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <BellIcon />
                          </button>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredWatchlist.length === 0 && (
            <div className="py-12 text-center">
              <StarIcon filled={false} />
              <p className="text-muted-foreground mt-2">
                {searchQuery ? "No matching assets" : "Your watchlist is empty"}
              </p>
              {!searchQuery && (
                <Button variant="outline" className="mt-4" onClick={() => setShowSearch(true)}>
                  Add your first asset
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAlertModal(null)}
          />
          <Card className="relative z-10 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon active />
                Price Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing alerts */}
              {watchlist.find(w => w.id === showAlertModal)?.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    alert.triggered ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-muted/50"
                  )}
                >
                  <div>
                    <div className="text-sm font-medium">
                      {getAlertTypeLabel(alert.type)}: {alert.value}
                    </div>
                    {alert.triggered && (
                      <Badge variant="secondary" className="text-xs mt-1">Triggered</Badge>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveAlert(showAlertModal, alert.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}

              {/* Add new alert */}
              <div className="border-t border-border pt-4">
                <div className="text-sm font-medium mb-3">Add New Alert</div>
                <div className="flex gap-2">
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as Alert["type"] })}
                    className="px-3 py-2 bg-background border border-input rounded-md text-sm"
                  >
                    <option value="price_above">Price Above</option>
                    <option value="price_below">Price Below</option>
                    <option value="change_percent">Change %</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Value"
                    value={newAlert.value}
                    onChange={(e) => setNewAlert({ ...newAlert, value: e.target.value })}
                    className="flex-1"
                  />
                  <Button onClick={() => handleAddAlert(showAlertModal)}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setShowAlertModal(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
