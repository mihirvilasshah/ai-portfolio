import { NextResponse } from "next/server";
import {
  withErrorHandling,
  validateBody,
  paginatedResponse,
} from "@/lib/api-utils";
import { screenerQuerySchema, ScreenerQuery, ScreenerFilter } from "@/lib/validators";

// Mock stock data for screening
interface StockData {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  price: number;
  marketCap: number; // in crores
  pe: number;
  pb: number;
  dividendYield: number;
  roe: number;
  debtToEquity: number;
  revenue: number; // in crores
  profitMargin: number;
  eps: number;
  volume: number;
  changePercent: number;
}

const mockStocks: StockData[] = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", exchange: "NSE", sector: "Energy", industry: "Oil & Gas", price: 2892.45, marketCap: 1954000, pe: 28.5, pb: 2.8, dividendYield: 0.3, roe: 9.8, debtToEquity: 0.4, revenue: 875000, profitMargin: 8.2, eps: 101.5, volume: 5842000, changePercent: 1.2 },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", exchange: "NSE", sector: "Technology", industry: "IT Services", price: 3945.75, marketCap: 1425000, pe: 32.1, pb: 14.2, dividendYield: 1.2, roe: 48.5, debtToEquity: 0.0, revenue: 225500, profitMargin: 19.8, eps: 122.9, volume: 1523000, changePercent: 0.8 },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", exchange: "NSE", sector: "Financial Services", industry: "Banking", price: 1654.30, marketCap: 1258000, pe: 19.8, pb: 2.9, dividendYield: 1.1, roe: 16.8, debtToEquity: 0.0, revenue: 198000, profitMargin: 22.5, eps: 83.5, volume: 8945000, changePercent: 0.5 },
  { symbol: "INFY.NS", name: "Infosys", exchange: "NSE", sector: "Technology", industry: "IT Services", price: 1523.20, marketCap: 632000, pe: 24.5, pb: 8.1, dividendYield: 2.5, roe: 31.2, debtToEquity: 0.0, revenue: 152000, profitMargin: 17.2, eps: 62.2, volume: 4521000, changePercent: 1.4 },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", exchange: "NSE", sector: "Financial Services", industry: "Banking", price: 1098.75, marketCap: 772000, pe: 18.2, pb: 3.1, dividendYield: 0.8, roe: 18.2, debtToEquity: 0.0, revenue: 165000, profitMargin: 25.8, eps: 60.4, volume: 12450000, changePercent: 1.1 },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever", exchange: "NSE", sector: "Consumer Goods", industry: "FMCG", price: 2485.60, marketCap: 584000, pe: 58.2, pb: 12.5, dividendYield: 1.5, roe: 21.5, debtToEquity: 0.0, revenue: 61000, profitMargin: 16.8, eps: 42.7, volume: 1254000, changePercent: -0.3 },
  { symbol: "SBIN.NS", name: "State Bank of India", exchange: "NSE", sector: "Financial Services", industry: "Banking", price: 782.45, marketCap: 698000, pe: 11.2, pb: 1.8, dividendYield: 1.6, roe: 18.5, debtToEquity: 0.0, revenue: 452000, profitMargin: 12.5, eps: 69.9, volume: 18542000, changePercent: 0.9 },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel", exchange: "NSE", sector: "Telecom", industry: "Telecom Services", price: 1425.80, marketCap: 854000, pe: 72.5, pb: 5.8, dividendYield: 0.4, roe: 8.2, debtToEquity: 1.2, revenue: 145000, profitMargin: 8.5, eps: 19.7, volume: 5421000, changePercent: 0.6 },
  { symbol: "ITC.NS", name: "ITC Limited", exchange: "NSE", sector: "Consumer Goods", industry: "Tobacco", price: 452.30, marketCap: 565000, pe: 28.5, pb: 8.2, dividendYield: 3.2, roe: 29.5, debtToEquity: 0.0, revenue: 72000, profitMargin: 26.8, eps: 15.9, volume: 8542000, changePercent: 0.2 },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", exchange: "NSE", sector: "Financial Services", industry: "Banking", price: 1785.40, marketCap: 355000, pe: 22.5, pb: 3.2, dividendYield: 0.1, roe: 14.2, debtToEquity: 0.0, revenue: 95000, profitMargin: 28.5, eps: 79.4, volume: 2145000, changePercent: -0.4 },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", exchange: "NSE", sector: "Automobile", industry: "Auto Manufacturer", price: 952.30, marketCap: 352000, pe: 8.5, pb: 2.1, dividendYield: 0.0, roe: 28.5, debtToEquity: 0.8, revenue: 425000, profitMargin: 5.2, eps: 112.0, volume: 14520000, changePercent: -1.2 },
  { symbol: "ASIANPAINT.NS", name: "Asian Paints", exchange: "NSE", sector: "Consumer Goods", industry: "Paints", price: 2845.20, marketCap: 273000, pe: 65.2, pb: 18.5, dividendYield: 0.6, roe: 28.5, debtToEquity: 0.1, revenue: 35000, profitMargin: 15.2, eps: 43.6, volume: 854000, changePercent: 0.3 },
  { symbol: "MARUTI.NS", name: "Maruti Suzuki", exchange: "NSE", sector: "Automobile", industry: "Auto Manufacturer", price: 12450.80, marketCap: 392000, pe: 32.5, pb: 5.2, dividendYield: 0.7, roe: 16.8, debtToEquity: 0.0, revenue: 135000, profitMargin: 8.5, eps: 383.1, volume: 425000, changePercent: 1.5 },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical", exchange: "NSE", sector: "Healthcare", industry: "Pharmaceuticals", price: 1654.30, marketCap: 397000, pe: 35.8, pb: 4.5, dividendYield: 0.5, roe: 12.8, debtToEquity: 0.1, revenue: 48000, profitMargin: 22.5, eps: 46.2, volume: 2145000, changePercent: 0.8 },
  { symbol: "WIPRO.NS", name: "Wipro", exchange: "NSE", sector: "Technology", industry: "IT Services", price: 452.80, marketCap: 236000, pe: 21.5, pb: 3.8, dividendYield: 0.2, roe: 17.8, debtToEquity: 0.2, revenue: 89000, profitMargin: 12.5, eps: 21.1, volume: 5421000, changePercent: 0.4 },
];

