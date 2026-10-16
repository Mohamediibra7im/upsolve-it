"use client";

import { Shield, Lock, Eye, Cookie, ArrowLeft } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "What We Collect",
    icon: Eye,
    content: "We only collect the essential data needed to sync your Codeforces progress, including your handle, rating history, and submission data. We never store your Codeforces password or private credentials."
  },
  {
    title: "How We Protect Your Data",
    icon: Shield,
    content: "Your session data is encrypted and stored securely. We use industry-standard security practices to keep your training history accessible only to you."
  },
  {
    title: "Your Privacy Rights",
    icon: Lock,
    content: "We never sell or share your training data with third parties. Your performance metrics are used solely to provide you with personalized training insights."
  },
  {
    title: "Cookies",
    icon: Cookie,
    content: "We use essential cookies to keep you logged in. No tracking or marketing cookies are used on this platform."
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#101214] py-12 font-sans text-[#f1f3ee] sm:py-20">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 rounded-lg text-sm text-[#929b98] transition-colors hover:text-[#b5e3c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]">
          <ArrowLeft className="size-4" />Back to home
        </Link>
        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
          <header className="self-start lg:sticky lg:top-28">
            <p className="mb-4 text-sm text-[#b5e3c4]">Privacy policy</p>
            <h1 className="font-heading text-4xl font-medium leading-[1.08] tracking-[-0.04em] sm:text-5xl">Your privacy matters.</h1>
            <p className="mt-5 text-base leading-relaxed text-[#929b98]">How we handle your data, protect your information, and respect your privacy.</p>
          </header>
          <div className="space-y-4">
            {sections.map((section, index) => (
              <section key={section.title} className="rounded-2xl border border-[#2b3031] bg-[#191c1e] p-6 sm:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <section.icon className="size-5 text-[#b5e3c4]" strokeWidth={1.5} />
                  <span className="text-xs text-[#69746e] tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h2 className="font-heading text-xl font-medium tracking-tight">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#a8b1ac]">{section.content}</p>
              </section>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
