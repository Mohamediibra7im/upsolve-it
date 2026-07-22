"use client";

import { m as motion } from "framer-motion";
import { ClipboardList, Layers, Sparkles, Clock, Play, ArrowRight } from "lucide-react";

const CloseTheLoopSection = () => {
  return (
    <section className="py-28 relative overflow-hidden bg-[#040604] font-mono text-emerald-400 border-t border-emerald-500/10">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

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
            <Sparkles size={11} className="text-emerald-400 animate-pulse" />
            <span>Continuous Improvement</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase text-white leading-none">
            Close the <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.35)]">Loop</span>
          </h2>

          <p className="text-emerald-500/60 text-xs leading-relaxed max-w-lg mx-auto uppercase tracking-wide">
            Automated session debriefs, upsolve queues, and level-gated roadmaps turn raw practice into permanent rating gains.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[28%] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-emerald-500/10 via-emerald-500/30 to-emerald-500/10 pointer-events-none z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Step 1: Session Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-7 md:p-8 rounded-xl bg-[#060a08]/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between h-full min-h-[400px] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute -inset-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="size-11 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300">
                    <ClipboardList size={20} />
                  </div>
                  <span className="text-3xl font-black leading-none text-emerald-500/20 font-mono group-hover:text-emerald-400/40 transition-colors">
                    01
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight uppercase text-emerald-300">
                    Session Debriefs
                  </h3>
                  <p className="text-xs text-emerald-500/70 leading-relaxed uppercase">
                    Review solve times, difficulty distribution, accuracy per tag, and custom recommendations after every training session.
                  </p>
                </div>
              </div>

              {/* Micro UI */}
              <div className="mt-8 p-4 bg-[#030604] border border-emerald-500/20 rounded-lg text-[10px] space-y-3 font-mono relative z-10">
                <div className="flex justify-between items-center border-b border-emerald-500/15 pb-2">
                  <span className="font-bold uppercase text-[8px] text-emerald-500/50 tracking-wider">SESSION #42 SUMMARY</span>
                  <span className="text-emerald-300 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/20">3/4 SOLVED</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div className="bg-[#070d09] p-2.5 rounded border border-emerald-500/15">
                    <span className="block text-[7.5px] uppercase font-bold text-emerald-500/40 mb-1">AVG SOLVE TIME</span>
                    <span className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                      <Clock size={11} className="text-emerald-400" /> 24m
                    </span>
                  </div>
                  <div className="bg-[#070d09] p-2.5 rounded border border-emerald-500/15">
                    <span className="block text-[7.5px] uppercase font-bold text-emerald-500/40 mb-1">TOP FOCUS</span>
                    <span className="font-bold text-[9px] text-emerald-300">DP, GRAPHS</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 2: Upsolve Queue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-7 md:p-8 rounded-xl bg-[#060a08]/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between h-full min-h-[400px] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute -inset-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="size-11 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300">
                    <Layers size={20} />
                  </div>
                  <span className="text-3xl font-black leading-none text-emerald-500/20 font-mono group-hover:text-emerald-400/40 transition-colors">
                    02
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight uppercase text-emerald-300">
                    Upsolve & Streaks
                  </h3>
                  <p className="text-xs text-emerald-500/70 leading-relaxed uppercase">
                    Unsolved problems are automatically funneled into an upsolve queue so no unsolved problem gets forgotten.
                  </p>
                </div>
              </div>

              {/* Micro UI */}
              <div className="mt-8 p-4 bg-[#030604] border border-emerald-500/20 rounded-lg text-[10px] space-y-2.5 font-mono relative z-10">
                <div className="flex justify-between items-center border-b border-emerald-500/15 pb-2">
                  <span className="font-bold uppercase text-[8px] text-emerald-500/50 tracking-wider">AUTO UPSOLVE QUEUE (2)</span>
                  <span className="text-orange-400 font-bold text-[8px]">🔥 17 DAYS</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 bg-[#070d09] border border-emerald-500/20 rounded">
                    <span className="font-mono font-bold text-[10px] text-emerald-300">CF 1892C</span>
                    <span className="text-[8px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1 hover:bg-emerald-500 hover:text-emerald-950 transition-colors cursor-pointer">
                      SOLVE NOW <ArrowRight size={9} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-[#070d09] border border-emerald-500/10 rounded opacity-60">
                    <span className="font-mono font-bold text-[10px] text-emerald-500/60">CF 1900B</span>
                    <span className="text-[8px] font-bold uppercase text-emerald-500/40">PENDING</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 3: Roadmap Progression */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-7 md:p-8 rounded-xl bg-[#060a08]/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between h-full min-h-[400px] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
              <div className="absolute -inset-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="size-11 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300">
                    <Sparkles size={20} />
                  </div>
                  <span className="text-3xl font-black leading-none text-emerald-500/20 font-mono group-hover:text-emerald-400/40 transition-colors">
                    03
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight uppercase text-emerald-300">
                    Level-Gated Progression
                  </h3>
                  <p className="text-xs text-emerald-500/70 leading-relaxed uppercase">
                    Level up through structured topic roadmaps, video tutorials, and handpicked problem sets.
                  </p>
                </div>
              </div>

              {/* Micro UI */}
              <div className="mt-8 p-4 bg-[#030604] border border-emerald-500/20 rounded-lg text-[10px] space-y-3 font-mono relative z-10">
                <div className="flex justify-between items-center text-[8px] font-bold text-emerald-500/50 uppercase border-b border-emerald-500/15 pb-2">
                  <span>ROADMAP CURRICULUM</span>
                  <span className="text-emerald-300">60% COMPLETE</span>
                </div>

                <div className="w-full bg-emerald-950/40 h-2 rounded-full overflow-hidden border border-emerald-500/20">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full w-[60%] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <div className="size-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                    <Play size={10} className="fill-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[7.5px] font-bold text-emerald-500/40 uppercase">NEXT LECTURE</span>
                    <span className="text-[9.5px] font-bold text-emerald-300 uppercase truncate block">Graphs: BFS & DFS Traversal</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CloseTheLoopSection;
