import type { ReactNode } from "react";
import SiteShell from "@/components/layout/SiteShell";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell contentClassName="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      {children}
    </SiteShell>
  );
}
