"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { m as motion } from "framer-motion";
import {
  Heart,
  Github,
  Linkedin,
  Facebook,
  ShieldAlert
} from "lucide-react";
import { useUser } from "@/hooks/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const footerLinks = {
  platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Training", href: "/training" },
    { label: "Statistics", href: "/statistics" },
    { label: "Upsolve List", href: "/upsolve" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Documentation", href: "/docs" },
    { label: "Quick Start Guide", href: "/help/quick-start" },
    { label: "FAQ", href: "/help/faq" },
    { label: "Contact Support", href: "/help/support" },
  ],
  resources: [
    { label: "What's New", href: "/whats-new" },
    { label: "Suggestions", href: "/suggestions" },
    { label: "Bug Report", href: "/report" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Code of Conduct", href: "/community" },
  ],
};

const Footer = () => {
  const { user } = useUser();
  const currentYear = new Date().getFullYear();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getFormattedDate = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    return `${month}.${day}.${year}`;
  };

  return (
    <footer className="relative border-t border-emerald-500/15 bg-[#040604] font-mono text-emerald-400 pt-16 pb-8 select-none">
      {/* Decorative scanner line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="group flex flex-col items-start">
              <div className="flex items-center gap-1.5 leading-none font-bold text-sm tracking-wider">
                <span className="text-emerald-500/30">&lt;</span>
                <span className="text-white group-hover:text-emerald-300 transition-colors uppercase">UPSOLVE</span>
                <span className="text-emerald-400 font-extrabold uppercase">.IT</span>
                <span className="text-emerald-500/30">/&gt;</span>
              </div>
            </Link>
            <p className="text-[10px] text-emerald-500/50 max-w-xs leading-relaxed uppercase">
              The ultimate command center for competitive programmers. Track your progress, upsolve efficiently, and reach your target rating.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://github.com/HNU-ICPC-Community"
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-sm border border-emerald-500/20 bg-emerald-950/5 flex items-center justify-center text-emerald-500/50 hover:text-emerald-300 hover:border-emerald-500/40 hover:shadow-[0_0_8px_rgba(16,185,129,0.1)] transition-all"
              >
                <Github size={13} />
              </a>
              <a
                href="https://www.facebook.com/fcsit.hnu.icpc"
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-sm border border-emerald-500/20 bg-emerald-950/5 flex items-center justify-center text-emerald-500/50 hover:text-emerald-300 hover:border-emerald-500/40 hover:shadow-[0_0_8px_rgba(16,185,129,0.1)] transition-all"
              >
                <Facebook size={13} />
              </a>
              <a
                href="https://www.linkedin.com/company/hnu-fcsit-icpc-community"
                target="_blank"
                rel="noopener noreferrer"
                className="size-8 rounded-sm border border-emerald-500/20 bg-emerald-950/5 flex items-center justify-center text-emerald-500/50 hover:text-emerald-300 hover:border-emerald-500/40 hover:shadow-[0_0_8px_rgba(16,185,129,0.1)] transition-all"
              >
                <Linkedin size={13} />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500/45">{"// Platform"}</h4>
            <ul className="space-y-2 text-[10px] font-bold">
              {footerLinks.platform.map((link) => {
                const isProtected = ["Dashboard", "Training", "Statistics", "Upsolve List"].includes(link.label);
                const isDisabled = isProtected && !user;

                return (
                  <li key={link.label}>
                    {isDisabled ? (
                      <Dialog>
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DialogTrigger asChild>
                                <button className="text-left text-emerald-500/30 hover:text-emerald-400 transition-colors uppercase cursor-help">
                                  [ {link.label} ]
                                </button>
                              </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipPortal>
                              <TooltipContent className="bg-[#060a08] border border-emerald-500/20 px-2 py-1 rounded-sm text-[8px] font-bold text-emerald-300 tracking-wider">
                                IDENTITY_REQUIRED
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        </TooltipProvider>

                        <DialogContent className="bg-[#060a08] border border-emerald-500/25 max-w-sm rounded-sm p-6 text-emerald-400 font-mono">
                          <DialogTitle className="sr-only">Access Authorization Required</DialogTitle>
                          <div className="space-y-6 text-center">
                            <div className="mx-auto size-12 rounded-sm border border-red-500/20 bg-red-950/10 flex items-center justify-center text-red-400 animate-pulse">
                              <ShieldAlert size={20} />
                            </div>
                            
                            <div className="space-y-2">
                              <h3 className="text-sm font-bold tracking-wider uppercase text-red-400">SECURE_SECTOR // ACCESS_DENIED</h3>
                              <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                                Accessing the <span className="text-emerald-300">{link.label}</span> module requires verified login credentials. Please initialize secure identity validation.
                              </p>
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                              <Button asChild className="h-9 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] font-mono">
                                <Link href="/login">[ INITIALIZE_LOGIN.EXE ]</Link>
                              </Button>
                              <Button asChild variant="outline" className="h-9 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 font-mono">
                                <Link href="/signup">[ REGISTER_IDENTITY.SH ]</Link>
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Link href={link.href} className="text-emerald-500/50 hover:text-emerald-300 transition-colors uppercase">
                        [ {link.label} ]
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-3">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500/45">{"// Support"}</h4>
            <ul className="space-y-2 text-[10px] font-bold">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-emerald-500/50 hover:text-emerald-300 transition-colors uppercase">
                    [ {link.label} ]
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-3">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500/45">{"// Resources"}</h4>
            <ul className="space-y-2 text-[10px] font-bold">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-emerald-500/50 hover:text-emerald-300 transition-colors uppercase">
                    [ {link.label} ]
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-500/45">{"// Legal"}</h4>
            <ul className="space-y-2 text-[10px] font-bold">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-emerald-500/50 hover:text-emerald-300 transition-colors uppercase">
                    [ {link.label} ]
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Metadata Panel */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-emerald-500/10 gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 order-2 md:order-1 text-center sm:text-left">
            <p className="text-[9px] text-emerald-500/35 uppercase">
              © {currentYear} UPSOLVE.IT. All rights reserved.
            </p>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-950/20 border border-emerald-500/10 rounded-sm">
              <div className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[8px] font-bold text-emerald-300 uppercase tracking-widest">
                SYSTEM_STABLE // {mounted ? getFormattedDate() : "04.30.2026"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 text-[9px] font-bold text-emerald-500/50 order-1 md:order-2 text-center md:text-right max-w-md sm:max-w-none">
            <div className="flex items-center justify-center gap-1">
              <span>MADE WITH</span>
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block"
              >
                <Heart className="size-3 text-red-500 fill-red-500" />
              </motion.div>
              <span>FOR CP COMMUNITY BY</span>
              <a
                href="https://mohamediibrahim.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-emerald-300 transition-colors underline decoration-emerald-500/30 underline-offset-4"
              >
                M_IBRAHIM
              </a>
            </div>
            <span className="hidden sm:inline text-emerald-500/20">|</span>
            <div className="flex items-center justify-center gap-1.5 text-[8px] text-emerald-500/35 uppercase">
              <span>POWERED BY HNU-ICPC</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
