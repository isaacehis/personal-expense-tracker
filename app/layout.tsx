import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";

import { GoogleAnalytics } from "@/components/google-analytics";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Personal Expense Tracker",
    template: "%s | Personal Expense Tracker",
  },
  description:
    "Track income, expenses, budgets, and monthly financial activity securely.",
  applicationName: "ExpenseTrack",
  authors: [{ name: "ExpenseTrack project team" }],
  creator: "ExpenseTrack project team",
  openGraph: {
    title: "ExpenseTrack — Personal Expense Tracking System",
    description:
      "A secure personal finance application for income, expense, budget, and monthly analysis.",
    type: "website",
    siteName: "ExpenseTrack",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExpenseTrack — Personal Expense Tracking System",
    description: "Track income, spending, and monthly budgets securely.",
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

type RootLayoutProps = {
  children: ReactNode;
};

const themeScript = `try{const saved=localStorage.getItem('expense-track-theme');const dark=saved==='dark'||(!saved&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light'}catch{}`;

export default async function RootLayout({ children }: RootLayoutProps) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ExpenseTrack",
    url: siteUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any web browser",
    description:
      "A secure personal expense tracking system for income, expenses, budgets, and analytics.",
  };

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <script
          nonce={nonce}
          suppressHydrationWarning
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <GoogleAnalytics nonce={nonce} />
      </body>
    </html>
  );
}
