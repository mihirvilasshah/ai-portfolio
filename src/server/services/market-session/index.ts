/**
 * Market Session Service
 * Tracks market hours for NSE/BSE (India) and US exchanges
 */

import type { Market, MarketSession, SessionStatus } from "@/types/domain";

// Market timezone configurations
const MARKET_TIMEZONES: Record<Market, string> = {
  NSE: "Asia/Kolkata",
  BSE: "Asia/Kolkata",
  NYSE: "America/New_York",
  NASDAQ: "America/New_York",
  CRYPTO: "UTC",
};

// Market hours (in local time)
interface MarketHours {
  preMarketStart?: { hour: number; minute: number };
  preMarketEnd?: { hour: number; minute: number };
  marketOpen: { hour: number; minute: number };
  marketClose: { hour: number; minute: number };
  afterHoursStart?: { hour: number; minute: number };
  afterHoursEnd?: { hour: number; minute: number };
  tradingDays: number[]; // 0 = Sunday, 6 = Saturday
}

const MARKET_HOURS: Record<Market, MarketHours> = {
  NSE: {
    preMarketStart: { hour: 9, minute: 0 },
    preMarketEnd: { hour: 9, minute: 15 },
    marketOpen: { hour: 9, minute: 15 },
    marketClose: { hour: 15, minute: 30 },
    tradingDays: [1, 2, 3, 4, 5], // Monday to Friday
  },
  BSE: {
    preMarketStart: { hour: 9, minute: 0 },
    preMarketEnd: { hour: 9, minute: 15 },
    marketOpen: { hour: 9, minute: 15 },
    marketClose: { hour: 15, minute: 30 },
    tradingDays: [1, 2, 3, 4, 5],
  },
  NYSE: {
    preMarketStart: { hour: 4, minute: 0 },
    preMarketEnd: { hour: 9, minute: 30 },
    marketOpen: { hour: 9, minute: 30 },
    marketClose: { hour: 16, minute: 0 },
    afterHoursStart: { hour: 16, minute: 0 },
    afterHoursEnd: { hour: 20, minute: 0 },
    tradingDays: [1, 2, 3, 4, 5],
  },
  NASDAQ: {
    preMarketStart: { hour: 4, minute: 0 },
    preMarketEnd: { hour: 9, minute: 30 },
    marketOpen: { hour: 9, minute: 30 },
    marketClose: { hour: 16, minute: 0 },
    afterHoursStart: { hour: 16, minute: 0 },
    afterHoursEnd: { hour: 20, minute: 0 },
    tradingDays: [1, 2, 3, 4, 5],
  },
  CRYPTO: {
    marketOpen: { hour: 0, minute: 0 },
    marketClose: { hour: 23, minute: 59 },
    tradingDays: [0, 1, 2, 3, 4, 5, 6], // 24/7
  },
};

// Indian market holidays 2024-2026 (NSE/BSE)
const INDIAN_HOLIDAYS: string[] = [
  // 2024
  "2024-01-26", "2024-03-08", "2024-03-25", "2024-03-29",
  "2024-04-11", "2024-04-14", "2024-04-17", "2024-04-21",
  "2024-05-01", "2024-05-23", "2024-06-17", "2024-07-17",
  "2024-08-15", "2024-10-02", "2024-11-01", "2024-11-15",
  "2024-12-25",
  // 2025
  "2025-01-26", "2025-02-26", "2025-03-14", "2025-03-31",
  "2025-04-10", "2025-04-14", "2025-04-18", "2025-05-01",
  "2025-08-15", "2025-08-27", "2025-10-02", "2025-10-21",
  "2025-10-22", "2025-11-05", "2025-12-25",
  // 2026
  "2026-01-26", "2026-02-17", "2026-03-03", "2026-03-20",
  "2026-04-02", "2026-04-03", "2026-04-14", "2026-05-01",
  "2026-07-07", "2026-08-15", "2026-08-17", "2026-10-02",
  "2026-10-20", "2026-11-09", "2026-12-25",
];

