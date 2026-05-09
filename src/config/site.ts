/**
 * Site-wide configuration constants
 */
export const siteConfig = {
  name: "AI Portfolio",
  description:
    "AI-powered investment platform with real-time market data, smart recommendations, and portfolio analytics.",
  url: "https://ai-portfolio.com",
  ogImage: "https://ai-portfolio.com/og.jpg",
  
  // Contact
  supportEmail: "support@ai-portfolio.com",
  
  // Social links
  links: {
    twitter: "https://twitter.com/aiportfolio",
    github: "https://github.com/aiportfolio",
  },

  // Compliance
  disclaimer:
    "Educational purposes only. Not financial advice. All recommendations are for informational purposes and should not be considered as personalized investment advice. Always consult with a qualified financial advisor before making investment decisions.",

  // Navigation
  mainNav: [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Screener", href: "/screener" },
    { title: "Recommendations", href: "/recommendations" },
    { title: "Watchlist", href: "/watchlist" },
    { title: "Portfolio", href: "/portfolio-simulator" },
    { title: "Insights", href: "/insights" },
  ],

  // Formatting
  defaultCurrency: "INR",
  supportedCurrencies: ["INR", "USD"] as const,
  defaultLocale: "en-IN",
  supportedLocales: ["en-IN", "en-US"] as const,

  // Pagination defaults
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

export type Currency = (typeof siteConfig.supportedCurrencies)[number];
export type Locale = (typeof siteConfig.supportedLocales)[number];
