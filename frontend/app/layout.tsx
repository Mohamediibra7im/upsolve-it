import "./globals.css";
import { Barlow_Condensed, Barlow, JetBrains_Mono } from "next/font/google";
import type React from "react";
import type { Viewport } from "next";
import AuthGuard from "@/components/providers/AuthGuard";
import { ToastProvider } from "@/components/providers/Toast";
import Script from "next/script";
import { cn } from "@/lib/utils";
import PageTransition from "@/components/shared/PageTransition";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import AnnouncementDialog from "@/components/shared/AnnouncementDialog";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--ff-display",
});
const sans = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--ff-sans",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--ff-mono",
});

export { metadata } from "./metadata";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0c0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(display.variable, sans.variable, mono.variable)}
    >
      <body
        className="font-sans antialiased overflow-x-hidden"
        suppressHydrationWarning
      >
        <ToastProvider>
          <div className="relative isolate flex min-h-screen flex-col">
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            <AuthGuard>
              <PageTransition>
                <ErrorBoundary>{children}</ErrorBoundary>
              </PageTransition>
            </AuthGuard>
          </div>
          <AnnouncementDialog />
        </ToastProvider>
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "700b11106fa44fa299e0fc678b5d6c31"}'
        />
      </body>
    </html>
  );
}
