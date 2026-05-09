import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import { ApiError } from "./validators";

/**
 * Wraps an API handler with error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<T>
): Promise<NextResponse<T | ApiError>> {
  return handler()
    .then((data) => NextResponse.json(data as T))
    .catch((error) => handleApiError(error));
}

/**
 * Handles API errors and returns appropriate response
 */
export function handleApiError(error: unknown): NextResponse<ApiError> {
  console.error("API Error:", error);

  // Zod validation error
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation Error",
        message: "Invalid request data",
        statusCode: 400,
        details: formatZodErrors(error),
      },
      { status: 400 }
    );
  }

  // Custom API error
  if (isApiError(error)) {
    return NextResponse.json(error, { status: error.statusCode });
  }

  // Generic error
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error.message,
        statusCode: 500,
      },
      { status: 500 }
    );
  }

  // Unknown error
  return NextResponse.json(
    {
      error: "Internal Server Error",
      message: "An unexpected error occurred",
      statusCode: 500,
    },
    { status: 500 }
  );
}

/**
 * Creates an API error object
 */
export function createApiError(
  statusCode: number,
  error: string,
  message: string,
  details?: Record<string, unknown>
): ApiError {
  return { statusCode, error, message, details };
}

/**
 * Type guard for ApiError
 */
function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    "error" in error &&
    "message" in error
  );
}

/**
 * Format Zod errors into a user-friendly structure
 */
function formatZodErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "root";
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }
  
  return errors;
}

/**
 * Validates request body against a Zod schema
 */
export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: ZodSchema<T>
): T {
  const params: Record<string, string | string[]> = {};
  
  searchParams.forEach((value, key) => {
    if (params[key]) {
      // Handle multiple values for same key
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });
  
  return schema.parse(params);
}

/**
 * Creates a paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Common HTTP error responses
 */
export const errors = {
  notFound: (resource: string) =>
    createApiError(404, "Not Found", `${resource} not found`),
  
  unauthorized: () =>
    createApiError(401, "Unauthorized", "Authentication required"),
  
  forbidden: () =>
    createApiError(403, "Forbidden", "You do not have permission to perform this action"),
  
  badRequest: (message: string) =>
    createApiError(400, "Bad Request", message),
  
  conflict: (message: string) =>
    createApiError(409, "Conflict", message),
  
  rateLimit: () =>
    createApiError(429, "Too Many Requests", "Rate limit exceeded. Please try again later."),
};
