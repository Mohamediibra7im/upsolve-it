"use client";

import { m as motion } from "framer-motion";
import { RefreshCw, Target, LineChart, ShieldCheck, Zap, Flame, Users, BookOpen } from "lucide-react";

const FeaturesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-[#040604] font-mono text-emerald-400 border-t border-emerald-500/10">
      <div className="container mx-auto max-w-6xl px-4 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-500/45">
            {"// Core Platform"}
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-white leading-none">
            Built for Growth
          </h2>
          <p className="text-emerald-500/50 text-xs leading-relaxed max-w-lg mx-auto uppercase">
            Explore the ecosystem built to power your competitive programming journey from amateur to grandmaster.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Live CF Sync - Colspan 2 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 md:p-8 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 group relative overflow-hidden md:col-span-2 flex flex-col sm:flex-row justify-between gap-6"
          >
            <div className="flex flex-col justify-between flex-1 space-y-4">
              <div className="space-y-3">
                <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-all">
                  <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
                </div>
                <h3 className="text-lg font-bold tracking-tight uppercase text-emerald-300">
                  Live CF Sync
                </h3>
                <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase max-w-sm">
                  Link your handle once. Ratings, submissions, and heatmaps auto-populate, no CF password needed.
                </p>
              </div>
            </div>

            {/* Micro UI */}
            <div className="flex flex-col justify-center min-w-[200px] sm:min-w-[230px]">
              <div className="flex flex-col gap-2 p-3.5 bg-emerald-950/5 border border-emerald-500/10 rounded-sm text-[9px] font-mono">
                <span className="text-[8px] font-bold text-emerald-500/35 uppercase tracking-wider">SYNC_CF_ACCOUNT</span>
                <div className="flex gap-2 items-center bg-[#060a08] p-2 border border-emerald-500/15 rounded-sm">
                  <span className="text-emerald-500/40 font-mono text-[8px] select-none">cf/profile/</span>
                  <span className="font-mono text-emerald-300 font-bold animate-pulse">tourist</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex size-1.5">
                      <span className="animate-ping absolute inline-flex size-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
                    </span>
                    <span className="font-bold text-[8px] text-emerald-400 uppercase tracking-wider">SYNCHRONIZED</span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-300 font-bold">RATING: 3843</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Five Training Modes - Colspan 1 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 md:p-8 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between gap-6"
          >
            <div className="space-y-4">
              <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-all">
                <Target size={18} />
              </div>
              <h3 className="text-lg font-bold tracking-tight uppercase text-emerald-300">
                Five Modes
              </h3>
              <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                Ladder, weakness, speed, contest simulation, and endurance. Tune tags and difficulty per session.
              </p>
            </div>

            {/* Micro UI */}
            <div className="flex flex-wrap gap-1 pt-1.5">
              {["Ladder", "Weakness", "Speed", "Contest", "Endurance"].map((mode, idx) => (
                <span
                  key={mode}
                  className={`text-[8.5px] font-bold uppercase px-2 py-1 rounded-sm border tracking-wider transition-all duration-200 ${
                    idx === 0
                      ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-300"
                      : "bg-[#060a08]/50 border-emerald-500/10 text-emerald-500/40 hover:border-emerald-500/25"
                  }`}
                >
                  [ {mode} ]
                </span>
              ))}
            </div>
          </motion.div>

          {/* Card 3: Per-mode Analytics - Colspan 1 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 md:p-8 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between gap-6"
          >
            <div className="space-y-4">
              <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-all">
                <LineChart size={18} />
              </div>
              <h3 className="text-lg font-bold tracking-tight uppercase text-emerald-300">
                Analytics
              </h3>
              <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                Stats broken down by mode, performance trends, session history, and trajectory charts.
              </p>
            </div>

            {/* Micro UI */}
            <div className="flex items-end justify-between h-14 w-full px-1 pt-2 gap-2">
              {[
                { h: "h-[40%]" },
                { h: "h-[75%]" },
                { h: "h-[55%]" },
                { h: "h-[95%]" },
                { h: "h-[65%]" },
                { h: "h-[85%]" }
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                  <div
                    className={`w-full rounded-sm bg-emerald-500/40 group-hover:bg-emerald-500 transition-colors ${item.h}`}
                  />
                  <span className="text-[7px] font-bold font-mono text-emerald-500/40">{`M${idx + 1}`}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 4: XP & Leveling - Colspan 1 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 md:p-8 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between gap-6"
          >
            <div className="space-y-4">
              <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-all">
                <Zap size={18} />
              </div>
              <h3 className="text-lg font-bold tracking-tight uppercase text-emerald-300">
                XP & Levels
              </h3>
              <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                Earn XP from every solve, level up with titles, and track progress with a visual XP bar.
              </p>
            </div>

            {/* Micro UI */}
            <div className="flex flex-col gap-1.5 p-3 bg-emerald-950/5 border border-emerald-500/10 rounded-sm font-mono text-[9px]">
              <div className="flex justify-between items-center font-bold">
                <span className="text-emerald-400">LEVEL 14</span>
                <span className="text-emerald-500/60">780 / 1000 XP</span>
              </div>
              
              {/* Monospace progress blocks */}
              <div className="text-[9px] tabular-nums flex items-center">
                <span className="text-emerald-500/30">[</span>
                <span className="text-emerald-400">███████</span>
                <span className="text-emerald-500/15">░░░</span>
                <span className="text-emerald-500/30">]</span>
              </div>

              <div className="flex justify-between items-center text-[7.5px] font-bold text-emerald-500/35 uppercase">
                <span>TITLE: PUPIL</span>
                <span>+220 XP NEXT</span>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Streaks & Consistency - Colspan 1 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 md:p-8 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between gap-6"
          >
            <div className="space-y-4">
              <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-all">
                <Flame size={18} className="group-hover:text-orange-500 transition-colors" />
              </div>
              <h3 className="text-lg font-bold tracking-tight uppercase text-emerald-300">
                Streaks
              </h3>
              <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                Daily training streak, upsolve streak, best streak, and a consistency score to keep you accountable.
              </p>
            </div>

            {/* Micro UI */}
            <div className="flex items-center justify-around p-3 bg-emerald-950/5 border border-emerald-500/10 rounded-sm font-mono">
              <div className="text-center">
                <span className="flex items-center justify-center gap-1 text-xl font-black text-orange-400 group-hover:scale-105 transition-transform">
                  <Flame size={15} className="fill-orange-500/10 text-orange-400" />
                  <span>17</span>
                </span>
                <span className="text-[7.5px] font-bold text-emerald-500/35 uppercase tracking-wider">DAY_STREAK</span>
              </div>
              <div className="w-px h-6 bg-emerald-500/10" />
              <div className="text-center">
                <span className="block text-xl font-bold text-emerald-300">94%</span>
                <span className="text-[7.5px] font-bold text-emerald-500/35 uppercase tracking-wider">CONSISTENCY</span>
              </div>
            </div>
          </motion.div>

          {/* Card 6: Learning Roadmaps - Colspan 2 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 md:p-8 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 group relative overflow-hidden md:col-span-2 flex flex-col sm:flex-row justify-between gap-6"
          >
            <div className="flex flex-col justify-between flex-1 space-y-4">
              <div className="space-y-3">
                <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-all">
                  <BookOpen size={18} />
                </div>
                <h3 className="text-lg font-bold tracking-tight uppercase text-emerald-300">
                  Learning Roadmaps
                </h3>
                <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase max-w-sm">
                  Structured paths with Arabic video lectures, curated problems, and level-gated progression from basics to advanced.
                </p>
              </div>
            </div>

            {/* Micro UI */}
            <div className="flex flex-col justify-center min-w-[200px] sm:min-w-[230px] font-mono">
              <div className="flex items-center justify-between p-3.5 bg-emerald-950/5 border border-emerald-500/10 rounded-sm relative overflow-hidden">
                <div className="absolute top-1/2 left-[12%] right-[12%] h-[1px] border-t border-dashed border-emerald-500/20 -translate-y-1/2 z-0" />
                {[
                  { label: "Basics", done: true },
                  { label: "Math", done: true },
                  { label: "DP", active: true },
                  { label: "Graphs", locked: true }
                ].map((node, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 relative z-10">
                    <div className={`size-6 rounded-sm flex items-center justify-center text-[9px] font-bold transition-all ${
                      node.done 
                        ? "bg-emerald-500 text-emerald-950 font-black shadow-[0_0_8px_rgba(16,185,129,0.2)]" 
                        : node.active 
                        ? "bg-[#060a08] border border-emerald-500 text-emerald-400 animate-pulse" 
                        : "bg-emerald-950/20 border border-emerald-500/10 text-emerald-500/25"
                    }`}>
                      {node.done ? "✓" : idx + 1}
                    </div>
                    <span className="text-[7.5px] font-bold uppercase tracking-wider text-emerald-500/40">{node.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 7: Friends & Leaderboard - Colspan 1 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 md:p-8 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between gap-6"
          >
            <div className="space-y-4">
              <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-all">
                <Users size={18} />
              </div>
              <h3 className="text-lg font-bold tracking-tight uppercase text-emerald-300">
                Leaderboards
              </h3>
              <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                Add friends, compare progress, and compete on a dynamic leaderboard.
              </p>
            </div>

            {/* Micro UI */}
            <div className="flex flex-col gap-1 font-mono text-[9px]">
              {[
                { rank: 1, name: "tourist", xp: "14.2k XP" },
                { rank: 2, name: "Benq", xp: "12.8k XP" },
                { rank: 3, name: "user_123", xp: "11.1k XP" }
              ].map((player) => (
                <div key={player.rank} className="flex items-center justify-between px-2.5 py-1.5 bg-[#060a08]/50 border border-emerald-500/10 rounded-sm">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold ${
                      player.rank === 1 ? "text-amber-500" : player.rank === 2 ? "text-slate-400" : "text-amber-700"
                    }`}>{player.rank}</span>
                    <span className="font-bold text-emerald-300">{player.name}</span>
                  </div>
                  <span className="font-bold text-emerald-500/60">{player.xp}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 8: Secure by Design - Colspan 3 */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 md:p-8 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 group relative overflow-hidden md:col-span-3"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight uppercase text-emerald-300">
                    Secure by Design
                  </h3>
                  <p className="text-[10px] text-emerald-500/55 uppercase">
                    Your credentials never touch our servers.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {["JWT Auth", "Role-Aware Access", "Public CF API Only", "No Passwords Stored"].map((label) => (
                  <div key={label} className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase text-emerald-300 tracking-wider bg-emerald-950/10 px-2.5 py-1 rounded-sm border border-emerald-500/15">
                    <span className="size-1 bg-emerald-400 animate-pulse" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
