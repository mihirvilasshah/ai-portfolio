import type { MetadataRoute } from "next";

/**
 * Generate robots.txt for search engines
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiportfolio.example.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login"],
        disallow: [
          "/api/",           // API routes
          "/dashboard/",      // Protected user dashboard
          "/portfolio/",      // User portfolio (private)
          "/settings/",       // User settings
          "/watchlist/",      // User watchlist
          "/_next/",          // Next.js internals
          "/private/",        // Any private routes
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/login",
          "/screener",        // Allow Googlebot to index screener
          "/recommendations", // Allow recommendations page
          "/news",            // Allow news page
          "/markets",         // Allow markets page
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/portfolio/",
          "/settings/",
          "/watchlist/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
