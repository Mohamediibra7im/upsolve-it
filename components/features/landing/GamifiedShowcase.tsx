"use client";

import { useState } from "react";
import { AnimatePresence, m as motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Trophy,
  Crown,
  CheckSquare,
  Check,
  Zap,
  Flame,
  Sparkles,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GamifiedShowcase = () => {
  const [activeTab, setActiveTab] = useState<"problems" | "podium">("problems");
  const [problems, setProblems] = useState([
    { id: 1, name: "1582F - Linear Dynamics", tag: "Dynamic Programming", rating: 1700, solved: true, xp: 150 },
    { id: 2, name: "1619E - Mex and Increments", tag: "Greedy / Math", rating: 1800, solved: false, xp: 200 },
    { id: 3, name: "1622D - Shuffle", tag: "Combinatorics", rating: 1900, solved: false, xp: 250 },
  ]);
  const [xp, setXp] = useState(450);
  const [combo, setCombo] = useState(3);
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
          const diff = newSolved ? p.xp : -p.xp;
          setXp((prev) => Math.max(0, prev + diff));
          if (newSolved) setCombo((c) => c + 1);
          else setCombo((c) => Math.max(0, c - 1));
          setFloatXp({ show: true, amount: diff, key: Date.now() });
          return { ...p, solved: newSolved };
        }
        return p;
      })
    );
  };

  return (
    <section className="py-28 relative overflow-hidden bg-[#040604] font-mono text-emerald-400 border-t border-emerald-500/10">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-400/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950/40 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-400/90 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
            <Zap size={11} className="text-emerald-400 animate-pulse fill-emerald-400/20" />
            <span>Motivation & Rewards</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase text-white leading-none">
            Practice <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.35)]">Gamified</span>
          </h2>

          <p className="text-emerald-500/60 text-xs leading-relaxed max-w-lg mx-auto uppercase tracking-wide">
            Turn your upsolve routines into an RPG progression system with interactive problem tracking, XP rewards, and dynamic leaderboard podiums.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Feature Selector */}
          <div className="lg:col-span-5 space-y-4">
            {[
              {
                title: "Interactive Checkbox Solves",
                desc: "Check off solved problems to instantly gain XP, trigger local rating recalculations, and build your daily solve multiplier.",
                icon: CheckSquare,
                tab: "problems",
                badge: "LIVE DEMO",
              },
              {
                title: "Dynamic Leaderboard Podium",
                desc: "Top competitors stand tall on an animated visual 3D podium. Real-time ranking with rating division color codes and user highlights.",
                icon: Crown,
                tab: "podium",
                badge: "PODIUM ARENA",
              },
            ].map((item, idx) => {
              const isSelected = activeTab === item.tab;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  onClick={() => setActiveTab(item.tab as any)}
                  className={cn(
                    "p-6 rounded-lg border transition-all duration-300 cursor-pointer select-none relative overflow-hidden group backdrop-blur-md",
                    isSelected
                      ? "bg-[#060a08]/80 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      : "bg-[#060a08]/30 border-emerald-500/15 hover:bg-[#060a08]/60 hover:border-emerald-500/30"
                  )}
                >
                  {/* Left accent highlight bar */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 bottom-0 w-1 transition-all duration-300",
                      isSelected ? "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-transparent"
                    )}
                  />

                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "size-11 rounded-md flex items-center justify-center shrink-0 border transition-all duration-300",
                        isSelected
                          ? "bg-emerald-500 border-emerald-400 text-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/40"
                      )}
                    >
                      <item.icon size={20} />
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={cn(
                            "font-bold text-sm uppercase tracking-wider transition-colors",
                            isSelected ? "text-emerald-300" : "text-emerald-400/80"
                          )}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-500/60 leading-relaxed uppercase">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Dynamic Interactive Console */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative rounded-xl border border-emerald-500/25 bg-[#060a08]/90 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.6)] p-6 overflow-hidden"
            >
              {/* Console Window Topbar */}
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-red-500/70" />
                  <div className="size-2.5 rounded-full bg-yellow-500/70" />
                  <div className="size-2.5 rounded-full bg-emerald-500/70" />
                  <span className="text-[9.5px] font-bold text-emerald-500/50 ml-2 uppercase tracking-widest hidden sm:inline">
                    GAMIFIED_PROGRESSION_ENGINE // SIMULATOR
                  </span>
                </div>

                <div className="flex items-center gap-1 p-1 bg-[#030604] border border-emerald-500/20 rounded-md">
                  {(["problems", "podium"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all duration-300",
                        activeTab === tab
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                          : "text-emerald-500/40 hover:text-emerald-300"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="min-h-[290px] flex flex-col justify-between">
                {/* Mode 1: Problems Checkbox Sandbox */}
                {activeTab === "problems" && (
                  <motion.div
                    key="problems"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {/* XP & Combo Header */}
                    <div className="flex items-center justify-between bg-[#030604] border border-emerald-500/20 rounded-lg p-3.5">
                      <div className="flex items-center gap-2.5">
                        <Trophy size={16} className="text-emerald-400 animate-pulse" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase text-emerald-300">
                            Dynamic Programming Topic
                          </span>
                          <span className="text-[8px] text-emerald-500/50 uppercase">Level 14 // Specialist</span>
                        </div>
                      </div>

                      <div className="relative flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[9px] bg-orange-500/10 border border-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-bold">
                          <Flame size={11} className="fill-orange-400" />
                          <span>{combo} COMBO (1.5x)</span>
                        </div>

                        <div className="font-bold text-[10px] bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/30">
                          {xp} / 1000 XP
                        </div>

                        {/* Floating XP Reward Popups */}
                        <AnimatePresence>
                          {floatXp.show && (
                            <motion.span
                              key={floatXp.key}
                              initial={{ opacity: 0, y: 0, scale: 0.8 }}
                              animate={{ opacity: 1, y: -25, scale: 1.1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className={cn(
                                "absolute right-0 top-0 font-black text-[11px] px-2 py-0.5 rounded border font-mono shadow-lg",
                                floatXp.amount > 0
                                  ? "text-emerald-300 bg-emerald-500/20 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                  : "text-red-400 bg-red-500/20 border-red-400"
                              )}
                            >
                              {floatXp.amount > 0 ? `+${floatXp.amount}` : floatXp.amount} XP
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Interactive Problem Rows */}
                    <div className="space-y-2">
                      {problems.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => toggleProblem(p.id)}
                          className={cn(
                            "flex items-center justify-between p-3.5 rounded-lg border transition-all duration-300 cursor-pointer select-none group/row",
                            p.solved
                              ? "bg-emerald-500/[0.04] border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                              : "bg-[#030604] border-emerald-500/15 hover:bg-emerald-500/[0.02] hover:border-emerald-500/30"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "size-5 rounded flex items-center justify-center border transition-all duration-300",
                                p.solved
                                  ? "bg-emerald-500 border-emerald-400 text-emerald-950 shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                                  : "border-emerald-500/30 bg-[#040604] group-hover/row:border-emerald-400"
                              )}
                            >
                              {p.solved && <Check size={12} strokeWidth={3} />}
                            </div>

                            <div className="flex flex-col">
                              <span
                                className={cn(
                                  "text-[11px] font-bold uppercase transition-all tracking-wide",
                                  p.solved ? "line-through text-emerald-500/40" : "text-emerald-300"
                                )}
                              >
                                {p.name}
                              </span>
                              <span className="text-[8px] text-emerald-500/50 uppercase">{p.tag}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[8.5px] font-bold text-emerald-400/80">+{p.xp} XP</span>
                            <span
                              className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded border font-mono",
                                p.rating >= 1900
                                  ? "text-purple-300 bg-purple-950/30 border-purple-500/30"
                                  : p.rating >= 1800
                                  ? "text-blue-300 bg-blue-950/30 border-blue-500/30"
                                  : "text-cyan-300 bg-cyan-950/30 border-cyan-500/30"
                              )}
                            >
                              {p.rating}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-1 text-center">
                      <span className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-widest flex items-center justify-center gap-1">
                        <Sparkles size={9} /> CLICK ENTRIES TO TOGGLE SOLVED STATE & TEST XP REWARD TRIGGER
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Mode 2: 3D Holographic Podium */}
                {activeTab === "podium" && (
                  <motion.div
                    key="podium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col justify-between h-full space-y-4"
                  >
                    <div className="text-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/50">
                        SEASON 4 // TOP SOLVER PODIUM
                      </span>
                    </div>

                    {/* 3D Podium Render */}
                    <div className="grid grid-cols-3 gap-4 items-end max-w-md mx-auto w-full pt-4 pb-2">
                      {/* 2nd Place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <Avatar className="size-11 border-2 border-slate-400/60 rounded-full shadow-[0_0_12px_rgba(148,163,184,0.3)]">
                            <AvatarFallback className="bg-slate-950 text-[10px] font-bold text-slate-300">
                              BQ
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-slate-300 font-black text-[8px] bg-[#030604] border border-slate-400/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            #2
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-300 truncate w-full text-center uppercase">
                          Benq
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">12.8k XP</span>
                        {/* Podium Block */}
                        <div className="w-full h-20 mt-2 bg-gradient-to-t from-slate-500/10 to-slate-500/20 rounded-t-lg border-t-2 border-x border-slate-400/30 flex flex-col items-center justify-center shadow-lg">
                          <Crown size={16} className="text-slate-400 opacity-60 mb-1" />
                          <span className="text-sm font-black text-slate-300">2nd</span>
                        </div>
                      </div>

                      {/* 1st Place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <div className="absolute -inset-1.5 rounded-full bg-amber-400/20 blur-[6px] animate-pulse" />
                          <Avatar className="relative size-14 border-2 border-amber-400 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                            <AvatarFallback className="bg-amber-950/60 text-xs font-black text-amber-300">
                              TR
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-amber-300 font-black text-[8.5px] bg-[#030604] border border-amber-400/60 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            <Crown size={10} className="fill-amber-400" /> #1
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-amber-300 truncate w-full text-center uppercase tracking-wide">
                          tourist
                        </span>
                        <span className="text-[8px] font-bold text-amber-400/90 uppercase">14.2k XP</span>
                        {/* Podium Block */}
                        <div className="w-full h-28 mt-2 bg-gradient-to-t from-amber-500/15 to-emerald-500/20 rounded-t-lg border-t-2 border-x border-amber-400/40 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                          <Award size={20} className="text-amber-400 mb-1 animate-bounce" />
                          <span className="text-base font-black text-amber-300">1st</span>
                        </div>
                      </div>

                      {/* 3rd Place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <Avatar className="size-10 border-2 border-amber-700/60 rounded-full shadow-[0_0_10px_rgba(180,83,9,0.3)]">
                            <AvatarFallback className="bg-amber-950/40 text-[9px] font-bold text-amber-500">
                              EC
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-500 font-black text-[8px] bg-[#030604] border border-amber-700/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            #3
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-300 truncate w-full text-center uppercase">
                          ecnerwala
                        </span>
                        <span className="text-[8px] font-bold text-amber-600 uppercase">11.1k XP</span>
                        {/* Podium Block */}
                        <div className="w-full h-14 mt-2 bg-gradient-to-t from-amber-800/10 to-amber-700/20 rounded-t-lg border-t-2 border-x border-amber-700/30 flex flex-col items-center justify-center shadow-lg">
                          <span className="text-xs font-black text-amber-600">3rd</span>
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
