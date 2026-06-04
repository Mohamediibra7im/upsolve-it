"use client";

import {m} from "framer-motion";
import {ClipboardList, Layers, Sparkles, Clock, Play} from "lucide-react";

const CloseTheLoopSection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute rounded-full pointer-events-none blur-[120px] size-[400px] bg-primary/5 top-[10%] left-[10%]" />
      <div className="absolute rounded-full pointer-events-none blur-[120px] size-[300px] bg-emerald-500/5 bottom-[10%] right-[10%]" />

      <div className="container mx-auto px-6 relative z-10">
        <m.div
          initial={{opacity: 0, y: 16}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          className="text-center max-w-2xl mx-auto mb-24 space-y-4"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            After Every Session
          </span>
          <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-[0.95]">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">Close the</span>{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Loop</span>
          </h2>
          <p className="text-muted-foreground font-medium text-lg">
            Reviews, upsolving, and roadmaps turn raw practice into lasting gains.
          </p>
        </m.div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[35%] left-[15%] right-[15%] h-[1px] border-t border-dashed border-border/60 pointer-events-none z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            
            {/* Step 1: Session Reviews */}
            <m.div
              initial={{opacity: 0, y: 24}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{duration: 0.5}}
              className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden flex flex-col justify-between h-full min-h-[380px]"
            >
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="size-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                    <ClipboardList size={22} />
                  </div>
                  <span className="text-4xl font-[1000] leading-none text-primary/10 select-none">01</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                    Session Reviews
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Debrief each run with time-per-problem tracking, difficulty analysis, and focused recommendations on what to train next.
                  </p>
                </div>
              </div>

              {/* Micro UI */}
              <div className="mt-8 p-4 bg-background/50 border border-border/40 rounded-2xl text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                  <span className="font-black uppercase text-[8px] text-muted-foreground/80 tracking-wider">Session #42 Completed</span>
                  <span className="text-emerald-500 font-bold">3/4 Solved</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-card p-2 rounded-xl border border-border/60">
                    <span className="block text-[7px] uppercase font-bold text-muted-foreground/60 mb-0.5">Average Time</span>
                    <span className="font-black text-xs font-mono text-primary flex items-center gap-1">
                      <Clock size={10} /> 24m
                    </span>
                  </div>
                  <div className="bg-card p-2 rounded-xl border border-border/60">
                    <span className="block text-[7px] uppercase font-bold text-muted-foreground/60 mb-0.5">Focus Areas</span>
                    <span className="font-black text-[9px] text-muted-foreground">DP, Graphs</span>
                  </div>
                </div>
              </div>
            </m.div>

            {/* Step 2: Upsolve & Streaks */}
            <m.div
              initial={{opacity: 0, y: 24}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{duration: 0.5, delay: 0.1}}
              className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden flex flex-col justify-between h-full min-h-[380px]"
            >
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="size-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                    <Layers size={22} />
                  </div>
                  <span className="text-4xl font-[1000] leading-none text-primary/10 select-none">02</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                    Upsolve & Streaks
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Unsolved problems auto-queue for later. Track daily streaks, best streaks, and a consistency score to stay on track.
                  </p>
                </div>
              </div>

              {/* Micro UI */}
              <div className="mt-8 p-4 bg-background/50 border border-border/40 rounded-2xl text-xs space-y-2">
                <span className="block font-black uppercase text-[8px] text-muted-foreground/80 tracking-wider">Upsolve Queue (2)</span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 bg-card border border-border/60 rounded-xl">
                    <span className="font-mono font-bold text-[10px]">CF 1892C</span>
                    <span className="text-[7px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">Solve Now</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-card border border-border/30 rounded-xl opacity-60">
                    <span className="font-mono font-bold text-[10px]">CF 1900B</span>
                    <span className="text-[7px] font-black uppercase tracking-wider text-muted-foreground/60">Pending</span>
                  </div>
                </div>
              </div>
            </m.div>

            {/* Step 3: Learning Roadmaps */}
            <m.div
              initial={{opacity: 0, y: 24}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{duration: 0.5, delay: 0.2}}
              className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden flex flex-col justify-between h-full min-h-[380px]"
            >
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="size-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                    <Sparkles size={22} />
                  </div>
                  <span className="text-4xl font-[1000] leading-none text-primary/10 select-none">03</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                    Learning Roadmaps
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    Follow curated paths with Arabic video lectures, structured problem sets, and XP-based level progression.
                  </p>
                </div>
              </div>

              {/* Micro UI */}
              <div className="mt-8 p-4 bg-background/50 border border-border/40 rounded-2xl text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black uppercase text-[8px] text-muted-foreground/80 tracking-wider">Roadmap Progress</span>
                  <span className="text-primary font-bold">68%</span>
                </div>
                <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[68%] rounded-full" />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <div className="size-5 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <Play size={10} className="fill-primary text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-[8px] font-bold text-muted-foreground/60 leading-none">Next Lecture</span>
                    <span className="text-[10px] font-bold text-muted-foreground/85 leading-tight truncate block">Graphs: BFS & DFS Basics</span>
                  </div>
                </div>
              </div>
            </m.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CloseTheLoopSection;
