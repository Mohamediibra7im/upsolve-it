"use client";

import Link from "next/link";
import {m} from "framer-motion";
import {Users, BookOpen, Trophy, Heart, ArrowRight, Github, Facebook, Linkedin} from "lucide-react";
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
  <section className="py-32 relative overflow-hidden">
    <div className="absolute rounded-full pointer-events-none blur-[120px] size-[400px] bg-primary/5 -top-[10%] right-[10%]" />
    <div className="absolute rounded-full pointer-events-none blur-[120px] size-[350px] bg-emerald-500/5 -bottom-[10%] left-[10%]" />

    <div className="container mx-auto px-6 relative z-10">

      {/* Section Title */}
      <m.div
        initial={{opacity: 0, y: 16}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true}}
        className="text-center max-w-2xl mx-auto mb-20 space-y-4"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
          Community Product
        </span>
        <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-[0.95]">
          <span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">Born from the</span>{" "}
          <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Community</span>
        </h2>
        <p className="text-muted-foreground font-medium text-lg pt-1">
          A product raised from the heart of the HNU ICPC Community. Built to elevate training standards and empower every competitor.
        </p>
      </m.div>

      {/* Stats Row */}
      <m.div
        initial={{opacity: 0, y: 20}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true}}
        transition={{duration: 0.5}}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
      >
        {[
          {value: <Counter to={500} suffix="+" />, label: "Members", icon: Users},
          {value: <Counter to={10} suffix="k+" />, label: "Problems Solved", icon: Trophy},
          {value: "5+", label: "Training Levels", icon: BookOpen},
          {value: "100%", label: "Free & Open", icon: Heart},
        ].map((stat, idx) => (
          <m.div
            key={stat.label}
            initial={{opacity: 0, y: 16}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{delay: idx * 0.08}}
            className="text-center p-6 rounded-2xl bg-card/30 backdrop-blur-md border border-border/30 hover:border-primary/20 transition-all duration-500"
          >
            <stat.icon size={18} className="mx-auto mb-3 text-primary/60" />
            <span className="block text-3xl md:text-4xl font-[1000] tracking-tighter text-primary">
              {stat.value}
            </span>
            <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">
              {stat.label}
            </span>
          </m.div>
        ))}
      </m.div>

      {/* Avatar Row + Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">

        {/* Community Avatars */}
        <m.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.5, delay: 0.1}}
          className="p-8 rounded-3xl bg-card/30 backdrop-blur-md border border-border/30 hover:border-primary/20 transition-all duration-500 flex flex-col items-center justify-center text-center space-y-6"
        >
          <div className="flex -space-x-3">
            {[
              {bg: "bg-primary/20", text: "text-primary", border: "border-primary/20", label: "JD"},
              {bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", label: "AM"},
              {bg: "bg-primary/10", text: "text-primary", border: "border-primary/20", label: "KS"},
              {bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", label: "RW"},
              {bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20", label: "SL"},
            ].map((a, i) => (
              <div
                key={i}
                className={`size-10 rounded-full ring-2 ring-background ${a.bg} text-[10px] font-black flex items-center justify-center border ${a.border} ${a.text}`}
              >
                {a.label}
              </div>
            ))}
            <div className="size-10 rounded-full ring-2 ring-background bg-muted border border-border text-[10px] font-bold flex items-center justify-center text-muted-foreground/70">
              +500
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-foreground uppercase tracking-tight">
              500+ Competitors and Growing
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              Join the HNU ICPC Community on Facebook
            </p>
          </div>
          <a
            href="https://www.facebook.com/fcsit.hnu.icpc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-wider hover:bg-primary/20 transition-all"
          >
            <Facebook size={14} />
            Join the Group
          </a>
        </m.div>

        {/* Community Values */}
        <m.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.5, delay: 0.2}}
          className="p-8 rounded-3xl bg-card/30 backdrop-blur-md border border-border/30 hover:border-primary/20 transition-all duration-500 flex flex-col justify-center"
        >
          <div className="space-y-5">
            {values.map((v, idx) => (
              <div key={v.label} className="flex items-start gap-4">
                <div className="size-10 rounded-xl bg-primary/[0.06] flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <v.icon size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-foreground">
                    {v.label}
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-0.5">
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </m.div>
      </div>

      {/* CTA */}
      <m.div
        initial={{opacity: 0, y: 20}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true}}
        transition={{duration: 0.5, delay: 0.3}}
        className="text-center"
      >
        <Link
          href="/signup"
          className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-[0_8px_40px_hsl(var(--primary)/0.35)] hover:shadow-[0_14px_50px_hsl(var(--primary)/0.5)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
        >
          Join the Community
          <ArrowRight size={16} />
        </Link>
      </m.div>
    </div>
  </section>
);

export default CommunitySection;
