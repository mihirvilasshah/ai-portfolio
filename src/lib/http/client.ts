/**
 * Resilient HTTP client with retry, timeout, and circuit breaker support
 */

import { apiConfig } from "@/config/api";
import { ProviderError, CircuitBreakerOpenError, TooManyRequestsError } from "@/lib/errors";

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  provider?: string;
}

interface CircuitState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
  openedAt?: number;
}

// Circuit breaker state per provider
const circuits = new Map<string, CircuitState>();

const CIRCUIT_THRESHOLD = 5; // Failures before opening
const CIRCUIT_RESET_TIME = 60 * 1000; // 1 minute

/**
 * Add jitter to delay to prevent thundering herd
 */
function addJitter(delay: number): number {
  const jitter = Math.random() * 0.3 * delay; // Up to 30% jitter
  return delay + jitter;
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  return addJitter(delay);
}

/**
 * Check if circuit breaker is open
 */
function isCircuitOpen(provider: string): boolean {
  const state = circuits.get(provider);
  
  if (!state || !state.isOpen) {
    return false;
  }

  // Check if reset time has passed
  const now = Date.now();
  if (state.openedAt && now - state.openedAt > CIRCUIT_RESET_TIME) {
    // Allow a probe request (half-open state)
    state.isOpen = false;
    state.failures = 0;
    return false;
  }

  return true;
}

/**
 * Record a failure for circuit breaker
 */
function recordFailure(provider: string): void {
  const state = circuits.get(provider) || { failures: 0, lastFailure: 0, isOpen: false };
  
  state.failures += 1;
  state.lastFailure = Date.now();

  if (state.failures >= CIRCUIT_THRESHOLD) {
    state.isOpen = true;
    state.openedAt = Date.now();
    console.warn(`Circuit breaker opened for provider: ${provider}`);
  }

  circuits.set(provider, state);
}

/**
 * Record a success for circuit breaker
 */
function recordSuccess(provider: string): void {
  const state = circuits.get(provider);
  
  if (state) {
    state.failures = 0;
    state.isOpen = false;
    state.openedAt = undefined;
  }
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: FetchOptions
): Promise<Response> {
  const { timeout = apiConfig.http.timeout, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Resilient fetch with retry logic
 */
export async function resilientFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    retries = apiConfig.http.retries,
    retryDelay = apiConfig.http.retryDelay,
    provider = "unknown",
    ...fetchOptions
  } = options;

  // Check circuit breaker
  if (isCircuitOpen(provider)) {
    throw new CircuitBreakerOpenError(
      provider,
      new Date(Date.now() + CIRCUIT_RESET_TIME)
    );
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        ...fetchOptions,
        provider,
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : retryDelay;
        
        if (attempt <= retries) {
          await sleep(waitTime);
          continue;
        }
        
        throw new TooManyRequestsError(
          `Rate limited by ${provider}`,
          retryAfter ? parseInt(retryAfter, 10) : undefined
        );
      }

      // Handle server errors with retry
      if (response.status >= 500 && attempt <= retries) {
        const delay = getBackoffDelay(attempt, retryDelay, apiConfig.http.maxRetryDelay);
        await sleep(delay);
        continue;
      }

      // Handle client errors
      if (!response.ok) {
        throw new ProviderError(
          `Provider returned ${response.status}: ${response.statusText}`,
          provider
        );
      }

      // Success
      recordSuccess(provider);
      return await response.json() as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on abort (timeout)
      if (lastError.name === "AbortError") {
        recordFailure(provider);
        throw new ProviderError(`Request timed out for ${provider}`, provider, lastError);
      }

      // Don't retry on circuit breaker or rate limit errors
      if (
        error instanceof CircuitBreakerOpenError ||
        error instanceof TooManyRequestsError
      ) {
        throw error;
      }

      // Record failure
      recordFailure(provider);

      // Retry if attempts remaining
      if (attempt <= retries) {
        const delay = getBackoffDelay(attempt, retryDelay, apiConfig.http.maxRetryDelay);
        console.warn(
          `Retry ${attempt}/${retries} for ${provider} after ${Math.round(delay)}ms:`,
          lastError.message
        );
        await sleep(delay);
        continue;
      }
    }
  }

  // All retries exhausted
  throw new ProviderError(
    `All retries exhausted for ${provider}`,
    provider,
    lastError || undefined
  );
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build URL with query params
 */
export function buildUrl(base: string, params: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(base);
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  }
  
  return url.toString();
}

/**
 * Get circuit breaker status for all providers
 */
export function getCircuitStatus(): Record<string, CircuitState> {
  return Object.fromEntries(circuits.entries());
}

/**
 * Reset circuit breaker for a provider
 */
export function resetCircuit(provider: string): void {
  circuits.delete(provider);
}

/**
 * HTTP client wrapper for common operations
 */
export const httpClient = {
  get: async <T>(url: string, options?: FetchOptions): Promise<T> => {
    return resilientFetch<T>(url, { ...options, method: "GET" });
  },
  post: async <T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> => {
    return resilientFetch<T>(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
  },
  put: async <T>(url: string, data?: unknown, options?: FetchOptions): Promise<T> => {
    return resilientFetch<T>(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
  },
  delete: async <T>(url: string, options?: FetchOptions): Promise<T> => {
    return resilientFetch<T>(url, { ...options, method: "DELETE" });
  },
};

export { sleep, addJitter, getBackoffDelay };
