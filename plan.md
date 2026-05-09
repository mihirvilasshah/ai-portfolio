## Plan: AI Investment Platform MVP + Expansion

Build a production-ready, mobile-first fintech web app as a single Next.js App Router TypeScript application with secure API route handlers, Prisma + Supabase Postgres, NextAuth authentication, and a pluggable AI-insight layer (mock provider first, OpenAI-compatible adapter). Deliver high-value core modules in Phase 1, then expand advanced intelligence and market breadth in Phase 2.

---

## Progress Tracking

### Phase 0 - Foundation ✅ COMPLETE
- [x] Next.js 15 + TypeScript + Tailwind v4 + ESLint + strict typing
- [x] Core libraries installed (shadcn-inspired components)
- [x] Architecture folders created
- [x] Environment schema validation (Zod-based, fail-fast)
- [x] Feature-flag framework in `/config/features.ts`
- [x] API configuration with rate limits and cache TTLs
- [x] Domain types defined in `/types/domain.ts`
- [x] Cache layer with TTL and stale-while-revalidate
- [x] HTTP client with retry, jitter, circuit breaker
- [x] Custom error classes
- [x] UI primitives (Button, Card, Input, Badge, Skeleton, ComplianceDisclaimer, StatCard)
- [x] Prisma schema with SQLite (User, Asset, Watchlist, Portfolio, AlertRule, Recommendations, News)
- [x] Seed script with 33 sample assets (10 Indian, 10 US, 8 crypto, 5 mutual funds)
- [x] Landing page with hero, features grid, compliance disclaimer

### Phase 1 - Data Ingestion Layer ✅ COMPLETE
- [x] Provider interface with unified contracts (`/server/services/providers/types.ts`)
- [x] Mock provider with realistic sample data (`/server/services/providers/mock-provider.ts`)
- [x] Market data service with fallback and caching (`/server/services/providers/market-data-service.ts`)
- [x] Market session service for NSE/BSE/US/Crypto (`/server/services/market-session/index.ts`)
- [x] Technical indicators service (SMA, EMA, RSI, MACD, Bollinger, ATR, OBV) (`/server/services/indicators/index.ts`)

### Phase 1 - UX Shell ✅ COMPLETE
- [x] App shell with responsive sidebar navigation (`/components/layout/app-shell.tsx`)
- [x] Dashboard route group with shared layout (`/app/(dashboard)/layout.tsx`)
- [x] Light/dark theme support via ThemeProvider

### Phase 1 - Core Pages ✅ COMPLETE
- [x] Dashboard page with market overview, portfolio summary, trending stocks (`/app/(dashboard)/dashboard/page.tsx`)
- [x] Stock screener with filters, search, sortable table (`/app/(dashboard)/screener/page.tsx`)
- [x] AI Recommendations page with score gauges, filters, factor breakdowns (`/app/(dashboard)/recommendations/page.tsx`)
- [x] Asset detail page with chart placeholder, stats, fundamentals, news (`/app/(dashboard)/asset/[symbol]/page.tsx`)

### Remaining Phase 1 Work
- [ ] Portfolio simulator page
- [ ] Watchlist page with alerts
- [ ] News section page
- [ ] AI Insights page (mock provider)
- [ ] API route handlers with Zod validation
- [ ] Authentication (NextAuth)
- [ ] Real provider clients (Yahoo, Finnhub, CoinGecko)
- [ ] Testing suite
- [ ] Deployment configuration

---

