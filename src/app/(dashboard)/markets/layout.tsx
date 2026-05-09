import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata.markets;

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
