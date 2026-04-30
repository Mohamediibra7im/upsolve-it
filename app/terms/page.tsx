"use client";

import { motion } from "framer-motion";
import { Scale, Zap, Target, ShieldAlert, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const terms = [
  {
    title: "Operational Access",
    icon: Globe,
    content: "Access to the Command Center is granted for personal, non-commercial use in improving competitive programming skills. Automated scraping or interference with system logic is prohibited."
  },
  {
    title: "User Conduct",
    icon: Target,
    content: "Respect the training environment. Users must not attempt to bypass security protocols, reverse-engineer the system, or disrupt the experience for other community members."
  },
  {
    title: "Intelligence Accuracy",
    icon: Zap,
    content: "While we strive for 100% synchronization, we are not responsible for discrepancies in external data sources (e.g., Codeforces API latency). Training metrics are provided for informational purposes."
  },
  {
    title: "System Integrity",
    icon: ShieldAlert,
    content: "We reserve the right to terminate access for users who violate these protocols. System stability and community safety are our highest priorities."
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden py-20">
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.02]" />
      
      <div className="container mx-auto px-4 max-w-4xl space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
            Protocol: TERMS_OF_ENGAGEMENT
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none text-foreground">
            Terms <span className="text-primary italic">of Service</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
            By accessing the Command Center, you agree to adhere to the following operational protocols and system guidelines.
          </p>
        </motion.div>

        <div className="grid gap-6">
          {terms.map((term, idx) => (
            <motion.div
              key={term.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 rounded-[2rem] bg-card/30 border border-border/40 backdrop-blur-xl transition-all hover:bg-card/50"
            >
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-2xl bg-background/50 text-primary border border-border/40 group-hover:border-primary/40 transition-colors">
                  <term.icon size={24} />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-black uppercase tracking-tight">{term.title}</h3>
                  <p className="text-muted-foreground font-medium leading-relaxed italic opacity-80">
                    {term.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center gap-8 pt-8"
        >
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border/40 to-transparent" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
            Last Update: 04.30.2026 // Status: Active
          </p>
          <Button asChild variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[10px]">
            <Link href="/">
              <ArrowLeft size={14} className="mr-2" /> Return to Base
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
