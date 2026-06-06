"use client";

import { m, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";

const variants = {
  hidden: { opacity: 0, x: 0, y: 10 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 0, y: -10 },
};

export default function PageTransition({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="sync">
      <m.div
        key={pathname}
        initial={false}
        animate="enter"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex-grow flex flex-col min-h-0 relative"
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}
