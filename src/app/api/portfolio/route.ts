import { NextResponse } from "next/server";
import {
  withErrorHandling,
  validateBody,
  paginatedResponse,
  errors,
} from "@/lib/api-utils";
import { createHoldingSchema, CreateHolding, updateHoldingSchema } from "@/lib/validators";

// Mock data store (replace with database in production)
const holdings = new Map<string, {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  createdAt: Date;
  updatedAt: Date;
}>();

// Initialize with sample data
const sampleHoldings = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", quantity: 50, avgCost: 2450.0, currentPrice: 2892.45 },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", quantity: 100, avgCost: 1580.0, currentPrice: 1654.30 },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", quantity: 25, avgCost: 3600.0, currentPrice: 3945.75 },
  { symbol: "INFY.NS", name: "Infosys", quantity: 75, avgCost: 1400.0, currentPrice: 1523.20 },
];

sampleHoldings.forEach((h, i) => {
  const id = `holding-${i + 1}`;
  holdings.set(id, {
    id,
    userId: "user-1",
    ...h,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

/**
 * GET /api/portfolio
 * Returns all holdings for the authenticated user
 */
export async function GET(request: Request) {
  return withErrorHandling(async () => {
    // In production, get userId from session
    const userId = "user-1";
    
    const userHoldings = Array.from(holdings.values())
      .filter((h) => h.userId === userId)
      .map((h) => ({
        ...h,
        value: h.quantity * h.currentPrice,
        gain: (h.currentPrice - h.avgCost) * h.quantity,
        gainPercent: ((h.currentPrice - h.avgCost) / h.avgCost) * 100,
      }));

    const totalValue = userHoldings.reduce((sum, h) => sum + h.value, 0);
    const totalCost = userHoldings.reduce((sum, h) => sum + h.quantity * h.avgCost, 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return {
      holdings: userHoldings,
      summary: {
        totalValue,
        totalCost,
        totalGain,
        totalGainPercent,
        holdingsCount: userHoldings.length,
      },
    };
  });
}

/**
 * POST /api/portfolio
 * Add a new holding
 */
export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const data = await validateBody<CreateHolding>(request, createHoldingSchema);
    
    // In production, get userId from session
    const userId = "user-1";
    
    const id = `holding-${Date.now()}`;
    const now = new Date();
    
    // Fetch current price (mock)
    const currentPrice = data.avgCost * (1 + (Math.random() * 0.2 - 0.1));
    
    const newHolding = {
      id,
      userId,
      symbol: data.symbol,
      name: data.symbol.replace(".NS", "").replace(".BSE", ""),
      quantity: data.quantity,
      avgCost: data.avgCost,
      currentPrice,
      createdAt: now,
      updatedAt: now,
    };
    
    holdings.set(id, newHolding);
    
    return {
      message: "Holding added successfully",
      holding: {
        ...newHolding,
        value: newHolding.quantity * newHolding.currentPrice,
        gain: (newHolding.currentPrice - newHolding.avgCost) * newHolding.quantity,
        gainPercent: ((newHolding.currentPrice - newHolding.avgCost) / newHolding.avgCost) * 100,
      },
    };
  });
}

/**
 * PUT /api/portfolio
 * Update a holding (expects id in body)
 */
export async function PUT(request: Request) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      throw errors.badRequest("Holding ID is required");
    }
    
    const holding = holdings.get(id);
    if (!holding) {
      throw errors.notFound("Holding");
    }
    
    const validated = updateHoldingSchema.parse(updateData);
    
    const updated = {
      ...holding,
      ...validated,
      updatedAt: new Date(),
    };
    
    holdings.set(id, updated);
    
    return {
      message: "Holding updated successfully",
      holding: updated,
    };
  });
}

/**
 * DELETE /api/portfolio
 * Delete a holding (expects id in query params)
 */
export async function DELETE(request: Request) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      throw errors.badRequest("Holding ID is required");
    }
    
    const holding = holdings.get(id);
    if (!holding) {
      throw errors.notFound("Holding");
    }
    
    holdings.delete(id);
    
    return {
      message: "Holding deleted successfully",
    };
  });
}
