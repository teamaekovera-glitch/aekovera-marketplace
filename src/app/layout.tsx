import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Aekovera — The CPG Brand-to-Buyer Marketplace",
    template: "%s · Aekovera",
  },
  description:
    "Aekovera connects consumer packaged goods brands with verified retail buyers. Retailer-ready brand profiles, product catalogs, sourcing opportunities, and AI-assisted matching.",
  keywords: [
    "CPG marketplace",
    "retail buyers",
    "brand discovery",
    "consumer packaged goods",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
