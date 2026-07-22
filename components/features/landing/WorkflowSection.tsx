"use client";

import { m as motion } from "framer-motion";
import { RefreshCw, Target, Zap, BarChart3, ArrowRight, Cpu } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Sync Handle",
    desc: "Link your handle once; rating trends & submission data auto-sync via public CF APIs.",
    icon: RefreshCw,
    ui: (
      <div className="mt-6 p-3.5 bg-[#030604] border border-emerald-500/20 rounded-lg text-[10px] space-y-2 font-mono">
        <div className="flex justify-between items-center text-[8px] font-bold text-emerald-500/50 uppercase border-b border-emerald-500/15 pb-1.5">
          <span>HANDLE_DAEMON</span>
          <span className="text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded border border-emerald-500/20">LIVE</span>
        </div>
        <div className="font-mono bg-[#070d09] p-2 border border-emerald-500/20 rounded text-emerald-300 font-bold text-center text-xs shadow-inner">
          tourist
        </div>
      </div>
    ),
  },
  {
    n: "02",
    title: "Configure Session",
    desc: "Select a training mode, fine-tune tag filters, and set target rating bounds.",
    icon: Target,
    ui: (
      <div className="mt-6 p-3.5 bg-[#030604] border border-emerald-500/20 rounded-lg text-[10px] space-y-2 font-mono">
        <div className="flex justify-between items-center text-[8px] font-bold text-emerald-500/50 uppercase border-b border-emerald-500/15 pb-1.5">
          <span>MODE: LADDER</span>
          <span className="text-emerald-300 font-bold">1400 - 1700</span>
        </div>
        <div className="flex gap-1.5 pt-0.5">
          <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[8px] font-bold px-2 py-0.5 rounded uppercase">DP</span>
          <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[8px] font-bold px-2 py-0.5 rounded uppercase">GRAPHS</span>
        </div>
      </div>
    ),
  },
  {
    n: "03",
    title: "Train & Debrief",
    desc: "Solve timed problems in focus mode, then complete your post-session review.",
    icon: Zap,
    ui: (
      <div className="mt-6 p-3.5 bg-[#030604] border border-emerald-500/20 rounded-lg text-[10px] space-y-2 font-mono">
        <div className="flex justify-between items-center text-[8px] font-bold text-emerald-500/50 uppercase border-b border-emerald-500/15 pb-1.5">
          <span>ACTIVE TIMER</span>
          <span className="font-mono text-[9px] font-bold text-orange-400">01:42:15</span>
        </div>
        <div className="space-y-1 pt-0.5">
          <div className="flex justify-between text-[8.5px]">
            <span className="text-emerald-500/60 font-bold">PROBLEM 1892C</span>
            <span className="text-emerald-300 font-bold">✓ 18m</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    n: "04",
    title: "Analyze & Repeat",
    desc: "Track trajectory metrics and upsolve weaknesses to optimize your next training block.",
    icon: BarChart3,
    ui: (
      <div className="mt-6 p-3.5 bg-[#030604] border border-emerald-500/20 rounded-lg text-[10px] space-y-2 font-mono">
        <div className="flex justify-between items-center text-[8px] font-bold text-emerald-500/50 uppercase border-b border-emerald-500/15 pb-1.5">
          <span>30D TRAJECTORY</span>
          <span className="text-emerald-300 font-bold">+180 XP</span>
        </div>
        <div className="h-7 w-full flex items-end gap-1 px-0.5 justify-between pt-1">
          {[
            { h: "h-[35%]" },
            { h: "h-[50%]" },
            { h: "h-[40%]" },
            { h: "h-[70%]" },
            { h: "h-[60%]" },
            { h: "h-[100%]" },
          ].map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col justify-end h-full">
              <div className={`w-full rounded-xs bg-gradient-to-t from-emerald-600/40 to-emerald-400 ${item.h}`} />
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const WorkflowSection = () => (
  <section className="py-28 relative overflow-hidden bg-[#040604] font-mono text-emerald-400 border-t border-emerald-500/10">
    {/* Ambient lighting */}
    <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

    <div className="container mx-auto max-w-6xl px-4 relative z-10">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto mb-20 space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950/40 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-400/90 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
          <Cpu size={11} className="text-emerald-400 animate-pulse" />
          <span>System Architecture</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase text-white leading-none">
          The Evolution <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.35)]">Protocol</span>
        </h2>

        <p className="text-emerald-500/60 text-xs leading-relaxed max-w-lg mx-auto uppercase tracking-wide">
          A structured 4-step execution loop designed to continuously analyze weaknesses and drive steady rating progression.
        </p>
      </motion.div>

      {/* Grid Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="p-7 rounded-xl bg-[#060a08]/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-500 group relative flex flex-col justify-between min-h-[360px] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute -inset-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="flex justify-between items-start">
                <div className="size-11 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300">
                  <s.icon size={20} />
                </div>
                <span className="text-3xl font-black leading-none text-emerald-500/20 font-mono group-hover:text-emerald-400/40 transition-colors">
                  {s.n}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold uppercase tracking-wide text-emerald-300">
                  {s.title}
                </h4>
                <p className="text-xs text-emerald-500/70 leading-relaxed uppercase">
                  {s.desc}
                </p>
              </div>
            </div>

            {/* Connecting arrow dividers on desktop */}
            {i < steps.length - 1 && (
              <div className="hidden lg:flex absolute top-[30%] right-[-14px] translate-x-1/2 z-20 size-7 rounded-full bg-[#030604] border border-emerald-500/30 items-center justify-center text-emerald-400 shadow-md">
                <ArrowRight size={13} />
              </div>
            )}

            {/* Micro UI */}
            <div className="relative z-10">{s.ui}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WorkflowSection;
