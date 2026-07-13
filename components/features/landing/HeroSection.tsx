"use client";

import Link from "next/link";
import { m as motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Terminal } from "lucide-react";
import { useRoadmapUserSummary } from "@/hooks/roadmap";

const HeroSection = ({ user }: { user: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const { summary: _summary } = useRoadmapUserSummary(!!user);

  // Retro boot sequence logs
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const sequence = [
      "SYS // DETECTING USER SESSION...",
      user ? `SYS // USER LOCATED: @${user.codeforcesHandle?.toUpperCase()}` : "SYS // ANONYMOUS CONNECTION CONFIRMED.",
      "SYS // SYNCING CURATED PROBLEMS LOG...",
      "SYS // ACCESS GRANTED // READY TO BOOT."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setLogs(prev => [...prev, sequence[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 450);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#040604] font-mono text-emerald-400"
    >
      {/* Background terminal grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_45%,transparent_100%)]" />

      {/* Terminal Scanline overlay */}
      <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03] pointer-events-none" />

      <motion.div
        style={{ y, opacity }}
        className="container mx-auto px-4 relative z-10 -mt-16"
      >
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Badge Tag */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/20 border border-emerald-500/15 rounded-sm text-[9px] font-bold uppercase tracking-widest"
          >
            <span className="relative flex size-1.5">
              <span className="animate-ping absolute inline-flex size-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
            </span>
            <span>HNU_ICPC // COCKPIT_STATION</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none uppercase select-none"
          >
            <span className="text-white">UPSOLVE</span>
            <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">.IT</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-emerald-500/70 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto uppercase tracking-wide"
          >
            The ultimate terminal dashboard for competitive programmers. Analyze your rating trajectory, solve smart recommendations, and master the algorithms feed in a pure developer workspace.
          </motion.p>

          {/* Live system boot logger UI */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-md mx-auto p-3.5 border border-emerald-500/15 bg-emerald-950/[0.03] text-left text-[9px] space-y-1 rounded-sm shadow-[inset_0_0_8px_rgba(16,185,129,0.02)]"
          >
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-1.5 mb-1.5 text-emerald-500/40 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1"><Terminal size={10} /> BOOT_SEQUENCE.LOG</span>
              <span>SYS_OK</span>
            </div>
            {logs.map((log, idx) => (
              <div key={idx} className="flex justify-between font-mono">
                <span className="text-emerald-400/80">&gt; {log}</span>
                <span className="text-emerald-300 font-bold">[ DONE ]</span>
              </div>
            ))}
            {logs.length < 4 && (
              <div className="flex items-center gap-1 text-emerald-500/40 animate-pulse">
                <span>&gt; LOADING_STREAM_DATA</span>
                <span className="inline-block w-1.5 h-3 bg-emerald-500/40" />
              </div>
            )}
          </motion.div>

          {/* CTA Bracket Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            {user ? (
              <>
                <Button
                  asChild
                  className="h-10 px-6 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] font-mono shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all"
                >
                  <Link href="/profile" className="flex items-center gap-1.5">
                    [ GO_TO_PROFILE.EXE ] <ArrowRight size={12} />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 px-6 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[10px] font-mono hover:bg-emerald-500/10 transition-all"
                >
                  <Link href="/dashboard">[ OPERATIONS_BOARD.SH ]</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 px-6 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[10px] font-mono hover:bg-emerald-500/10 transition-all"
                >
                  <Link href="/docs">[ READ_DOCS.MD ]</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  className="h-10 px-6 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] font-mono shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all"
                >
                  <Link href="/signup" className="flex items-center gap-1.5">
                    [ START_INITIALIZATION.SH ] <ArrowRight size={12} />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 px-6 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[10px] font-mono hover:bg-emerald-500/10 transition-all"
                >
                  <Link href="/login">[ LOGIN.EXE ]</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 px-6 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[10px] font-mono hover:bg-emerald-500/10 transition-all"
                >
                  <Link href="/docs">[ READ_DOCS.MD ]</Link>
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-emerald-500/30"
      >
        <span className="text-[7px] font-bold uppercase tracking-[0.3em]">
          Scroll_Down
        </span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <ChevronDown size={12} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
