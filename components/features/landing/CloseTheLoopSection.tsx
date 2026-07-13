"use client";

import { m as motion } from "framer-motion";
import { ClipboardList, Layers, Sparkles, Clock, Play } from "lucide-react";

const CloseTheLoopSection = () => {
  return (
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
            {"// After Every Session"}
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-white leading-none">
            Close the Loop
          </h2>
          <p className="text-emerald-500/50 text-xs leading-relaxed max-w-lg mx-auto uppercase">
            Reviews, upsolving, and roadmaps turn raw practice into lasting gains.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[35%] left-[15%] right-[15%] h-[1px] border-t border-dashed border-emerald-500/15 pointer-events-none z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            
            {/* Step 1: Session Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 md:p-8 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between h-full min-h-[380px]"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                    <ClipboardList size={18} />
                  </div>
                  <span className="text-2xl font-black leading-none text-emerald-500/10">01</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-md font-bold tracking-tight uppercase text-emerald-300">
                    Session Reviews
                  </h3>
                  <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                    Debrief each run with time-per-problem tracking, difficulty analysis, and focused recommendations on what to train next.
                  </p>
                </div>
              </div>

              {/* Micro UI */}
              <div className="mt-8 p-4 bg-emerald-950/5 border border-emerald-500/10 rounded-sm text-[9px] space-y-2.5 font-mono">
                <div className="flex justify-between items-center border-b border-emerald-500/10 pb-2">
                  <span className="font-bold uppercase text-[7px] text-emerald-500/40 tracking-wider">Session #42 Completed</span>
                  <span className="text-emerald-300 font-bold">3/4 Solved</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-[#060a08] p-2 rounded-sm border border-emerald-500/10">
                    <span className="block text-[7px] uppercase font-bold text-emerald-500/35 mb-0.5">Average Time</span>
                    <span className="font-bold text-xs font-mono text-emerald-300 flex items-center gap-1">
                      <Clock size={10} /> 24m
                    </span>
                  </div>
                  <div className="bg-[#060a08] p-2 rounded-sm border border-emerald-500/10">
                    <span className="block text-[7px] uppercase font-bold text-emerald-500/35 mb-0.5">Focus Areas</span>
                    <span className="font-bold text-[8px] text-emerald-400">DP, Graphs</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 2: Upsolve & Streaks */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 md:p-8 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between h-full min-h-[380px]"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                    <Layers size={18} />
                  </div>
                  <span className="text-2xl font-black leading-none text-emerald-500/10">02</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-md font-bold tracking-tight uppercase text-emerald-300">
                    Upsolve & Streaks
                  </h3>
                  <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                    Unsolved problems auto-queue for later. Track daily streaks, best streaks, and a consistency score to stay on track.
                  </p>
                </div>
              </div>

              {/* Micro UI */}
              <div className="mt-8 p-4 bg-emerald-950/5 border border-emerald-500/10 rounded-sm text-[9px] space-y-2 font-mono">
                <span className="block font-bold uppercase text-[7px] text-emerald-500/40 tracking-wider">Upsolve Queue (2)</span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-1.5 bg-[#060a08] border border-emerald-500/10 rounded-sm">
                    <span className="font-mono font-bold text-[9px] text-emerald-300">CF 1892C</span>
                    <span className="text-[6.5px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-sm border border-emerald-500/20 hover:bg-emerald-500 hover:text-emerald-950 transition-colors cursor-pointer">[ Solve Now ]</span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 bg-[#060a08] border border-emerald-500/5 rounded-sm opacity-60">
                    <span className="font-mono font-bold text-[9px] text-emerald-500/65">CF 1900B</span>
                    <span className="text-[6.5px] font-bold uppercase tracking-wider text-emerald-500/35">Pending</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 3: Learning Roadmaps */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 md:p-8 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between h-full min-h-[380px]"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-2xl font-black leading-none text-emerald-500/10">03</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-md font-bold tracking-tight uppercase text-emerald-300">
                    Learning Roadmaps
                  </h3>
                  <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                    Follow curated paths with Arabic video lectures, structured problem sets, and XP-based level progression.
                  </p>
                </div>
              </div>

              {/* Micro UI */}
              <div className="mt-8 p-4 bg-emerald-950/5 border border-emerald-500/10 rounded-sm text-[9px] space-y-2 font-mono">
                <div className="flex justify-between items-center text-[7px]">
                  <span className="font-bold uppercase text-emerald-500/40 tracking-wider">Roadmap Progress</span>
                  <span className="text-emerald-300 font-bold">60%</span>
                </div>
                
                {/* Monospace progress blocks */}
                <div className="text-[9px] tabular-nums flex items-center">
                  <span className="text-emerald-500/30">[</span>
                  <span className="text-emerald-400">██████</span>
                  <span className="text-emerald-500/15">░░░░</span>
                  <span className="text-emerald-500/30">]</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <div className="size-5 rounded-sm bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <Play size={10} className="fill-emerald-400 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[7px] font-bold text-emerald-500/35 leading-none uppercase">Next Lecture</span>
                    <span className="text-[9px] font-bold text-emerald-300 leading-tight truncate block uppercase">Graphs: BFS & DFS Basics</span>
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
