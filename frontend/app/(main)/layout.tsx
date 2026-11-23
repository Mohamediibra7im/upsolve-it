import type { ReactNode } from "react";
import SiteShell from "@/components/layout/SiteShell";

export default function MainLayout({ children }: { children: ReactNode }) {
  return <SiteShell app>{children}</SiteShell>;
}
