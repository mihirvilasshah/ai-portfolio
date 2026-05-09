/**
 * Provider Quota Manager
 * Tracks API usage, enforces limits, and manages provider priority
 */

/**
 * Provider configuration
 */
export interface ProviderConfig {
  name: string;
  dailyLimit: number;
  minuteLimit: number;
  priority: number;           // Lower = higher priority
  costPerRequest?: number;    // For paid APIs
  isEnabled: boolean;
}

/**
 * Quota status for a provider
 */
export interface QuotaStatus {
  provider: string;
  dailyUsed: number;
  dailyRemaining: number;
  minuteUsed: number;
  minuteRemaining: number;
  percentUsed: number;
  isAvailable: boolean;
  lastRequest?: Date;
  nextResetDaily: Date;
  nextResetMinute: Date;
}

/**
 * Request tracking entry
 */
interface RequestEntry {
  timestamp: Date;
  endpoint?: string;
  cost?: number;
}

/**
 * Provider tracking state
 */
interface ProviderState {
  config: ProviderConfig;
  requests: RequestEntry[];
  dailyCount: number;
  lastDailyReset: Date;
  isCircuitOpen: boolean;
  circuitOpenUntil?: Date;
  consecutiveFailures: number;
}

// Default provider configurations
const DEFAULT_PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  yahoo: {
    name: "Yahoo Finance",
    dailyLimit: 2000,
    minuteLimit: 60,
    priority: 1,
    isEnabled: true,
  },
  finnhub: {
    name: "Finnhub",
    dailyLimit: 300,       // Free tier
    minuteLimit: 30,
    priority: 2,
    isEnabled: true,
  },
  coingecko: {
    name: "CoinGecko",
    dailyLimit: 10000,
    minuteLimit: 50,
    priority: 1,
    isEnabled: true,
  },
  newsapi: {
    name: "NewsAPI",
    dailyLimit: 100,       // Free tier
    minuteLimit: 10,
    priority: 2,
    isEnabled: true,
  },
  alphavantage: {
    name: "Alpha Vantage",
    dailyLimit: 500,
    minuteLimit: 5,
    priority: 3,
    isEnabled: true,
  },
  twelvedata: {
    name: "TwelveData",
    dailyLimit: 800,
    minuteLimit: 8,
    priority: 3,
    isEnabled: false,
  },
  mock: {
    name: "Mock Provider",
    dailyLimit: Infinity,
    minuteLimit: Infinity,
    priority: 99,
    isEnabled: true,
  },
};

// In-memory state (in production, use Redis)
const providerStates = new Map<string, ProviderState>();

// Circuit breaker settings
const CIRCUIT_BREAKER_THRESHOLD = 5;    // Failures before opening
const CIRCUIT_BREAKER_RESET_MS = 60000; // 1 minute

/**
 * Initialize provider state
 */
function initializeProvider(providerId: string): ProviderState {
  const config = DEFAULT_PROVIDER_CONFIGS[providerId] ?? {
    name: providerId,
    dailyLimit: 100,
    minuteLimit: 10,
    priority: 50,
    isEnabled: false,
  };

  const state: ProviderState = {
    config,
    requests: [],
    dailyCount: 0,
    lastDailyReset: getStartOfDay(),
    isCircuitOpen: false,
    consecutiveFailures: 0,
  };

  providerStates.set(providerId, state);
  return state;
}

/**
 * Get start of current day
 */
