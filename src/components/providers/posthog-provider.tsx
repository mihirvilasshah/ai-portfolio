"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";

// Initialize PostHog
if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    // Capture pageviews manually for accurate SPA tracking
    capture_pageview: false,
    // Capture page leave events
    capture_pageleave: true,
    // Respect Do Not Track
    respect_dnt: true,
    // Persistence method
    persistence: "localStorage+cookie",
    // Session recording
    disable_session_recording: process.env.NODE_ENV === "development",
    // Mask all input fields by default
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-mask]",
    },
    // Bootstrap with feature flags if available
    bootstrap: {
      distinctID: undefined,
      isIdentifiedID: false,
      featureFlags: {},
    },
    // Debug mode in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") {
        // Enable debug mode in development
        posthog.debug();
      }
    },
  });
}

/**
 * Track page views on route changes
 */
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString();
      }
      posthog.capture("$pageview", {
        $current_url: url,
        $pathname: pathname,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * Identify user when session changes
 */
function UserIdentifier() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Identify user with PostHog
      const userId = session.user.id || session.user.email || undefined;
      if (userId) {
        posthog.identify(userId, {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        });
      }
    } else if (status === "unauthenticated") {
      // Reset identity on logout
      posthog.reset();
    }
  }, [session, status]);

  return null;
}

interface PostHogProviderProps {
  children: React.ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  // Don't render provider if PostHog is not configured
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageViewTracker />
        <UserIdentifier />
      </Suspense>
      {children}
    </PHProvider>
  );
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (posthog) {
    posthog.capture(eventName, properties);
  }
}

/**
 * Set user property
 */
export function setUserProperty(
  property: string,
  value: string | number | boolean
) {
  if (posthog) {
    posthog.people.set({ [property]: value });
  }
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flagKey: string): boolean {
  if (posthog) {
    return posthog.isFeatureEnabled(flagKey) ?? false;
  }
  return false;
}

/**
 * Get feature flag value
 */
export function getFeatureFlag(flagKey: string): string | boolean | undefined {
  if (posthog) {
    return posthog.getFeatureFlag(flagKey);
  }
  return undefined;
}

// Analytics event types for type safety
export const AnalyticsEvents = {
  // User events
  USER_SIGNED_IN: "user_signed_in",
  USER_SIGNED_OUT: "user_signed_out",
  USER_SIGNED_UP: "user_signed_up",
  
  // Portfolio events
  PORTFOLIO_VIEWED: "portfolio_viewed",
  HOLDING_ADDED: "holding_added",
  HOLDING_REMOVED: "holding_removed",
  HOLDING_UPDATED: "holding_updated",
  
  // Screener events
  SCREENER_FILTERED: "screener_filtered",
  STOCK_VIEWED: "stock_viewed",
  STOCK_SEARCHED: "stock_searched",
  
  // Watchlist events
  WATCHLIST_ITEM_ADDED: "watchlist_item_added",
  WATCHLIST_ITEM_REMOVED: "watchlist_item_removed",
  
  // Recommendation events
  RECOMMENDATION_VIEWED: "recommendation_viewed",
  RECOMMENDATION_ACTED_ON: "recommendation_acted_on",
  
  // Simulation events
  SIMULATION_RUN: "simulation_run",
  SIMULATION_COMPLETED: "simulation_completed",
  
  // Settings events
  THEME_CHANGED: "theme_changed",
  NOTIFICATION_PREFERENCES_UPDATED: "notification_preferences_updated",
} as const;

export type AnalyticsEvent = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];
