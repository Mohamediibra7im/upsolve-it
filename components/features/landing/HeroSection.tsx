"use client";

import Link from "next/link";
import {m, useScroll, useTransform} from "framer-motion";
import {useRef} from "react";
import {Button} from "@/components/ui/button";
import {ArrowRight, ChevronDown} from "lucide-react";
import {useRoadmapUserSummary} from "@/hooks/roadmap";
import Orb from "./Orb";

/* ═══════════════════ HERO ═══════════════════ */
const HeroSection = ({user}: {user: any}) => {
  const ref = useRef<HTMLDivElement>(null);
  const {scrollYProgress} = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const {summary: _summary} = useRoadmapUserSummary(!!user);

  return (
    <section
      ref={ref}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
    >
      <Orb className="size-[700px] bg-primary/12 -top-[15%] -left-[10%]" />
      <Orb className="size-[500px] bg-emerald-500/8 bottom-[5%] right-[-5%]" />

      {/* fine grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_55%_55%_at_50%_50%,black_30%,transparent_100%)]" />

      <m.div
        style={{y, opacity}}
        className="container mx-auto px-6 relative z-10 -mt-32"
      >
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <m.div
            initial={{opacity: 0, y: 20, filter: "blur(6px)"}}
            animate={{opacity: 1, y: 0, filter: "blur(0px)"}}
            transition={{duration: 0.6}}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/[0.07] border border-primary/15 text-primary text-[10px] font-black uppercase tracking-[0.25em] backdrop-blur-xl"
          >
            <span className="relative flex size-1.5">
              <span className="animate-ping absolute inline-flex size-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full size-1.5 bg-primary" />
            </span>{" "}
            <span>Free · By HNU ICPC Community · Codeforces Companion</span>
          </m.div>

          {/* heading */}
          <m.h1
            initial={{opacity: 0, y: 30, filter: "blur(10px)"}}
            animate={{opacity: 1, y: 0, filter: "blur(0px)"}}
            transition={{duration: 0.8, delay: 0.12}}
            className="text-6xl sm:text-8xl md:text-9xl font-[1000] tracking-tighter leading-[0.88] uppercase select-none"
          >
            <span className="bg-gradient-to-b from-foreground to-foreground/35 bg-clip-text text-transparent">
              UPSOLVE
            </span>
            <span className="bg-gradient-to-br from-primary to-emerald-400 bg-clip-text text-transparent">
              .IT
            </span>
          </m.h1>

          {/* sub */}
          <m.p
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.6, delay: 0.28}}
            className="text-muted-foreground/90 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto tracking-tight font-medium"
          >
            The ultimate{" "}
            <span className="text-foreground font-black border-b-2 border-primary/20">
              ecosystem
            </span>{" "}
            for competitive programmers to{" "}
            <span className="text-primary font-bold">track progress</span>,{" "}
            <span className="text-foreground/90 font-bold">
              optimize training
            </span>
            , and achieve{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-black">
              peak performance
            </span>{" "}
            in a data-driven world.
          </m.p>

          {/* CTA */}
          <m.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.6, delay: 0.42}}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            {user ? (
              <>
                <Button
                  asChild
                  size="lg"
                  className="h-16 w-full sm:w-auto px-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-[0_8px_40px_hsl(var(--primary)/0.35)] hover:shadow-[0_14px_50px_hsl(var(--primary)/0.5)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
                >
                  <Link href="/profile" className="flex items-center gap-3">
                    Profile <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-16 w-full sm:w-auto px-14 rounded-2xl border-2 border-border/40 font-black uppercase tracking-widest text-xs hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300 backdrop-blur-xl"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="h-16 w-full sm:w-auto px-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-[0_8px_40px_hsl(var(--primary)/0.35)] hover:shadow-[0_14px_50px_hsl(var(--primary)/0.5)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
                >
                  <Link href="/signup" className="flex items-center gap-3">
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-16 w-full sm:w-auto px-14 rounded-2xl border-2 border-border/40 font-black uppercase tracking-widest text-xs hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300 backdrop-blur-xl"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </m.div>
        </div>
      </m.div>

      {/* scroll hint */}
      <m.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 1.6}}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/30"
      >
        <span className="text-[8px] font-black uppercase tracking-[0.35em]">
          Scroll
        </span>
        <m.div
          animate={{y: [0, 5, 0]}}
          transition={{duration: 1.6, repeat: Infinity}}
        >
          <ChevronDown size={14} />
        </m.div>
      </m.div>
    </section>
  );
};

export default HeroSection;
