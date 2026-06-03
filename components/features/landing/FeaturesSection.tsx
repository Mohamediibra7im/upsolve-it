"use client";

import {m} from "framer-motion";
import {RefreshCw, Target, LineChart, ShieldCheck} from "lucide-react";
import Orb from "./Orb";

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

const FeaturesSection = () => (
  <section className="py-32 relative">
    <Orb className="size-[450px] bg-primary/6 top-[20%] right-[-8%]" />
    <div className="container mx-auto px-6 relative z-10">
      <m.div
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
      </m.div>

      <div className="space-y-0 divide-y divide-border/20">
        {featureRows.map((f, i) => (
          <m.div
            key={f.label}
            initial={{opacity: 0, x: -20}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true}}
            transition={{delay: i * 0.06}}
            className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 py-10 md:py-14 items-start hover:bg-primary/[0.02] transition-colors duration-500 -mx-6 px-6 rounded-xl"
          >
            <div className="md:col-span-1 flex items-center">
              <div className="size-12 rounded-xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                <f.icon size={22} />
              </div>
            </div>
            <h3 className="md:col-span-3 text-2xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
              {f.label}
            </h3>
            <p className="md:col-span-8 text-muted-foreground font-medium leading-relaxed text-lg">
              {f.text}
            </p>
          </m.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
