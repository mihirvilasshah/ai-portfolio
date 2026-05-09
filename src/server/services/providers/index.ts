export { mockProvider, MockMarketDataProvider } from "./mock-provider";
export { yahooFinanceProvider, YahooFinanceProvider } from "./yahoo-provider";
export { finnhubProvider, FinnhubProvider } from "./finnhub-provider";
export { coinGeckoProvider, CoinGeckoProvider } from "./coingecko-provider";
export { newsAPIProvider, NewsAPIProvider } from "./newsapi-provider";
export {
  registerProvider,
  getProvider,
  getQuote,
  getQuotes,
  getOHLCV,
  getFundamentals,
  getNews,
  searchAssets,
  getProvidersHealth,
} from "./market-data-service";
export type {
  ProviderName,
  ProviderCapabilities,
  ProviderHealth,
  MarketDataProvider,
  OHLCVInterval,
  ProviderResponse,
  OrchestratedResponse,
} from "./types";
