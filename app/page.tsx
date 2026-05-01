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
  Cpu
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
          The Ultimate Training Companion
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-[1000] tracking-tighter leading-[0.95] uppercase"
        >
          UPSOLVE<span className="text-primary">.IT</span>
          <br />
          <span className="text-muted-foreground/30 text-2xl sm:text-4xl lg:text-5xl">PRACTICE REDEFINED.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
        >
          Master Codeforces with precision. Build smart training sessions, track your growth with high-fidelity analytics, and conquer every problem in your path.
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
                Enter Command Center <ArrowRight size={18} />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg" className="h-14 sm:h-16 w-full sm:w-auto px-10 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-[0_0_40px_rgba(var(--primary),0.3)] hover:scale-105 active:scale-95 transition-all">
                <Link href="/signup" className="flex items-center gap-3">
                  Initialize Protocol <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 sm:h-16 w-full sm:w-auto px-10 rounded-2xl border-2 border-border/40 font-black uppercase tracking-widest text-[10px] sm:text-xs hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-300 backdrop-blur-xl">
                <Link href="/login">Access Interface</Link>
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
              <h3 className="text-3xl font-black tracking-tight uppercase">Seamless CF Integration</h3>
              <p className="text-muted-foreground font-medium">Connect your Codeforces handle in seconds. Our system automatically pulls your submission history, ratings, and upsolve targets.</p>
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
            <h3 className="text-2xl font-black tracking-tight uppercase">Elite Insights</h3>
            <p className="text-muted-foreground font-medium">High-fidelity data visualization tracking your rating progression and problem distribution.</p>
          </div>
        </Card>

        <Card className="border-border/40 bg-card/20 backdrop-blur-2xl rounded-[2.5rem] p-10 group overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
              <Target size={24} />
            </div>
            <h3 className="text-2xl font-black tracking-tight uppercase">Session Builder</h3>
            <p className="text-muted-foreground font-medium">Generate custom practice sessions based on specific tags and rating ranges to sharpen your edge.</p>
          </div>
        </Card>

        <Card className="md:col-span-2 border-border/40 bg-card/20 backdrop-blur-2xl rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative flex-1 order-2 md:order-1">
             <div className="grid grid-cols-2 gap-4">
               {[Zap, Cpu, Terminal, ShieldCheck].map((Icon) => (
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
            <h3 className="text-3xl font-black tracking-tight uppercase">Secure Protocol</h3>
            <p className="text-muted-foreground font-medium">Your Codeforces account remains entirely safe. We only use public API data and never ask for your CF credentials.</p>
          </div>
        </Card>
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
              Born from the <span className="text-primary italic">Community</span>
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
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Protocol: COMMUNITY_FIRST</p>
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
    return <Loader message="Accessing Neural Interface..." />;
  }

  return (
    <div className="relative min-h-screen">
      <HeroSection user={user} />
      <FeatureBento />
      <CommunitySection />
    </div>
  );
}
