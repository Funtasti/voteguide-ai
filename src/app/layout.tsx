import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { UserProvider } from "@/context/UserContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "VoteGuide AI - Your Interactive Civic Companion",
  description: "An interactive, step-by-step election assistant that explains the process clearly and helps you complete the right actions at the right time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body>
        <UserProvider>
          <a href="#main-content" className="visually-hidden focus:not-visually-hidden">
            Skip to main content
          </a>
          <Header />
          <main id="main-content">
            {children}
          </main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
