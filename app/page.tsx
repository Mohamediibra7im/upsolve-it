"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  RefreshCw,
  Target,
  Zap,
  ShieldCheck,
  LineChart,
  Terminal,
  Cpu,
  ClipboardList,
  Layers,
  Sparkles,
  Timer,
} from "lucide-react";
import useUser from "@/hooks/useUser";
import Loader from "@/app/_Components/Loader";

const HeroSection = ({ user }: { user: any }) => (
  <section className="relative pt-20 pb-32 overflow-hidden">
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em]"
        >
          <Zap size={14} className="fill-primary" />
          Multi-mode training · Stats · Reviews · Upsolve
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-[1000] tracking-tight leading-[0.95] uppercase"
        >
          UPSOLVE<span className="text-primary">.IT</span>
          <br />
          <span className="text-muted-foreground/30 text-2xl sm:text-4xl lg:text-5xl tracking-widest">PRACTICE REDEFINED.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
        >
          Run ladder, weakness, speed, contest, and endurance sessions, then debrief with post-session reviews, per-mode statistics, performance trajectories, upsolve tracking, and a curated levels path. Everything stays synced with your public Codeforces profile.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 px-6 sm:px-0"
        >
          {user ? (
            <Button asChild size="lg" className="h-14 sm:h-16 w-full sm:w-auto px-10 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-[0_0_40px_rgba(var(--primary),0.3)] hover:scale-105 active:scale-95 transition-all">
              <Link href="/home" className="flex items-center gap-3">
                Enter Dashboard <ArrowRight size={18} />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="h-14 sm:h-16 w-full sm:w-auto px-10 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-[0_0_40px_rgba(var(--primary),0.3)] hover:scale-105 active:scale-95 transition-all">
                <Link href="/signup" className="flex items-center gap-3">
                  Get Started <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 sm:h-16 w-full sm:w-auto px-10 rounded-2xl border-2 border-border/40 font-black uppercase tracking-widest text-[10px] sm:text-xs hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300 backdrop-blur-xl">
                <Link href="/login">Sign In</Link>
              </Button>
            </>
          )}
        </motion.div>
      </div>
    </div>

    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-full h-full pointer-events-none">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-20" />
    </div>
  </section>
);

const FeatureBento = () => (
  <section className="py-24 bg-background/50">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border/40 bg-card/20 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden group">
          <CardContent className="p-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 mx-auto md:mx-0">
                <RefreshCw size={24} />
              </div>
              <h3 className="text-3xl font-black tracking-tight uppercase">Live Codeforces sync</h3>
              <p className="text-muted-foreground font-medium">Link your handle once. We pull public ratings, submissions, and progress so dashboards, heatmaps, and session stats stay current; no CF password required.</p>
            </div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative p-6 rounded-3xl border border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Synchronization Active</span>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "85%" }}
                      className="h-full bg-primary" 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-50">
                    <span>Pulling Submissions</span>
                    <span>85% Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/20 backdrop-blur-2xl rounded-[2.5rem] p-10 group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 size={120} className="text-primary" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <LineChart size={24} />
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase">Per-mode analytics</h3>
            <p className="text-muted-foreground font-medium">Statistics broken down by training mode, performance trends over time, full session history, and trajectory charts, so you see where you actually improve.</p>
          </div>
        </Card>

        <Card className="border-border/40 bg-card/20 backdrop-blur-2xl rounded-[2.5rem] p-10 group overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <Target size={24} />
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase">Five training modes</h3>
            <p className="text-muted-foreground font-medium">Ladder, weakness targeting, speed drills, contest simulation, and endurance blocks: pick the protocol that matches today&apos;s goal, then tune tags and difficulty.</p>
          </div>
        </Card>

        <Card className="md:col-span-2 border-border/40 bg-card/20 backdrop-blur-2xl rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative flex-1 order-2 md:order-1">
             <div className="grid grid-cols-2 gap-4">
               {[Target, Timer, LineChart, Sparkles].map((Icon) => (
                 <div key={Icon.displayName || Icon.name || `icon-${Icon.toString()}`} className="p-6 rounded-3xl border border-border/40 bg-background/40 flex items-center justify-center text-primary/40 group-hover:text-primary/100 transition-colors">
                   <Icon size={32} />
                 </div>
               ))}
             </div>
          </div>
          <div className="flex-1 space-y-4 order-1 md:order-2">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-3xl font-black tracking-tight uppercase">Secure by design</h3>
            <p className="text-muted-foreground font-medium">JWT auth, role-aware access, and public CF API data only. Your contest credentials never touch our servers. Help center and support when you need it.</p>
          </div>
        </Card>
      </div>
    </div>
  </section>
);

