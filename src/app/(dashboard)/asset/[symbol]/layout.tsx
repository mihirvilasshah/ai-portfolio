import type { Metadata } from "next";
import { generateAssetMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { symbol } = await params;
  const decodedSymbol = decodeURIComponent(symbol);
  
  // In production, fetch the asset name from database/API
  // For now, use the symbol as the display name
  return generateAssetMetadata(decodedSymbol);
}

export default function AssetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
