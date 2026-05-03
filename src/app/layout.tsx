import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import { UserProvider } from "@/context/UserContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoteGuide AI - Your Interactive Civic Companion",
  description: "An interactive, step-by-step election assistant that explains the process clearly and helps you complete the right actions at the right time.",
  keywords: ["elections", "India", "voting guide", "voter registration", "myth buster", "AI assistant", "civic engagement"],
  authors: [{ name: "VoteGuide AI Team" }],
  openGraph: {
    title: "VoteGuide AI - Your Interactive Civic Companion",
    description: "Navigate the election process with confidence.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body>
        <UserProvider>
          <ErrorBoundary>
            <a href="#main-content" className="visually-hidden focus:not-visually-hidden">
              Skip to main content
            </a>
            <Header />
            <main id="main-content">
              {children}
            </main>
            <Footer />
          </ErrorBoundary>
        </UserProvider>
      </body>
    </html>
  );
}
