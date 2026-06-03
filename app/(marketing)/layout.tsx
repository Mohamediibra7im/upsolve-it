import type React from "react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      <main className="flex-1 min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
