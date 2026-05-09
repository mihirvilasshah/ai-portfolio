import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Sample Indian equities
const indianEquities = [
  {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Limited",
    sector: "Energy",
    industry: "Oil & Gas Refining",
  },
  {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services",
    sector: "Technology",
    industry: "IT Services",
  },
  {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank Limited",
    sector: "Financial Services",
    industry: "Banks",
  },
  {
    symbol: "INFY.NS",
    name: "Infosys Limited",
    sector: "Technology",
    industry: "IT Services",
  },
  {
    symbol: "ICICIBANK.NS",
    name: "ICICI Bank Limited",
    sector: "Financial Services",
    industry: "Banks",
  },
  {
    symbol: "HINDUNILVR.NS",
    name: "Hindustan Unilever Limited",
    sector: "Consumer Staples",
    industry: "FMCG",
  },
  {
    symbol: "SBIN.NS",
    name: "State Bank of India",
    sector: "Financial Services",
    industry: "Banks",
  },
  {
    symbol: "BHARTIARTL.NS",
    name: "Bharti Airtel Limited",
    sector: "Communication Services",
    industry: "Telecom",
  },
  {
    symbol: "KOTAKBANK.NS",
    name: "Kotak Mahindra Bank",
    sector: "Financial Services",
    industry: "Banks",
  },
  {
    symbol: "ITC.NS",
    name: "ITC Limited",
    sector: "Consumer Staples",
    industry: "FMCG",
  },
];

// Sample US equities
const usEquities = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    industry: "Consumer Electronics",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology",
    industry: "Software",
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Technology",
    industry: "Internet Services",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    sector: "Consumer Discretionary",
    industry: "E-commerce",
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Technology",
    industry: "Semiconductors",
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    sector: "Technology",
    industry: "Social Media",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    sector: "Consumer Discretionary",
    industry: "Electric Vehicles",
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase & Co.",
    sector: "Financial Services",
    industry: "Banks",
  },
  {
    symbol: "V",
    name: "Visa Inc.",
    sector: "Financial Services",
    industry: "Payments",
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    sector: "Healthcare",
    industry: "Pharmaceuticals",
  },
];

// Sample cryptocurrencies
const cryptoAssets = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    sector: "Cryptocurrency",
    industry: "Layer 1",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    sector: "Cryptocurrency",
    industry: "Smart Contracts",
  },
  {
    symbol: "BNB",
    name: "BNB",
    sector: "Cryptocurrency",
    industry: "Exchange Token",
  },
  {
    symbol: "SOL",
    name: "Solana",
    sector: "Cryptocurrency",
    industry: "Layer 1",
  },
  {
    symbol: "XRP",
    name: "XRP",
    sector: "Cryptocurrency",
    industry: "Payments",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    sector: "Cryptocurrency",
    industry: "Layer 1",
  },
  {
    symbol: "DOGE",
    name: "Dogecoin",
    sector: "Cryptocurrency",
    industry: "Meme",
  },
  {
    symbol: "MATIC",
    name: "Polygon",
    sector: "Cryptocurrency",
    industry: "Layer 2",
  },
];

// Sample Indian mutual funds
const mutualFunds = [
  {
    symbol: "MF-AXIS-BLUECHIP",
    name: "Axis Bluechip Fund",
    sector: "Mutual Fund",
    industry: "Large Cap",
  },
  {
    symbol: "MF-HDFC-MIDCAP",
    name: "HDFC Mid-Cap Opportunities Fund",
    sector: "Mutual Fund",
    industry: "Mid Cap",
  },
  {
    symbol: "MF-SBI-SMALLCAP",
    name: "SBI Small Cap Fund",
    sector: "Mutual Fund",
    industry: "Small Cap",
  },
  {
    symbol: "MF-PARAG-FLEXI",
    name: "Parag Parikh Flexi Cap Fund",
    sector: "Mutual Fund",
    industry: "Flexi Cap",
  },
  {
    symbol: "MF-MIRAE-EMERGING",
    name: "Mirae Asset Emerging Bluechip Fund",
    sector: "Mutual Fund",
    industry: "Large & Mid Cap",
  },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // Seed Indian equities
  console.log("📈 Seeding Indian equities...");
  for (const equity of indianEquities) {
    await prisma.assetMetadata.upsert({
      where: { symbol: equity.symbol },
      update: {},
      create: {
        symbol: equity.symbol,
        name: equity.name,
        assetClass: "equity",
        market: "NSE",
        country: "IN",
        sector: equity.sector,
        industry: equity.industry,
        currency: "INR",
        isActive: true,
      },
    });
  }

  // Seed US equities
  console.log("🇺🇸 Seeding US equities...");
  for (const equity of usEquities) {
    await prisma.assetMetadata.upsert({
      where: { symbol: equity.symbol },
      update: {},
      create: {
        symbol: equity.symbol,
        name: equity.name,
        assetClass: "equity",
        market: "NYSE",
        country: "US",
        sector: equity.sector,
        industry: equity.industry,
        currency: "USD",
        isActive: true,
      },
    });
  }

  // Seed cryptocurrencies
  console.log("🪙 Seeding cryptocurrencies...");
  for (const crypto of cryptoAssets) {
    await prisma.assetMetadata.upsert({
      where: { symbol: crypto.symbol },
      update: {},
      create: {
        symbol: crypto.symbol,
        name: crypto.name,
        assetClass: "crypto",
        market: "CRYPTO",
        country: "GLOBAL",
        sector: crypto.sector,
        industry: crypto.industry,
        currency: "USD",
        isActive: true,
      },
    });
  }

  // Seed mutual funds
  console.log("📊 Seeding mutual funds...");
  for (const fund of mutualFunds) {
    await prisma.assetMetadata.upsert({
      where: { symbol: fund.symbol },
      update: {},
      create: {
        symbol: fund.symbol,
        name: fund.name,
        assetClass: "mutual_fund",
        market: "NSE",
        country: "IN",
        sector: fund.sector,
        industry: fund.industry,
        currency: "INR",
        isActive: true,
      },
    });
  }

  console.log("✅ Database seed completed!");
  console.log(`   - ${indianEquities.length} Indian equities`);
  console.log(`   - ${usEquities.length} US equities`);
  console.log(`   - ${cryptoAssets.length} cryptocurrencies`);
  console.log(`   - ${mutualFunds.length} mutual funds`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
