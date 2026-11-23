import type { ReactNode } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { cn } from "@/lib/utils";

/** Shared public/member frame keeps navigation, page spacing, and footer consistent. */
export default function SiteShell({
  children,
  contentClassName,
}: {
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <>
      <NavBar />
      <main
        id="main-content"
        className="min-h-[calc(100dvh-4.75rem)] min-w-0 flex-1"
      >
        <div className={cn("min-w-0", contentClassName)}>{children}</div>
      </main>
      <Footer />
    </>
  );
}
