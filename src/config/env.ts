import { z } from "zod";

/**
 * Environment variable schema with validation
 * Fails fast at boot if required variables are missing
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url().optional(),

  // OAuth Providers (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Market Data Providers
  YAHOO_FINANCE_API_KEY: z.string().optional(),
  TWELVE_DATA_API_KEY: z.string().optional(),
  ALPHA_VANTAGE_API_KEY: z.string().optional(),
  FINNHUB_API_KEY: z.string().optional(),
  COINGECKO_API_KEY: z.string().optional(),
  NEWS_API_KEY: z.string().optional(),

  // AI Provider
  OPENAI_API_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(["mock", "openai"]).default("mock"),

  // Redis (optional)
  REDIS_URL: z.string().optional(),

  // Observability
  SENTRY_DSN: z.string().optional(),
  POSTHOG_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().optional(),

  // Feature flags
  ENABLE_AI_INSIGHTS: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  ENABLE_CRYPTO: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
  ENABLE_PORTFOLIO_SIMULATOR: z
    .string()
    .transform((val) => val === "true")
    .default("true"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables at boot
 * @throws {Error} If validation fails
 */
function validateEnv(): Env {
  // In development, provide fallbacks for non-critical vars
  const envValues = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL || "",
    DIRECT_URL: process.env.DIRECT_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    YAHOO_FINANCE_API_KEY: process.env.YAHOO_FINANCE_API_KEY,
    TWELVE_DATA_API_KEY: process.env.TWELVE_DATA_API_KEY,
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
    FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
    COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
    NEWS_API_KEY: process.env.NEWS_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    AI_PROVIDER: process.env.AI_PROVIDER,
    REDIS_URL: process.env.REDIS_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    POSTHOG_KEY: process.env.POSTHOG_KEY,
    POSTHOG_HOST: process.env.POSTHOG_HOST,
    ENABLE_AI_INSIGHTS: process.env.ENABLE_AI_INSIGHTS,
    ENABLE_CRYPTO: process.env.ENABLE_CRYPTO,
    ENABLE_PORTFOLIO_SIMULATOR: process.env.ENABLE_PORTFOLIO_SIMULATOR,
  };

  const parsed = envSchema.safeParse(envValues);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `  ${field}: ${messages?.join(", ")}`)
      .join("\n");

    // In development, warn but don't crash for missing optional vars
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `⚠️ Environment validation warnings:\n${errorMessages}\n\nSome features may not work correctly.`
      );
      // Return with defaults for development
      return envSchema.parse({
        ...envValues,
        DATABASE_URL: envValues.DATABASE_URL || "postgresql://localhost:5432/ai_portfolio",
        NEXTAUTH_SECRET: envValues.NEXTAUTH_SECRET || "dev-secret-change-in-production",
      });
    }

    throw new Error(
      `❌ Invalid environment variables:\n${errorMessages}\n\nPlease check your .env file.`
    );
  }

  return parsed.data;
}

// Export validated env
export const env = validateEnv();

// Type-safe environment access
declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
