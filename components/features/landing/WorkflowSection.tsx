"use client";

import {m} from "framer-motion";
import {RefreshCw, Target, Zap, BarChart3, ArrowRight} from "lucide-react";
import Orb from "./Orb";

const steps = [
  {
    n: "01",
    title: "Sync",
    desc: "Connect your handle; ratings and submissions populate.",
    icon: RefreshCw,
    ui: (
      <div className="mt-6 p-3 bg-background/50 border border-border/40 rounded-xl text-[10px] space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="font-bold text-muted-foreground/60">Handle Sync</span>
          <span className="text-[7px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 tracking-wider">Synced</span>
        </div>
        <div className="font-mono bg-card p-1.5 border border-border/60 rounded text-primary font-bold text-center">
          tourist
        </div>
      </div>
    ),
  },
  {
    n: "02",
    title: "Configure",
    desc: "Pick a mode, set tags and rating band.",
    icon: Target,
    ui: (
      <div className="mt-6 p-3 bg-background/50 border border-border/40 rounded-xl text-[10px] space-y-2">
        <div className="flex justify-between items-center text-muted-foreground/60 font-bold">
          <span>Mode: Ladder</span>
          <span>Rating Band</span>
        </div>
        <div className="flex gap-1">
          <span className="bg-primary/10 border border-primary/20 text-primary text-[7px] font-black px-1.5 py-0.5 rounded uppercase">dp</span>
          <span className="bg-primary/10 border border-primary/20 text-primary text-[7px] font-black px-1.5 py-0.5 rounded uppercase">graphs</span>
        </div>
        <div className="w-full h-1 bg-muted rounded relative">
          <div className="absolute left-[25%] right-[20%] h-full bg-primary rounded" />
          <div className="absolute left-[25%] -translate-x-1/2 -translate-y-[2px] size-1.5 rounded-full bg-primary" />
          <div className="absolute right-[20%] translate-x-1/2 -translate-y-[2px] size-1.5 rounded-full bg-primary" />
        </div>
      </div>
    ),
  },
  {
    n: "03",
    title: "Train & Review",
    desc: "Run timed sessions, then debrief with reviews.",
    icon: Zap,
    ui: (
      <div className="mt-6 p-3 bg-background/50 border border-border/40 rounded-xl text-[10px] space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-bold text-muted-foreground/60">Session Active</span>
          <span className="font-mono text-[9px] font-black text-amber-500">01:42:15</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[8px] border-b border-border/40 pb-0.5">
            <span className="font-mono text-muted-foreground">Problem A</span>
            <span className="text-emerald-500 font-bold">✓ 18m</span>
          </div>
          <div className="flex justify-between text-[8px]">
            <span className="font-mono text-muted-foreground">Problem B</span>
            <span className="text-muted-foreground/60">Solving...</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    n: "04",
    title: "Analyze",
    desc: "Use stats, trajectories, and upsolve list to steer your next block.",
    icon: BarChart3,
    ui: (
      <div className="mt-6 p-3 bg-background/50 border border-border/40 rounded-xl text-[10px] space-y-2">
        <div className="flex justify-between items-center text-muted-foreground/60 font-bold">
          <span>Performance</span>
          <span className="text-primary font-black">+45 rating</span>
        </div>
        <div className="h-10 w-full flex items-end gap-1.5 px-0.5 justify-between">
          {[
            { h: "h-[30%]" },
            { h: "h-[45%]" },
            { h: "h-[40%]" },
            { h: "h-[60%]" },
            { h: "h-[55%]" },
            { h: "h-[80%]" }
          ].map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col justify-end h-full">
              <div className={`w-full rounded-t-sm bg-gradient-to-t from-primary/30 to-primary ${item.h}`} />
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const WorkflowSection = () => (
  <section className="py-32 relative overflow-hidden">
    <Orb className="size-[400px] bg-primary/6 bottom-[10%] left-[5%]" />

    <div className="container mx-auto px-6 relative z-10">
      <m.div
        initial={{opacity: 0, y: 16}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true}}
        className="text-center max-w-2xl mx-auto mb-24 space-y-4"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
          Workflow
        </span>
        <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-[0.95]">
          <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">The Evolution</span>{" "}
          <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Protocol</span>
        </h2>
        <p className="text-muted-foreground font-medium text-lg pt-1">
          One repeatable loop from sync to insight, run it every week.
        </p>
      </m.div>

      {/* Grid Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {steps.map((s, i) => (
          <m.div
            key={s.n}
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{delay: i * 0.08}}
            className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden flex flex-col justify-between min-h-[350px]"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
            
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="size-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                  <s.icon size={22} />
                </div>
                <span className="text-4xl font-[1000] leading-none text-primary/10 select-none">{s.n}</span>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                  {s.title}
                </h4>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>

            {/* Connecting arrows for lg screen width */}
            {i < steps.length - 1 && (
              <div className="hidden lg:flex absolute top-[25%] right-[-16px] translate-x-1/2 z-20 size-8 rounded-full bg-background border border-border/80 items-center justify-center text-muted-foreground/60 shadow-md">
                <ArrowRight size={14} />
              </div>
            )}

            {/* Micro UI */}
            {s.ui}
          </m.div>
        ))}
      </div>
    </div>
  </section>
);

export default WorkflowSection;
