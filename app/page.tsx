"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  RefreshCw,
  Target,
  Zap,
  ShieldCheck,
  LineChart,
  Terminal,
  ClipboardList,
  Layers,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
  Flame,
} from "lucide-react";
import useUser from "@/hooks/useUser";
import Loader from "@/components/shared/Loader";

/* ───── Animated number ───── */
const Counter = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (!go) return;
    const dur = 1400;
    const t0 = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setV(Math.floor((1 - Math.pow(1 - p, 4)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, to]);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setGo(true), { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return <span ref={ref}>{v}{suffix}</span>;
};

/* ───── Decorative orb ───── */
const Orb = ({ className }: { className?: string }) => (
  <div className={`absolute rounded-full pointer-events-none blur-[120px] ${className}`} />
);

/* ═══════════════════ HERO ═══════════════════ */
const Hero = ({ user }: { user: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      <Orb className="w-[700px] h-[700px] bg-primary/12 -top-[15%] -left-[10%]" />
      <Orb className="w-[500px] h-[500px] bg-emerald-500/8 bottom-[5%] right-[-5%]" />

      {/* fine grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_55%_55%_at_50%_50%,black_30%,transparent_100%)]" />

      <motion.div style={{ y, opacity }} className="container mx-auto px-6 relative z-10 -mt-32">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/[0.07] border border-primary/15 text-primary text-[10px] font-black uppercase tracking-[0.25em] backdrop-blur-xl"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>{" "}
            <span>Free · Open Source · By ICPC Community</span>
          </motion.div>

          {/* heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="text-6xl sm:text-8xl md:text-9xl font-[1000] tracking-tighter leading-[0.88] uppercase select-none"
          >
            <span className="bg-gradient-to-b from-foreground to-foreground/35 bg-clip-text text-transparent">UPSOLVE</span>
            <span className="bg-gradient-to-br from-primary to-emerald-400 bg-clip-text text-transparent">.IT</span>
          </motion.h1>

          {/* sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground/70 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Five training modes · live Codeforces sync · per-mode analytics · session reviews · upsolve tracking.{" "}
            <span className="text-foreground font-semibold">Everything to level up.</span>
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            {user ? (
              <Button asChild size="lg" className="h-16 w-full sm:w-auto px-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-[0_8px_40px_hsl(var(--primary)/0.35)] hover:shadow-[0_14px_50px_hsl(var(--primary)/0.5)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300">
                <Link href="/home" className="flex items-center gap-3">Dashboard <ArrowRight size={18} /></Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="h-16 w-full sm:w-auto px-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-[0_8px_40px_hsl(var(--primary)/0.35)] hover:shadow-[0_14px_50px_hsl(var(--primary)/0.5)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300">
                  <Link href="/signup" className="flex items-center gap-3">Get Started Free <ArrowRight size={18} /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-16 w-full sm:w-auto px-14 rounded-2xl border-2 border-border/40 font-black uppercase tracking-widest text-xs hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300 backdrop-blur-xl">
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* scroll hint */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/30">
        <span className="text-[8px] font-black uppercase tracking-[0.35em]">Scroll</span>
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.6, repeat: Infinity }}><ChevronDown size={14} /></motion.div>
      </motion.div>
    </section>
  );
};

/* ═══════════════════ FEATURES – open rows, no cards ═══════════════════ */
const featureRows = [
  { icon: RefreshCw, label: "Live CF Sync", text: "Link your handle once. Ratings, submissions, and heatmaps auto-populate — no CF password needed." },
  { icon: Target, label: "Five Training Modes", text: "Ladder, weakness, speed, contest simulation, and endurance. Tune tags and difficulty per session." },
  { icon: LineChart, label: "Per-mode Analytics", text: "Stats broken down by mode, performance trends, session history, and trajectory charts." },
  { icon: ShieldCheck, label: "Secure by Design", text: "JWT auth, role-aware access, public CF API only. Your credentials never touch our servers." },
];

