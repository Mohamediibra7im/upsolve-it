"use client";

import { useState } from "react";
import { AnimatePresence, m as motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, CheckSquare, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const GamifiedShowcase = () => {
  const [activeTab, setActiveTab] = useState<"problems" | "podium">("problems");
  const [problems, setProblems] = useState([
    { id: 1, name: "1582F - Linear Dynamics", rating: 1700, solved: true },
    { id: 2, name: "1619E - Mex and Increments", rating: 1800, solved: false },
    { id: 3, name: "1622D - Shuffle", rating: 1900, solved: false },
  ]);
  const [xp, setXp] = useState(450);
  const [floatXp, setFloatXp] = useState<{
    show: boolean;
    amount: number;
    key: number;
  }>({
    show: false,
    amount: 0,
    key: 0,
  });

  const toggleProblem = (id: number) => {
    setProblems(
      problems.map((p) => {
        if (p.id === id) {
          const newSolved = !p.solved;
          const diff = newSolved ? 150 : -150;
          setXp((prev) => Math.max(0, prev + diff));
          setFloatXp({ show: true, amount: diff, key: Date.now() });
          return { ...p, solved: newSolved };
        }
        return p;
      })
    );
  };

  return (
    <section className="py-24 relative overflow-hidden bg-[#040604] font-mono text-emerald-400 border-t border-emerald-500/10">
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-500/45">
            {"// Track Your Progress"}
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-white leading-none">
            Practice Gamified
          </h2>
          <p className="text-emerald-500/50 text-xs leading-relaxed max-w-lg mx-auto uppercase">
            We've integrated a powerful checkbox-based roadmap progress tracker and a premium rewards system.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Feature Selector */}
          <div className="lg:col-span-5 space-y-4">
            <div className="space-y-4">
              {[
                {
                  title: "Checkbox-Based Problem Solving",
                  desc: "Check off completed problems manually to immediately record progress, gain rating weights, and trigger local recalculations.",
                  icon: CheckSquare,
                  tab: "problems",
                },
                {
                  title: "Dynamic Leaderboard Podium",
                  desc: "Top 3 competitors stand tall on an animated visual podium. Real-time ranking with rating division color codes and user highlights.",
                  icon: Crown,
                  tab: "podium",
                },
              ].map((item, idx) => {
                const isSelected = activeTab === item.tab;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => setActiveTab(item.tab as any)}
                    className={cn(
                      "flex gap-4 p-5 rounded-sm border transition-all duration-300 cursor-pointer select-none",
                      isSelected
                        ? "bg-[#060a08]/40 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.08)]"
                        : "bg-transparent border-transparent hover:bg-[#060a08]/20 hover:border-emerald-500/10"
                    )}
                  >
                    <div
                      className={cn(
                        "size-10 rounded-sm flex items-center justify-center shrink-0 border transition-all",
                        isSelected
                          ? "bg-emerald-500 border-emerald-500 text-emerald-950"
                          : "bg-emerald-500/5 border-emerald-500/15 text-emerald-400"
                      )}
                    >
                      <item.icon size={16} />
                    </div>
                    <div className="space-y-1">
                      <h4
                        className={cn(
                          "font-bold text-xs uppercase tracking-wider transition-colors",
                          isSelected ? "text-emerald-300" : "text-emerald-400/80"
                        )}
                      >
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Mockup Console */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-sm border border-emerald-500/20 bg-[#060a08] shadow-[0_4px_16px_rgba(0,0,0,0.5)] p-6"
            >
              {/* Tab Selector Headers */}
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4 mb-6">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-sm bg-red-500/60" />
                  <div className="size-2 rounded-sm bg-yellow-500/60" />
                  <div className="size-2 rounded-sm bg-emerald-500/60" />
                  <span className="text-[8px] font-bold text-emerald-500/40 ml-2 uppercase tracking-widest">
                    UPSOLVE_SANDBOX // SIMULATION_MODE
                  </span>
                </div>

                <div className="flex items-center gap-1.5 p-0.5 bg-emerald-950/20 border border-emerald-500/15 rounded-sm">
                  {(["problems", "podium"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider rounded-sm transition-all duration-200",
                        activeTab === tab
                          ? "bg-emerald-500 text-emerald-950"
                          : "text-emerald-500/50 hover:text-emerald-300"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="min-h-[260px] flex flex-col justify-between">
                {/* 1. Problems / Checkbox Mockup */}
                {activeTab === "problems" && (
                  <motion.div
                    key="problems"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between bg-emerald-950/5 border border-emerald-500/10 rounded-sm px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Trophy size={14} className="text-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                          Dynamic Programming
                        </span>
                      </div>
                      <div className="relative flex items-center gap-2 text-[9px]">
                        <span className="font-bold text-emerald-500/40">
                          XP_POOL:
                        </span>
                        <span className="font-bold bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-sm border border-emerald-500/15">
                          {xp} / 1000
                        </span>

                        {/* Float XP Indicator */}
                        <AnimatePresence>
                          {floatXp.show && (
                            <motion.span
                              key={floatXp.key}
                              initial={{ opacity: 0, y: 0, scale: 0.8 }}
                              animate={{ opacity: 1, y: -20, scale: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className={cn(
                                "absolute right-0 font-bold text-[9px] px-1.5 py-0.5 rounded-sm border font-mono",
                                floatXp.amount > 0
                                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                  : "text-red-400 bg-red-500/10 border-red-500/20"
                              )}
                            >
                              {floatXp.amount > 0 ? `+${floatXp.amount}` : floatXp.amount} XP
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {problems.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => toggleProblem(p.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-sm border transition-all duration-200 cursor-pointer select-none group/row",
                            p.solved
                              ? "bg-emerald-500/[0.01] border-emerald-500/20 hover:bg-emerald-500/[0.03]"
                              : "bg-[#060a08]/50 border-emerald-500/10 hover:bg-emerald-500/5"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox button */}
                            <div
                              className={cn(
                                "size-4 rounded-sm border flex items-center justify-center transition-all",
                                p.solved
                                  ? "bg-emerald-500 border-emerald-500 text-emerald-950"
                                  : "border-emerald-500/35 bg-[#040604] group-hover/row:border-emerald-400"
                              )}
                            >
                              {p.solved && <Check size={10} strokeWidth={3} />}
                            </div>

                            <span
                              className={cn(
                                "text-[10px] font-bold transition-all uppercase tracking-wide",
                                p.solved
                                  ? "line-through text-emerald-500/30"
                                  : "text-emerald-300"
                              )}
                            >
                              {p.name}
                            </span>
                          </div>

                          <span
                            className={cn(
                              "text-[8.5px] font-bold px-2 py-0.5 rounded-sm border",
                              p.rating >= 1900
                                ? "text-purple-400 bg-purple-950/10 border-purple-500/20"
                                : p.rating >= 1800
                                ? "text-blue-400 bg-blue-950/10 border-blue-500/20"
                                : "text-cyan-400 bg-cyan-950/10 border-cyan-500/20"
                            )}
                          >
                            {p.rating}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1 text-center">
                      <span className="text-[7.5px] font-bold text-emerald-500/35 uppercase">
                        &gt;&gt; CLICK ON ENTRIES TO SIMULATE COMPLETED ACTION STACKS
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* 2. Podium Leaderboard Mockup */}
                {activeTab === "podium" && (
                  <motion.div
                    key="podium"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col justify-between h-full"
                  >
                    <div className="text-center mb-4">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/40">
                        TOP_COMPETITORS // DETAILED_GRID
                      </span>
                    </div>

                    {/* 3D Podium Render */}
                    <div className="grid grid-cols-3 gap-4 items-end max-w-xs mx-auto w-full pt-6">
                      {/* 2nd Place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <Avatar className="size-9 border border-slate-500/30 rounded-sm">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-emerald-950/40 text-[9px] font-bold text-emerald-400">
                              BQ
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-slate-400 font-bold text-[7.5px] bg-[#060a08] border border-slate-500/20 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                            II
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-300 truncate w-full text-center uppercase tracking-wide">
                          Benq
                        </span>
                        <span className="text-[7px] font-bold text-blue-400 uppercase tracking-wider">
                          MASTER
                        </span>
                        {/* Podium Block */}
                        <div className="w-full h-16 mt-2 bg-slate-500/5 rounded-t-sm border-t border-x border-slate-500/15 flex items-center justify-center">
                          <span className="text-md font-bold text-slate-500/20">
                            2
                          </span>
                        </div>
                      </div>

                      {/* 1st Place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <div className="absolute -inset-1 rounded-sm bg-emerald-500/10 blur-[3px] opacity-40 animate-pulse" />
                          <Avatar className="relative size-11 border border-emerald-400/45 rounded-sm">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-emerald-950/40 text-[10px] font-bold text-emerald-300">
                              TR
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-emerald-300 font-bold text-[7.5px] bg-[#060a08] border border-emerald-400/30 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                            I
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-300 truncate w-full text-center uppercase tracking-wide">
                          tourist
                        </span>
                        <span className="text-[7px] font-bold text-red-400 uppercase tracking-wider">
                          GM_CLASS
                        </span>
                        {/* Podium Block */}
                        <div className="w-full h-24 mt-2 bg-emerald-500/5 rounded-t-sm border-t border-x border-emerald-500/20 flex items-center justify-center">
                          <span className="text-lg font-bold text-emerald-500/20">
                            1
                          </span>
                        </div>
                      </div>

                      {/* 3rd Place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <Avatar className="size-8 border border-amber-700/30 rounded-sm">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-emerald-950/40 text-[9px] font-bold text-emerald-400">
                              EC
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-600/70 font-bold text-[7.5px] bg-[#060a08] border border-amber-700/20 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                            III
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-300 truncate w-full text-center uppercase tracking-wide">
                          ecnerwala
                        </span>
                        <span className="text-[7px] font-bold text-blue-400 uppercase tracking-wider">
                          MASTER
                        </span>
                        {/* Podium Block */}
                        <div className="w-full h-11 mt-2 bg-amber-700/5 rounded-t-sm border-t border-x border-amber-700/15 flex items-center justify-center">
                          <span className="text-xs font-bold text-amber-700/20">
                            3
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GamifiedShowcase;
