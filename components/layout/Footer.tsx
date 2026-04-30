"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Github,
  Linkedin,
  Facebook,
  Globe} from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Dashboard", href: "/home" },
    { label: "Training", href: "/training" },
    { label: "Statistics", href: "/statistics" },
    { label: "Upsolve List", href: "/upsolve" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Mission Briefing", href: "/help/quick-start" },
    { label: "Knowledge Base", href: "/help/faq" },
    { label: "Signal Support", href: "/help/support" },
  ],
  resources: [
    { label: "Community", href: "/community" },
    { label: "Bug Report", href: "/report" },
    { label: "Documentation", href: "https://docs.hnuicpc.tech" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Code of Conduct", href: "/community" },
  ],
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/40 bg-background/80 backdrop-blur-2xl overflow-hidden pt-16 pb-8">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="group flex flex-col items-start overflow-visible">
              <div className="flex items-center gap-1.5 leading-none overflow-visible">
                <span className="text-primary/30 font-light text-2xl tracking-tighter">[</span>
                <div className="flex items-baseline">
                  <span className="font-black text-2xl tracking-tighter uppercase text-foreground group-hover:text-primary transition-colors">
                    UPSOLVE
                  </span>
                  <span className="font-black text-2xl tracking-tighter bg-gradient-to-br from-primary to-emerald-500 bg-clip-text text-transparent ml-1 pr-1">
                    .it
                  </span>
                </div>
                <span className="text-primary/30 font-light text-2xl tracking-tighter">]</span>
              </div>
              <p className="text-muted-foreground/60 text-sm max-w-xs mt-4 font-medium leading-relaxed">
                The ultimate command center for competitive programmers. Track your progress, upsolve efficiently, and reach your target rating.
              </p>
            </Link>

            <div className="flex items-center gap-4">
              <a href="https://github.com/HNU-ICPC-Community" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-card/40 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
                <Github size={18} />
              </a>
              <a href="https://www.facebook.com/fcsit.hnu.icpc" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-card/40 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
                <Facebook size={18} />
              </a>
              <a href="https://www.linkedin.com/company/hnu-fcsit-icpc-community" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-card/40 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
                <Linkedin size={18} />
              </a>
              <a href="https://docs.hnuicpc.tech" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-xl bg-card/40 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
                <Globe size={18} />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Platform</h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>



        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/20 gap-6">
          <div className="flex items-center gap-6">
            <p className="text-xs text-muted-foreground font-medium">
              © {currentYear} Upsolve.it. All rights reserved.
            </p>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Build: 04.30.2026</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            </motion.div>
            <span>for CP Communities by</span>
            <a
              href="https://mohamediibrahim.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground font-black hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4"
            >
              Midoriya
            </a>
            <span className="opacity-40">from</span>
            <span className="font-bold text-foreground/80">HNU - ICPC Community</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
