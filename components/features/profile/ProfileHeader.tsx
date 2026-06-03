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
      className="relative overflow-hidden rounded-3xl border border-border/80 dark:border-border/40 bg-card/40 dark:bg-card/25 p-6 md:p-8 backdrop-blur-xl"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-primary/10 blur-[130px] opacity-80" />
        <div className="absolute -bottom-20 left-10 size-60 rounded-full bg-emerald-500/10 blur-[110px] opacity-60" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-6 md:gap-8 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <div className="relative">
            <div className="rounded-full p-1 bg-gradient-to-br from-primary via-emerald-400 to-indigo-500 shadow-2xl shadow-primary/25">
              <Avatar className="size-20 md:w-24 md:h-24 border-4 border-card">
                <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
                <AvatarFallback className="bg-primary/10 text-2xl font-black text-primary">
                  {user.codeforcesHandle?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute bottom-1 right-1 size-5 rounded-full bg-emerald-500 border-4 border-card shadow-md animate-pulse" />
          </div>

          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                <Shield size={11} /> Competitive Programmer
              </span>
              {user.role === "admin" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  Admin
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-[1000] tracking-tighter uppercase text-foreground leading-none flex items-center gap-3">
              {user.codeforcesHandle}
              {user.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck size={12} />
                  Verified
                </span>
              )}
            </h1>

            <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-wider text-muted-foreground/80">
              <span className="rounded-lg border border-border/40 bg-background/50 px-3 py-1.5 backdrop-blur-md">
                CF: {user.rank || "Unrated"}
              </span>
              <span className="rounded-lg border border-border/40 bg-background/50 px-3 py-1.5 backdrop-blur-md">
                Org: {user.organization || "Independent"}
              </span>
              <span className="rounded-lg border border-border/40 bg-background/50 px-3 py-1.5 backdrop-blur-md">
                Skills: {summary?.currentLevel?.title || "Novice"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
          <Button
            onClick={syncProfile}
            variant="outline"
            className="h-11 flex-1 sm:flex-none rounded-xl border border-border/80 hover:border-primary/40 dark:border-border/40 hover:bg-primary/5 text-foreground hover:text-primary transition-all duration-300 font-bold uppercase tracking-wider text-[10px]"
          >
            <RefreshCw className="mr-2 size-3.5" />
            Sync Handle
          </Button>
          <Button
            asChild
            className="h-11 flex-1 sm:flex-none rounded-xl bg-primary text-primary-foreground hover:brightness-110 shadow-lg shadow-primary/15 hover:shadow-primary/25 transition-all duration-300 font-bold uppercase tracking-wider text-[10px]"
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              To Dashboard
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </m.section>
  );
}
