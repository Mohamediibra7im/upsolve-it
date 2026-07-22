"use client";

import { useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Target,
  LineChart,
  ShieldCheck,
  Zap,
  Flame,
  Users,
  BookOpen,
  CheckCircle2,
  Terminal,
  Activity,
  Sparkles,
  Cpu,
  Database,
  Layers,
  Award,
} from "lucide-react";

// Feature Tabs definition
const FEATURES = [
  {
    id: "sync",
    tabLabel: "01 // LIVE_SYNC",
    title: "Instant Codeforces Synchronization",
    badge: "REALTIME DAEMON",
    icon: RefreshCw,
    description:
      "Connect your Codeforces handle once. Upsolve.it syncs ratings, submission heatmaps, and unsolved problem lists automatically using public CF APIs.",
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 text-xs font-mono">
          <span className="text-emerald-400 font-bold flex items-center gap-2">
            <Terminal size={14} className="text-emerald-400" />
            CF_SYNC_DAEMON // STATUS: ACTIVE
          </span>
          <span className="text-emerald-500/60">PORT 443 // SSL_OK</span>
        </div>

        <div className="p-4 bg-[#030604] border border-emerald-500/20 rounded-md font-mono space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-500/50">&gt; TARGET_HANDLE:</span>
            <span className="text-emerald-300 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              tourist
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[10px]">
            <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/15 rounded flex flex-col justify-between">
              <span className="text-emerald-500/50">CURRENT RATING</span>
              <span className="text-lg font-black text-emerald-300">3843 GM</span>
            </div>
            <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/15 rounded flex flex-col justify-between">
              <span className="text-emerald-500/50">SOLVED PROBLEMS</span>
              <span className="text-lg font-black text-emerald-300">4,921</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-emerald-500/10 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-400 font-bold">AUTO_SYNC_LISTENER</span>
            </div>
            <span className="text-emerald-500/50">LAST_FETCH: JUST NOW</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "modes",
    tabLabel: "02 // MODES",
    title: "Five Specialized Training Modes",
    badge: "ADAPTIVE ENGINE",
    icon: Target,
    description:
      "Target your rating gaps with precision. Switch seamlessly between Ladder mode, Weakness targeting, Speed drills, Virtual Contest simulation, and Endurance runs.",
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 text-xs font-mono">
          <span className="text-emerald-400 font-bold flex items-center gap-2">
            <Target size={14} />
            TRAINING_SESSION_BUILDER
          </span>
          <span className="text-emerald-500/60">TAGS: DP, GRAPHS, MATH</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[10.5px]">
          {[
            { name: "Ladder Mode", desc: "Progressive rating step +50 to +200", active: true },
            { name: "Weakness Drill", desc: "Auto-targets lowest accuracy tags", active: false },
            { name: "Speed Contest", desc: "Timed 30m rapid problem bursts", active: false },
            { name: "Virtual Contest", desc: "Simulate Div 2/1 contests", active: false },
            { name: "Endurance Run", desc: "Deep marathon hard problem sets", active: false },
          ].map((m) => (
            <div
              key={m.name}
              className={`p-3 rounded border transition-all duration-300 flex flex-col justify-between gap-1 ${
                m.active
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "bg-[#030604] border-emerald-500/15 text-emerald-500/60"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>{m.name}</span>
                {m.active && <span className="text-[8px] bg-emerald-400 text-emerald-950 font-black px-1.5 py-0.2 rounded">SELECTED</span>}
              </div>
              <span className="text-[9px] text-emerald-500/50">{m.desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "analytics",
    tabLabel: "03 // ANALYTICS",
    title: "Granular Performance Analytics",
    badge: "RATING PROJECTION",
    icon: LineChart,
    description:
      "Visualize your speed curves, submission accuracy by rating tier, tag strengths, and expected rating trajectory calculated from your upsolve consistency.",
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 text-xs font-mono">
          <span className="text-emerald-400 font-bold flex items-center gap-2">
            <Activity size={14} />
            TELEMETRY // RATING_VELOCITY
          </span>
          <span className="text-emerald-400 font-bold">+180 RATING / 30D</span>
        </div>

        <div className="p-4 bg-[#030604] border border-emerald-500/20 rounded-md space-y-3 font-mono">
          <div className="flex items-center justify-between text-[10px] text-emerald-500/60">
            <span>HISTORICAL TRAJECTORY</span>
            <span className="text-emerald-400 font-bold">TARGET: 1900 CANDIDATE MASTER</span>
          </div>

          <div className="flex items-end justify-between h-20 w-full px-1 gap-2 pt-2">
            {[
              { label: "WK 1", h: "h-[35%]", val: "1350" },
              { label: "WK 2", h: "h-[50%]", val: "1420" },
              { label: "WK 3", h: "h-[45%]", val: "1400" },
              { label: "WK 4", h: "h-[70%]", val: "1550" },
              { label: "WK 5", h: "h-[85%]", val: "1680" },
              { label: "WK 6", h: "h-[100%]", val: "1750" },
            ].map((bar) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                <span className="text-[8px] text-emerald-300 font-bold">{bar.val}</span>
                <div className={`w-full rounded-xs bg-gradient-to-t from-emerald-600/40 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)] ${bar.h}`} />
                <span className="text-[7.5px] text-emerald-500/40 font-bold">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "xp",
    tabLabel: "04 // XP_LEVELS",
    title: "RPG XP & Level Progression",
    badge: "CODER RANK",
    icon: Zap,
    description:
      "Gamify your daily training. Solve hard problem tags to earn bonus XP, level up your profile badge, unlock titles, and build unbroken solve streak multipliers.",
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 text-xs font-mono">
          <span className="text-emerald-400 font-bold flex items-center gap-2">
            <Zap size={14} className="fill-emerald-400/20" />
            LEVEL_14 // SPECIALIST
          </span>
          <span className="text-emerald-300 font-bold">1,780 / 2,000 XP</span>
        </div>

        <div className="p-4 bg-[#030604] border border-emerald-500/20 rounded-md font-mono space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-emerald-400 font-bold">PROGRESS TO EXPERT</span>
              <span className="text-emerald-500/60">89%</span>
            </div>
            <div className="w-full bg-emerald-950/60 h-3 rounded-full overflow-hidden border border-emerald-500/25 p-0.5">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-300 h-full rounded-full w-[89%] shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[9.5px]">
            <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/15 rounded flex items-center justify-between">
              <span className="text-emerald-500/60">DAILY STREAK</span>
              <span className="text-orange-400 font-bold flex items-center gap-1">
                <Flame size={12} className="fill-orange-400" /> 17 DAYS
              </span>
            </div>
            <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/15 rounded flex items-center justify-between">
              <span className="text-emerald-500/60">MULTIPLIER</span>
              <span className="text-emerald-300 font-bold">1.5x XP</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "roadmaps",
    tabLabel: "05 // ROADMAPS",
    title: "Curated Learning Curriculums",
    badge: "STRUCTURED PATHS",
    icon: BookOpen,
    description:
      "Structured topic curriculums equipped with high-yield video lectures, handpicked practice problems, and level-gated progression from fundamentals to advanced ICPC topics.",
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 text-xs font-mono">
          <span className="text-emerald-400 font-bold flex items-center gap-2">
            <BookOpen size={14} />
            ROADMAP // DYNAMIC_PROGRAMMING
          </span>
          <span className="text-emerald-300 font-bold">3 / 5 COMPLETED</span>
        </div>

        <div className="p-4 bg-[#030604] border border-emerald-500/20 rounded-md font-mono relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10 py-1">
            {[
              { title: "Basics & 1D", status: "done" },
              { title: "Grid & 2D", status: "done" },
              { title: "Knapsack Variants", status: "active" },
              { title: "Bitmask DP", status: "locked" },
              { title: "Tree & Graph DP", status: "locked" },
            ].map((item, idx) => (
              <div key={item.title} className="flex flex-col items-center gap-1.5 flex-1 text-center">
                <div
                  className={`size-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    item.status === "done"
                      ? "bg-emerald-500 text-emerald-950 font-black shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      : item.status === "active"
                      ? "bg-[#040604] border-2 border-emerald-400 text-emerald-400 animate-pulse"
                      : "bg-[#070d09] border border-emerald-500/20 text-emerald-500/30"
                  }`}
                >
                  {item.status === "done" ? <CheckCircle2 size={13} strokeWidth={3} /> : idx + 1}
                </div>
                <span className="text-[8px] font-bold uppercase text-emerald-500/50 hidden sm:block max-w-[60px] truncate">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "leaderboard",
    tabLabel: "06 // LEADERBOARD",
    title: "Global & Friends Leaderboards",
    badge: "COMMUNITY ARENA",
    icon: Users,
    description:
      "Compete against friends or the global community. Track monthly solve counts, rating growth speed, and rank on dynamic real-time scoreboards.",
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 text-xs font-mono">
          <span className="text-emerald-400 font-bold flex items-center gap-2">
            <Award size={14} />
            GLOBAL_SCOREBOARD // TOP_SOLVERS
          </span>
          <span className="text-emerald-500/60">SEASON 4</span>
        </div>

        <div className="space-y-1.5 font-mono text-[10.5px]">
          {[
            { rank: 1, handle: "tourist", title: "Grandmaster", xp: "14,250 XP", color: "text-amber-400" },
            { rank: 2, handle: "Benq", title: "Grandmaster", xp: "12,810 XP", color: "text-slate-300" },
            { rank: 3, handle: "user_123", title: "Master", xp: "11,100 XP", color: "text-amber-600" },
            { rank: 4, handle: "you", title: "Specialist", xp: "8,940 XP", color: "text-emerald-400", isUser: true },
          ].map((row) => (
            <div
              key={row.handle}
              className={`flex items-center justify-between px-3 py-2 rounded border transition-colors ${
                row.isUser
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                  : "bg-[#030604] border-emerald-500/15 text-emerald-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`font-bold w-4 ${row.color}`}>#{row.rank}</span>
                <span>{row.handle}</span>
                {row.isUser && <span className="text-[8px] bg-emerald-400 text-emerald-950 font-black px-1 rounded">YOU</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-500/50 text-[9px] hidden sm:inline">{row.title}</span>
                <span className="font-bold text-emerald-300">{row.xp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const FeaturesSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const activeFeature = FEATURES[activeTab];

  return (
    <section className="py-28 relative overflow-hidden bg-[#040604] font-mono text-emerald-400 border-t border-emerald-500/10">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

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
            <Sparkles size={11} className="text-emerald-400 animate-pulse" />
            <span>Interactive Command Center</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase text-white leading-none">
            Built for <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.35)]">Growth</span>
          </h2>

          <p className="text-emerald-500/60 text-xs leading-relaxed max-w-lg mx-auto uppercase tracking-wide">
            Explore the ecosystem engineered to accelerate your competitive programming trajectory from amateur to grandmaster.
          </p>
        </motion.div>

        {/* ── Main Command Terminal Window ── */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-xl border border-emerald-500/25 bg-[#060a08]/80 backdrop-blur-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.7)]"
        >
          {/* Terminal Window Header Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#030604] border-b border-emerald-500/20 gap-3">
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-red-500/70" />
              <div className="size-2.5 rounded-full bg-yellow-500/70" />
              <div className="size-2.5 rounded-full bg-emerald-500/70" />
              <span className="text-[10px] text-emerald-500/50 font-bold ml-2 hidden sm:inline">
                UPSOLVE_TERMINAL_V2.0
              </span>
            </div>

            {/* Interactive Tab Selectors */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
              {FEATURES.map((feat, idx) => {
                const isActive = idx === activeTab;
                return (
                  <button
                    key={feat.id}
                    onClick={() => setActiveTab(idx)}
                    className={`px-3 py-1 rounded text-[9.5px] font-bold tracking-wider transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        : "text-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-950/20"
                    }`}
                  >
                    {feat.tabLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Terminal Window Body Content */}
          <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[380px]">
            {/* Left Column: Details */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                <activeFeature.icon size={12} />
                <span>{activeFeature.badge}</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-white uppercase leading-tight tracking-tight">
                {activeFeature.title}
              </h3>

              <p className="text-xs text-emerald-500/70 leading-relaxed uppercase">
                {activeFeature.description}
              </p>
            </div>

            {/* Right Column: Dynamic Interactive Widget */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                  className="p-5 bg-[#040705] border border-emerald-500/20 rounded-lg shadow-inner"
                >
                  {activeFeature.content}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── Bottom Telemetry Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { icon: Cpu, label: "PLATFORM UPTIME", value: "99.99%", sub: "High Availability" },
            { icon: Database, label: "PROBLEMS INDEXED", value: "12,500+", sub: "Div 4 to Div 1" },
            { icon: ShieldCheck, label: "CREDENTIAL SECURITY", value: "0 PASSWORDS", sub: "OAuth & Public API" },
            { icon: Layers, label: "COMMUNITY ACCESS", value: "100% FREE", sub: "Open Source Core" },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * idx }}
              className="p-4 rounded-lg bg-[#060a08]/50 border border-emerald-500/15 hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-4"
            >
              <div className="size-10 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <stat.icon size={18} />
              </div>
              <div>
                <div className="text-[8.5px] font-bold text-emerald-500/40 uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="text-lg font-black text-emerald-300 leading-none my-0.5">
                  {stat.value}
                </div>
                <div className="text-[8px] text-emerald-500/60 uppercase">
                  {stat.sub}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
