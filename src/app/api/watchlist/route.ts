import {
  withErrorHandling,
  errors,
} from "@/lib/api-utils";
import { addToWatchlistSchema, createWatchlistSchema } from "@/lib/validators";

// Mock data store (replace with database in production)
interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  addedAt: Date;
}

interface WatchlistData {
  id: string;
  userId: string;
  name: string;
  description?: string;
  items: WatchlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const watchlists = new Map<string, WatchlistData>();

// Initialize with sample data
const defaultWatchlist: WatchlistData = {
  id: "watchlist-1",
  userId: "user-1",
  name: "My Watchlist",
  description: "Default watchlist",
  items: [
    { symbol: "RELIANCE.NS", name: "Reliance Industries", price: 2892.45, change: 34.20, changePercent: 1.2, addedAt: new Date() },
    { symbol: "TATAMOTORS.NS", name: "Tata Motors", price: 952.30, change: -12.45, changePercent: -1.29, addedAt: new Date() },
    { symbol: "ICICIBANK.NS", name: "ICICI Bank", price: 1098.75, change: 15.30, changePercent: 1.41, addedAt: new Date() },
    { symbol: "WIPRO.NS", name: "Wipro", price: 452.80, change: 5.60, changePercent: 1.25, addedAt: new Date() },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

watchlists.set(defaultWatchlist.id, defaultWatchlist);

/**
 * GET /api/watchlist
 * Returns all watchlists for the authenticated user
 */
export async function GET(request: Request) {
  return withErrorHandling(async () => {
    // In production, get userId from session
    const userId = "user-1";
    
    const { searchParams } = new URL(request.url);
    const watchlistId = searchParams.get("id");
    
    if (watchlistId) {
      // Return specific watchlist
      const watchlist = watchlists.get(watchlistId);
      if (!watchlist || watchlist.userId !== userId) {
        throw errors.notFound("Watchlist");
      }
      return watchlist;
    }
    
    // Return all watchlists
    const userWatchlists = Array.from(watchlists.values())
      .filter((w) => w.userId === userId)
      .map((w) => ({
        ...w,
        itemCount: w.items.length,
      }));
    
    return {
      watchlists: userWatchlists,
      total: userWatchlists.length,
    };
  });
}

/**
 * POST /api/watchlist
 * Create a new watchlist or add item to existing watchlist
 */
export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const userId = "user-1";
    
    // Check if adding to existing watchlist
    if (body.watchlistId && body.symbol) {
      const validated = addToWatchlistSchema.parse({ symbol: body.symbol });
      const watchlist = watchlists.get(body.watchlistId);
      
      if (!watchlist || watchlist.userId !== userId) {
        throw errors.notFound("Watchlist");
      }
      
      // Check if already in watchlist
      if (watchlist.items.some((i) => i.symbol === validated.symbol)) {
        throw errors.conflict("Symbol already in watchlist");
      }
      
      // Add item (mock price data)
      const newItem: WatchlistItem = {
        symbol: validated.symbol,
        name: validated.symbol.replace(".NS", "").replace(".BSE", ""),
        price: 1000 + Math.random() * 2000,
        change: (Math.random() - 0.5) * 50,
        changePercent: (Math.random() - 0.5) * 5,
        addedAt: new Date(),
      };
      
      watchlist.items.push(newItem);
      watchlist.updatedAt = new Date();
      
      return {
        message: "Symbol added to watchlist",
        item: newItem,
      };
    }
    
    // Create new watchlist
    const validated = createWatchlistSchema.parse(body);
    const id = `watchlist-${Date.now()}`;
    const now = new Date();
    
    const newWatchlist: WatchlistData = {
      id,
      userId,
      name: validated.name,
      description: validated.description,
      items: [],
      createdAt: now,
      updatedAt: now,
    };
    
    watchlists.set(id, newWatchlist);
    
    return {
      message: "Watchlist created successfully",
      watchlist: newWatchlist,
    };
  });
}

/**
 * PUT /api/watchlist
 * Update watchlist details
 */
export async function PUT(request: Request) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const { id, name, description } = body;
    const userId = "user-1";
    
    if (!id) {
      throw errors.badRequest("Watchlist ID is required");
    }
    
    const watchlist = watchlists.get(id);
    if (!watchlist || watchlist.userId !== userId) {
      throw errors.notFound("Watchlist");
    }
    
    if (name) watchlist.name = name;
    if (description !== undefined) watchlist.description = description;
    watchlist.updatedAt = new Date();
    
    return {
      message: "Watchlist updated successfully",
      watchlist,
    };
  });
}

/**
 * DELETE /api/watchlist
 * Delete watchlist or remove item from watchlist
 */
export async function DELETE(request: Request) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const symbol = searchParams.get("symbol");
    const userId = "user-1";
    
    if (!id) {
      throw errors.badRequest("Watchlist ID is required");
    }
    
    const watchlist = watchlists.get(id);
    if (!watchlist || watchlist.userId !== userId) {
      throw errors.notFound("Watchlist");
    }
    
    if (symbol) {
      // Remove item from watchlist
      const itemIndex = watchlist.items.findIndex((i) => i.symbol === symbol);
      if (itemIndex === -1) {
        throw errors.notFound("Symbol in watchlist");
      }
      
      watchlist.items.splice(itemIndex, 1);
      watchlist.updatedAt = new Date();
      
      return {
        message: "Symbol removed from watchlist",
      };
    }
    
    // Delete entire watchlist
    watchlists.delete(id);
    
    return {
      message: "Watchlist deleted successfully",
    };
  });
}
