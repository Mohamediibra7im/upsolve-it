"use client";

import { Zap, Target, ShieldAlert, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    <div className="min-h-screen bg-[#101214] py-12 font-sans text-[#f1f3ee] sm:py-20">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 rounded-lg text-sm text-[#929b98] transition-colors hover:text-[#b5e3c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]">
          <ArrowLeft className="size-4" />Back to home
        </Link>
        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
          <header className="self-start lg:sticky lg:top-28">
            <p className="mb-4 text-sm text-[#b5e3c4]">Terms of service</p>
            <h1 className="font-heading text-4xl font-medium leading-[1.08] tracking-[-0.04em] sm:text-5xl">A few ground rules.</h1>
            <p className="mt-5 text-base leading-relaxed text-[#929b98]">The terms that keep Upsolve.it a useful, reliable place to practice.</p>
          </header>
          <div className="space-y-4">
            {terms.map((term, index) => (
              <section key={term.title} className="rounded-2xl border border-[#2b3031] bg-[#191c1e] p-6 sm:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <term.icon className="size-5 text-[#b5e3c4]" strokeWidth={1.5} />
                  <span className="text-xs text-[#69746e] tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h2 className="font-heading text-xl font-medium tracking-tight">{term.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#a8b1ac]">{term.content}</p>
              </section>
            ))}
            <p className="px-1 pt-3 text-xs text-[#929b98]">Last updated June 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
