import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

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

export const metadata: Metadata = {
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
  ],
  authors: [{ name: "AI Portfolio Team" }],
  creator: "AI Portfolio",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "AI Portfolio - Smart Investment Insights",
    description:
      "AI-powered investment platform with real-time market data, smart recommendations, and portfolio analytics.",
    siteName: "AI Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Portfolio - Smart Investment Insights",
    description:
      "AI-powered investment platform with real-time market data, smart recommendations, and portfolio analytics.",
  },
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
