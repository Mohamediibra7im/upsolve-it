"use client";

import { m as motion } from "framer-motion";
import { RefreshCw, Target, Zap, BarChart3, ArrowRight } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Sync",
    desc: "Connect your handle; ratings and submissions populate.",
    icon: RefreshCw,
    ui: (
      <div className="mt-6 p-3 bg-emerald-950/5 border border-emerald-500/10 rounded-sm text-[10px] space-y-1.5 font-mono">
        <div className="flex justify-between items-center">
          <span className="font-bold text-emerald-500/40">Handle Sync</span>
          <span className="text-[7px] font-bold uppercase text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded-sm border border-emerald-500/20 tracking-wider">Synced</span>
        </div>
        <div className="font-mono bg-[#060a08] p-1.5 border border-emerald-500/15 rounded-sm text-emerald-300 font-bold text-center">
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
      <div className="mt-6 p-3 bg-emerald-950/5 border border-emerald-500/10 rounded-sm text-[10px] space-y-2 font-mono">
        <div className="flex justify-between items-center text-emerald-500/40 font-bold">
          <span>Mode: Ladder</span>
          <span>Rating Band</span>
        </div>
        <div className="flex gap-1">
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[7px] font-bold px-1.5 py-0.5 rounded-sm uppercase">dp</span>
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[7px] font-bold px-1.5 py-0.5 rounded-sm uppercase">graphs</span>
        </div>
        <div className="w-full h-1 bg-emerald-950/20 rounded-sm relative">
          <div className="absolute left-[25%] right-[20%] h-full bg-emerald-500 rounded-sm" />
          <div className="absolute left-[25%] -translate-x-1/2 -translate-y-[2px] size-1.5 rounded-sm bg-emerald-400" />
          <div className="absolute right-[20%] translate-x-1/2 -translate-y-[2px] size-1.5 rounded-sm bg-emerald-400" />
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
      <div className="mt-6 p-3 bg-emerald-950/5 border border-emerald-500/10 rounded-sm text-[10px] space-y-2 font-mono">
        <div className="flex justify-between items-center">
          <span className="font-bold text-emerald-500/40">Session Active</span>
          <span className="font-mono text-[9px] font-bold text-amber-500">01:42:15</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-[8px] border-b border-emerald-500/10 pb-0.5">
            <span className="font-mono text-emerald-500/50">Problem A</span>
            <span className="text-emerald-400 font-bold">✓ 18m</span>
          </div>
          <div className="flex justify-between text-[8px]">
            <span className="font-mono text-emerald-500/50">Problem B</span>
            <span className="text-emerald-500/30">Solving...</span>
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
      <div className="mt-6 p-3 bg-emerald-950/5 border border-emerald-500/10 rounded-sm text-[10px] space-y-2 font-mono">
        <div className="flex justify-between items-center text-emerald-500/40 font-bold">
          <span>Performance</span>
          <span className="text-emerald-300 font-bold">+45 rating</span>
        </div>
        <div className="h-10 w-full flex items-end gap-1 px-0.5 justify-between">
          {[
            { h: "h-[30%]" },
            { h: "h-[45%]" },
            { h: "h-[40%]" },
            { h: "h-[60%]" },
            { h: "h-[55%]" },
            { h: "h-[80%]" }
          ].map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col justify-end h-full">
              <div className={`w-full rounded-sm bg-emerald-500/40 group-hover:bg-emerald-500 transition-colors ${item.h}`} />
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const WorkflowSection = () => (
  <section className="py-24 relative overflow-hidden bg-[#040604] font-mono text-emerald-400 border-t border-emerald-500/10">
    <div className="container mx-auto max-w-6xl px-4 relative z-10">
      
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center max-w-2xl mx-auto mb-16 space-y-3"
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-500/45">
          {"// Workflow Protocol"}
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-white leading-none">
          The Evolution Protocol
        </h2>
        <p className="text-emerald-500/50 text-xs leading-relaxed max-w-lg mx-auto uppercase">
          One repeatable loop from sync to insight, run it every week.
        </p>
      </motion.div>

      {/* Grid Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="p-6 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 group relative flex flex-col justify-between min-h-[340px]"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                  <s.icon size={18} />
                </div>
                <span className="text-2xl font-black leading-none text-emerald-500/10">{s.n}</span>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-md font-bold uppercase tracking-wide text-emerald-300">
                  {s.title}
                </h4>
                <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                  {s.desc}
                </p>
              </div>
            </div>

            {/* Connecting arrows for lg screen width */}
            {i < steps.length - 1 && (
              <div className="hidden lg:flex absolute top-[25%] right-[-14px] translate-x-1/2 z-20 size-6 rounded-sm bg-[#060a08] border border-emerald-500/15 items-center justify-center text-emerald-500/40">
                <ArrowRight size={12} />
              </div>
            )}

            {/* Micro UI */}
            {s.ui}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WorkflowSection;
