"use client";

import {m} from "framer-motion";
import {Terminal, ArrowUpRight, BookOpen, Users, Globe, Code} from "lucide-react";
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Beginner Portal (Docs Link) - Colspan 2 */}
        <m.a
          href="https://docs.hnuicpc.tech"
          target="_blank"
          rel="noopener noreferrer"
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.5}}
          className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] hover:-translate-y-1 transition-all duration-500 ease-out group relative overflow-hidden md:col-span-2 flex flex-col sm:flex-row justify-between gap-6 min-h-[350px]"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
          <div className="absolute top-6 right-6 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500">
            <ArrowUpRight size={22} />
          </div>

          <div className="flex flex-col justify-between flex-1 space-y-6">
            <div className="space-y-4">
              <div className="size-12 rounded-2xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                <BookOpen size={22} />
              </div>
              <h3 className="text-2xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                Beginner Portal
              </h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
                Step-by-step learning guides, syllabus notes, and reference documentations from basics to master levels.
              </p>
            </div>
            
            <div className="text-xs font-bold text-primary group-hover:underline">
              Explore Documentation &rarr;
            </div>
          </div>

          {/* Right part: Interactive learning structure mockup */}
          <div className="flex flex-col justify-center min-w-[200px] sm:min-w-[240px]">
            <div className="p-4 bg-background/50 border border-border/40 rounded-2xl font-mono text-[9px] text-muted-foreground/80 space-y-2">
              <div className="flex justify-between items-center text-[8px] border-b border-border/40 pb-2 mb-2 font-bold uppercase tracking-wider text-muted-foreground/40">
                <span>hnu-icpc-docs/</span>
                <span className="text-emerald-500">Active</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span className="font-bold text-foreground">basics-introduction/</span>
                </div>
                <div className="flex items-center gap-1.5 pl-3 border-l border-border/60">
                  <span className="text-primary">&bull;</span>
                  <span>cpp-basics.md</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-primary font-bold">▶</span>
                  <span className="font-bold text-foreground">data-structures/</span>
                </div>
                <div className="flex items-center gap-1.5 pl-3 border-l border-border/60">
                  <span className="text-muted-foreground/40">&bull;</span>
                  <span className="text-muted-foreground/60">segment-tree.md</span>
                </div>
              </div>
            </div>
          </div>
        </m.a>

        {/* Card 2: Join Community (FB Group) - Colspan 1 */}
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
              <div className="inline-block size-6 rounded-full ring-2 ring-background bg-primary/20 text-[8px] font-black flex items-center justify-center border border-primary/20">JD</div>
              <div className="inline-block size-6 rounded-full ring-2 ring-background bg-primary/10 text-[8px] font-black flex items-center justify-center border border-primary/20">AM</div>
              <div className="inline-block size-6 rounded-full ring-2 ring-background bg-emerald-500/10 text-[8px] font-black flex items-center justify-center border border-emerald-500/20 text-emerald-500">KS</div>
              <div className="inline-block size-6 rounded-full ring-2 ring-background bg-muted border border-border text-[8px] font-bold flex items-center justify-center text-muted-foreground/70">+500</div>
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
          className="p-6 md:p-8 rounded-3xl bg-card/40 backdrop-blur-md border border-border/40 hover:border-primary/30 hover:bg-primary/[0.01] transition-all duration-500 ease-out group relative overflow-hidden md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-center divide-y divide-border/20 md:divide-y-0 md:divide-x divide-border/20"
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
              Free &amp; Open Source
            </span>
          </div>
        </m.div>

      </div>
    </div>
  </section>
);

export default CommunitySection;
