"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Keep one page mounted during navigation so fixed controls and scroll positions stay stable. */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div
      key={pathname}
      className="relative flex min-h-0 w-full flex-grow flex-col"
    >
      {children}
    </div>
  );
}
