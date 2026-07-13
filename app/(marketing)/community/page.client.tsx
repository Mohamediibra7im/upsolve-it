"use client";

import { Users, Heart, MessageSquare, ShieldCheck, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen relative overflow-hidden py-20 bg-[#040604] font-mono text-emerald-400 select-none">
      {/* Background terminal grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_45%,transparent_100%)]" />

      {/* Terminal Scanline overlay */}
      <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03] pointer-events-none z-50" />

      <div className="container mx-auto px-4 max-w-3xl space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/20 border border-emerald-500/15 rounded-sm text-[9px] font-bold uppercase tracking-widest text-emerald-400">
            [ LEGAL_DEPARTMENT // COMMUNITY_GUIDELINES ]
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
            Code of Conduct
          </h1>
          <p className="text-emerald-500/50 text-xs uppercase leading-relaxed max-w-xl mx-auto">
            Our community is built on mutual respect and a shared passion for competitive programming. These are the values that guide us.
          </p>
        </div>

        {/* Rules list */}
        <div className="grid gap-4">
          {rules.map((rule, idx) => (
            <div
              key={rule.title}
              className="p-6 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all space-y-3"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-sm bg-emerald-500/5 text-emerald-400 border border-emerald-500/15 shrink-0">
                  <rule.icon size={16} />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-500/40 uppercase tracking-widest">
                    <span>RULE_0{idx + 1}</span>
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">{rule.title}</h3>
                  <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                    {rule.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-6 pt-6">
          <div className="h-[1px] w-full bg-emerald-500/10" />
          <div className="flex items-center gap-2 text-emerald-500/40 text-[9px] font-bold uppercase tracking-wider">
            <Users size={12} />
            <span>STANDING_TOGETHER_AS_ONE_COMMUNITY</span>
          </div>
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
