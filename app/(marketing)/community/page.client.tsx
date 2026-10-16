"use client";

import { Heart, MessageSquare, ShieldCheck, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";

const rules = [
  {
    title: "Be Kind and Respectful",
    icon: Heart,
    content: "Support your fellow programmers. Everyone starts somewhere. Harassment, bullying, or toxic behavior has no place in our community."
  },
  {
    title: "Play Fair",
    icon: ShieldCheck,
    content: "Don't cheat. The goal is personal growth. Sharing solutions during active contests or using prohibited tools goes against everything we stand for."
  },
  {
    title: "Help Each Other Grow",
    icon: MessageSquare,
    content: "Engage in constructive discussions. Help others debug, share your thought process, and learn together as a community."
  },
  {
    title: "Focus on Learning",
    icon: Trophy,
    content: "The goal is improvement, not just rating. Celebrate the process of learning and the satisfaction of solving challenging problems."
  }
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#101214] py-12 font-sans text-[#f1f3ee] sm:py-20">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 rounded-lg text-sm text-[#929b98] transition-colors hover:text-[#b5e3c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]">
          <ArrowLeft className="size-4" />Back to home
        </Link>
        <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
          <header className="self-start lg:sticky lg:top-28">
            <p className="mb-4 text-sm text-[#b5e3c4]">Our community</p>
            <h1 className="font-heading text-4xl font-medium leading-[1.08] tracking-[-0.04em] sm:text-5xl">Better, together.</h1>
            <p className="mt-5 text-base leading-relaxed text-[#929b98]">A shared passion for problem solving. A little kindness. These are the values that guide our community.</p>
          </header>
          <div className="space-y-4">
            {rules.map((rule, index) => (
              <section key={rule.title} className="rounded-2xl border border-[#2b3031] bg-[#191c1e] p-6 sm:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <rule.icon className="size-5 text-[#b5e3c4]" strokeWidth={1.5} />
                  <span className="text-xs text-[#69746e] tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h2 className="font-heading text-xl font-medium tracking-tight">{rule.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#a8b1ac]">{rule.content}</p>
              </section>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
