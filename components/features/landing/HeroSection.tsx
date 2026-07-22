"use client";

import Link from "next/link";
import { m as motion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Cpu, Wifi, ShieldCheck, Database } from "lucide-react";
import { useRoadmapUserSummary } from "@/hooks/roadmap";

/* ─── Floating particles ─── */
const PARTICLE_COUNT = 28;

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
};

function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.4 + 0.1,
      }))
    );
  }, []);

  return particles;
}

/* ─── Title character stagger ─── */
const titleWord1 = "UPSOLVE";
const titleWord2 = ".IT";

const charVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: 0.3 + i * 0.045,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

/* ─── Typing effect hook ─── */
function useTypingEffect(text: string, speed = 30, startDelay = 1200) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);

    const startTimeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          setDone(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

/* ─── Status strip items ─── */
const statusItems = [
  { icon: Cpu, label: "SYS_CORE", status: "ONLINE" },
  { icon: Database, label: "PROBLEMS_DB", status: "SYNCED" },
  { icon: Wifi, label: "CF_API", status: "LINKED" },
  { icon: ShieldCheck, label: "AUTH_MOD", status: "READY" },
];

/* ═══════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════ */
const HeroSection = ({ user }: { user: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const { summary: _summary } = useRoadmapUserSummary(!!user);

  const particles = useParticles();

  const subtitleText =
    "The ultimate command center for competitive programmers. Analyze your trajectory, solve smart recommendations, and master algorithms in a pure developer workspace.";
  const { displayed: typedSubtitle, done: subtitleDone } = useTypingEffect(subtitleText, 18, 1400);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#040604] font-mono text-emerald-400"
    >
      {/* ── Background layers ── */}

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_45%,transparent_100%)]" />

      {/* Scanlines */}
      <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03] pointer-events-none" />

      {/* Gradient orb */}
      <div
        className="hero-orb absolute left-1/2 top-[42%] w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(6,95,70,0.08) 40%, transparent 70%)",
        }}
      />

      {/* Secondary smaller orb for depth */}
      <div
        className="hero-orb absolute left-[35%] top-[30%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 60%)",
          animationDelay: "4s",
          animationDuration: "10s",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-emerald-400"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.opacity,
            }}
            animate={{
              y: [0, -40, 10, -20, 0],
              x: [0, 15, -10, 5, 0],
              opacity: [p.opacity, p.opacity * 1.8, p.opacity * 0.5, p.opacity * 1.4, p.opacity],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <motion.div
        style={{ y, opacity }}
        className="container mx-auto px-4 relative z-10"
      >
        <div className="max-w-4xl mx-auto text-center space-y-7">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-950/30 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-[0.25em] backdrop-blur-sm"
          >
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/15 rounded-full text-emerald-400/90">
              <span className="relative flex size-1.5">
                <span className="animate-ping absolute inline-flex size-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
              </span>
              v2.0
            </span>
            <span className="w-px h-3 bg-emerald-500/20" />
            <span className="text-emerald-400/60">Open Source // Free Forever</span>
          </motion.div>

          {/* Title — staggered characters */}
          <div className="select-none">
            <motion.h1
              initial="hidden"
              animate="visible"
              className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase"
            >
              {/* UPSOLVE */}
              <span className="inline-block text-white">
                {titleWord1.split("").map((char, i) => (
                  <motion.span
                    key={`w1-${i}`}
                    custom={i}
                    variants={charVariants}
                    className="inline-block"
                    style={{ willChange: "transform, opacity, filter" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>

              {/* .IT */}
              <span className="inline-block">
                {titleWord2.split("").map((char, i) => (
                  <motion.span
                    key={`w2-${i}`}
                    custom={titleWord1.length + i}
                    variants={charVariants}
                    className="inline-block text-emerald-400"
                    style={{
                      textShadow: "0 0 20px rgba(16,185,129,0.6), 0 0 60px rgba(16,185,129,0.25), 0 0 100px rgba(16,185,129,0.1)",
                      willChange: "transform, opacity, filter",
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            </motion.h1>
          </div>

          {/* Subtitle — typing effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="max-w-2xl mx-auto min-h-[3.5rem]"
          >
            <p className="text-emerald-500/60 text-[11px] sm:text-xs leading-relaxed uppercase tracking-wide font-medium">
              <span className="text-emerald-500/30 mr-1">&gt;</span>
              {typedSubtitle}
              {!subtitleDone && (
                <span className="inline-block w-1.5 h-3.5 bg-emerald-400/70 ml-0.5 align-middle animate-pulse" />
              )}
            </p>
          </motion.div>

          {/* Status strip — horizontal */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            {statusItems.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + idx * 0.15, duration: 0.35 }}
                className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-emerald-500/40"
              >
                <item.icon size={10} className="text-emerald-500/30" />
                <span>{item.label}</span>
                <span className="text-emerald-400/70">[ {item.status} ]</span>
              </motion.div>
            ))}
          </motion.div>

          {/* ── CTAs ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            {user ? (
              <>
                {/* Primary */}
                <Button
                  asChild
                  className="hero-cta-glow hero-cta-shimmer relative h-12 px-8 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black uppercase tracking-widest text-[11px] font-mono shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300"
                >
                  <Link href="/profile" className="flex items-center gap-2">
                    GO_TO_PROFILE <ArrowRight size={14} strokeWidth={2.5} />
                  </Link>
                </Button>

                {/* Secondary */}
                <Button
                  asChild
                  variant="outline"
                  className="h-12 px-7 rounded-sm border border-emerald-500/25 bg-emerald-950/20 text-emerald-400 font-bold uppercase tracking-widest text-[10px] font-mono hover:bg-emerald-500/10 hover:border-emerald-500/40 backdrop-blur-sm transition-all duration-300"
                >
                  <Link href="/dashboard">OPERATIONS_BOARD</Link>
                </Button>

                {/* Tertiary */}
                <Button
                  asChild
                  variant="outline"
                  className="h-12 px-7 rounded-sm border border-emerald-500/25 bg-emerald-950/20 text-emerald-400 font-bold uppercase tracking-widest text-[10px] font-mono hover:bg-emerald-500/10 hover:border-emerald-500/40 backdrop-blur-sm transition-all duration-300"
                >
                  <Link href="/docs">READ_DOCS</Link>
                </Button>
              </>
            ) : (
              <>
                {/* Primary */}
                <Button
                  asChild
                  className="hero-cta-glow hero-cta-shimmer relative h-12 px-8 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black uppercase tracking-widest text-[11px] font-mono shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300"
                >
                  <Link href="/signup" className="flex items-center gap-2">
                    INITIALIZE <ArrowRight size={14} strokeWidth={2.5} />
                  </Link>
                </Button>

                {/* Secondary */}
                <Button
                  asChild
                  variant="outline"
                  className="h-12 px-7 rounded-sm border border-emerald-500/25 bg-emerald-950/20 text-emerald-400 font-bold uppercase tracking-widest text-[10px] font-mono hover:bg-emerald-500/10 hover:border-emerald-500/40 backdrop-blur-sm transition-all duration-300"
                >
                  <Link href="/login">LOGIN</Link>
                </Button>

                {/* Tertiary */}
                <Button
                  asChild
                  variant="outline"
                  className="h-12 px-7 rounded-sm border border-emerald-500/25 bg-emerald-950/20 text-emerald-400 font-bold uppercase tracking-widest text-[10px] font-mono hover:bg-emerald-500/10 hover:border-emerald-500/40 backdrop-blur-sm transition-all duration-300"
                >
                  <Link href="/docs">READ_DOCS</Link>
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll hint ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-emerald-500/25"
      >
        <span className="text-[7px] font-bold uppercase tracking-[0.3em]">
          Scroll_Down
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={14} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
