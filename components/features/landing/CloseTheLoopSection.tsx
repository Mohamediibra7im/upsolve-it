"use client";

import {m} from "framer-motion";
import {ClipboardList, Layers, Sparkles} from "lucide-react";

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

const CloseTheLoopSection = () => (
  <section className="py-32 relative overflow-hidden">
    <div className="container mx-auto px-6 relative z-10">
      <m.div
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
      </m.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
        {loopItems.map((item, i) => (
          <m.div
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
              <div className="size-11 rounded-xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
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
          </m.div>
        ))}
      </div>
    </div>
  </section>
);

export default CloseTheLoopSection;
