"use client";

import {useState} from "react";
import {AnimatePresence, m} from "framer-motion";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  Trophy,
  Crown,
  CheckSquare,
  Check,
} from "lucide-react";
import {cn} from "@/lib/utils";

const GamifiedShowcase = () => {
  const [activeTab, setActiveTab] = useState<"problems" | "podium">("problems");
  const [problems, setProblems] = useState([
    {id: 1, name: "1582F - Linear Dynamics", rating: 1700, solved: true},
    {id: 2, name: "1619E - Mex and Increments", rating: 1800, solved: false},
    {id: 3, name: "1622D - Shuffle", rating: 1900, solved: false},
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
          setFloatXp({show: true, amount: diff, key: Date.now()});
          return {...p, solved: newSolved};
        }
        return p;
      }),
    );
  };

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Centered Section Title */}
        <m.div
          initial={{opacity: 0, y: 16}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          className="text-center max-w-2xl mx-auto mb-24 space-y-4"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Track Your Progress
          </span>
          <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-[0.95]">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">Practice</span>{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Gamified.</span>
          </h2>
          <p className="text-muted-foreground font-medium text-lg pt-1">
            We've integrated a powerful checkbox-based roadmap progress tracker and a premium Trophy-inspired rewards system. Track your climbing trajectory in real time.
          </p>
        </m.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Feature Selector */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-6">
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
                  <m.div
                    key={item.title}
                    initial={{opacity: 0, x: -20}}
                    whileInView={{opacity: 1, x: 0}}
                    viewport={{once: true}}
                    transition={{delay: idx * 0.1}}
                    onClick={() => setActiveTab(item.tab as any)}
                    className={cn(
                      "flex gap-4 p-5 rounded-2xl border transition-all duration-300 cursor-pointer select-none",
                      isSelected
                        ? "bg-card border-primary/30 dark:border-primary/20 shadow-xl shadow-black/[0.02] dark:shadow-black/20"
                        : "bg-transparent border-transparent hover:bg-card/40 hover:border-border/30",
                    )}
                  >
                    <div
                      className={cn(
                        "size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/5 text-primary",
                      )}
                    >
                      <item.icon size={18} />
                    </div>
                    <div className="space-y-1">
                      <h4
                        className={cn(
                          "font-black text-sm uppercase tracking-tight transition-colors",
                          isSelected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </m.div>
                );
              })}
            </div>
          </div>

          {/* Right Mockup Console */}
          <div className="lg:col-span-7">
            <m.div
              initial={{opacity: 0, scale: 0.96}}
              whileInView={{opacity: 1, scale: 1}}
              viewport={{once: true}}
              className="relative rounded-3xl border border-border/80 dark:border-border/40 bg-card/60 dark:bg-card/40 backdrop-blur-2xl shadow-2xl p-6 md:p-8"
            >
              {/* Tab Selector Headers */}
              <div className="flex items-center justify-between border-b border-border/40 dark:border-border/20 pb-4 mb-6">
                <div className="flex items-center gap-1.5">
                  <div className="size-2.5 rounded-full bg-red-400/80" />
                  <div className="size-2.5 rounded-full bg-amber-400/80" />
                  <div className="size-2.5 rounded-full bg-emerald-400/80" />
                  <span className="text-[10px] font-bold text-muted-foreground/50 ml-2 uppercase tracking-widest">
                    Upsolve.it Sandbox
                  </span>
                </div>

                <div className="flex items-center gap-1 bg-muted/65 dark:bg-muted/30 p-0.5 rounded-lg border border-border/40 dark:border-border/20">
                  {(["problems", "podium"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition-all duration-200",
                        activeTab === tab
                          ? "bg-card text-primary shadow-sm"
                          : "text-muted-foreground/60 hover:text-foreground",
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content Pane */}
              <div className="min-h-[300px] flex flex-col justify-between">
                {/* 1. Problems / Checkbox Mockup */}
                {activeTab === "problems" && (
                  <m.div
                    key="problems"
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between bg-primary/[0.04] border border-primary/10 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-primary" />
                        <span className="text-xs font-black uppercase tracking-wider">
                          Dynamic Programming
                        </span>
                      </div>
                      <div className="relative flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground/70">
                          XP Reward Pool
                        </span>
                        <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-md tabular-nums">
                          {xp} / 1000
                        </span>

                        {/* Float XP Indicator */}
                        <AnimatePresence>
                          {floatXp.show && (
                            <m.span
                              key={floatXp.key}
                              initial={{opacity: 0, y: 0, scale: 0.8}}
                              animate={{opacity: 1, y: -24, scale: 1}}
                              exit={{opacity: 0}}
                              transition={{duration: 0.5}}
                              className={cn(
                                "absolute right-0 font-bold text-xs px-1.5 py-0.5 rounded-md border",
                                floatXp.amount > 0
                                  ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                                  : "text-red-500 bg-red-500/10 border-red-500/20",
                              )}
                            >
                              {floatXp.amount > 0
                                ? `+${floatXp.amount}`
                                : floatXp.amount}{" "}
                              XP
                            </m.span>
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
                            "flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 cursor-pointer select-none group/row",
                            p.solved
                              ? "bg-emerald-500/[0.02] border-emerald-500/20 hover:bg-emerald-500/[0.04]"
                              : "bg-muted/20 border-border/60 hover:bg-muted/40",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox button */}
                            <div
                              className={cn(
                                "size-5 rounded-md border flex items-center justify-center transition-all duration-300",
                                p.solved
                                  ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                  : "border-muted-foreground/30 bg-background group-hover/row:border-primary/50",
                              )}
                            >
                              {p.solved && <Check size={12} strokeWidth={3} />}
                            </div>

                            <span
                              className={cn(
                                "text-xs font-bold transition-all duration-300",
                                p.solved
                                  ? "line-through text-muted-foreground/60"
                                  : "text-foreground",
                              )}
                            >
                              {p.name}
                            </span>
                          </div>

                          <span
                            className={cn(
                              "text-[10px] font-black px-2 py-0.5 rounded-md border",
                              p.rating >= 1900
                                ? "text-purple-500 bg-purple-500/5 border-purple-500/15"
                                : p.rating >= 1800
                                  ? "text-blue-500 bg-blue-500/5 border-blue-500/15"
                                  : "text-cyan-500 bg-cyan-500/5 border-cyan-500/15",
                            )}
                          >
                            {p.rating}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-center">
                      <span className="text-[10px] font-semibold text-muted-foreground/40 italic">
                        Click on rows to toggle solved status and test
                        optimistic update mechanics.
                      </span>
                    </div>
                  </m.div>
                )}

                {/* 2. Podium Leaderboard Mockup */}
                {activeTab === "podium" && (
                  <m.div
                    key="podium"
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    className="flex flex-col justify-between h-full"
                  >
                    <div className="text-center mb-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/50">
                        Top Competitors Grid
                      </span>
                    </div>

                    {/* 3D Podium Render */}
                    <div className="grid grid-cols-3 gap-3 md:gap-4 items-end max-w-sm mx-auto w-full pt-10">
                      {/* 2nd Place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <Avatar className="size-10 border-2 border-slate-300">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-slate-100 text-xs font-bold text-slate-700">
                              CF
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-slate-400 font-bold text-[10px] bg-card border border-border px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <Crown size={8} /> II
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-foreground/80 truncate w-full text-center">
                          Benq
                        </span>
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-tight">
                          Master
                        </span>
                        {/* Podium Block */}
                        <div className="w-full h-20 mt-2 bg-gradient-to-t from-slate-500/10 to-slate-400/20 rounded-t-xl border-t border-slate-400/30 flex items-center justify-center">
                          <span className="text-2xl font-[1000] text-slate-400/35">
                            2
                          </span>
                        </div>
                      </div>

                      {/* 1st Place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 blur-sm opacity-60 animate-pulse" />
                          <Avatar className="relative size-12 border-2 border-amber-400">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-amber-55 text-xs font-bold text-amber-700">
                              CF
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-500 font-black text-[10px] bg-card border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                            <Crown
                              size={9}
                              className="text-amber-500 fill-amber-500"
                            />{" "}
                            I
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-foreground truncate w-full text-center">
                          tourist
                        </span>
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-tight">
                          Grandmaster
                        </span>
                        {/* Podium Block */}
                        <div className="w-full h-28 mt-2 bg-gradient-to-t from-amber-500/10 to-amber-400/25 rounded-t-xl border-t-2 border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/5">
                          <span className="text-4xl font-[1000] text-amber-400/35">
                            1
                          </span>
                        </div>
                      </div>

                      {/* 3rd Place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <Avatar className="size-9 border-2 border-amber-700/60">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-amber-900/5 text-xs font-bold text-amber-900/60">
                              CF
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-700/70 font-bold text-[9px] bg-card border border-border px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <Crown size={7} /> III
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-foreground/80 truncate w-full text-center">
                          ecnerwala
                        </span>
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-tight">
                          Master
                        </span>
                        {/* Podium Block */}
                        <div className="w-full h-14 mt-2 bg-gradient-to-t from-amber-700/10 to-amber-600/20 rounded-t-xl border-t border-amber-600/30 flex items-center justify-center">
                          <span className="text-xl font-[1000] text-amber-700/35">
                            3
                          </span>
                        </div>
                      </div>
                    </div>
                  </m.div>
                )}
              </div>
            </m.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GamifiedShowcase;
