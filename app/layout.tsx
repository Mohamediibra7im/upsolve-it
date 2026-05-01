import "./globals.css";
import { Inter, Host_Grotesk, JetBrains_Mono } from "next/font/google";
import type React from "react";
import AuthGuard from "@/app/_Components/AuthGuard";
import ConditionalNavBar from "@/components/layout/ConditionalNavBar";
import ThemeProvider from "@/app/_Components/ThemeProvider";
import { ToastProvider } from "@/app/_Components/Toast";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";
import PageTransition from "@/app/_Components/PageTransition";

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
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className={cn(inter.variable, hostGrotesk.variable, jetbrainsMono.variable)}>
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
