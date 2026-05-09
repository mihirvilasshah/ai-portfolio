/**
 * Custom error classes for structured error handling
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// HTTP Errors
export class HttpError extends AppError {
  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message, code || `HTTP_${statusCode}`, statusCode, details);
    this.name = "HttpError";
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Bad Request", details?: Record<string, unknown>) {
    super(message, 400, "BAD_REQUEST", details);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized", details?: Record<string, unknown>) {
    super(message, 401, "UNAUTHORIZED", details);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden", details?: Record<string, unknown>) {
    super(message, 403, "FORBIDDEN", details);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Not Found", details?: Record<string, unknown>) {
    super(message, 404, "NOT_FOUND", details);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflict", details?: Record<string, unknown>) {
    super(message, 409, "CONFLICT", details);
    this.name = "ConflictError";
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(
    message = "Too Many Requests",
    public retryAfter?: number,
    details?: Record<string, unknown>
  ) {
    super(message, 429, "TOO_MANY_REQUESTS", details);
    this.name = "TooManyRequestsError";
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "Internal Server Error", details?: Record<string, unknown>) {
    super(message, 500, "INTERNAL_SERVER_ERROR", details);
    this.name = "InternalServerError";
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message = "Service Unavailable", details?: Record<string, unknown>) {
    super(message, 503, "SERVICE_UNAVAILABLE", details);
    this.name = "ServiceUnavailableError";
  }
}

// Domain Errors
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message, "VALIDATION_ERROR", 400, { fields });
    this.name = "ValidationError";
  }
}

export class ProviderError extends AppError {
  constructor(
    message: string,
    public provider: string,
    public originalError?: Error
  ) {
    super(message, "PROVIDER_ERROR", 502, {
      provider,
      originalMessage: originalError?.message,
    });
    this.name = "ProviderError";
  }
}

export class QuotaExceededError extends AppError {
  constructor(
    public provider: string,
    public resetAt?: Date
  ) {
    super(
      `API quota exceeded for ${provider}`,
      "QUOTA_EXCEEDED",
      429,
      { provider, resetAt }
    );
    this.name = "QuotaExceededError";
  }
}

export class CircuitBreakerOpenError extends AppError {
  constructor(
    public provider: string,
    public resetAt?: Date
  ) {
    super(
      `Circuit breaker open for ${provider}`,
      "CIRCUIT_BREAKER_OPEN",
      503,
      { provider, resetAt }
    );
    this.name = "CircuitBreakerOpenError";
  }
}

// Error type guards
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

// Error handler utility
export function handleError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, "UNKNOWN_ERROR", 500, {
      originalName: error.name,
      stack: error.stack,
    });
  }

  return new AppError(
    "An unexpected error occurred",
    "UNKNOWN_ERROR",
    500,
    { originalError: String(error) }
  );
}
