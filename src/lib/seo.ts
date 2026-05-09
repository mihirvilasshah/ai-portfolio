import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiportfolio.example.com";

/**
 * Default SEO configuration
 */
export const defaultSEO = {
  title: "AI Portfolio - Smart Investment Insights",
  description: "AI-powered investment platform with real-time market data, smart recommendations, and portfolio analytics for Indian and US markets.",
  keywords: ["investment", "stocks", "portfolio", "AI", "market analysis", "NSE", "BSE", "cryptocurrency"],
};

/**
 * Generate metadata for a page
 */
export function generatePageMetadata({
  title,
  description,
  keywords = [],
  path = "",
  images = [],
  noIndex = false,
}: {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  images?: string[];
  noIndex?: boolean;
}): Metadata {
  const url = `${baseUrl}${path}`;
  const allKeywords = [...defaultSEO.keywords, ...keywords];
  const ogImages = images.length > 0 
    ? images.map((img) => ({ url: img, width: 1200, height: 630 }))
    : [{ url: "/og-image.png", width: 1200, height: 630 }];

  return {
    title,
    description,
    keywords: allKeywords,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: "AI Portfolio",
      images: ogImages,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length > 0 ? images : ["/og-image.png"],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Page-specific metadata configurations
 */
export const pageMetadata = {
  login: generatePageMetadata({
    title: "Sign In",
    description: "Sign in to AI Portfolio to access your investment dashboard, portfolio tracking, and AI-powered recommendations.",
    path: "/login",
  }),

  dashboard: generatePageMetadata({
    title: "Dashboard",
    description: "Your personalized investment dashboard with portfolio overview, market trends, and AI recommendations.",
    path: "/dashboard",
    noIndex: true, // Protected page
  }),

  screener: generatePageMetadata({
    title: "Stock Screener",
    description: "Screen and filter stocks from NSE, NYSE, and crypto markets. Find investment opportunities with advanced filters.",
    keywords: ["stock screener", "stock filter", "NSE stocks", "US stocks"],
    path: "/screener",
  }),

  recommendations: generatePageMetadata({
    title: "AI Recommendations",
    description: "Get AI-powered stock recommendations based on market analysis, sentiment, and technical indicators.",
    keywords: ["stock recommendations", "AI investing", "buy sell signals"],
    path: "/recommendations",
  }),

  portfolio: generatePageMetadata({
    title: "Portfolio",
    description: "Track your investment portfolio with real-time updates, performance analytics, and diversification insights.",
    keywords: ["portfolio tracker", "investment tracking"],
    path: "/portfolio",
    noIndex: true, // Protected page
  }),

  watchlist: generatePageMetadata({
    title: "Watchlist",
    description: "Monitor your favorite stocks and cryptocurrencies with real-time price updates and alerts.",
    keywords: ["stock watchlist", "price alerts"],
    path: "/watchlist",
    noIndex: true, // Protected page
  }),

  news: generatePageMetadata({
    title: "Market News",
    description: "Stay updated with the latest market news, company announcements, and financial analysis.",
    keywords: ["market news", "stock news", "financial news"],
    path: "/news",
  }),

  insights: generatePageMetadata({
    title: "Market Insights",
    description: "Deep market analysis, sector trends, and investment insights powered by AI.",
    keywords: ["market analysis", "investment insights", "sector analysis"],
    path: "/insights",
  }),

  markets: generatePageMetadata({
    title: "Markets Overview",
    description: "Global market overview with indices, sectors, and real-time market data from NSE, NYSE, and crypto exchanges.",
    keywords: ["market overview", "indices", "Nifty", "Sensex", "S&P 500"],
    path: "/markets",
  }),

  settings: generatePageMetadata({
    title: "Settings",
    description: "Manage your AI Portfolio account settings, preferences, and notification options.",
    path: "/settings",
    noIndex: true, // Protected page
  }),
};

/**
 * Generate dynamic metadata for asset pages
 */
export function generateAssetMetadata(symbol: string, name?: string): Metadata {
  const displayName = name || symbol;
  return generatePageMetadata({
    title: `${displayName} (${symbol})`,
    description: `View ${displayName} stock price, charts, analysis, and AI recommendations. Get real-time market data and insights.`,
    keywords: [symbol, displayName, "stock analysis", "stock chart"],
    path: `/asset/${encodeURIComponent(symbol)}`,
  });
}
