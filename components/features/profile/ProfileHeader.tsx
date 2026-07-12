"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ArrowRight, RefreshCw, Shield, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  user: any;
  summary: any;
  syncProfile: () => void;
}

export default function ProfileHeader({ user, summary, syncProfile }: ProfileHeaderProps) {
  return (
    <m.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-[2rem] border border-emerald-500/25 bg-[#060a08] shadow-[0_0_30px_rgba(16,185,129,0.08)] text-emerald-400 font-mono"
    >
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-terminal-scanlines opacity-[0.15]" />
      <div className="terminal-scanline-sweep" />

      {/* Terminal Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-emerald-500/15 bg-[#0b120f] select-none text-xs text-emerald-500/60">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-[#ef4444]/80 border border-[#ef4444]/30" />
            <div className="size-3 rounded-full bg-[#eab308]/80 border border-[#eab308]/30" />
            <div className="size-3 rounded-full bg-[#22c55e]/80 border border-[#22c55e]/30" />
          </div>
          <span className="ml-3 font-semibold tracking-wider">guest@upsolve: ~/profile_identity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] tracking-widest font-black uppercase text-emerald-500/50">SYS_IDENT_VERIFIED</span>
        </div>
      </div>

      <div className="relative z-10 p-6 md:p-8 space-y-6">
        {/* Terminal diagnostics readout */}
        <div className="space-y-1 bg-black/40 p-4 border border-emerald-500/10 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-500/60 text-xs">
            <span>guest@upsolve.it:~$</span>
            <span className="text-emerald-400 font-bold">./profile_diagnostics.sh --user={user.codeforcesHandle}</span>
          </div>
          <div className="text-[10px] text-emerald-500/40 font-mono leading-relaxed">
            [SYS] ACCESSING SECURITY SECTOR IDENTITY LOGS... SUCCESS<br />
            [SYS] INTEGRITY CHECKS... OK | SIGNATURE VERIFIED
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left">
            <div className="relative">
              <div className="rounded border border-emerald-500/35 p-1 bg-[#0b120f] shadow-lg shadow-emerald-950/20">
                <Avatar className="size-20 md:w-24 md:h-24 border border-emerald-500/15 rounded bg-black">
                  <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
                  <AvatarFallback className="bg-[#0b120f] text-2xl font-black text-emerald-400">
                    {user.codeforcesHandle?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-1 -right-1 size-4 rounded-full bg-emerald-500 border border-black shadow animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/25 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                  <Shield size={10} /> COMPETITIVE_PROG_FEED
                </span>
                {user.role === "admin" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-950/40 border border-red-500/25 text-red-400 text-[9px] font-bold uppercase tracking-wider">
                    SYS_ADMIN
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-emerald-400 glow-text-emerald leading-none flex flex-wrap items-center justify-center sm:justify-start gap-3">
                {user.codeforcesHandle}
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-400/40 text-emerald-400 text-[9px] font-bold uppercase tracking-widest">
                    <ShieldCheck size={11} />
                    [ VERIFIED ]
                  </span>
                )}
              </h1>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-[9px] font-bold uppercase tracking-wider text-emerald-500/60">
                <span className="rounded border border-emerald-500/15 bg-black/45 px-3 py-1.5">
                  CF_RANK: {user.rank || "Unrated"}
                </span>
                <span className="rounded border border-emerald-500/15 bg-black/45 px-3 py-1.5">
                  CF_ORG: {user.organization || "Independent"}
                </span>
                <span className="rounded border border-emerald-500/15 bg-black/45 px-3 py-1.5">
                  LEVEL_CAP: {summary?.currentLevel?.title || "Novice"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
            <Button
              onClick={syncProfile}
              variant="outline"
              className="h-10 flex-1 sm:flex-none rounded border border-emerald-500/35 bg-[#060a08] text-emerald-400 font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/60 active:scale-[0.98] transition-all font-mono"
            >
              <RefreshCw className="mr-2 size-3.5" />
              [ SYNC HANDLE ]
            </Button>
            <Button
              asChild
              className="h-10 flex-1 sm:flex-none rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[9px] shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all font-mono"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                [ TO DASHBOARD ]
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </m.section>
  );
}

