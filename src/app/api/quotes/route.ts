import {
  withErrorHandling,
  errors,
} from "@/lib/api-utils";

// Mock quote data
interface QuoteData {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  pe: number;
  eps: number;
  week52High: number;
  week52Low: number;
  timestamp: Date;
}

const mockQuotes: Record<string, QuoteData> = {
  "RELIANCE.NS": {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Ltd",
    exchange: "NSE",
    price: 2892.45,
    open: 2858.00,
    high: 2915.80,
    low: 2845.25,
    close: 2892.45,
    previousClose: 2858.25,
    change: 34.20,
    changePercent: 1.2,
    volume: 5842156,
    avgVolume: 4521000,
    marketCap: 1954000,
    pe: 28.5,
    eps: 101.5,
    week52High: 3025.00,
    week52Low: 2220.10,
    timestamp: new Date(),
  },
  "TCS.NS": {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services Ltd",
    exchange: "NSE",
    price: 3945.75,
    open: 3912.00,
    high: 3968.50,
    low: 3905.20,
    close: 3945.75,
    previousClose: 3914.50,
    change: 31.25,
    changePercent: 0.8,
    volume: 1523456,
    avgVolume: 1250000,
    marketCap: 1425000,
    pe: 32.1,
    eps: 122.9,
    week52High: 4255.00,
    week52Low: 3056.25,
    timestamp: new Date(),
  },
  "HDFCBANK.NS": {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank Ltd",
    exchange: "NSE",
    price: 1654.30,
    open: 1642.00,
    high: 1668.90,
    low: 1635.50,
    close: 1654.30,
    previousClose: 1646.05,
    change: 8.25,
    changePercent: 0.5,
    volume: 8945231,
    avgVolume: 7500000,
    marketCap: 1258000,
    pe: 19.8,
    eps: 83.5,
    week52High: 1794.00,
    week52Low: 1363.55,
    timestamp: new Date(),
  },
  "INFY.NS": {
    symbol: "INFY.NS",
    name: "Infosys Ltd",
    exchange: "NSE",
    price: 1523.20,
    open: 1502.00,
    high: 1535.80,
    low: 1498.25,
    close: 1523.20,
    previousClose: 1502.15,
    change: 21.05,
    changePercent: 1.4,
    volume: 4521896,
    avgVolume: 4000000,
    marketCap: 632000,
    pe: 24.5,
    eps: 62.2,
    week52High: 1733.95,
    week52Low: 1215.45,
    timestamp: new Date(),
  },
  "ICICIBANK.NS": {
    symbol: "ICICIBANK.NS",
    name: "ICICI Bank Ltd",
    exchange: "NSE",
    price: 1098.75,
    open: 1086.00,
    high: 1108.40,
    low: 1082.30,
    close: 1098.75,
    previousClose: 1086.80,
    change: 11.95,
    changePercent: 1.1,
    volume: 12450123,
    avgVolume: 11000000,
    marketCap: 772000,
    pe: 18.2,
    eps: 60.4,
    week52High: 1257.80,
    week52Low: 867.15,
    timestamp: new Date(),
  },
};

// Add small random variations to simulate real-time updates
function getRandomizedQuote(quote: QuoteData): QuoteData {
  const variation = (Math.random() - 0.5) * 0.002; // ±0.1% variation
  const newPrice = quote.price * (1 + variation);
  const change = newPrice - quote.previousClose;
  const changePercent = (change / quote.previousClose) * 100;
  
  return {
    ...quote,
    price: parseFloat(newPrice.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    high: Math.max(quote.high, newPrice),
    low: Math.min(quote.low, newPrice),
    close: parseFloat(newPrice.toFixed(2)),
    timestamp: new Date(),
  };
}

/**
 * GET /api/quotes
 * Get quotes for one or more symbols
 */
export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");
    
    if (!symbolsParam) {
      throw errors.badRequest("At least one symbol is required");
    }
    
    const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase());
    
    if (symbols.length > 50) {
      throw errors.badRequest("Maximum 50 symbols allowed per request");
    }
    
    const quotes: QuoteData[] = [];
    const notFound: string[] = [];
    
    for (const symbol of symbols) {
      const quote = mockQuotes[symbol];
      if (quote) {
        quotes.push(getRandomizedQuote(quote));
      } else {
        notFound.push(symbol);
      }
    }
    
    return {
      quotes,
      notFound: notFound.length > 0 ? notFound : undefined,
      timestamp: new Date(),
    };
  });
}

/**
 * POST /api/quotes/batch
 * Get quotes for multiple symbols with additional data
 */
export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const { symbols, includeExtended = false } = body;
    
    if (!symbols || !Array.isArray(symbols)) {
      throw errors.badRequest("Symbols array is required");
    }
    
    if (symbols.length > 100) {
      throw errors.badRequest("Maximum 100 symbols allowed per request");
    }
    
    const quotes = symbols
      .map((symbol: string) => mockQuotes[symbol.toUpperCase()])
      .filter(Boolean)
      .map(getRandomizedQuote);
    
    // If extended data requested, add technical indicators (mock)
    if (includeExtended) {
      const extendedQuotes = quotes.map((q) => ({
        ...q,
        technicals: {
          rsi: 45 + Math.random() * 30,
          macd: (Math.random() - 0.5) * 10,
          sma20: q.price * (0.95 + Math.random() * 0.1),
          sma50: q.price * (0.9 + Math.random() * 0.2),
          sma200: q.price * (0.85 + Math.random() * 0.3),
          bollingerUpper: q.price * 1.05,
          bollingerLower: q.price * 0.95,
        },
      }));
      
      return {
        quotes: extendedQuotes,
        timestamp: new Date(),
      };
    }
    
    return {
      quotes,
      timestamp: new Date(),
    };
  });
}
