"use client";

import { Zap, Target, ShieldAlert, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const terms = [
  {
    title: "Using the Platform",
    icon: Globe,
    content: "Access to Upsolve.it is for personal use to improve your competitive programming skills. Automated scraping or interfering with the platform is not allowed."
  },
  {
    title: "Expected Behavior",
    icon: Target,
    content: "Respect the community. Don't try to bypass security, reverse-engineer the system, or disrupt the experience for others."
  },
  {
    title: "Data Accuracy",
    icon: Zap,
    content: "While we aim for accurate syncing, we're not responsible for discrepancies from external sources like the Codeforces API. Training data is for informational purposes."
  },
  {
    title: "Account Termination",
    icon: ShieldAlert,
    content: "We reserve the right to suspend accounts that violate these terms. Keeping the platform safe and stable is our top priority."
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden py-20 bg-[#040604] font-mono text-emerald-400 select-none">
      {/* Background terminal grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_45%,transparent_100%)]" />

      {/* Terminal Scanline overlay */}
      <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03] pointer-events-none z-50" />

      <div className="container mx-auto px-4 max-w-3xl space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/20 border border-emerald-500/15 rounded-sm text-[9px] font-bold uppercase tracking-widest text-emerald-400">
            [ LEGAL_DEPARTMENT // TERMS_OF_SERVICE ]
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
            Terms of Service
          </h1>
          <p className="text-emerald-500/50 text-xs uppercase leading-relaxed max-w-xl mx-auto">
            By using Upsolve.it, you agree to the following terms. Please read them carefully.
          </p>
        </div>

        {/* Terms list */}
        <div className="grid gap-4">
          {terms.map((term) => (
            <div
              key={term.title}
              className="p-6 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-sm bg-emerald-500/5 text-emerald-400 border border-emerald-500/15">
                  <term.icon size={16} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">{term.title}</h3>
              </div>
              <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                {term.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-6 pt-6">
          <div className="h-[1px] w-full bg-emerald-500/10" />
          <p className="text-[8px] font-bold text-emerald-500/35 uppercase tracking-widest">
            LAST_UPDATE: JUNE.2026
          </p>
          <Button asChild variant="ghost" className="h-9 px-4 rounded-sm border border-emerald-500/10 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 text-[9px] font-bold uppercase tracking-widest font-mono">
            <Link href="/">
              <ArrowLeft size={12} className="mr-1.5" /> [ BACK_TO_HOME.SYS ]
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
