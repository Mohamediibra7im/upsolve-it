import "./globals.css";
import { Inter, Host_Grotesk, JetBrains_Mono } from "next/font/google";
import type React from "react";
import type { Metadata } from "next";
import AuthGuard from "@/app/_Components/AuthGuard";
import ConditionalNavBar from "@/components/layout/ConditionalNavBar";
import ThemeProvider from "@/app/_Components/ThemeProvider";
import { ToastProvider } from "@/app/_Components/Toast";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";
import PageTransition from "@/app/_Components/PageTransition";
import ScrollToTop from "@/app/_Components/ScrollToTop";

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

export const metadata: Metadata = {
  title: "Upsolve.it - ",
  description:
    "Practice Codeforces problems with virtual contests, track progress, and improve your competitive programming skills. Create focused training sessions with ratings and tags.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  keywords: [
    "Upsolve.it",
    "Codeforces",
    "competitive programming",
    "virtual contest",
    "cp training",
    "upsolve",
    "practice problems",
    "algorithm practice",
    "programming contest",
    "performance tracking",
    "training sessions",
    "statistics dashboard",
  ],
  authors: [{ name: "Mohammed Ibrahim" }],
  creator: "Upsolve.it",
  publisher: "Upsolve.it",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://upsolve.it"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Upsolve.it - ",
    description:
      "Practice Codeforces problems with virtual contests, track progress, and improve your competitive programming skills. Create focused training sessions with ratings and tags.",
    url: "https://upsolve.it",
    siteName: "Upsolve.it",
    images: [
      {
        url: "https://d3moma7wl9.ufs.sh/f/xRZhVxWEJbFMus29DenxT5WwkRzQNM4V8v2dhSnslabDi1c0",
        width: 1200,
        height: 630,
        alt: "Upsolve.it - Codeforces Practice Platform",
      },
    ],
    locale: "en_US",
    type: "website",
    },
  twitter: {
    card: "summary_large_image",
    title: "Upsolve.it - Codeforces Virtual Contest Practice Platform",
    description:
      "Practice Codeforces problems with virtual contests, track your progress, and improve your competitive programming skills.",
    images: ["https://d3moma7wl9.ufs.sh/f/xRZhVxWEJbFMus29DenxT5WwkRzQNM4V8v2dhSnslabDi1c0"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Upsolve.it",
    description:
      "A Codeforces virtual contest practice platform for competitive programming",
    url: "https://upsolve.it",
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
      "Codeforces, competitive programming, virtual contest, practice problems, algorithm practice",
    featureList: [
      "Custom virtual contests",
      "Problem rating selection",
      "Progress tracking",
      "Statistics and analytics",
      "Upsolving list",
      "Tag-based problem selection",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, hostGrotesk.variable, jetbrainsMono.variable)}>
      <head>
        <script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <ToastProvider>
            <div className="relative flex min-h-screen flex-col bg-background overflow-x-hidden">
              <AuthGuard>
                <ConditionalNavBar>
                  <PageTransition>
                    {children}
                  </PageTransition>
                </ConditionalNavBar>
              </AuthGuard>
            </div>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
