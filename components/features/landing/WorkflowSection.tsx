"use client";

import {m} from "framer-motion";
import {RefreshCw, Target, Zap, BarChart3} from "lucide-react";
import Orb from "./Orb";

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

const WorkflowSection = () => (
  <section className="py-32 relative overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.012)_1px,transparent_1px)] bg-[size:48px_48px]" />
    <Orb className="size-[400px] bg-primary/6 bottom-[10%] left-[5%]" />

    <div className="container mx-auto px-6 relative z-10">
      <m.div
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
      </m.div>

      {/* vertical timeline */}
      <div className="relative pl-8 md:pl-12 border-l border-border/20 space-y-16 md:space-y-20">
        {steps.map((s, i) => (
          <m.div
            key={s.n}
            initial={{opacity: 0, x: -16}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true}}
            transition={{delay: i * 0.1}}
            className="relative group"
          >
            {/* dot on the line */}
            <div className="absolute -left-8 md:-left-12 top-1 size-4 rounded-full border-2 border-primary/40 bg-background group-hover:bg-primary group-hover:border-primary transition-all duration-500 -translate-x-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10 items-start">
              <div className="md:col-span-1 flex items-center gap-3">
                <span className="text-3xl font-[1000] text-primary/20 group-hover:text-primary/50 transition-colors">
                  {s.n}
                </span>
              </div>
              <div className="md:col-span-3 flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/[0.06] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
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
          </m.div>
        ))}
      </div>
    </div>
  </section>
);

export default WorkflowSection;
