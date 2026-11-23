import type { ReactNode } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { cn } from "@/lib/utils";

/** The one frame: top bar, content, footer. `app` puts the content in the wide
 *  1440px container with page padding; public pages manage their own bands. */
export default function SiteShell({
  children,
  app = false,
  admin = false,
}: {
  children: ReactNode;
  app?: boolean;
  admin?: boolean;
}) {
  return (
    <>
      <NavBar admin={admin} app={app} />
      <main
        id="main-content"
        className={cn(
          "min-h-[calc(100dvh-4rem)] min-w-0 flex-1",
          app && "wrap pb-[72px] pt-10",
        )}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
