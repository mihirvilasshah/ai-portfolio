import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata.settings;

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