function getStartOfDay(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Get provider state (initialize if needed)
 */
function getProviderState(providerId: string): ProviderState {
  let state = providerStates.get(providerId);
  if (!state) {
    state = initializeProvider(providerId);
  }

  // Check if daily reset needed
  const today = getStartOfDay();
  if (state.lastDailyReset < today) {
    state.dailyCount = 0;
    state.lastDailyReset = today;
  }

  // Clean up old minute requests
  const oneMinuteAgo = new Date(Date.now() - 60000);
  state.requests = state.requests.filter((r) => r.timestamp > oneMinuteAgo);

  return state;
}

/**
 * Record a request for a provider
 */
export function recordRequest(
  providerId: string,
  endpoint?: string,
  cost: number = 1
): void {
  const state = getProviderState(providerId);

  state.requests.push({
    timestamp: new Date(),
    endpoint,
    cost,
  });

  state.dailyCount += cost;
  state.consecutiveFailures = 0; // Reset on successful request

  // Close circuit on success
  if (state.isCircuitOpen) {
    state.isCircuitOpen = false;
    state.circuitOpenUntil = undefined;
  }
}

/**
 * Record a failed request (for circuit breaker)
 */
export function recordFailure(providerId: string): void {
  const state = getProviderState(providerId);
  state.consecutiveFailures++;

  if (state.consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
    state.isCircuitOpen = true;
    state.circuitOpenUntil = new Date(Date.now() + CIRCUIT_BREAKER_RESET_MS);
  }
}

/**
 * Check if provider is available (within quota and circuit closed)
 */
export function isProviderAvailable(providerId: string): boolean {
  const state = getProviderState(providerId);

  if (!state.config.isEnabled) return false;

  // Check circuit breaker
  if (state.isCircuitOpen) {
    if (state.circuitOpenUntil && new Date() > state.circuitOpenUntil) {
      // Half-open: allow one request to test
      state.isCircuitOpen = false;
    } else {
      return false;
    }
  }

  // Check daily limit
  if (state.dailyCount >= state.config.dailyLimit) return false;

  // Check minute limit
  if (state.requests.length >= state.config.minuteLimit) return false;

  return true;
}

/**
 * Get quota status for a provider
 */
export function getQuotaStatus(providerId: string): QuotaStatus {
  const state = getProviderState(providerId);
  const now = new Date();

  const dailyRemaining = Math.max(0, state.config.dailyLimit - state.dailyCount);
  const minuteRemaining = Math.max(0, state.config.minuteLimit - state.requests.length);

  // Calculate next reset times
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const nextMinute = new Date(now.getTime() + 60000);

  return {
    provider: state.config.name,
    dailyUsed: state.dailyCount,
    dailyRemaining,
    minuteUsed: state.requests.length,
    minuteRemaining,
    percentUsed: (state.dailyCount / state.config.dailyLimit) * 100,
    isAvailable: isProviderAvailable(providerId),
    lastRequest: state.requests[state.requests.length - 1]?.timestamp,
    nextResetDaily: tomorrow,
    nextResetMinute: nextMinute,
  };
}

/**
 * Get all quota statuses
 */
export function getAllQuotaStatuses(): QuotaStatus[] {
  const statuses: QuotaStatus[] = [];

  for (const providerId of Object.keys(DEFAULT_PROVIDER_CONFIGS)) {
    statuses.push(getQuotaStatus(providerId));
  }

  return statuses.sort((a, b) => {
    const stateA = providerStates.get(a.provider);
    const stateB = providerStates.get(b.provider);
    return (stateA?.config.priority ?? 99) - (stateB?.config.priority ?? 99);
  });
}

/**
 * Get best available provider for a request type
 */
export function getBestProvider(
  requestType: "quote" | "ohlcv" | "fundamentals" | "news" | "search"
): string | null {
  // Provider capabilities by request type
  const providerCapabilities: Record<string, string[]> = {
    yahoo: ["quote", "ohlcv", "fundamentals", "search"],
    finnhub: ["quote", "ohlcv", "news", "search"],
    coingecko: ["quote", "ohlcv", "search"],
    newsapi: ["news"],
    alphavantage: ["quote", "ohlcv", "fundamentals", "search"],
    twelvedata: ["quote", "ohlcv", "fundamentals", "search"],
  };

  // Find available providers that support this request type
  const candidates: Array<{ id: string; priority: number; percentUsed: number }> = [];

  for (const [providerId, capabilities] of Object.entries(providerCapabilities)) {
    if (!capabilities.includes(requestType)) continue;
    if (!isProviderAvailable(providerId)) continue;

    const status = getQuotaStatus(providerId);
    const state = getProviderState(providerId);

    candidates.push({
      id: providerId,
      priority: state.config.priority,
      percentUsed: status.percentUsed,
    });
  }

  if (candidates.length === 0) {
    // Fall back to mock if enabled
    if (isProviderAvailable("mock")) return "mock";
    return null;
  }

  // Sort by priority, then by quota remaining
  candidates.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.percentUsed - b.percentUsed;
  });

  return candidates[0]!.id;
}

/**
 * Reserve quota for a batch request
 */
export function reserveQuota(
  providerId: string,
  count: number
): boolean {
  const state = getProviderState(providerId);

  // Check if we have enough quota
  const dailyRemaining = state.config.dailyLimit - state.dailyCount;
  const minuteRemaining = state.config.minuteLimit - state.requests.length;

  if (count > dailyRemaining || count > minuteRemaining) {
    return false;
  }

  return true;
}

/**
 * Get estimated time until provider is available
 */
export function getTimeUntilAvailable(providerId: string): number | null {
  const state = getProviderState(providerId);

  if (!state.config.isEnabled) return null;

  // If circuit is open
  if (state.isCircuitOpen && state.circuitOpenUntil) {
    return state.circuitOpenUntil.getTime() - Date.now();
  }

  // If daily limit hit
  if (state.dailyCount >= state.config.dailyLimit) {
    const tomorrow = getStartOfDay();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.getTime() - Date.now();
  }

  // If minute limit hit
  if (state.requests.length >= state.config.minuteLimit) {
    const oldestRequest = state.requests[0];
    if (oldestRequest) {
      return oldestRequest.timestamp.getTime() + 60000 - Date.now();
    }
  }

  return 0; // Available now
}

/**
 * Update provider configuration
 */
export function updateProviderConfig(
  providerId: string,
  updates: Partial<ProviderConfig>
): void {
  const state = getProviderState(providerId);
  state.config = { ...state.config, ...updates };
}

/**
 * Reset provider quota (for testing or admin)
 */
export function resetProviderQuota(providerId: string): void {
  const state = getProviderState(providerId);
  state.requests = [];
  state.dailyCount = 0;
  state.lastDailyReset = getStartOfDay();
  state.isCircuitOpen = false;
  state.circuitOpenUntil = undefined;
  state.consecutiveFailures = 0;
}

/**
 * Get daily usage statistics
 */
export function getDailyUsageStats(): {
  totalRequests: number;
  byProvider: Record<string, number>;
  estimatedCost: number;
} {
  let totalRequests = 0;
  const byProvider: Record<string, number> = {};
  let estimatedCost = 0;

  for (const [providerId, state] of providerStates) {
    byProvider[providerId] = state.dailyCount;
    totalRequests += state.dailyCount;

    if (state.config.costPerRequest) {
      estimatedCost += state.dailyCount * state.config.costPerRequest;
    }
  }

  return { totalRequests, byProvider, estimatedCost };
}
