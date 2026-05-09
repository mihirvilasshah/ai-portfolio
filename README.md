# AI Portfolio

AI-powered investment platform with real-time market data, smart recommendations, and portfolio analytics for Indian and US markets.

## Features

- **AI Recommendations**: Intelligent buy/hold/sell recommendations powered by advanced algorithms
- **Multi-Market Coverage**: Track Indian equities (NSE/BSE), US stocks, mutual funds, ETFs, and cryptocurrencies
- **Advanced Screener**: Filter assets by technical indicators, fundamentals, risk metrics, and AI scores
- **Portfolio Simulator**: Test investment strategies, analyze risk-reward scenarios
- **Real-Time Data**: Live quotes, breaking news, and market sentiment analysis
- **Smart Watchlists**: Track favorite assets with custom alerts

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Charts**: Lightweight Charts, Recharts
- **UI Components**: Radix UI, shadcn/ui style
- **Animations**: Framer Motion
- **Data Fetching**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 22+
- PostgreSQL database (local or Supabase)
- npm/pnpm/yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-portfolio.git
cd ai-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. Set up the database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

See [.env.example](.env.example) for all required and optional environment variables.

### Required Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js session encryption

### Optional Variables

- Market data provider API keys (Yahoo, TwelveData, Alpha Vantage, Finnhub, CoinGecko)
- OAuth provider credentials (Google, GitHub)
- Observability tools (Sentry, PostHog)

## Project Structure

```
ai-portfolio/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (app)/              # Authenticated routes
│   │   ├── (public)/           # Public routes
│   │   └── api/                # API route handlers
│   ├── components/
│   │   ├── ui/                 # Reusable UI primitives
│   │   ├── charts/             # Chart components
│   │   └── providers/          # React context providers
│   ├── config/                 # Configuration files
│   ├── features/               # Feature-specific code
│   ├── lib/                    # Utility libraries
│   │   ├── cache/              # Caching utilities
│   │   ├── http/               # HTTP client with retry
│   │   └── errors/             # Error handling
│   ├── server/                 # Server-side code
│   │   ├── db/                 # Database client
│   │   ├── repositories/       # Data access layer
│   │   └── services/           # Business logic
│   └── types/                  # TypeScript types
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
├── tests/
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests
└── public/                     # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## API Data Providers

The platform uses multiple data providers with fallback support:

| Asset Class | Primary | Fallbacks |
|-------------|---------|-----------|
| Indian Equities | Yahoo Finance | TwelveData, Alpha Vantage |
| US Equities | Finnhub | Alpha Vantage, TwelveData |
| Mutual Funds | MFAPI.in | - |
| Crypto | CoinGecko | Binance |
| News | Finnhub | NewsAPI, Alpha Vantage |

## Disclaimer

**Educational purposes only. Not financial advice.**

All recommendations are for informational purposes and should not be considered as personalized investment advice. Always consult with a qualified financial advisor before making investment decisions.

## License

MIT License - see [LICENSE](LICENSE) for details.
