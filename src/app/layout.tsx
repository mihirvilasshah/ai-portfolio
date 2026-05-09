import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { PostHogProvider } from "@/components/providers/posthog-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aiportfolio.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "AI Portfolio - Smart Investment Insights",
    template: "%s | AI Portfolio",
  },
  description:
    "AI-powered investment platform with real-time market data, smart recommendations, and portfolio analytics for Indian and US markets.",
  keywords: [
    "investment",
    "stocks",
    "portfolio",
    "AI",
    "market analysis",
    "NSE",
    "BSE",
    "cryptocurrency",
    "mutual funds",
    "stock screener",
    "portfolio tracker",
    "investment recommendations",
  ],
  authors: [{ name: "AI Portfolio Team" }],
  creator: "AI Portfolio",
  publisher: "AI Portfolio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "AI Portfolio - Smart Investment Insights",
    description:
      "AI-powered investment platform with real-time market data, smart recommendations, and portfolio analytics.",
    siteName: "AI Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Portfolio - Smart Investment Insights",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Portfolio - Smart Investment Insights",
    description:
      "AI-powered investment platform with real-time market data, smart recommendations, and portfolio analytics.",
    images: ["/og-image.png"],
    creator: "@aiportfolio",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: baseUrl,
  },
  category: "finance",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AI Portfolio",
    description: "AI-powered investment platform with real-time market data, smart recommendations, and portfolio analytics.",
    url: baseUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Real-time market data",
      "AI-powered recommendations",
      "Portfolio tracking",
      "Stock screener",
      "Watchlist management",
      "Market news and insights",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <PostHogProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </PostHogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