const FeatureHighlights = () => (
  <section className="py-16 bg-background/30">
    <div className="container mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">
          After every session
        </p>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
          Close the loop
        </h2>
        <p className="text-muted-foreground font-medium">
          Reviews, upsolve, and structured levels turn raw practice into lasting gains.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: ClipboardList,
            title: "Session reviews",
            body: "Debrief each run with solved counts, timing, and notes, so virtual, speed, and contest sessions all leave a paper trail.",
          },
          {
            icon: Layers,
            title: "Upsolve & streaks",
            body: "Queue misses for later, track upsolve streaks alongside training streaks, and keep weak problems from slipping through.",
          },
          {
            icon: Sparkles,
            title: "Levels roadmap",
            body: "Follow a curated ladder of problems and ratings as you progress, and pair it with weakness mode for targeted fixes.",
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="h-full border-border/40 bg-card/20 backdrop-blur-2xl rounded-[2rem] p-8 hover:border-primary/30 transition-colors duration-300">
              <CardContent className="p-0 space-y-5">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-black tracking-tight uppercase">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {item.body}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

const EvolutionProtocol = () => (
  <section className="py-24 bg-card/5 border-y border-border/40 relative overflow-hidden">
    <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
    <div className="container mx-auto px-4 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest"
        >
          Operational Workflow
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">The Evolution Protocol</h2>
        <p className="text-muted-foreground font-medium text-lg">From first sync to stats and upsolve: one repeatable loop you can run every week.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
        {[
          { step: "01", title: "Sync", desc: "Connect your handle; ratings, submissions, and heatmaps populate automatically.", icon: RefreshCw },
          { step: "02", title: "Configure", desc: "Pick a mode (ladder, weakness, speed, contest, or endurance), then set tags and rating band.", icon: Target },
          { step: "03", title: "Train & review", desc: "Run timed sessions, then open structured reviews to see what actually happened.", icon: Zap },
          { step: "04", title: "Analyze & upsolve", desc: "Use per-mode statistics, trajectories, and the upsolve list to steer your next block.", icon: BarChart3 }
        ].map((item, i) => (
          <motion.div 
            key={item.step} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative group"
          >
            <div className="space-y-6 relative z-10">
              <div className="text-8xl font-black text-primary/5 group-hover:text-primary/10 transition-colors absolute -top-12 -left-4 -z-10 select-none">
                {item.step}
              </div>
              <div className="h-16 w-16 rounded-2xl bg-background border border-border/60 flex items-center justify-center text-primary shadow-2xl group-hover:scale-110 group-hover:border-primary/40 transition-all duration-500">
                <item.icon size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">{item.title}</h4>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
            {i < 3 && (
              <div className="hidden md:block absolute top-8 left-[calc(100%+1.5rem)] w-[calc(100%-4rem)] h-[1px] bg-gradient-to-r from-primary/30 to-transparent" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const CommunitySection = () => (
  <section className="py-24 relative overflow-hidden">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Community Story */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            Official Community Product
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              Born from the <span className="text-primary">Community</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-xl">
              Upsolve.it isn't just a tool, it's a product raised from the heart of the <span className="text-foreground font-bold">HNU ICPC Community</span>. We built this to elevate our training standards and empower every programmer to reach their full potential.
            </p>
          </div>

          <div className="flex items-center gap-6 pt-4">
             <div className="flex flex-col">
               <span className="text-3xl font-black text-foreground">500+</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Community Members</span>
             </div>
             <div className="h-10 w-[1px] bg-border/40" />
             <div className="flex flex-col">
               <span className="text-3xl font-black text-foreground">10k+</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Solved Problems</span>
             </div>
          </div>
        </div>

        {/* Resource Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full border-border/40 bg-card/20 backdrop-blur-2xl rounded-[2.5rem] p-8 group hover:border-primary/40 transition-all duration-500">
              <CardContent className="p-0 space-y-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Terminal size={28} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black tracking-tight uppercase">Beginner Portal</h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    New to competitive programming? Our curated roadmaps and materials will take you from the basics to advanced mastery.
                  </p>
                </div>
                <Button asChild className="w-full h-12 rounded-xl bg-background border border-border/40 hover:border-primary/40 hover:bg-primary/5 text-foreground transition-all font-black uppercase tracking-widest text-[10px]">
                  <a href="https://docs.hnuicpc.tech" target="_blank" rel="noopener noreferrer">
                    Explore Resources <ArrowRight size={14} className="ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full border-border/40 bg-primary/5 backdrop-blur-2xl rounded-[2.5rem] p-8 group hover:bg-primary/10 transition-all duration-500 border-dashed">
              <CardContent className="p-0 space-y-6 flex flex-col h-full justify-between">
                <div className="space-y-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                    <Cpu size={28} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black tracking-tight uppercase">Open Logic</h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                      Upsolve.it is built for the community, by the community. Access our documentation to understand the logic behind our training algorithms.
                    </p>
                  </div>
                </div>
                <div className="pt-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Mode: COMMUNITY_FIRST</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>

    {/* Background Decorative */}
    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] -z-10" />
  </section>
);

export default function LandingPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Loader message="Loading dashboard..." />;
  }

  return (
    <div className="relative min-h-screen">
      <HeroSection user={user} />
      <FeatureBento />
      <FeatureHighlights />
      <EvolutionProtocol />
      <CommunitySection />
    </div>
  );
}
