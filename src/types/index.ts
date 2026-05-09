// Domain types
export * from "./domain";

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Result type for error handling
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Date types
export type DateString = string; // ISO 8601 format
export type Timestamp = number; // Unix timestamp in milliseconds

// ID types
export type AssetId = string;
export type UserId = string;
export type PortfolioId = string;
export type WatchlistId = string;

// Filter and sort types
export type SortDirection = "asc" | "desc";

export interface SortOption<T> {
  field: keyof T;
  direction: SortDirection;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface FilterParams {
  search?: string;
  [key: string]: unknown;
}

// Form types
export type FormState = "idle" | "loading" | "success" | "error";

export interface FormError {
  field: string;
  message: string;
}

// Component props helpers
export type PropsWithClassName<P = unknown> = P & {
  className?: string;
};

export type PropsWithChildren<P = unknown> = P & {
  children: React.ReactNode;
};
