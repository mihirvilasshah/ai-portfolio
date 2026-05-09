import { z } from "zod";

// ============================================
// Asset Schemas
// ============================================

export const assetTypeSchema = z.enum(["stock", "etf", "mf", "crypto"]);

export const exchangeSchema = z.enum(["NSE", "BSE", "NASDAQ", "NYSE", "CRYPTO"]);

export const assetSchema = z.object({
  id: z.string().cuid2(),
  symbol: z.string().min(1).max(20),
  name: z.string().min(1).max(255),
  type: assetTypeSchema,
  exchange: exchangeSchema,
  sector: z.string().optional(),
  industry: z.string().optional(),
  marketCap: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createAssetSchema = assetSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAssetSchema = createAssetSchema.partial();

// ============================================
// Quote Schemas
// ============================================

export const quoteSchema = z.object({
  symbol: z.string(),
  price: z.number().min(0),
  open: z.number().min(0),
  high: z.number().min(0),
  low: z.number().min(0),
  close: z.number().min(0),
  previousClose: z.number().min(0),
  volume: z.number().int().min(0),
  change: z.number(),
  changePercent: z.number(),
  timestamp: z.date(),
});

// ============================================
// Portfolio Schemas
// ============================================

export const holdingSchema = z.object({
  id: z.string().cuid2(),
  userId: z.string().cuid2(),
  assetId: z.string().cuid2(),
  quantity: z.number().positive(),
  avgCost: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createHoldingSchema = z.object({
  symbol: z.string().min(1).max(20),
  quantity: z.number().positive("Quantity must be positive"),
  avgCost: z.number().positive("Average cost must be positive"),
});

export const updateHoldingSchema = z.object({
  quantity: z.number().positive("Quantity must be positive").optional(),
  avgCost: z.number().positive("Average cost must be positive").optional(),
});

// ============================================
// Watchlist Schemas
// ============================================

export const watchlistSchema = z.object({
  id: z.string().cuid2(),
  userId: z.string().cuid2(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createWatchlistSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500).optional(),
});

export const addToWatchlistSchema = z.object({
  symbol: z.string().min(1).max(20),
});

// ============================================
// Alert Schemas
// ============================================

export const alertTypeSchema = z.enum([
  "price_above",
  "price_below",
  "change_percent",
  "volume_spike",
]);

export const alertSchema = z.object({
  id: z.string().cuid2(),
  userId: z.string().cuid2(),
  symbol: z.string().min(1).max(20),
  type: alertTypeSchema,
  threshold: z.number(),
  enabled: z.boolean().default(true),
  triggered: z.boolean().default(false),
  triggeredAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createAlertSchema = z.object({
  symbol: z.string().min(1, "Symbol is required").max(20),
  type: alertTypeSchema,
  threshold: z.number({
    required_error: "Threshold is required",
    invalid_type_error: "Threshold must be a number",
  }),
  enabled: z.boolean().default(true),
});

export const updateAlertSchema = z.object({
  threshold: z.number().optional(),
  enabled: z.boolean().optional(),
});

// ============================================
// Screener Schemas
// ============================================

export const screenerFilterSchema = z.object({
  field: z.enum([
    "price",
    "marketCap",
    "pe",
    "pb",
    "dividendYield",
    "roe",
    "debtToEquity",
    "revenue",
    "profitMargin",
    "eps",
    "volume",
    "changePercent",
  ]),
  operator: z.enum(["gt", "gte", "lt", "lte", "eq", "between"]),
  value: z.union([z.number(), z.tuple([z.number(), z.number()])]),
});

export const screenerQuerySchema = z.object({
  filters: z.array(screenerFilterSchema).max(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  exchange: exchangeSchema.optional(),
  sector: z.string().optional(),
});

// ============================================
// User Preferences Schema
// ============================================

export const userPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  defaultExchange: exchangeSchema.default("NSE"),
  currency: z.enum(["INR", "USD", "EUR"]).default("INR"),
  riskTolerance: z.enum(["conservative", "moderate", "aggressive"]).default("moderate"),
  notifications: z.object({
    emailAlerts: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    priceAlerts: z.boolean().default(true),
    portfolioUpdates: z.boolean().default(true),
  }),
});

// ============================================
// API Response Schemas
// ============================================

export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int(),
  details: z.record(z.unknown()).optional(),
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
    }),
  });

// ============================================
// Type Exports
// ============================================

export type Asset = z.infer<typeof assetSchema>;
export type CreateAsset = z.infer<typeof createAssetSchema>;
export type UpdateAsset = z.infer<typeof updateAssetSchema>;
export type Quote = z.infer<typeof quoteSchema>;
export type Holding = z.infer<typeof holdingSchema>;
export type CreateHolding = z.infer<typeof createHoldingSchema>;
export type UpdateHolding = z.infer<typeof updateHoldingSchema>;
export type Watchlist = z.infer<typeof watchlistSchema>;
export type CreateWatchlist = z.infer<typeof createWatchlistSchema>;
export type Alert = z.infer<typeof alertSchema>;
export type CreateAlert = z.infer<typeof createAlertSchema>;
export type UpdateAlert = z.infer<typeof updateAlertSchema>;
export type AlertType = z.infer<typeof alertTypeSchema>;
export type ScreenerFilter = z.infer<typeof screenerFilterSchema>;
export type ScreenerQuery = z.infer<typeof screenerQuerySchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
