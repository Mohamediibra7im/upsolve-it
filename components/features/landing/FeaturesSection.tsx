"use client";

import {m} from "framer-motion";
import {RefreshCw, Target, LineChart, ShieldCheck, Zap, Flame, Users, BookOpen} from "lucide-react";
import Orb from "./Orb";

const FeaturesSection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <Orb className="size-[450px] bg-primary/6 top-[20%] right-[-8%]" />
      <Orb className="size-[350px] bg-emerald-500/5 bottom-[10%] left-[-5%]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <m.div
          initial={{opacity: 0, y: 16}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          className="text-center max-w-2xl mx-auto mb-24 space-y-4"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Core Platform
          </span>
          <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-[0.95]">
            <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">Built for</span>{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Growth</span>
          </h2>
          <p className="text-muted-foreground font-medium text-lg pt-1">
            Explore the ecosystem built to power your competitive programming journey from amateur to grandmaster.
          </p>
        </m.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Live CF Sync - Colspan 2 */}
          <m.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.5}}
            className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden md:col-span-2 flex flex-col sm:flex-row justify-between gap-6"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex flex-col justify-between flex-1 space-y-4">
              <div className="space-y-4">
                <div className="size-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                  <RefreshCw size={22} className="group-hover:rotate-180 transition-transform duration-700" />
                </div>
                <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                  Live CF Sync
                </h3>
                <p className="text-muted-foreground font-medium leading-relaxed text-sm max-w-sm">
                  Link your handle once. Ratings, submissions, and heatmaps auto-populate, no CF password needed.
                </p>
              </div>
            </div>

            {/* Micro UI */}
            <div className="flex flex-col justify-center min-w-[200px] sm:min-w-[240px]">
              <div className="flex flex-col gap-2.5 p-4 bg-background/50 border border-border/40 rounded-2xl text-xs backdrop-blur-lg">
                <span className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-wider">Sync CF Account</span>
                <div className="flex gap-2 items-center bg-card p-2 border border-border/80 rounded-xl">
                  <span className="text-muted-foreground/60 font-mono text-[9px] select-none">codeforces.com/profile/</span>
                  <span className="font-mono text-primary font-black animate-pulse">tourist</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-2">
                      <span className="animate-ping absolute inline-flex size-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
                    </span>
                    <span className="font-black text-[9px] text-emerald-500 uppercase tracking-wider">Synchronized</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground font-bold">Rating: 3843</span>
                </div>
              </div>
            </div>
          </m.div>

          {/* Card 2: Five Training Modes - Colspan 1 */}
          <m.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.5, delay: 0.1}}
            className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden flex flex-col justify-between gap-6"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                <Target size={22} />
              </div>
              <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                Five Modes
              </h3>
              <p className="text-muted-foreground font-medium leading-relaxed text-sm">
                Ladder, weakness, speed, contest simulation, and endurance. Tune tags and difficulty per session.
              </p>
            </div>

            {/* Micro UI */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {["Ladder", "Weakness", "Speed", "Contest", "Endurance"].map((mode, idx) => (
                <span
                  key={mode}
                  className={`text-[9px] font-black uppercase px-2.5 py-1.5 rounded-lg border tracking-wider transition-all duration-300 ${
                    idx === 0
                      ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                      : "bg-background/40 border-border/50 text-muted-foreground hover:border-border/80 hover:bg-background/60"
                  }`}
                >
                  {mode}
                </span>
              ))}
            </div>
          </m.div>

          {/* Card 3: Per-mode Analytics - Colspan 1 */}
          <m.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.5}}
            className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden flex flex-col justify-between gap-6"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                <LineChart size={22} />
              </div>
              <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                Analytics
              </h3>
              <p className="text-muted-foreground font-medium leading-relaxed text-sm">
                Stats broken down by mode, performance trends, session history, and trajectory charts.
              </p>
            </div>

            {/* Micro UI */}
            <div className="flex items-end justify-between h-16 w-full px-1 pt-2 gap-2">
              {[
                { h: "h-[40%]" },
                { h: "h-[75%]" },
                { h: "h-[55%]" },
                { h: "h-[95%]" },
                { h: "h-[65%]" },
                { h: "h-[85%]" }
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                  <div
                    className={`w-full rounded-t-md bg-gradient-to-t from-primary/30 to-primary transition-all duration-500 group-hover:from-primary/45 group-hover:to-primary ${item.h}`}
                  />
                  <span className="text-[7px] font-bold font-mono text-muted-foreground/60">{`M${idx + 1}`}</span>
                </div>
              ))}
            </div>
          </m.div>

          {/* Card 4: XP & Leveling - Colspan 1 */}
          <m.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.5, delay: 0.1}}
            className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden flex flex-col justify-between gap-6"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                <Zap size={22} className="group-hover:text-amber-500 group-hover:scale-110 transition-colors" />
              </div>
              <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                XP & Levels
              </h3>
              <p className="text-muted-foreground font-medium leading-relaxed text-sm">
                Earn XP from every solve, level up with titles, and track progress with a visual ring chart and XP bar.
              </p>
            </div>

            {/* Micro UI */}
            <div className="flex flex-col gap-2 p-3 bg-background/50 border border-border/40 rounded-xl">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
                <span className="text-primary">Level 14</span>
                <span className="text-muted-foreground/80">780 / 1000 XP</span>
              </div>
              <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-emerald-400 w-[78%] rounded-full" />
              </div>
              <div className="flex justify-between items-center text-[8px] font-black uppercase text-muted-foreground/60">
                <span>Title: Pupil</span>
                <span>+220 XP to level up</span>
              </div>
            </div>
          </m.div>

          {/* Card 5: Streaks & Consistency - Colspan 1 */}
          <m.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.5, delay: 0.2}}
            className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden flex flex-col justify-between gap-6"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                <Flame size={22} className="group-hover:text-orange-500 group-hover:scale-110 transition-colors" />
              </div>
              <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                Streaks
              </h3>
              <p className="text-muted-foreground font-medium leading-relaxed text-sm">
                Daily training streak, upsolve streak, best streak, and a consistency score to keep you accountable.
              </p>
            </div>

            {/* Micro UI */}
            <div className="flex items-center justify-around p-3 bg-background/50 border border-border/40 rounded-xl">
              <div className="text-center">
                <span className="flex items-center justify-center gap-1 text-2xl font-black text-orange-500 group-hover:scale-110 transition-transform duration-300">
                  <Flame size={20} className="fill-orange-500/25 text-orange-500" />
                  <span>17</span>
                </span>
                <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider">Day Streak</span>
              </div>
              <div className="w-px h-8 bg-border/40" />
              <div className="text-center">
                <span className="block text-2xl font-black text-primary">94%</span>
                <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider">Consistency</span>
              </div>
            </div>
          </m.div>

          {/* Card 6: Learning Roadmaps - Colspan 2 */}
          <m.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.5}}
            className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden md:col-span-2 flex flex-col sm:flex-row justify-between gap-6"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex flex-col justify-between flex-1 space-y-4">
              <div className="space-y-4">
                <div className="size-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                  <BookOpen size={22} />
                </div>
                <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                  Learning Roadmaps
                </h3>
                <p className="text-muted-foreground font-medium leading-relaxed text-sm max-w-sm">
                  Structured paths with Arabic video lectures, curated problems, and level-gated progression from basics to advanced.
                </p>
              </div>
            </div>

            {/* Micro UI */}
            <div className="flex flex-col justify-center min-w-[200px] sm:min-w-[240px]">
              <div className="flex items-center justify-between p-4 bg-background/50 border border-border/40 rounded-2xl relative overflow-hidden">
                <div className="absolute top-1/2 left-[12%] right-[12%] h-[1.5px] border-t border-dashed border-border/80 -translate-y-1/2 z-0" />
                {[
                  { label: "Basics", done: true },
                  { label: "Math", done: true },
                  { label: "DP", active: true },
                  { label: "Graphs", locked: true }
                ].map((node, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 relative z-10">
                    <div className={`size-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
                      node.done 
                        ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(var(--primary),0.355)]" 
                        : node.active 
                        ? "bg-background border-2 border-primary text-primary animate-pulse" 
                        : "bg-muted/80 border border-border/60 text-muted-foreground/50"
                    }`}>
                      {node.done ? "✓" : idx + 1}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground/80">{node.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </m.div>

          {/* Card 7: Friends & Leaderboard - Colspan 1 */}
          <m.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.5, delay: 0.1}}
            className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden flex flex-col justify-between gap-6"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-tl from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                <Users size={22} />
              </div>
              <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                Leaderboards
              </h3>
              <p className="text-muted-foreground font-medium leading-relaxed text-sm">
                Add friends, compare progress, and compete on a dynamic leaderboard with an animated top-3 podium.
              </p>
            </div>

            {/* Micro UI */}
            <div className="flex flex-col gap-1.5">
              {[
                { rank: 1, name: "tourist", xp: "14.2k XP" },
                { rank: 2, name: "Benq", xp: "12.8k XP" },
                { rank: 3, name: "user_123", xp: "11.1k XP" }
              ].map((player) => (
                <div key={player.rank} className="flex items-center justify-between px-3 py-2 bg-background/50 border border-border/40 rounded-xl text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className={`font-black ${
                      player.rank === 1 ? "text-amber-500" : player.rank === 2 ? "text-slate-400" : "text-amber-700"
                    }`}>{player.rank}</span>
                    <span className="font-black text-muted-foreground font-mono">{player.name}</span>
                  </div>
                  <span className="font-black text-primary">{player.xp}</span>
                </div>
              ))}
            </div>
          </m.div>

          {/* Card 8: Secure by Design - Colspan 3 */}
          <m.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.5}}
            className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden md:col-span-3"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] via-transparent to-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                    Secure by Design
                  </h3>
                  <p className="text-muted-foreground text-xs font-medium">
                    Your credentials never touch our servers.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 md:gap-8 justify-center">
                {["JWT Auth", "Role-Aware Access", "Public CF API Only", "No Passwords Stored"].map((label) => (
                  <div key={label} className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground/85 tracking-wider bg-background/50 px-3 py-1.5 rounded-lg border border-border/30">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </m.div>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
