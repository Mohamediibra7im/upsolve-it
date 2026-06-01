"use client";

import Link from "next/link";
import {AnimatePresence, motion, useScroll, useTransform} from "framer-motion";
import {useRef, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  ArrowRight,
  BarChart3,
  RefreshCw,
  Target,
  Zap,
  ShieldCheck,
  LineChart,
  Terminal,
  ClipboardList,
  Layers,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
  Flame,
  Trophy,
  Crown,
  CheckSquare,
  Check,
} from "lucide-react";
import ClientOnly from "@/components/shared/ClientOnly";
import useUser from "@/hooks/useUser";
import {useRoadmapUserSummary} from "@/hooks/useRoadmap";
import Loader from "@/components/shared/Loader";
import Dashboard from "./_Components/Dashboard";
import {cn} from "@/lib/utils";

/* ───── Animated number ───── */
const Counter = ({to, suffix = ""}: {to: number; suffix?: string}) => {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (!go) return;
    const dur = 1400;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 4)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, to]);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setGo(true),
      {threshold: 0.3},
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref}>
      {v}
      {suffix}
    </span>
  );
};

/* ───── Decorative orb ───── */
const Orb = ({className}: {className?: string}) => (
  <div
    className={`absolute rounded-full pointer-events-none blur-[120px] ${className}`}
  />
);

/* ═══════════════════ HERO ═══════════════════ */
const Hero = ({user}: {user: any}) => {
  const ref = useRef<HTMLDivElement>(null);
  const {scrollYProgress} = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const {summary} = useRoadmapUserSummary(!!user);

  return (
    <section
      ref={ref}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      <Orb className="w-[700px] h-[700px] bg-primary/12 -top-[15%] -left-[10%]" />
      <Orb className="w-[500px] h-[500px] bg-emerald-500/8 bottom-[5%] right-[-5%]" />

      {/* fine grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_55%_55%_at_50%_50%,black_30%,transparent_100%)]" />

      <motion.div
        style={{y, opacity}}
        className="container mx-auto px-6 relative z-10 -mt-32"
      >
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <motion.div
            initial={{opacity: 0, y: 20, filter: "blur(6px)"}}
            animate={{opacity: 1, y: 0, filter: "blur(0px)"}}
            transition={{duration: 0.6}}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/[0.07] border border-primary/15 text-primary text-[10px] font-black uppercase tracking-[0.25em] backdrop-blur-xl"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>{" "}
            <span>Free · Open Source · By ICPC Community</span>
          </motion.div>

          {/* heading */}
          <motion.h1
            initial={{opacity: 0, y: 30, filter: "blur(10px)"}}
            animate={{opacity: 1, y: 0, filter: "blur(0px)"}}
            transition={{duration: 0.8, delay: 0.12}}
            className="text-6xl sm:text-8xl md:text-9xl font-[1000] tracking-tighter leading-[0.88] uppercase select-none"
          >
            <span className="bg-gradient-to-b from-foreground to-foreground/35 bg-clip-text text-transparent">
              UPSOLVE
            </span>
            <span className="bg-gradient-to-br from-primary to-emerald-400 bg-clip-text text-transparent">
              .IT
            </span>
          </motion.h1>

          {/* sub */}
          <motion.p
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.6, delay: 0.28}}
            className="text-muted-foreground/90 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto tracking-tight font-medium"
          >
            The ultimate{" "}
            <span className="text-foreground font-black border-b-2 border-primary/20">
              ecosystem
            </span>{" "}
            for competitive programmers to{" "}
            <span className="text-primary font-bold">track progress</span>,{" "}
            <span className="text-foreground/90 font-bold">
              optimize training
            </span>
            , and achieve{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-black">
              peak performance
            </span>{" "}
            in a data-driven world.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.6, delay: 0.42}}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            {user ? (
              <>
                <Button
                  asChild
                  size="lg"
                  className="h-16 w-full sm:w-auto px-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-[0_8px_40px_hsl(var(--primary)/0.35)] hover:shadow-[0_14px_50px_hsl(var(--primary)/0.5)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
                >
                  <Link href="/profile" className="flex items-center gap-3">
                    Profile <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-16 w-full sm:w-auto px-14 rounded-2xl border-2 border-border/40 font-black uppercase tracking-widest text-xs hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300 backdrop-blur-xl"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="h-16 w-full sm:w-auto px-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-[0_8px_40px_hsl(var(--primary)/0.35)] hover:shadow-[0_14px_50px_hsl(var(--primary)/0.5)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
                >
                  <Link href="/signup" className="flex items-center gap-3">
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-16 w-full sm:w-auto px-14 rounded-2xl border-2 border-border/40 font-black uppercase tracking-widest text-xs hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300 backdrop-blur-xl"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </motion.div>

        </div>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 1.6}}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/30"
      >
        <span className="text-[8px] font-black uppercase tracking-[0.35em]">
          Scroll
        </span>
        <motion.div
          animate={{y: [0, 5, 0]}}
          transition={{duration: 1.6, repeat: Infinity}}
        >
          <ChevronDown size={14} />
        </motion.div>
      </motion.div>
    </section>
  );
};

