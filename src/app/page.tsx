import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            AI-Powered Investment Intelligence
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Smart Investing,{" "}
            <span className="text-primary">Simplified</span>
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Get AI-powered recommendations, real-time market data, and
            comprehensive analytics for Indian and US markets. Make informed
            investment decisions with confidence.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Get Started
            </Link>
            <Link
              href="/screener"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-background px-8 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Explore Screener
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive tools for modern investors
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="AI Recommendations"
            description="Get intelligent buy/hold/sell recommendations powered by advanced algorithms analyzing technical and fundamental data."
            icon="🎯"
          />
          <FeatureCard
            title="Multi-Market Coverage"
            description="Track Indian equities (NSE/BSE), US stocks, mutual funds, ETFs, and cryptocurrencies in one platform."
            icon="🌍"
          />
          <FeatureCard
            title="Advanced Screener"
            description="Filter assets by technical indicators, fundamentals, risk metrics, and AI scores to find the best opportunities."
            icon="🔍"
          />
          <FeatureCard
            title="Portfolio Simulator"
            description="Test investment strategies, analyze risk-reward scenarios, and optimize your asset allocation."
            icon="📊"
          />
          <FeatureCard
            title="Real-Time Data"
            description="Stay updated with live quotes, breaking news, and market sentiment analysis."
            icon="⚡"
          />
          <FeatureCard
            title="Smart Watchlists"
            description="Track your favorite assets with custom alerts and performance snapshots."
            icon="👁️"
          />
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> Educational purposes only. Not
            financial advice. All recommendations are for informational purposes
            and should not be considered as personalized investment advice.
            Always consult with a qualified financial advisor before making
            investment decisions.
          </p>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="group rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-card-hover">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
