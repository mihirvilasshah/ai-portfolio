"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Icons
const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

const PieChartIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
  </svg>
);

// Mock holdings data
interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  sector: string;
}

const initialHoldings: Holding[] = [
  { id: "1", symbol: "RELIANCE.NS", name: "Reliance Industries", quantity: 50, avgCost: 2650, currentPrice: 2847.50, sector: "Energy" },
  { id: "2", symbol: "TCS.NS", name: "Tata Consultancy", quantity: 30, avgCost: 3200, currentPrice: 3456.75, sector: "Technology" },
  { id: "3", symbol: "HDFCBANK.NS", name: "HDFC Bank", quantity: 100, avgCost: 1550, currentPrice: 1623.40, sector: "Finance" },
  { id: "4", symbol: "INFY.NS", name: "Infosys", quantity: 75, avgCost: 1400, currentPrice: 1478.25, sector: "Technology" },
  { id: "5", symbol: "AAPL", name: "Apple Inc.", quantity: 20, avgCost: 175, currentPrice: 189.45, sector: "Technology" },
];

// Available assets for adding
const availableAssets = [
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", price: 1089.60 },
  { symbol: "MSFT", name: "Microsoft", price: 378.92 },
  { symbol: "NVDA", name: "NVIDIA", price: 875.28 },
  { symbol: "BTC", name: "Bitcoin", price: 67845.50 },
  { symbol: "ETH", name: "Ethereum", price: 3456.78 },
];

