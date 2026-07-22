"use client";

import Link from "next/link";
import { m as motion } from "framer-motion";
import { Users, BookOpen, Trophy, Heart, ArrowRight, Github, Facebook } from "lucide-react";
import Counter from "./Counter";

const values = [
  {
    icon: Github,
    label: "Open Source Core",
    desc: "Fully transparent codebase built in public under standard open source licensing.",
  },
  {
    icon: Heart,
    label: "100% Free Forever",
    desc: "Zero paywalls or premium tiers. Every feature is free for all competitive programmers.",
  },
  {
    icon: Users,
    label: "Community-Driven",
    desc: "Engineered by active ICPC competitors to directly address real training friction.",
  },
];

const CommunitySection = () => (
  <section className="py-28 relative overflow-hidden bg-[#040604] font-mono text-emerald-400 border-t border-emerald-500/10">
    {/* Ambient lighting */}
    <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

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
          <Users size={11} className="text-emerald-400 animate-pulse" />
          <span>HNU ICPC Ecosystem</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase text-white leading-none">
          Born from the <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.35)]">Community</span>
        </h2>

        <p className="text-emerald-500/60 text-xs leading-relaxed max-w-lg mx-auto uppercase tracking-wide">
          A platform built from the heart of the HNU ICPC community to redefine competitive programming practice.
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12"
      >
        {[
          { value: <Counter to={500} suffix="+" />, label: "ACTIVE MEMBERS", icon: Users },
          { value: <Counter to={10} suffix="k+" />, label: "PROBLEMS SOLVED", icon: Trophy },
          { value: "5+", label: "TRAINING LEVELS", icon: BookOpen },
          { value: "100%", label: "FREE & OPEN CODE", icon: Heart },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            className="text-center p-6 rounded-xl bg-[#060a08]/60 border border-emerald-500/20 hover:border-emerald-500/40 backdrop-blur-md transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group"
          >
            <stat.icon size={18} className="mx-auto mb-3 text-emerald-400/60 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-300" />
            <span className="block text-3xl md:text-4xl font-black tracking-tight text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              {stat.value}
            </span>
            <span className="block text-[8.5px] font-bold uppercase tracking-wider text-emerald-500/50 mt-1.5">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Grid: Members & Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {/* Community Members Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-8 rounded-xl bg-[#060a08]/60 border border-emerald-500/20 hover:border-emerald-500/40 backdrop-blur-md transition-all duration-500 flex flex-col items-center justify-center text-center space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden group"
        >
          <div className="absolute -inset-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="flex -space-x-2 relative z-10">
            {[
              { bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", label: "JD" },
              { bg: "bg-emerald-500/25 text-emerald-300 border-emerald-500/50", label: "AM" },
              { bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "KS" },
              { bg: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", label: "RW" },
              { bg: "bg-emerald-500/25 text-emerald-400 border-emerald-500/50", label: "SL" },
            ].map((a, i) => (
              <div
                key={i}
                className={`size-10 rounded-full border-2 ${a.bg} text-[10px] font-black flex items-center justify-center shadow-md`}
              >
                {a.label}
              </div>
            ))}
            <div className="size-10 rounded-full border-2 border-emerald-500/20 bg-[#030604] text-[9.5px] font-bold flex items-center justify-center text-emerald-400 shadow-md">
              +500
            </div>
          </div>

          <div className="space-y-1.5 relative z-10">
            <p className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
              500+ Active Competitors
            </p>
            <p className="text-xs text-emerald-500/60 uppercase">
              Join the official HNU ICPC community portal
            </p>
          </div>

          <a
            href="https://www.facebook.com/fcsit.hnu.icpc"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 hover:text-emerald-950 shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all duration-300"
          >
            <Facebook size={14} />
            <span>JOIN COMMUNITY PORTAL</span>
          </a>
        </motion.div>

        {/* Community Values Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-8 rounded-xl bg-[#060a08]/60 border border-emerald-500/20 hover:border-emerald-500/40 backdrop-blur-md transition-all duration-500 flex flex-col justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden group"
        >
          <div className="absolute -inset-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {values.map((v) => (
              <div key={v.label} className="flex items-start gap-4">
                <div className="size-9 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <v.icon size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wide text-emerald-300">
                    {v.label}
                  </h4>
                  <p className="text-xs text-emerald-500/60 leading-relaxed mt-0.5 uppercase">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Bottom CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="p-8 md:p-12 rounded-2xl bg-gradient-to-br from-[#060d09] via-[#040604] to-[#060d09] border border-emerald-500/30 text-center space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)]"
      >
        <div className="space-y-3 relative z-10 max-w-2xl mx-auto">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-400/80 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            READY TO DOMINATE CODEFORCES?
          </span>

          <h3 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight leading-none pt-2">
            Start Your Training Block
          </h3>

          <p className="text-xs text-emerald-500/70 leading-relaxed uppercase">
            Join hundreds of competitive programmers upsolving smarter, tracking weaknesses, and climbing rating ladders.
          </p>
        </div>

        <div className="relative z-10 pt-2">
          <Link
            href="/signup"
            className="hero-cta-glow hero-cta-shimmer inline-flex items-center gap-2.5 px-9 py-4 rounded-md bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black uppercase tracking-widest text-xs font-mono shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] transition-all duration-300"
          >
            <span>INITIALIZE ACCOUNT</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CommunitySection;