/* ═══════════════════ FEATURES – open rows, no cards ═══════════════════ */
const featureRows = [
  {
    icon: RefreshCw,
    label: "Live CF Sync",
    text: "Link your handle once. Ratings, submissions, and heatmaps auto-populate — no CF password needed.",
  },
  {
    icon: Target,
    label: "Five Training Modes",
    text: "Ladder, weakness, speed, contest simulation, and endurance. Tune tags and difficulty per session.",
  },
  {
    icon: LineChart,
    label: "Per-mode Analytics",
    text: "Stats broken down by mode, performance trends, session history, and trajectory charts.",
  },
  {
    icon: ShieldCheck,
    label: "Secure by Design",
    text: "JWT auth, role-aware access, public CF API only. Your credentials never touch our servers.",
  },
];

const Features = () => (
  <section className="py-32 relative">
    <Orb className="w-[450px] h-[450px] bg-primary/6 top-[20%] right-[-8%]" />
    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{opacity: 0, y: 16}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true}}
        className="max-w-xl mb-20 space-y-3"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
          Core Platform
        </span>
        <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-[0.95]">
          Built for
          <br />
          Growth
        </h2>
      </motion.div>

      <div className="space-y-0 divide-y divide-border/20">
        {featureRows.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{opacity: 0, x: -20}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true}}
            transition={{delay: i * 0.06}}
            className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 py-10 md:py-14 items-start hover:bg-primary/[0.02] transition-colors duration-500 -mx-6 px-6 rounded-xl"
          >
            <div className="md:col-span-1 flex items-center">
              <div className="h-12 w-12 rounded-xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                <f.icon size={22} />
              </div>
            </div>
            <h3 className="md:col-span-3 text-2xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
              {f.label}
            </h3>
            <p className="md:col-span-8 text-muted-foreground font-medium leading-relaxed text-lg">
              {f.text}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════ CLOSE THE LOOP – inline layout ═══════════════════ */
