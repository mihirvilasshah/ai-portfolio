import { env } from "./env";

/**
 * Feature flags for controlled rollout and premium gating
 * All flags are typed and centrally managed
 */
export interface FeatureFlags {
  // AI Features
  enableAIInsights: boolean;
  enableAIChat: boolean;

  // Market Coverage
  enableCrypto: boolean;
  enableUSMarkets: boolean;
  enableIndianMarkets: boolean;
  enableMutualFunds: boolean;

  // Tools
  enablePortfolioSimulator: boolean;
  enableBacktesting: boolean;
  enableAlerts: boolean;
  enableSIPCalculator: boolean;

  // Premium Features
  enableRealTimeQuotes: boolean;
  enableAdvancedCharts: boolean;
  enableExportReports: boolean;

  // Experimental
  enableWebsockets: boolean;
  enablePushNotifications: boolean;
}

/**
 * Default feature flag values
 * Can be overridden by environment variables or remote config
 */
const defaultFlags: FeatureFlags = {
  // AI Features - mock-first strategy
  enableAIInsights: true,
  enableAIChat: false, // Phase 2

  // Market Coverage - all enabled for MVP
  enableCrypto: true,
  enableUSMarkets: true,
  enableIndianMarkets: true,
  enableMutualFunds: true,

  // Tools
  enablePortfolioSimulator: true,
  enableBacktesting: false, // Phase 2
  enableAlerts: true, // In-app only for MVP
  enableSIPCalculator: false, // Phase 2

  // Premium Features
  enableRealTimeQuotes: false, // Polling-first for MVP
  enableAdvancedCharts: true,
  enableExportReports: false,

  // Experimental
  enableWebsockets: false,
  enablePushNotifications: false, // Phase 2
};

/**
 * Get current feature flags
 * Merges defaults with environment overrides
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    ...defaultFlags,
    // Environment overrides
    enableAIInsights: env.ENABLE_AI_INSIGHTS ?? defaultFlags.enableAIInsights,
    enableCrypto: env.ENABLE_CRYPTO ?? defaultFlags.enableCrypto,
    enablePortfolioSimulator:
      env.ENABLE_PORTFOLIO_SIMULATOR ?? defaultFlags.enablePortfolioSimulator,
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[flag];
}

/**
 * Feature flag hook for components
 * Use this to conditionally render features
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  // In a real implementation, this could fetch from remote config
  return isFeatureEnabled(flag);
}

/**
 * Feature gate HOC for protecting routes/components
 */
export function withFeatureGate<P extends object>(
  flag: keyof FeatureFlags,
  Component: React.ComponentType<P>,
  Fallback?: React.ComponentType<P>
) {
  return function FeatureGatedComponent(props: P) {
    const isEnabled = isFeatureEnabled(flag);

    if (!isEnabled) {
      if (Fallback) {
        return <Fallback {...props} />;
      }
      return null;
    }

    return <Component {...props} />;
  };
}

// Export singleton
export const features = getFeatureFlags();
