// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Spotlight for local development
  spotlight: process.env.NODE_ENV === "development",

  // Filter out specific errors
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    const error = hint.originalException;
    if (error && typeof error === "object" && "message" in error) {
      const message = (error as Error).message;
      
      // Filter out common non-actionable errors
      if (
        message.includes("NEXT_REDIRECT") ||
        message.includes("NEXT_NOT_FOUND")
      ) {
        return null;
      }
    }

    return event;
  },

  // Environment tag
  environment: process.env.NODE_ENV,
});