function formatCurrency(value: number, currency: "INR" | "USD" = "INR"): string {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

// Risk meter component
function RiskMeter({ score }: { score: number }) {
  const getColor = () => {
    if (score <= 30) return "bg-green-500";
    if (score <= 60) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const getLabel = () => {
    if (score <= 30) return "Low";
    if (score <= 60) return "Medium";
    return "High";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Portfolio Risk</span>
        <span className="font-medium">{getLabel()}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", getColor())}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// Allocation chart (simple bar representation)
function AllocationChart({ holdings }: { holdings: Holding[] }) {
  const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  
  // Group by sector
  const sectorAllocation = holdings.reduce((acc, h) => {
    const value = h.quantity * h.currentPrice;
    acc[h.sector] = (acc[h.sector] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  const sectors = Object.entries(sectorAllocation)
    .map(([sector, value]) => ({
      sector,
      value,
      percent: (value / totalValue) * 100,
    }))
    .sort((a, b) => b.value - a.value);

  const colors = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"];

  return (
    <div className="space-y-3">
      <div className="h-4 flex rounded-full overflow-hidden">
        {sectors.map((s, idx) => (
          <div
            key={s.sector}
            className={cn(colors[idx % colors.length])}
            style={{ width: `${s.percent}%` }}
            title={`${s.sector}: ${s.percent.toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {sectors.map((s, idx) => (
          <div key={s.sector} className="flex items-center gap-2 text-sm">
            <div className={cn("h-3 w-3 rounded-full", colors[idx % colors.length])} />
            <span className="text-muted-foreground">{s.sector}</span>
            <span className="ml-auto font-medium">{s.percent.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>(initialHoldings);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHolding, setNewHolding] = useState({ symbol: "", quantity: "", avgCost: "" });

  // Calculate portfolio metrics
  const totalInvested = holdings.reduce((sum, h) => sum + h.quantity * h.avgCost, 0);
  const currentValue = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  const totalPnL = currentValue - totalInvested;
  const totalPnLPercent = (totalPnL / totalInvested) * 100;

  // Day change (mock - using 1.5% average)
  const dayChange = currentValue * 0.015;
  const dayChangePercent = 1.5;

  // Risk score (simplified calculation)
  const riskScore = 45; // Would be calculated based on volatility, concentration, etc.

  // Diversification score
  const sectors = new Set(holdings.map(h => h.sector));
  const diversificationScore = Math.min(100, sectors.size * 25);

  const handleRemoveHolding = (id: string) => {
    setHoldings(holdings.filter(h => h.id !== id));
  };

  const handleAddHolding = () => {
    const asset = availableAssets.find(a => a.symbol === newHolding.symbol);
    if (!asset || !newHolding.quantity || !newHolding.avgCost) return;

    const holding: Holding = {
      id: Date.now().toString(),
      symbol: asset.symbol,
      name: asset.name,
      quantity: parseFloat(newHolding.quantity),
      avgCost: parseFloat(newHolding.avgCost),
      currentPrice: asset.price,
      sector: "Other",
    };

    setHoldings([...holdings, holding]);
    setNewHolding({ symbol: "", quantity: "", avgCost: "" });
    setShowAddModal(false);
  };

  // Determine currency (simplified - check if any US stocks)
  const hasUSStocks = holdings.some(h => !h.symbol.endsWith(".NS"));
  const primaryCurrency = hasUSStocks ? "USD" : "INR";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio Simulator</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and simulate your investment portfolio
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <PlusIcon />
          Add Holding
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Portfolio Value</div>
            <div className="text-2xl font-bold mt-1">
              {formatCurrency(currentValue, primaryCurrency)}
            </div>
            <div className={cn(
              "flex items-center gap-1 text-sm mt-1",
              dayChange >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {dayChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              <span>{formatCurrency(dayChange, primaryCurrency)} ({formatPercent(dayChangePercent)}) today</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Total P&L</div>
            <div className={cn(
              "text-2xl font-bold mt-1",
              totalPnL >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {totalPnL >= 0 ? "+" : ""}{formatCurrency(totalPnL, primaryCurrency)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatPercent(totalPnLPercent)} all time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Invested Amount</div>
            <div className="text-2xl font-bold mt-1">
              {formatCurrency(totalInvested, primaryCurrency)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {holdings.length} holdings
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Diversification</div>
            <div className="text-2xl font-bold mt-1">{diversificationScore}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              {sectors.size} sectors
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Holdings Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">Asset</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">Qty</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">Avg Cost</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">Current</th>
                    <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">P&L</th>
                    <th className="text-center py-2 text-xs font-medium text-muted-foreground uppercase w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {holdings.map((holding) => {
                    const isIndian = holding.symbol.endsWith(".NS");
                    const currency = isIndian ? "INR" : "USD";
                    const value = holding.quantity * holding.currentPrice;
                    const cost = holding.quantity * holding.avgCost;
                    const pnl = value - cost;
                    const pnlPercent = (pnl / cost) * 100;

                    return (
                      <tr key={holding.id} className="hover:bg-muted/50">
                        <td className="py-3">
                          <div className="font-medium text-sm">{holding.symbol.replace(".NS", "")}</div>
                          <div className="text-xs text-muted-foreground">{holding.name}</div>
                        </td>
                        <td className="py-3 text-right text-sm">{holding.quantity}</td>
                        <td className="py-3 text-right text-sm">{formatCurrency(holding.avgCost, currency)}</td>
                        <td className="py-3 text-right text-sm">{formatCurrency(holding.currentPrice, currency)}</td>
                        <td className="py-3 text-right">
                          <div className={cn("text-sm font-medium", pnl >= 0 ? "text-green-600" : "text-red-600")}>
                            {formatCurrency(pnl, currency)}
                          </div>
                          <div className={cn("text-xs", pnl >= 0 ? "text-green-600" : "text-red-600")}>
                            {formatPercent(pnlPercent)}
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleRemoveHolding(holding.id)}
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

            {holdings.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No holdings yet. Add your first position to get started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Sidebar */}
        <div className="space-y-6">
          {/* Risk Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RiskMeter score={riskScore} />
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Volatility</span>
                  <span className="font-medium">Medium</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Beta</span>
                  <span className="font-medium">1.12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sharpe Ratio</span>
                  <span className="font-medium">1.45</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Drawdown</span>
                  <span className="font-medium text-red-500">-12.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Allocation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <PieChartIcon />
                Sector Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AllocationChart holdings={holdings} />
            </CardContent>
          </Card>

          {/* Projections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1-Year Projection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conservative (5%)</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(currentValue * 1.05, primaryCurrency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Moderate (12%)</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(currentValue * 1.12, primaryCurrency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Aggressive (20%)</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(currentValue * 1.20, primaryCurrency)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                *Based on historical performance. Not guaranteed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddModal(false)}
          />
          <Card className="relative z-10 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add Holding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Asset</label>
                <select
                  value={newHolding.symbol}
                  onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="">Select an asset...</option>
                  {availableAssets.map((asset) => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.symbol} - {asset.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={newHolding.quantity}
                  onChange={(e) => setNewHolding({ ...newHolding, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Average Cost</label>
                <Input
                  type="number"
                  placeholder="e.g., 1500"
                  value={newHolding.avgCost}
                  onChange={(e) => setNewHolding({ ...newHolding, avgCost: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddHolding}>
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-xs text-muted-foreground text-center py-4 border-t border-border">
        <strong>Disclaimer:</strong> This portfolio simulator is for educational purposes only.
        Projections are estimates based on historical data and do not guarantee future results.
        Please consult a financial advisor for personalized advice.
      </div>
    </div>
  );
}
