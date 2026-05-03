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
import HelpFab from "@/components/layout/HelpFab";

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
              {/* Site-wide background */}
              <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_20%,transparent_100%)]" />
                <div className="absolute w-[700px] h-[700px] rounded-full blur-[150px] bg-[hsl(var(--primary)/0.07)] -top-[20%] -left-[10%]" />
                <div className="absolute w-[500px] h-[500px] rounded-full blur-[130px] bg-[hsl(165_70%_50%/0.05)] bottom-[10%] right-[-8%]" />
                <div className="absolute w-[400px] h-[400px] rounded-full blur-[120px] bg-[hsl(var(--primary)/0.04)] top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2" />
              </div>
              <AuthGuard>
                <ConditionalNavBar>
                  <PageTransition>
                    {children}
                  </PageTransition>
                </ConditionalNavBar>
              </AuthGuard>
              <HelpFab />
            </div>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