**Steps**
1. Phase 0 - Foundation and guardrails
1.1 Initialize Next.js latest App Router + TypeScript + Tailwind + ESLint + strict typing + path aliases.
1.2 Add core libraries: shadcn/ui, Framer Motion, Lightweight Charts, Recharts (secondary charts), Prisma, Zod, React Query/TanStack Query, date-fns, NextAuth, rate-limit library, retry/circuit utilities.
1.3 Define architecture folders: app (routes), components (ui/domain), features (market, screener, recommendations, watchlist, portfolio, news, ai), lib (api clients, scoring, auth, cache, errors), server (db, repositories, services), types, config, tests.
1.4 Add environment schema validation at boot (Zod-based) and fail-fast for missing required variables.
1.5 Configure accessibility/performance baseline: semantic landmarks, reduced-motion support, font loading strategy, metadata defaults, sitemap/robots stubs.
1.6 Add feature-flag framework with typed toggles in /config/features.ts for controlled rollout and premium gating (e.g., enableAIInsights, enableCrypto, enablePortfolioSimulator).
1.7 Add background jobs architecture in /lib/jobs/* with scheduler adapter supporting Vercel Cron or Upstash QStash.
1.8 Add queue abstraction for heavy async workloads (Inngest recommended for Vercel; optional BullMQ/Trigger.dev adapters) to offload recommendation recomputation and complex portfolio simulations.
1.9 Add production observability baseline: Sentry for error monitoring and PostHog or Plausible for product analytics.
1.10 Add recommendation compliance guardrails: mandatory "Educational purposes only. Not financial advice." disclaimer on all recommendation surfaces and recommendation API payload metadata.
1.11 Add market session intelligence service for NSE/BSE and US exchanges with open/closed, pre-market, after-hours, and holiday calendar awareness.

2. Phase 1 - Data ingestion layer (blocks most downstream modules)
2.1 Implement provider clients per asset class with unified interface and normalization contracts.
2.2 Indian equities/ETFs: Yahoo/TwelveData primary, Alpha Vantage secondary, NSE unofficial optional fallback.
2.3 Mutual funds: MFAPI.in primary with normalized NAV history shape.
2.4 US equities/ETFs: Finnhub primary, Alpha Vantage/TwelveData fallback.
2.5 Crypto: CoinGecko primary, Binance/CryptoCompare fallback.
2.6 News: Finnhub + NewsAPI + Alpha Vantage news fallback chain.
2.7 Add resilient fetch pipeline: timeout, retry with jitter, per-provider circuit breaker, stale cache serving, and mock fallback payloads.
2.8 Add caching strategy: short TTL for quotes, medium TTL for fundamentals/news, long TTL for static metadata; support on-server in-memory + optional Redis adapter.
2.9 Add provider health endpoint and logging hooks for observability.
2.10 Add API quota and cost governance layer: provider budget tracker, per-provider request counters, daily quota windows, and provider-priority routing with graceful degradation.
2.11 Define polling windows explicitly to protect free tiers: equities/ETFs quotes every 15-60s, crypto every 10-30s, fundamentals daily, recommendation refresh every 2-6h.
2.12 Add scheduled market refresh jobs: intraday quote refresh, periodic fundamentals refresh, scheduled news aggregation, and sentiment refresh jobs.

3. Phase 1 - Domain models and scoring engine (depends on step 2)
3.1 Define typed domain entities: Asset, Quote, OHLCV, Fundamentals, IndicatorSet, NewsItem, SentimentSignal, Recommendation, RiskProfile, PortfolioPosition.
3.2 Build technical indicator service: SMA/EMA, RSI, MACD, momentum, volatility, volume trend.
3.3 Build recommendation scoring pipeline (0-100 AI ranking): weighted factor model across trend, momentum, risk, valuation, sentiment, liquidity.
3.4 Map score outputs to Buy/Hold/Sell + confidence + risk level + horizon tags (short/medium/long).
3.5 Generate actionable recommendation payload: expected upside range, entry zone, target, stop loss, hold duration, allocation suggestion, key reasons.
3.6 Add valuation badge logic: Undervalued/Fairly Valued/Overvalued using heuristic multiples + trend context.
3.7 Add periodic recommendation recalculation workflow using scheduler + queue so scoring refreshes continue reliably outside user request cycles.

4. Phase 1 - Persistence and user features (parallel with step 3 once schema stable)
4.1 Design Prisma schema: User, Account, Session (NextAuth), Watchlist, WatchlistItem, Portfolio, PortfolioHolding, AlertRule, RecommendationSnapshot, NewsSnapshot, AssetMetadata.
4.2 Add migrations and seed scripts with representative Indian/US/crypto assets.
4.3 Implement repositories/services for watchlist, portfolio simulator, and alert rule CRUD.
4.4 Add simulation engine: scenario returns, drawdown estimate, diversification score, horizon projection.
4.5 Implement authentication flows and protected routes with role-safe session typing.
4.6 Route heavy simulation and batch recomputation tasks to queue workers with idempotency keys and retry-safe job handlers.

5. Phase 1 - UX shell and navigation (can start early, integrate data later)
5.1 Create responsive app shell: sticky top nav, desktop sidebar, mobile bottom navigation.
5.2 Implement light/dark themes with persisted toggle and accessible contrast tokens.
5.3 Build shared design primitives: cards, stat tiles, filter bars, data tables, pagination, skeleton loaders, empty/error states, toast notifications.
5.4 Add motion system with restrained but premium transitions and staggered reveals.
5.5 Expose market session status badges and timers in shell-level market widgets (Open, Closed, Pre-market, After-hours, Holiday).

6. Phase 1 - Core pages and feature modules (depends on steps 2-5)
6.1 Dashboard: market overview, top movers, trending assets, personalized recommendation summaries.
6.2 Asset screener: filters (country/class/sector/market cap/risk/dividend/RSI/momentum/change/horizon), sortable table, pagination, saved views.
6.3 Recommendation engine page: ranked opportunities by horizon with confidence/risk/explanation chips.
6.4 Asset detail page: live quote, candlestick + volume + RSI + MACD + moving averages, fundamentals, recommendation card, sentiment meter, related news.
6.5 Watchlist page: add/remove assets, performance snapshots, alert status.
6.6 Portfolio simulator page: create mock portfolios, compare allocation mixes, projection/risk outputs.
6.7 AI insights page: bullish/bearish narrative, market commentary, risk explanation, investment thesis (mock provider first).
6.8 News section: latest market/asset-specific news with sentiment tags and source metadata.
6.9 Add visible compliance disclaimer to every recommendation surface (dashboard cards, recommendation list, detail page, exported/shareable views, and API-driven widgets).

7. Phase 1 - API and security hardening (depends on steps 2-6)
7.1 Build typed route handlers with Zod input validation and structured error responses.
7.2 Add per-route and per-user rate limits for quote/news/recommendation endpoints.
7.3 Add CORS policy for API routes where needed and strict server-only secret usage.
7.4 Add anti-abuse controls: request throttling, cache-key scoping, invalid symbol guardrails.
7.5 Add SEO and SSR/ISR strategy by route: SSR for dashboard and key detail pages, ISR for slower-changing aggregates.
7.6 Add provider-aware throttling middleware honoring quota tracker state and automatic provider failover/priority downgrade when limits are near exhaustion.

8. Phase 1 - Testing and quality gates
8.1 Unit tests: indicator math, scoring weights, recommendation classification, valuation badges, risk metrics.
8.2 Integration tests: provider fallback chain, cache behavior, watchlist and portfolio APIs.
8.3 UI tests: responsive navigation, table filtering/sorting/pagination, theme toggle, skeleton/error rendering.
8.4 Accessibility audits: keyboard navigation, focus order, aria labels, color contrast, form validation announcements.
8.5 Performance audits: Lighthouse mobile/desktop, bundle analysis, lazy loading of heavy chart modules.

9. Phase 1 - Deployment and ops
9.1 Configure Vercel project, environment variables, and build checks.
9.2 Configure Supabase Postgres, Prisma migration pipeline, and secure connection pooling.
9.3 Add CI pipeline for lint/typecheck/test/build.
9.4 Produce documentation set: README, environment setup, API integration guide, deployment guide, sample env, architecture notes.
9.5 Configure scheduler deployment artifacts (Vercel Cron or QStash) and worker runtime secrets for jobs/queue processing.
9.6 Configure Sentry release tracking and analytics instrumentation validation before production rollout.

10. Phase 2 - Advanced/beta features (post-MVP)
10.1 Email/push alerts.
10.2 AI chatbot for investment Q&A.
10.3 Backtesting engine and SIP/tax calculators.
10.4 Heatmaps, sector analysis, economic calendar.
10.5 India-specific market intelligence: FII/DII flow and institutional activity.
10.6 Crypto fear and greed index integration.

**Relevant files**
- /app/(public)/page.tsx - Marketing/entry and SEO landing composition.
- /app/(app)/layout.tsx - Authenticated shell (top nav, sidebar, bottom nav).
- /app/(app)/dashboard/page.tsx - Market overview and personalized summary widgets.
- /app/(app)/screener/page.tsx - Filter/search/sort/pagination screener UI.
- /app/(app)/recommendations/page.tsx - Horizon-based ranked recommendation board.
- /app/(app)/asset/[symbol]/page.tsx - Asset detail, charts, fundamentals, AI insight panel.
- /app/(app)/watchlist/page.tsx - Watchlist management and alert indicators.
- /app/(app)/portfolio-simulator/page.tsx - Portfolio simulation workflows.
- /app/(app)/insights/page.tsx - AI commentary and thesis explanations.
- /app/api/market/* - Aggregated market data endpoints.
- /app/api/recommendations/* - Recommendation and scoring endpoints.
- /app/api/watchlist/* - Watchlist CRUD and alert endpoints.
- /app/api/portfolio/* - Portfolio simulation endpoints.
- /app/api/news/* - News aggregation and sentiment endpoints.
- /app/api/auth/[...nextauth]/route.ts - NextAuth handlers.
- /server/db/prisma.ts - Prisma client singleton.
- /server/repositories/* - Data access layer.
- /server/services/providers/* - External API provider clients + fallback orchestration.
- /server/services/providers/quota-manager.ts - Provider quota tracking, budget windows, and routing priority logic.
- /server/services/indicators/* - RSI/MACD/MA/volatility calculations.
- /server/services/recommendation/* - Scoring engine, risk-reward, recommendation payload assembly.
- /server/services/sentiment/* - News sentiment and market sentiment normalization.
- /server/services/market-session/* - Market session + exchange holiday intelligence for India and US markets.
- /lib/cache/* - TTL cache adapters and stale-while-revalidate helpers.
- /lib/http/* - Retry, timeout, circuit breaker, and error typing.
- /lib/jobs/* - Scheduled job definitions for refresh/recalculation pipelines.
- /lib/queue/* - Queue abstraction and adapters (Inngest/BullMQ/Trigger.dev).
- /lib/monitoring/sentry.ts - Sentry initialization and error capture helpers.
- /lib/analytics/* - PostHog/Plausible adapters and event contracts.
- /config/features.ts - Typed feature flags and rollout defaults.
- /prisma/schema.prisma - Database schema and relations.
- /prisma/seed.ts - Sample/mock bootstrap records.
- /components/ui/* - shadcn-based reusable primitives.
- /components/charts/* - Candlestick, volume, RSI, MACD renderers.
- /features/* - Feature-specific state, hooks, and composition.
- /tests/unit/* - Core algorithm tests.
- /tests/integration/* - API/data pipeline tests.
- /README.md - Setup and architecture guide.
- /.env.example - Environment template.

**Verification**
1. Run lint, typecheck, unit tests, integration tests, and production build in CI.
2. Verify provider fallback by intentionally disabling one upstream API and confirming stale/mock fallback responses.
3. Validate recommendation output includes all required fields (Buy/Hold/Sell, confidence, risk, allocation, horizon, upside, hold duration, entry/exit/stop, reasons).
4. Validate responsive behavior at common breakpoints for desktop/tablet/mobile and gesture-safe mobile bottom nav.
5. Run Lighthouse and confirm performance/SEO/accessibility best-practice targets near or above 90.
6. Run WCAG 2.2 AA checklist (keyboard-only navigation, contrast, focus visibility, status announcements).
7. Validate secure handling: no secret leakage to client bundles, auth-protected routes enforced, rate limits triggered appropriately.
8. Confirm documentation completeness: setup, env, API source mapping, deployment steps, fallback strategy.
9. Validate scheduled jobs execute correctly (quotes refresh, news aggregation, sentiment updates, recommendation recalculation) and recover gracefully from transient failures.
10. Validate market session awareness accuracy against NSE/BSE and US calendars, including pre-market/after-hours and holidays.
11. Validate recommendation compliance disclaimer is always visible where recommendations are rendered or consumed.
12. Validate quota governance under constrained free-tier limits: provider rotation, degraded mode fallback, and no hard failures.
13. Validate Sentry captures backend/frontend failures and analytics events are emitted for search usage, popular assets, and engagement funnels.

**Decisions**
- Single-app architecture: Next.js App Router + route handlers (no separate Express service).
- Authentication: NextAuth.
- AI strategy: mock-first provider with OpenAI-compatible interface for later plug-in.
- Chart strategy: Lightweight Charts primary; Recharts for auxiliary indicators/summary visuals.
- Delivery strategy: MVP first, then advanced features in Phase 2.
- Alerts in MVP: in-app only.
- Deployment baseline: Vercel + Supabase Postgres.
- Scheduler baseline: Vercel Cron with optional Upstash QStash adapter.
- Queue baseline: Inngest-first abstraction with optional BullMQ/Trigger.dev adapters.
- Compliance baseline: educational-only recommendation messaging, not financial advice.
- Included in MVP: dashboard, screener, watchlist, recommendations, market overview, trending, portfolio simulation, AI insights, news, risk analysis.
- Excluded from MVP (Phase 2): chatbot, push/email alerts, backtesting, SIP/tax tools, macro calendar.

**Further Considerations**
1. Recommendation transparency: expose per-factor weights in UI for trust, or keep single composite score for simplicity.
2. Real-time updates: polling-first with defined windows (equities 15-60s, crypto 10-30s, fundamentals daily, recommendations every 2-6h) and optional websocket upgrade later.
3. Regionalization: INR/USD formatting and timezone-aware market session states from day one.