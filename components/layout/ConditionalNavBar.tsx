"use client";

import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import useUser from "@/hooks/useUser";
import { usePathname } from "next/navigation";

type ConditionalNavBarProps = {
  children: React.ReactNode;
};

const ConditionalNavBar = ({ children }: ConditionalNavBarProps) => {
  const { isLoading } = useUser();
  const pathname = usePathname();

  const showNavbar = !isLoading;
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <>
      {showNavbar && !isAdminPage && <NavBar />}
      <main className="flex-1 min-h-screen">
        {isAdminPage ? (
          <div className="w-full">
            {children}
          </div>
        ) : (
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 max-w-7xl">
            {children}
          </div>
        )}
      </main>
      {!isAdminPage && <Footer />}
    </>
  );
};

export default ConditionalNavBar;







