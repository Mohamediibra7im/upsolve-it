import type React from "react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      <main className="flex-1 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 max-w-7xl">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
