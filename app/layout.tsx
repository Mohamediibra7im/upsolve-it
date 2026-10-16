import "./globals.css";
import localFont from "next/font/local";
import type React from "react";
import type { Viewport } from "next";
import AuthGuard from "@/components/providers/AuthGuard";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/Toast";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "@/lib/utils";
import PageTransition from "@/components/shared/PageTransition";
import StudioBackground from "@/components/layout/StudioBackground";
import SystemConsoleFab from "@/components/layout/SystemConsoleFab";
import { LazyMotion, domMax, MotionConfig } from "framer-motion";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const studioSans = localFont({
  src: "./fonts/Montserrat-VariableFont_wght.ttf",
  display: "swap",
  variable: "--font-host",
});

const studioMono = localFont({
  src: "./fonts/Monda-VariableFont_wght.ttf",
  display: "swap",
  variable: "--font-mono",
});

export { metadata } from "./metadata";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101214",
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
      className={cn(studioSans.variable, studioMono.variable)}
    >
      <body
        className="font-sans antialiased overflow-x-hidden"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ToastProvider>
            <LazyMotion features={domMax} strict>
              <MotionConfig reducedMotion="user">
                <div className="relative isolate flex min-h-screen flex-col bg-background">
                  <StudioBackground />
                  <a href="#main-content" className="skip-link">
                    Skip to content
                  </a>
                  <AuthGuard>
                    <PageTransition>
                      <ErrorBoundary>{children}</ErrorBoundary>
                    </PageTransition>
                  </AuthGuard>
                  <SystemConsoleFab />
                </div>
              </MotionConfig>
            </LazyMotion>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
