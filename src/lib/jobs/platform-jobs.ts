/**
 * Predefined Jobs for AI Portfolio Platform
 * Register these jobs on application startup
 */

import { registerJob } from "./scheduler";

/**
 * Register all platform jobs
 */
export function registerPlatformJobs(): void {
  // Quote refresh job - runs every 60 seconds during market hours
  registerJob({
    id: "refresh-quotes",
    name: "Refresh Stock Quotes",
    description: "Fetch latest quotes for tracked assets",
    handler: async () => {
      console.log("[Job] Refreshing quotes...");
      // In production, this would call the market data service
      // await marketDataService.refreshQuotes();
      console.log("[Job] Quotes refreshed");
    },
    interval: 60000, // 1 minute
    priority: "high",
    maxRetries: 3,
    timeout: 30000,
    enabled: true,
  });

  // News aggregation job - runs every 15 minutes
  registerJob({
    id: "aggregate-news",
    name: "Aggregate Market News",
    description: "Fetch and aggregate news from all sources",
    handler: async () => {
      console.log("[Job] Aggregating news...");
      // await newsService.aggregateNews();
      console.log("[Job] News aggregated");
    },
    interval: 900000, // 15 minutes
    priority: "normal",
    maxRetries: 2,
    timeout: 60000,
    enabled: true,
  });

  // Sentiment analysis job - runs every 30 minutes
  registerJob({
    id: "update-sentiment",
    name: "Update Sentiment Scores",
    description: "Recalculate sentiment scores for all tracked assets",
    handler: async () => {
      console.log("[Job] Updating sentiment scores...");
      // await sentimentService.updateAllSentiment();
      console.log("[Job] Sentiment scores updated");
    },
    interval: 1800000, // 30 minutes
    priority: "normal",
    maxRetries: 2,
    timeout: 120000,
    enabled: true,
  });

  // Recommendation recalculation job - runs every 2 hours
  registerJob({
    id: "recalculate-recommendations",
    name: "Recalculate Recommendations",
    description: "Regenerate AI recommendations for all assets",
    handler: async () => {
      console.log("[Job] Recalculating recommendations...");
      // await recommendationService.recalculateAll();
      console.log("[Job] Recommendations recalculated");
    },
    interval: 7200000, // 2 hours
    priority: "high",
    maxRetries: 3,
    timeout: 300000, // 5 minutes
    enabled: true,
  });

  // Fundamentals refresh job - runs daily at 6 AM
  registerJob({
    id: "refresh-fundamentals",
    name: "Refresh Fundamentals",
    description: "Update fundamental data for all assets",
    handler: async () => {
      console.log("[Job] Refreshing fundamentals...");
      // await fundamentalsService.refreshAll();
      console.log("[Job] Fundamentals refreshed");
    },
    schedule: "0 6 * * *", // 6 AM daily
    priority: "normal",
    maxRetries: 3,
    timeout: 600000, // 10 minutes
    enabled: true,
  });

  // Alert check job - runs every 5 minutes
  registerJob({
    id: "check-alerts",
    name: "Check Price Alerts",
    description: "Check and trigger price alerts for users",
    handler: async () => {
      console.log("[Job] Checking alerts...");
      // await alertService.checkAndTriggerAlerts();
      console.log("[Job] Alerts checked");
    },
    interval: 300000, // 5 minutes
    priority: "critical",
    maxRetries: 2,
    timeout: 30000,
    enabled: true,
  });

  // Portfolio valuation job - runs every 5 minutes
  registerJob({
    id: "update-portfolio-values",
    name: "Update Portfolio Values",
    description: "Recalculate portfolio values and P&L",
    handler: async () => {
      console.log("[Job] Updating portfolio values...");
      // await portfolioService.updateAllPortfolioValues();
      console.log("[Job] Portfolio values updated");
    },
    interval: 300000, // 5 minutes
    priority: "high",
    maxRetries: 2,
    timeout: 60000,
    enabled: true,
  });

  // Technical indicators job - runs every 15 minutes
  registerJob({
    id: "calculate-indicators",
    name: "Calculate Technical Indicators",
    description: "Calculate and cache technical indicators",
    handler: async () => {
      console.log("[Job] Calculating indicators...");
      // await indicatorService.calculateAll();
      console.log("[Job] Indicators calculated");
    },
    interval: 900000, // 15 minutes
    priority: "normal",
    maxRetries: 2,
    timeout: 120000,
    enabled: true,
  });

  // Provider health check - runs every 5 minutes
  registerJob({
    id: "check-provider-health",
    name: "Check Provider Health",
    description: "Monitor health and quota status of data providers",
    handler: async () => {
      console.log("[Job] Checking provider health...");
      // await providerService.checkHealth();
      console.log("[Job] Provider health checked");
    },
    interval: 300000, // 5 minutes
    priority: "normal",
    maxRetries: 1,
    timeout: 30000,
    enabled: true,
  });

  // Cache cleanup job - runs hourly
  registerJob({
    id: "cleanup-cache",
    name: "Cleanup Cache",
    description: "Remove expired cache entries",
    handler: async () => {
      console.log("[Job] Cleaning up cache...");
      // await cacheService.cleanup();
      console.log("[Job] Cache cleaned up");
    },
    interval: 3600000, // 1 hour
    priority: "low",
    maxRetries: 1,
    timeout: 60000,
    enabled: true,
  });

  // Daily digest job - runs at 8 AM
  registerJob({
    id: "send-daily-digest",
    name: "Send Daily Digest",
    description: "Send daily market digest emails to subscribed users",
    handler: async () => {
      console.log("[Job] Sending daily digests...");
      // await notificationService.sendDailyDigests();
      console.log("[Job] Daily digests sent");
    },
    schedule: "0 8 * * *", // 8 AM daily
    priority: "normal",
    maxRetries: 3,
    timeout: 300000,
    enabled: false, // Disabled until email service is configured
  });

  // Weekly report job - runs Sunday at 9 AM
  registerJob({
    id: "generate-weekly-reports",
    name: "Generate Weekly Reports",
    description: "Generate and send weekly portfolio reports",
    handler: async () => {
      console.log("[Job] Generating weekly reports...");
      // await reportService.generateWeeklyReports();
      console.log("[Job] Weekly reports generated");
    },
    schedule: "0 9 * * 0", // Sunday 9 AM
    priority: "normal",
    maxRetries: 3,
    timeout: 600000,
    enabled: false, // Disabled until report service is configured
  });

  console.log("[Jobs] Platform jobs registered");
}

/**
 * Job groups for selective starting
 */
export const JOB_GROUPS = {
  market: [
    "refresh-quotes",
    "calculate-indicators",
    "update-portfolio-values",
    "check-alerts",
  ],
  intelligence: [
    "aggregate-news",
    "update-sentiment",
    "recalculate-recommendations",
  ],
  maintenance: [
    "refresh-fundamentals",
    "check-provider-health",
    "cleanup-cache",
  ],
  notifications: [
    "send-daily-digest",
    "generate-weekly-reports",
  ],
};
