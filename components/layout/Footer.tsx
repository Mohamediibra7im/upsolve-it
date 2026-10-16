"use client";

import Link from "next/link";
import { Github, Linkedin, Facebook, LockKeyhole } from "lucide-react";
import { useUser } from "@/hooks/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Brand from "./Brand";

const footerLinks = {
  Platform: [
    { label: "Overview", href: "/dashboard" },
    { label: "Training", href: "/training" },
    { label: "Statistics", href: "/statistics" },
    { label: "Upsolve list", href: "/upsolve" },
  ],
  Support: [
    { label: "Help center", href: "/help" },
    { label: "Documentation", href: "/docs" },
    { label: "Quick start", href: "/help/quick-start" },
    { label: "FAQ", href: "/help/faq" },
    { label: "Contact support", href: "/help/support" },
  ],
  Community: [
    { label: "What's new", href: "/whats-new" },
    { label: "Suggestions", href: "/suggestions" },
    { label: "Report a bug", href: "/report" },
  ],
  Legal: [
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
    { label: "Code of conduct", href: "/community" },
  ],
};
const accountRoutes = new Set([
  "/dashboard",
  "/training",
  "/statistics",
  "/upsolve",
  "/report",
]);

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/HNU-ICPC-Community",
    icon: Github,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/fcsit.hnu.icpc",
    icon: Facebook,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/hnu-fcsit-icpc-community",
    icon: Linkedin,
  },
];
const linkClass =
  "rounded-sm text-[13px] leading-6 text-[#929b98] transition-colors hover:text-[#f1f3ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]";

export default function Footer() {
  const { user } = useUser();
  return (
    <footer className="border-t border-white/[0.07] bg-[#101214] pb-7 pt-14 font-sans sm:pt-16">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 pb-12 sm:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-4 lg:col-span-2">
            <Link href="/" aria-label="Upsolve.it home" className="inline-flex">
              <Brand />
            </Link>
            <p className="mt-5 max-w-[260px] text-sm leading-6 text-[#929b98]">
              A little more practice.
              <br />A better problem solver.
            </p>
            <div className="mt-6 flex gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex size-9 items-center justify-center rounded-[10px] border border-[#2b3031] text-[#929b98] transition-colors hover:border-[#454d48] hover:text-[#b5e3c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]"
                >
                  <link.icon size={15} />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h2 className="mb-4 text-[13px] font-semibold text-[#f1f3ee]">
                {group}
              </h2>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    {accountRoutes.has(link.href) && !user ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className={linkClass}>{link.label}</button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[calc(100vw-40px)] rounded-3xl border-[#2b3031] bg-[#191c1e] p-8 font-sans text-[#f1f3ee] sm:max-w-sm sm:rounded-3xl">
                          <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-[#b5e3c4]/10 text-[#b5e3c4]">
                            <LockKeyhole size={22} />
                          </div>
                          <DialogTitle className="font-heading text-2xl font-medium tracking-tight">
                            Your practice starts here.
                          </DialogTitle>
                          <DialogDescription className="text-sm leading-6 text-[#929b98]">
                            Log in to continue and keep your practice, progress,
                            and conversations in one place.
                          </DialogDescription>
                          <div className="mt-3 grid gap-2.5">
                            <Button
                              asChild
                              className="h-11 rounded-xl bg-[#b5e3c4] font-semibold text-[#14241b] hover:bg-[#c7edd3]"
                            >
                              <Link href="/login">Log in</Link>
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              className="h-11 rounded-xl border-[#2b3031] bg-transparent text-[#f1f3ee] hover:bg-white/[0.05]"
                            >
                              <Link href="/signup">Create a free account</Link>
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 border-t border-[#2b3031] pt-6 text-xs leading-5 text-[#747e79] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Upsolve.it</p>
          <p>
            Built for the competitive programming community by{" "}
            <a
              href="https://mohamediibrahim.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#b6bdb9] transition-colors hover:text-[#b5e3c4]"
            >
              Mohamed Ibrahim
            </a>{" "}
            <span className="mx-1 text-[#454d48]">/</span> HNU ICPC
          </p>
        </div>
      </div>
    </footer>
  );
}