// US market holidays 2024-2026 (NYSE/NASDAQ)
const US_HOLIDAYS: string[] = [
  // 2024
  "2024-01-01", "2024-01-15", "2024-02-19", "2024-03-29",
  "2024-05-27", "2024-06-19", "2024-07-04", "2024-09-02",
  "2024-11-28", "2024-12-25",
  // 2025
  "2025-01-01", "2025-01-20", "2025-02-17", "2025-04-18",
  "2025-05-26", "2025-06-19", "2025-07-04", "2025-09-01",
  "2025-11-27", "2025-12-25",
  // 2026
  "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03",
  "2026-05-25", "2026-06-19", "2026-07-03", "2026-09-07",
  "2026-11-26", "2026-12-25",
];

// Holiday names
const HOLIDAY_NAMES: Record<string, string> = {
  "2024-01-26": "Republic Day",
  "2024-08-15": "Independence Day",
  "2024-10-02": "Gandhi Jayanti",
  "2024-11-01": "Diwali",
  "2024-12-25": "Christmas",
  "2025-01-26": "Republic Day",
  "2025-08-15": "Independence Day",
  "2025-10-02": "Gandhi Jayanti",
  "2025-12-25": "Christmas",
  "2026-01-26": "Republic Day",
  "2026-08-15": "Independence Day",
  "2026-10-02": "Gandhi Jayanti",
  "2026-12-25": "Christmas",
  "2024-01-01": "New Year's Day",
  "2024-07-04": "Independence Day",
  "2024-11-28": "Thanksgiving",
  "2025-01-01": "New Year's Day",
  "2025-07-04": "Independence Day",
  "2025-11-27": "Thanksgiving",
  "2026-01-01": "New Year's Day",
  "2026-07-03": "Independence Day (observed)",
  "2026-11-26": "Thanksgiving",
};

/**
 * Get current time in a specific timezone
 */