const Features = () => (
  <section className="py-32 relative">
    <Orb className="w-[450px] h-[450px] bg-primary/6 top-[20%] right-[-8%]" />
    <div className="container mx-auto px-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl mb-20 space-y-3">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Core Platform</span>
        <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-[0.95]">Built for<br />Growth</h2>
      </motion.div>

      <div className="space-y-0 divide-y divide-border/20">
        {featureRows.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 py-10 md:py-14 items-start hover:bg-primary/[0.02] transition-colors duration-500 -mx-6 px-6 rounded-xl"
          >
            <div className="md:col-span-1 flex items-center">
              <div className="h-12 w-12 rounded-xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:bg-primary/[0.12] group-hover:scale-110 transition-all duration-500">
                <f.icon size={22} />
              </div>
            </div>
            <h3 className="md:col-span-3 text-2xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">{f.label}</h3>
            <p className="md:col-span-8 text-muted-foreground font-medium leading-relaxed text-lg">{f.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════ CLOSE THE LOOP – inline layout ═══════════════════ */
const loopItems = [
  { icon: ClipboardList, num: "01", title: "Session Reviews", text: "Debrief each run with solved counts, timing breakdowns, and personal notes." },
  { icon: Layers, num: "02", title: "Upsolve & Streaks", text: "Queue misses for later, track streaks, keep weak spots from slipping through." },
  { icon: Sparkles, num: "03", title: "Levels Roadmap", text: "Follow a curated ladder of problems and ratings as you progress." },
];

const CloseTheLoop = () => (
  <section className="py-32 relative overflow-hidden">
    <div className="container mx-auto px-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-20 space-y-4">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">After Every Session</span>
        <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase">Close the Loop</h2>
        <p className="text-muted-foreground font-medium text-lg">Reviews, upsolve, and levels turn raw practice into lasting gains.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
        {loopItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="group relative space-y-6"
          >
            {/* large decorative number */}
            <span className="text-[6rem] font-[1000] leading-none text-primary/[0.05] group-hover:text-primary/[0.1] transition-colors select-none absolute -top-8 -left-2">{item.num}</span>
            <div className="relative pt-12 space-y-4">
              <div className="h-11 w-11 rounded-xl bg-primary/[0.06] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <item.icon size={20} />
              </div>
              <h3 className="text-xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.text}</p>
            </div>
            {/* underline accent */}
            <div className="h-px w-12 bg-primary/20 group-hover:w-full group-hover:bg-primary/40 transition-all duration-700" />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════ WORKFLOW TIMELINE ═══════════════════ */
const steps = [
  { n: "01", title: "Sync", desc: "Connect your handle; ratings and submissions populate.", icon: RefreshCw },
  { n: "02", title: "Configure", desc: "Pick a mode, set tags and rating band.", icon: Target },
  { n: "03", title: "Train & Review", desc: "Run timed sessions, then debrief with reviews.", icon: Zap },
  { n: "04", title: "Analyze", desc: "Use stats, trajectories, and upsolve list to steer your next block.", icon: BarChart3 },
];

const Workflow = () => (
  <section className="py-32 relative overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.012)_1px,transparent_1px)] bg-[size:48px_48px]" />
    <Orb className="w-[400px] h-[400px] bg-primary/6 bottom-[10%] left-[5%]" />

    <div className="container mx-auto px-6 relative z-10">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-xl mb-20 space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/[0.07] border border-primary/15 text-primary text-[10px] font-black uppercase tracking-[0.25em]">Workflow</span>
        <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-[0.95]">The Evolution<br />Protocol</h2>
        <p className="text-muted-foreground font-medium text-lg">One repeatable loop from sync to insight — run it every week.</p>
      </motion.div>

      {/* vertical timeline */}
      <div className="relative pl-8 md:pl-12 border-l border-border/20 space-y-16 md:space-y-20">
        {steps.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative group"
          >
            {/* dot on the line */}
            <div className="absolute -left-8 md:-left-12 top-1 w-4 h-4 rounded-full border-2 border-primary/40 bg-background group-hover:bg-primary group-hover:border-primary transition-all duration-500 -translate-x-1/2" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10 items-start">
              <div className="md:col-span-1 flex items-center gap-3">
                <span className="text-3xl font-[1000] text-primary/20 group-hover:text-primary/50 transition-colors">{s.n}</span>
              </div>
              <div className="md:col-span-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/[0.06] flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <s.icon size={18} />
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">{s.title}</h4>
              </div>
              <p className="md:col-span-8 text-muted-foreground font-medium leading-relaxed">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════ COMMUNITY ═══════════════════ */
const Community = () => (
  <section className="py-32 relative">
    <div className="container mx-auto px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* left */}
        <div className="space-y-10">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.25em]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>{" "}
            <span>Community Product</span>
          </motion.div>

          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-6xl font-[1000] tracking-tighter uppercase leading-[0.95]">
            Born from<br />the <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">Community</span>
          </motion.h2>

          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-lg text-muted-foreground font-medium leading-relaxed max-w-lg">
            A product raised from the heart of the <span className="text-foreground font-bold">HNU ICPC Community</span>. Built to elevate training standards and empower every competitive programmer.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center gap-10">
            <div><span className="block text-5xl font-[1000] tracking-tighter"><Counter to={500} suffix="+" /></span><span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Members</span></div>
            <div className="h-14 w-px bg-border/20" />
            <div><span className="block text-5xl font-[1000] tracking-tighter"><Counter to={10} suffix="k+" /></span><span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Problems</span></div>
          </motion.div>
        </div>

        {/* right – resource links, no cards */}
        <div className="space-y-8">
          <motion.a
            href="https://docs.hnuicpc.tech"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="group flex items-center justify-between py-8 hover:pl-4 transition-all duration-500"
          >
            <div className="flex items-center gap-5">
              <Terminal size={22} className="text-primary shrink-0" />
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">Beginner Portal</h3>
                <p className="text-sm text-muted-foreground font-medium">Curated roadmaps from basics to mastery</p>
              </div>
            </div>
            <ArrowUpRight size={20} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </motion.a>

          <motion.a
            href="https://www.facebook.com/fcsit.hnu.icpc"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="group flex items-center justify-between py-8 hover:pl-4 transition-all duration-500"
          >
            <div className="flex items-center gap-5">
              <Flame size={22} className="text-primary shrink-0" />
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">Join the Community</h3>
                <p className="text-sm text-muted-foreground font-medium">Connect with fellow competitors</p>
              </div>
            </div>
            <ArrowUpRight size={20} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </motion.a>
        </div>
      </div>
    </div>
  </section>
);

/* ═══════════════════ PAGE ═══════════════════ */
export default function LandingPage() {
  const { user, isLoading } = useUser();
  if (isLoading) return <Loader message="Loading..." />;

  return (
    <div className="relative min-h-screen">
      <Hero user={user} />
      <Features />
      <CloseTheLoop />
      <Workflow />
      <Community />
    </div>
  );
}
