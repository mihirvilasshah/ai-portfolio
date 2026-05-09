import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata.insights;

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
