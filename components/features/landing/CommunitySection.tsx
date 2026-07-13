"use client";

import Link from "next/link";
import { m as motion } from "framer-motion";
import { Users, BookOpen, Trophy, Heart, ArrowRight, Github, Facebook } from "lucide-react";
import Counter from "./Counter";

const values = [
  {
    icon: Github,
    label: "Open Source",
    desc: "Fully transparent codebase built in public.",
  },
  {
    icon: Heart,
    label: "100% Free",
    desc: "No paywalls. Every feature is free forever.",
  },
  {
    icon: Users,
    label: "Community-Driven",
    desc: "Shaped by competitors, for competitors.",
  },
];

const CommunitySection = () => (
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
          {"// Community Operations"}
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-white leading-none">
          Born from the Community
        </h2>
        <p className="text-emerald-500/50 text-xs leading-relaxed max-w-lg mx-auto uppercase">
          A product raised from the heart of the HNU ICPC Community. Built to elevate training standards.
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
      >
        {[
          { value: <Counter to={500} suffix="+" />, label: "Members Logged", icon: Users },
          { value: <Counter to={10} suffix="k+" />, label: "Problems Solved", icon: Trophy },
          { value: "5+", label: "Training Levels", icon: BookOpen },
          { value: "100%", label: "Free & Open Code", icon: Heart },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            className="text-center p-6 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-350"
          >
            <stat.icon size={15} className="mx-auto mb-3 text-emerald-500/45 animate-pulse" />
            <span className="block text-2xl md:text-3xl font-black tracking-tight text-emerald-300">
              {stat.value}
            </span>
            <span className="block text-[8px] font-bold uppercase tracking-wider text-emerald-500/35 mt-1">
              {stat.label}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Grid: Members & Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

        {/* Community Members Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-8 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-350 flex flex-col items-center justify-center text-center space-y-6"
        >
          <div className="flex -space-x-1.5">
            {[
              { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/25", label: "JD" },
              { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/40", label: "AM" },
              { bg: "bg-emerald-500/5", text: "text-emerald-400", border: "border-emerald-500/15", label: "KS" },
              { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/25", label: "RW" },
              { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/40", label: "SL" },
            ].map((a, i) => (
              <div
                key={i}
                className={`size-9 rounded-sm border ${a.bg} ${a.border} ${a.text} text-[9px] font-bold flex items-center justify-center`}
              >
                [{a.label}]
              </div>
            ))}
            <div className="size-9 rounded-sm border border-emerald-500/10 bg-emerald-950/10 text-[9px] font-bold flex items-center justify-center text-emerald-500/35">
              +500
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              500+ Competitors Online
            </p>
            <p className="text-[10px] text-emerald-500/55 uppercase">
              Join the HNU ICPC Community portal
            </p>
          </div>
          <a
            href="https://www.facebook.com/fcsit.hnu.icpc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500/20 hover:text-emerald-300 transition-all"
          >
            <Facebook size={12} />
            [ JOIN_COMMUNITY_PORTAL.EXE ]
          </a>
        </motion.div>

        {/* Community Values Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-8 rounded-sm bg-[#060a08]/30 border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-350 flex flex-col justify-center"
        >
          <div className="space-y-5">
            {values.map((v) => (
              <div key={v.label} className="flex items-start gap-4">
                <div className="size-8 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <v.icon size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-300">
                    {v.label}
                  </h4>
                  <p className="text-[10px] text-emerald-500/60 leading-relaxed mt-0.5 uppercase">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center"
      >
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_10px_rgba(16,185,129,0.25)] transition-all"
        >
          [ INITIALIZE_CONNECTION.EXE ]
          <ArrowRight size={12} />
        </Link>
      </motion.div>
    </div>
  </section>
);

export default CommunitySection;
