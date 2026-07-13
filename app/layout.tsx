import "./globals.css";
import { Inter, Host_Grotesk, JetBrains_Mono } from "next/font/google";
import type React from "react";
import Script from "next/script";
import AuthGuard from "@/components/providers/AuthGuard";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/Toast";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";
import PageTransition from "@/components/shared/PageTransition";
import HelpFab from "@/components/layout/HelpFab";
import WhatsNewFab from "@/components/layout/WhatsNewFab";
import { LazyMotion, domMax, MotionConfig } from "framer-motion";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-host",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export { metadata } from "./metadata";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Upsolve.it",
  description:
    "The ultimate command center for competitive programmers. Master Codeforces with intelligent practice sessions, track your evolution, and dominate the competitive programming ladder.",
  url: "https://upsolve-it.hnuicpc.tech",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Mohammed Ibrahim",
  },
  keywords:
    "Upsolve.it, Codeforces, competitive programming, virtual contest, practice problems, algorithm practice, upsolve, HNU ICPC",
  featureList: [
    "Custom virtual contests",
    "Problem rating selection",
    "Progress tracking",
    "Statistics and analytics",
    "Upsolving list",
    "Tag-based problem selection",
    "Problem statistics",
    "Rating tracking",
    "Problem analytics",
    "Practice sessions",
    "Problem analytics",

  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={cn(inter.variable, hostGrotesk.variable, jetbrainsMono.variable)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased overflow-x-hidden" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <ToastProvider>
            <LazyMotion features={domMax} strict>
              <MotionConfig reducedMotion="user">
              <div className="relative flex min-h-screen flex-col bg-background">
                {/* Site-wide background */}
                <div className="fixed inset-0 -z-10 pointer-events-none bg-[#040604]" aria-hidden="true">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_45%,transparent_100%)]" />
                  <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03]" />
                </div>
                <AuthGuard>
                  <PageTransition>
                    <ErrorBoundary>{children}</ErrorBoundary>
                  </PageTransition>
                </AuthGuard>
                <WhatsNewFab />
                <HelpFab />
              </div>
            </MotionConfig>
          </LazyMotion>
        </ToastProvider>
      </ThemeProvider>
        <Analytics />
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
        />
      </body>
    </html>
  );
}