function getTimeInTimezone(timezone: string): Date {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(now);
  
  const getPart = (type: string) => parts.find(p => p.type === type)?.value ?? "0";
  
  return new Date(
    parseInt(getPart("year")),
    parseInt(getPart("month")) - 1,
    parseInt(getPart("day")),
    parseInt(getPart("hour")),
    parseInt(getPart("minute")),
    parseInt(getPart("second"))
  );
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

/**
 * Check if a date is a holiday for a market
 */
function isHoliday(market: Market, date: Date): { isHoliday: boolean; name?: string } {
  const dateStr = formatDate(date);
  
  if (market === "CRYPTO") {
    return { isHoliday: false };
  }
  
  const holidays = market === "NSE" || market === "BSE" ? INDIAN_HOLIDAYS : US_HOLIDAYS;
  const isHol = holidays.includes(dateStr);
  
  return {
    isHoliday: isHol,
    name: isHol ? HOLIDAY_NAMES[dateStr] : undefined,
  };
}

/**
 * Get the next market open time
 */
function getNextMarketOpen(market: Market, currentTime: Date): Date {
  const hours = MARKET_HOURS[market];
  const nextOpen = new Date(currentTime);
  
  // Set to market open time
  nextOpen.setHours(hours.marketOpen.hour, hours.marketOpen.minute, 0, 0);
  
  // If already past today's open, move to tomorrow
  if (nextOpen <= currentTime) {
    nextOpen.setDate(nextOpen.getDate() + 1);
  }
  
  // Skip weekends and holidays
  let attempts = 0;
  while (attempts < 10) {
    const dayOfWeek = nextOpen.getDay();
    if (!hours.tradingDays.includes(dayOfWeek) || isHoliday(market, nextOpen).isHoliday) {
      nextOpen.setDate(nextOpen.getDate() + 1);
      attempts++;
    } else {
      break;
    }
  }
  
  return nextOpen;
}

/**
 * Get market session status
 */
export function getMarketSession(market: Market): MarketSession {
  const timezone = MARKET_TIMEZONES[market];
  const currentTime = getTimeInTimezone(timezone);
  const hours = MARKET_HOURS[market];
  const dayOfWeek = currentTime.getDay();
  
  // Check if it's a trading day
  if (!hours.tradingDays.includes(dayOfWeek)) {
    return {
      market,
      status: "closed",
      isOpen: false,
      currentTime,
      nextOpen: getNextMarketOpen(market, currentTime),
      timezone,
    };
  }
  
  // Check for holiday
  const holiday = isHoliday(market, currentTime);
  if (holiday.isHoliday) {
    return {
      market,
      status: "holiday",
      isOpen: false,
      currentTime,
      nextOpen: getNextMarketOpen(market, currentTime),
      holidayName: holiday.name,
      timezone,
    };
  }
  
  // Get current time in minutes from midnight
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const marketOpenMinutes = hours.marketOpen.hour * 60 + hours.marketOpen.minute;
  const marketCloseMinutes = hours.marketClose.hour * 60 + hours.marketClose.minute;
  
  // Pre-market
  if (hours.preMarketStart && hours.preMarketEnd) {
    const preMarketStartMinutes = hours.preMarketStart.hour * 60 + hours.preMarketStart.minute;
    const preMarketEndMinutes = hours.preMarketEnd.hour * 60 + hours.preMarketEnd.minute;
    
    if (currentMinutes >= preMarketStartMinutes && currentMinutes < preMarketEndMinutes) {
      const nextClose = new Date(currentTime);
      nextClose.setHours(hours.marketClose.hour, hours.marketClose.minute, 0, 0);
      
      return {
        market,
        status: "pre_market",
        isOpen: false,
        currentTime,
        nextOpen: new Date(currentTime.setHours(hours.marketOpen.hour, hours.marketOpen.minute, 0, 0)),
        nextClose,
        timezone,
      };
    }
  }
  
  // Market open
  if (currentMinutes >= marketOpenMinutes && currentMinutes < marketCloseMinutes) {
    const nextClose = new Date(currentTime);
    nextClose.setHours(hours.marketClose.hour, hours.marketClose.minute, 0, 0);
    
    return {
      market,
      status: "open",
      isOpen: true,
      currentTime,
      nextClose,
      timezone,
    };
  }
  
  // After hours
  if (hours.afterHoursStart && hours.afterHoursEnd) {
    const afterHoursStartMinutes = hours.afterHoursStart.hour * 60 + hours.afterHoursStart.minute;
    const afterHoursEndMinutes = hours.afterHoursEnd.hour * 60 + hours.afterHoursEnd.minute;
    
    if (currentMinutes >= afterHoursStartMinutes && currentMinutes < afterHoursEndMinutes) {
      return {
        market,
        status: "after_hours",
        isOpen: false,
        currentTime,
        nextOpen: getNextMarketOpen(market, currentTime),
        timezone,
      };
    }
  }
  
  // Closed
  return {
    market,
    status: "closed",
    isOpen: false,
    currentTime,
    nextOpen: getNextMarketOpen(market, currentTime),
    timezone,
  };
}

/**
 * Get all market sessions
 */
export function getAllMarketSessions(): MarketSession[] {
  const markets: Market[] = ["NSE", "BSE", "NYSE", "NASDAQ", "CRYPTO"];
  return markets.map(getMarketSession);
}

/**
 * Check if any market is currently open
 */
export function isAnyMarketOpen(): boolean {
  return getAllMarketSessions().some(session => session.isOpen);
}

/**
 * Get session status badge color
 */
export function getSessionStatusColor(status: SessionStatus): string {
  switch (status) {
    case "open":
      return "success";
    case "pre_market":
    case "after_hours":
      return "warning";
    case "closed":
    case "holiday":
      return "danger";
    default:
      return "secondary";
  }
}

/**
 * Format time until market event
 */
export function formatTimeUntil(targetDate: Date): string {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  
  if (diffMs <= 0) return "now";
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}
