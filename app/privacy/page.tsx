"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Cookie, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "Intelligence Gathering",
    icon: Eye,
    content: "We collect only the essential data required to synchronize your Codeforces progress, including your handle, rating history, and submission metadata. We do not store private credentials."
  },
  {
    title: "Data Encryption",
    icon: Shield,
    content: "Your session data is encrypted and stored securely. We use industry-standard protocols to ensure that your training history remains accessible only to you."
  },
  {
    title: "Neural Privacy",
    icon: Lock,
    content: "We never sell or share your training patterns with third-party advertisers. Your performance metrics are used exclusively to provide you with personalized training insights."
  },
  {
    title: "Cookie Protocol",
    icon: Cookie,
    content: "We use essential cookies to maintain your authenticated session. No tracking or marketing cookies are deployed within the Command Center."
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen relative overflow-hidden py-20">
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.02]" />
      
      <div className="container mx-auto px-4 max-w-4xl space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
            Protocol: PRIVACY_SAFEGUARD
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">
            Privacy <span className="text-primary italic">Policy</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl mx-auto">
            Transparency is a core protocol. Learn how we handle your intelligence data and maintain the security of your training environment.
          </p>
        </motion.div>

        <div className="grid gap-6">
          {sections.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 rounded-[2rem] bg-card/30 border border-border/40 backdrop-blur-xl space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <section.icon size={20} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">{section.title}</h3>
              </div>
              <p className="text-muted-foreground font-medium leading-relaxed italic">
                "{section.content}"
              </p>
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
