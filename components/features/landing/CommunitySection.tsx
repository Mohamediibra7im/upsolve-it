"use client";

import {m} from "framer-motion";
import {Terminal, Flame, ArrowUpRight} from "lucide-react";
import Counter from "./Counter";

const CommunitySection = () => (
  <section className="py-32 relative">
    <div className="container mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* left */}
        <div className="space-y-10">
          <m.div
            initial={{opacity: 0, x: -16}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.25em]"
          >
            <span className="relative flex size-1.5">
              <span className="animate-ping absolute inline-flex size-full rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
            </span>{" "}
            <span>Community Product</span>
          </m.div>

          <m.h2
            initial={{opacity: 0, y: 16}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-[0.95]"
          >
            Born from
            <br />
            the{" "}
            <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
              Community
            </span>
          </m.h2>

          <m.p
            initial={{opacity: 0, y: 12}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            className="text-lg text-muted-foreground font-medium leading-relaxed max-w-lg"
          >
            A product raised from the heart of the{" "}
            <span className="text-foreground font-bold">
              HNU ICPC Community
            </span>
            . Built to elevate training standards and empower every competitive
            programmer.
          </m.p>

          <m.div
            initial={{opacity: 0, y: 12}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            className="flex items-center gap-10"
          >
            <div>
              <span className="block text-5xl font-[1000] tracking-tighter">
                <Counter to={500} suffix="+" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                Members
              </span>
            </div>
            <div className="h-14 w-px bg-border/20" />
            <div>
              <span className="block text-5xl font-[1000] tracking-tighter">
                <Counter to={10} suffix="k+" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                Problems
              </span>
            </div>
          </m.div>
        </div>

        {/* right – resource links, no cards */}
        <div className="space-y-8">
          <m.a
            href="https://docs.hnuicpc.tech"
            target="_blank"
            rel="noopener noreferrer"
            initial={{opacity: 0, x: 20}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true}}
            className="group flex items-center justify-between py-8 hover:pl-4 transition-all duration-500"
          >
            <div className="flex items-center gap-5">
              <Terminal size={22} className="text-primary shrink-0" />
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                  Beginner Portal
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Curated roadmaps from basics to mastery
                </p>
              </div>
            </div>
            <ArrowUpRight
              size={20}
              className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
            />
          </m.a>

          <m.a
            href="https://www.facebook.com/fcsit.hnu.icpc"
            target="_blank"
            rel="noopener noreferrer"
            initial={{opacity: 0, x: 20}}
            whileInView={{opacity: 1, x: 0}}
            viewport={{once: true}}
            transition={{delay: 0.16}}
            className="group flex items-center justify-between py-8 hover:pl-4 transition-all duration-500"
          >
            <div className="flex items-center gap-5">
              <Flame size={22} className="text-primary shrink-0" />
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                  Join the Community
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Connect with fellow competitors
                </p>
              </div>
            </div>
            <ArrowUpRight
              size={20}
              className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
            />
          </m.a>
        </div>
      </div>
    </div>
  </section>
);

export default CommunitySection;