const GamifiedShowcase = () => {
  const [activeTab, setActiveTab] = useState<"problems" | "podium">("problems");
  const [problems, setProblems] = useState([
    {id: 1, name: "1582F - Linear Dynamics", rating: 1700, solved: true},
    {id: 2, name: "1619E - Mex and Increments", rating: 1800, solved: false},
    {id: 3, name: "1622D - Shuffle", rating: 1900, solved: false},
  ]);
  const [xp, setXp] = useState(450);
  const [floatXp, setFloatXp] = useState<{show: boolean; amount: number; key: number}>({
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
      })
    );
  };

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{opacity: 0, y: 15}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              className="space-y-4"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.25em]">
                <Trophy size={11} /> New Gamified Features
              </span>
              <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-[0.95]">
                Practice
                <br />
                Gamified.
              </h2>
              <p className="text-muted-foreground/90 font-medium text-lg leading-relaxed">
                We've integrated a powerful checkbox-based roadmap progress tracker and a premium Trophy-inspired rewards system. Track your climbing trajectory in real time.
              </p>
            </motion.div>

            {/* List of Features */}
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
                  <motion.div
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
                        : "bg-transparent border-transparent hover:bg-card/40 hover:border-border/30"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-primary/5 text-primary"
                    )}>
                      <item.icon size={18} />
                    </div>
                    <div className="space-y-1">
                      <h4 className={cn(
                        "font-black text-sm uppercase tracking-tight transition-colors",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
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
              initial={{opacity: 0, scale: 0.96}}
              whileInView={{opacity: 1, scale: 1}}
              viewport={{once: true}}
              className="relative rounded-3xl border border-border/80 dark:border-border/40 bg-card/60 dark:bg-card/40 backdrop-blur-2xl shadow-2xl p-6 md:p-8"
            >
              {/* Tab Selector Headers */}
              <div className="flex items-center justify-between border-b border-border/40 dark:border-border/20 pb-4 mb-6">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
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
                          : "text-muted-foreground/60 hover:text-foreground"
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
                  <motion.div
                    key="problems"
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between bg-primary/[0.04] border border-primary/10 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-primary" />
                        <span className="text-xs font-black uppercase tracking-wider">Dynamic Programming</span>
                      </div>
                      <div className="relative flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground/70">XP Reward Pool</span>
                        <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded-md tabular-nums">
                          {xp} / 1000
                        </span>
                        
                        {/* Float XP Indicator */}
                        <AnimatePresence>
                          {floatXp.show && (
                            <motion.span
                              key={floatXp.key}
                              initial={{opacity: 0, y: 0, scale: 0.8}}
                              animate={{opacity: 1, y: -24, scale: 1}}
                              exit={{opacity: 0}}
                              transition={{duration: 0.5}}
                              className={cn(
                                "absolute right-0 font-bold text-xs px-1.5 py-0.5 rounded-md border",
                                floatXp.amount > 0 
                                  ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
                                  : "text-red-500 bg-red-500/10 border-red-500/20"
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
                            "flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 cursor-pointer select-none group/row",
                            p.solved 
                              ? "bg-emerald-500/[0.02] border-emerald-500/20 hover:bg-emerald-500/[0.04]" 
                              : "bg-muted/20 border-border/60 hover:bg-muted/40"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {/* Checkbox button */}
                            <div className={cn(
                              "h-5 w-5 rounded-md border flex items-center justify-center transition-all duration-300",
                              p.solved
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                : "border-muted-foreground/30 bg-background group-hover/row:border-primary/50"
                            )}>
                              {p.solved && <Check size={12} strokeWidth={3} />}
                            </div>

                            <span className={cn(
                              "text-xs font-bold transition-all duration-300",
                              p.solved ? "line-through text-muted-foreground/60" : "text-foreground"
                            )}>
                              {p.name}
                            </span>
                          </div>

                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-md border",
                            p.rating >= 1900 
                              ? "text-purple-500 bg-purple-500/5 border-purple-500/15" 
                              : p.rating >= 1800 
                                ? "text-blue-500 bg-blue-500/5 border-blue-500/15" 
                                : "text-cyan-500 bg-cyan-500/5 border-cyan-500/15"
                          )}>
                            {p.rating}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-center">
                      <span className="text-[10px] font-semibold text-muted-foreground/40 italic">
                        Click on rows to toggle solved status and test optimistic update mechanics.
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* 2. Podium Leaderboard Mockup */}
                {activeTab === "podium" && (
                  <motion.div
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
                          <Avatar className="w-10 h-10 border-2 border-slate-300">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-slate-100 text-xs font-bold text-slate-700">CF</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-slate-400 font-bold text-[10px] bg-card border border-border px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <Crown size={8} /> II
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-foreground/80 truncate w-full text-center">Benq</span>
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-tight">Master</span>
                        {/* Podium Block */}
                        <div className="w-full h-20 mt-2 bg-gradient-to-t from-slate-500/10 to-slate-400/20 rounded-t-xl border-t border-slate-400/30 flex items-center justify-center">
                          <span className="text-2xl font-[1000] text-slate-400/35">2</span>
                        </div>
                      </div>

                      {/* 1st Place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 blur-sm opacity-60 animate-pulse" />
                          <Avatar className="relative w-12 h-12 border-2 border-amber-400">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-amber-55 text-xs font-bold text-amber-700">CF</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-500 font-black text-[10px] bg-card border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                            <Crown size={9} className="text-amber-500 fill-amber-500" /> I
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-foreground truncate w-full text-center">tourist</span>
                        <span className="text-[8px] font-black text-red-500 uppercase tracking-tight">Grandmaster</span>
                        {/* Podium Block */}
                        <div className="w-full h-28 mt-2 bg-gradient-to-t from-amber-500/10 to-amber-400/25 rounded-t-xl border-t-2 border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/5">
                          <span className="text-4xl font-[1000] text-amber-400/35">1</span>
                        </div>
                      </div>

                      {/* 3rd Place */}
                      <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                          <Avatar className="w-9 h-9 border-2 border-amber-700/60">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-amber-900/5 text-xs font-bold text-amber-900/60">CF</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-700/70 font-bold text-[9px] bg-card border border-border px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <Crown size={7} /> III
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-foreground/80 truncate w-full text-center">ecnerwala</span>
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-tight">Master</span>
                        {/* Podium Block */}
                        <div className="w-full h-14 mt-2 bg-gradient-to-t from-amber-700/10 to-amber-600/20 rounded-t-xl border-t border-amber-600/30 flex items-center justify-center">
                          <span className="text-xl font-[1000] text-amber-700/35">3</span>
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

const loopItems = [
  {
    icon: ClipboardList,
    num: "01",
    title: "Session Reviews",
    text: "Debrief each run with solved counts, timing breakdowns, and personal notes.",
  },
  {
    icon: Layers,
    num: "02",
    title: "Upsolve & Streaks",
    text: "Queue misses for later, track streaks, keep weak spots from slipping through.",
  },
  {
    icon: Sparkles,
    num: "03",
    title: "Levels Roadmap",
    text: "Follow a curated ladder of problems and ratings as you progress.",
  },
];

const CloseTheLoop = () => (
  <section className="py-32 relative overflow-hidden">
    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{opacity: 0, y: 16}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true}}
        className="text-center max-w-2xl mx-auto mb-20 space-y-4"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
          After Every Session
        </span>
        <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase">
          Close the Loop
        </h2>
        <p className="text-muted-foreground font-medium text-lg">
          Reviews, upsolve, and levels turn raw practice into lasting gains.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
        {loopItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{opacity: 0, y: 24}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{delay: i * 0.1}}
            className="group relative space-y-6"
          >
            {/* large decorative number */}
            <span className="text-[6rem] font-[1000] leading-none text-primary/[0.05] group-hover:text-primary/[0.1] transition-colors select-none absolute -top-8 -left-2">
              {item.num}
            </span>
            <div className="relative pt-12 space-y-4">
              <div className="h-11 w-11 rounded-xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <item.icon size={20} />
              </div>
              <h3 className="text-xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {item.text}
              </p>
            </div>
            {/* underline accent */}
            <div className="h-px w-12 bg-primary/20 group-hover:w-full group-hover:bg-primary/40 transition-all duration-700" />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════ WORKFLOW TIMELINE ═══════════════════ */
const steps = [
  {
    n: "01",
    title: "Sync",
    desc: "Connect your handle; ratings and submissions populate.",
    icon: RefreshCw,
  },
  {
    n: "02",
    title: "Configure",
    desc: "Pick a mode, set tags and rating band.",
    icon: Target,
  },
  {
    n: "03",
    title: "Train & Review",
    desc: "Run timed sessions, then debrief with reviews.",
    icon: Zap,
  },
  {
    n: "04",
    title: "Analyze",
    desc: "Use stats, trajectories, and upsolve list to steer your next block.",
    icon: BarChart3,
  },
];

const Workflow = () => (
  <section className="py-32 relative overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.012)_1px,transparent_1px)] bg-[size:48px_48px]" />
    <Orb className="w-[400px] h-[400px] bg-primary/6 bottom-[10%] left-[5%]" />

    <div className="container mx-auto px-6 relative z-10">
      <motion.div
        initial={{opacity: 0, y: 16}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true}}
        className="max-w-xl mb-20 space-y-4"
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/[0.07] border border-primary/15 text-primary text-[10px] font-black uppercase tracking-[0.25em]">
          Workflow
        </span>
        <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-[0.95]">
          The Evolution
          <br />
          Protocol
        </h2>
        <p className="text-muted-foreground font-medium text-lg">
          One repeatable loop from sync to insight — run it every week.
        </p>
      </motion.div>

      {/* vertical timeline */}
      <div className="relative pl-8 md:pl-12 border-l border-border/20 space-y-16 md:space-y-20">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{opacity: 0, x: -16}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true}}
            transition={{delay: i * 0.1}}
            className="relative group"
          >
            {/* dot on the line */}
            <div className="absolute -left-8 md:-left-12 top-1 w-4 h-4 rounded-full border-2 border-primary/40 bg-background group-hover:bg-primary group-hover:border-primary transition-all duration-500 -translate-x-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10 items-start">
              <div className="md:col-span-1 flex items-center gap-3">
                <span className="text-3xl font-[1000] text-primary/20 group-hover:text-primary/50 transition-colors">
                  {s.n}
                </span>
              </div>
              <div className="md:col-span-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/[0.06] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <s.icon size={18} />
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                  {s.title}
                </h4>
              </div>
              <p className="md:col-span-8 text-muted-foreground font-medium leading-relaxed">
                {s.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════ COMMUNITY ═══════════════════ */
const Community = () => (
  <section className="py-32 relative">
    <div className="container mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* left */}
        <div className="space-y-10">
          <motion.div
            initial={{opacity: 0, x: -16}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.25em]"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>{" "}
            <span>Community Product</span>
          </motion.div>

          <motion.h2
            initial={{opacity: 0, y: 16}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-[0.95]"
          >
            Born from
            <br />
            the{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Community
            </span>
          </motion.h2>

          <motion.p
            initial={{opacity: 0, y: 12}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            className="text-lg text-muted-foreground font-medium leading-relaxed max-w-lg"
          >
            A product raised from the heart of the{" "}
            <span className="text-foreground font-bold">
              HNU ICPC Community
            </span>
            . Built to elevate training standards and empower every competitive
            programmer.
          </motion.p>

          <motion.div
            initial={{opacity: 0, y: 12}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            className="flex items-center gap-10"
          >
            <div>
              <span className="block text-5xl font-[1000] tracking-tighter">
                <Counter to={500} suffix="+" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                Members
              </span>
            </div>
            <div className="h-14 w-px bg-border/20" />
            <div>
              <span className="block text-5xl font-[1000] tracking-tighter">
                <Counter to={10} suffix="k+" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                Problems
              </span>
            </div>
          </motion.div>
        </div>

        {/* right – resource links, no cards */}
        <div className="space-y-8">
          <motion.a
            href="https://docs.hnuicpc.tech"
            target="_blank"
            rel="noopener noreferrer"
            initial={{opacity: 0, x: 20}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true}}
            className="group flex items-center justify-between py-8 hover:pl-4 transition-all duration-500"
          >
            <div className="flex items-center gap-5">
              <Terminal size={22} className="text-primary shrink-0" />
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                  Beginner Portal
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Curated roadmaps from basics to mastery
                </p>
              </div>
            </div>
            <ArrowUpRight
              size={20}
              className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
            />
          </motion.a>

          <motion.a
            href="https://www.facebook.com/fcsit.hnu.icpc"
            target="_blank"
            rel="noopener noreferrer"
            initial={{opacity: 0, x: 20}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true}}
            transition={{delay: 0.16}}
            className="group flex items-center justify-between py-8 hover:pl-4 transition-all duration-500"
          >
            <div className="flex items-center gap-5">
              <Flame size={22} className="text-primary shrink-0" />
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                  Join the Community
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Connect with fellow competitors
                </p>
              </div>
            </div>
            <ArrowUpRight
              size={20}
              className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
            />
          </motion.a>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════ PAGE ═══════════════════ */
function GuestLandingPage({user}: {user: any}) {
  return (
    <div className="relative min-h-screen">
      <Hero user={user} />
      <Features />
      <GamifiedShowcase />
      <CloseTheLoop />
      <Workflow />
      <Community />
    </div>
  );
}

export default function RootPage() {
  const {user, isLoading} = useUser();
  if (isLoading) return <Loader message="Loading..." />;

  return <GuestLandingPage user={user} />;
}