function applyFilter(stock: StockData, filter: ScreenerFilter): boolean {
  const value = stock[filter.field as keyof StockData] as number;
  
  switch (filter.operator) {
    case "gt":
      return value > (filter.value as number);
    case "gte":
      return value >= (filter.value as number);
    case "lt":
      return value < (filter.value as number);
    case "lte":
      return value <= (filter.value as number);
    case "eq":
      return value === (filter.value as number);
    case "between":
      const [min, max] = filter.value as [number, number];
      return value >= min && value <= max;
    default:
      return true;
  }
}

/**
 * POST /api/screener
 * Run a stock screener query
 */
export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const query = await validateBody<ScreenerQuery>(request, screenerQuerySchema);
    
    let results = [...mockStocks];
    
    // Apply exchange filter
    if (query.exchange) {
      results = results.filter((s) => s.exchange === query.exchange);
    }
    
    // Apply sector filter
    if (query.sector) {
      results = results.filter((s) => s.sector.toLowerCase() === query.sector!.toLowerCase());
    }
    
    // Apply numeric filters
    for (const filter of query.filters) {
      results = results.filter((stock) => applyFilter(stock, filter));
    }
    
    // Sort results
    if (query.sortBy) {
      const sortKey = query.sortBy as keyof StockData;
      results.sort((a, b) => {
        const aVal = a[sortKey] as number;
        const bVal = b[sortKey] as number;
        return query.sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      });
    }
    
    // Paginate
    const total = results.length;
    const start = (query.page - 1) * query.limit;
    const paginatedResults = results.slice(start, start + query.limit);
    
    return paginatedResponse(paginatedResults, query.page, query.limit, total);
  });
}

/**
 * GET /api/screener
 * Get available filter options and presets
 */
export async function GET() {
  return withErrorHandling(async () => {
    const sectors = [...new Set(mockStocks.map((s) => s.sector))].sort();
    const industries = [...new Set(mockStocks.map((s) => s.industry))].sort();
    
    return {
      filters: [
        { field: "price", label: "Price", unit: "₹" },
        { field: "marketCap", label: "Market Cap", unit: "Cr" },
        { field: "pe", label: "P/E Ratio", unit: "x" },
        { field: "pb", label: "P/B Ratio", unit: "x" },
        { field: "dividendYield", label: "Dividend Yield", unit: "%" },
        { field: "roe", label: "ROE", unit: "%" },
        { field: "debtToEquity", label: "Debt/Equity", unit: "x" },
        { field: "profitMargin", label: "Profit Margin", unit: "%" },
        { field: "eps", label: "EPS", unit: "₹" },
        { field: "changePercent", label: "Change %", unit: "%" },
      ],
      sectors,
      industries,
      presets: [
        {
          name: "Value Stocks",
          description: "Low P/E, high dividend yield",
          filters: [
            { field: "pe", operator: "lt", value: 15 },
            { field: "dividendYield", operator: "gt", value: 2 },
          ],
        },
        {
          name: "Growth Stocks",
          description: "High ROE, strong profit margins",
          filters: [
            { field: "roe", operator: "gt", value: 20 },
            { field: "profitMargin", operator: "gt", value: 15 },
          ],
        },
        {
          name: "Large Caps",
          description: "Market cap above 1 lakh crore",
          filters: [
            { field: "marketCap", operator: "gt", value: 100000 },
          ],
        },
        {
          name: "Low Debt",
          description: "Companies with minimal debt",
          filters: [
            { field: "debtToEquity", operator: "lt", value: 0.3 },
          ],
        },
        {
          name: "High Dividend",
          description: "Dividend yield above 2%",
          filters: [
            { field: "dividendYield", operator: "gt", value: 2 },
          ],
        },
      ],
      totalStocks: mockStocks.length,
    };
  });
}
