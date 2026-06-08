"use client";

import {m} from "framer-motion";
import {ArrowUpRight, Globe} from "lucide-react";
import Counter from "./Counter";

const CommunitySection = () => (
  <section className="py-32 relative overflow-hidden">
    {/* Decorative blur elements */}
    <div className="absolute rounded-full pointer-events-none blur-[120px] size-[400px] bg-primary/5 -top-[10%] right-[10%]" />
    <div className="absolute rounded-full pointer-events-none blur-[120px] size-[350px] bg-emerald-500/5 -bottom-[10%] left-[10%]" />

    <div className="container mx-auto px-6 relative z-10">
      
      {/* Centered Section Title */}
      <m.div
        initial={{opacity: 0, y: 16}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true}}
        className="text-center max-w-2xl mx-auto mb-24 space-y-4"
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

      {/* Bento-style Asymmetric Grid */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Card 1: Join Community (FB Group) - Colspan 1 */}
        <m.a
          href="https://www.facebook.com/fcsit.hnu.icpc"
          target="_blank"
          rel="noopener noreferrer"
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.5, delay: 0.1}}
          className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] hover:-translate-y-1 transition-all duration-500 ease-out group relative overflow-hidden flex flex-col justify-between min-h-[350px]"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
          <div className="absolute top-6 right-6 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500">
            <ArrowUpRight size={22} />
          </div>

          <div className="space-y-4">
            <div className="size-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
              <Globe size={22} />
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
              Social Hub
            </h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Connect with fellow competitors, coordinate training sessions, and share success.
            </p>
          </div>

          {/* Micro UI: Community Avatar Group */}
          <div className="flex items-center justify-between p-3.5 bg-background/50 border border-border/40 rounded-2xl text-[10px]">
            <div className="flex -space-x-2.5 overflow-hidden">
              <div className="size-6 rounded-full ring-2 ring-background bg-primary/20 text-[8px] font-black flex items-center justify-center border border-primary/20">JD</div>
              <div className="size-6 rounded-full ring-2 ring-background bg-primary/10 text-[8px] font-black flex items-center justify-center border border-primary/20">AM</div>
              <div className="size-6 rounded-full ring-2 ring-background bg-emerald-500/10 text-[8px] font-black flex items-center justify-center border border-emerald-500/20 text-emerald-500">KS</div>
              <div className="size-6 rounded-full ring-2 ring-background bg-muted border border-border text-[8px] font-bold flex items-center justify-center text-muted-foreground/70">+500</div>
            </div>
            <span className="font-black text-primary uppercase text-[8px] tracking-wider bg-primary/10 px-2 py-1 rounded-md border border-primary/25">Join Hub</span>
          </div>
        </m.a>

        {/* Card 3: Platform Stats Bar - Colspan 3 */}
        <m.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.5, delay: 0.2}}
          className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-center divide-y md:divide-y-0 md:divide-x divide-border/20"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.01] pointer-events-none" />
          
          <div className="space-y-1">
            <span className="block text-4xl font-[1000] tracking-tighter text-primary group-hover:scale-105 transition-transform duration-300">
              <Counter to={500} suffix="+" />
            </span>
            <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              Members
            </span>
          </div>
          
          <div className="space-y-1 pt-6 md:pt-0">
            <span className="block text-4xl font-[1000] tracking-tighter text-primary group-hover:scale-105 transition-transform duration-300">
              <Counter to={10} suffix="k+" />
            </span>
            <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              Problems Solved
            </span>
          </div>
          
          <div className="space-y-1 pt-6 md:pt-0">
            <span className="block text-4xl font-[1000] tracking-tighter text-primary group-hover:scale-105 transition-transform duration-300">
              5+
            </span>
            <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              Training Levels
            </span>
          </div>
          
          <div className="space-y-1 pt-6 md:pt-0">
            <span className="block text-4xl font-[1000] tracking-tighter text-primary group-hover:scale-105 transition-transform duration-300">
              100%
            </span>
            <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              Free &amp; Community-Driven
            </span>
          </div>
        </m.div>

      </div>
    </div>
  </section>
);

export default CommunitySection;
