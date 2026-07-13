"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Book, 
  MessageCircle, 
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  ChevronRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { m as motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import HelpSearch from "./HelpSearch";

const helpCategories = [
  {
    id: "quick-start",
    title: "Getting Started",
    description: "Set up your account and start training in under 5 minutes.",
    icon: Zap,
    color: "bg-emerald-500/5 border-emerald-500/15 text-emerald-400",
    hoverColor: "hover:border-emerald-500/25",
    href: "/help/quick-start",
    time: "5 MIN READ",
  },
  {
    id: "faq",
    title: "FAQ & Guides",
    description: "Answers to the most common questions about every feature.",
    icon: Book,
    color: "bg-emerald-500/5 border-emerald-500/15 text-emerald-400",
    hoverColor: "hover:border-emerald-500/25",
    href: "/help/faq",
    time: "BROWSE ALL",
  },
  {
    id: "support",
    title: "Contact Support",
    description: "Still need help? Reach out to our team directly.",
    icon: MessageCircle,
    color: "bg-emerald-500/5 border-emerald-500/15 text-emerald-400",
    hoverColor: "hover:border-emerald-500/25",
    href: "/help/support",
    time: "24-48H RESPONSE",
  },
];

const quickLinks = [
  { label: "How do I create an account?", href: "/help/faq" },
  { label: "How do I sync my profile?", href: "/help/faq" },
  { label: "How do practice sessions work?", href: "/help/faq" },
  { label: "What is upsolving?", href: "/help/faq" },
  { label: "How do I change my password?", href: "/help/faq" },
  { label: "Is my data safe?", href: "/help/faq" },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 font-mono text-emerald-400 select-none relative z-10">
      {/* Hero */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/20 border border-emerald-500/15 rounded-sm text-[9px] font-bold uppercase tracking-widest text-emerald-400">
          <Sparkles className="size-3 animate-pulse" />
          {"// Help Center"}
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-none uppercase">
          How can we help?
        </h1>
        <p className="text-emerald-500/50 text-xs uppercase max-w-lg mx-auto">
          Find answers to your questions, learn how to use the platform, or get in touch with our team.
        </p>

        {/* Search */}
        <div className="max-w-xl mx-auto pt-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500/30 group-focus-within:text-emerald-400 transition-colors" />
            <Input
              placeholder="Search questions or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9 bg-[#040604] border border-emerald-500/20 rounded-sm text-xs text-emerald-300 placeholder-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-mono"
            />
          </div>
        </div>

        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="max-w-xl mx-auto text-left"
            >
              <HelpSearch query={searchQuery} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {helpCategories.map((category, idx) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
          >
            <Link href={category.href}>
              <Card 
                className={cn(
                  "h-full border-emerald-500/15 bg-[#060a08]/30 rounded-sm cursor-pointer group transition-all duration-300 hover:border-emerald-500/25",
                  category.hoverColor
                )}
              >
                <CardContent className="p-6 space-y-4">
                  <div className={cn(
                    "size-9 rounded-sm flex items-center justify-center border transition-all duration-300",
                    category.color
                  )}>
                    <category.icon className="size-4.5" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 group-hover:text-emerald-400 transition-colors">
                        {category.title}
                      </h3>
                      <ChevronRight className="size-3.5 text-emerald-500/40 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[10px] text-emerald-500/60 leading-relaxed uppercase">
                      {category.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-500/35 tracking-widest">
                    <Clock className="size-3" />
                    {category.time}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <Card className="border-emerald-500/15 bg-[#060a08]/20 rounded-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-7 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Zap className="size-3.5" />
            </div>
            <h2 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Common Questions</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-bold uppercase">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-2 p-2 bg-[#040604]/40 border border-emerald-500/5 hover:border-emerald-500/15 rounded-sm hover:bg-emerald-500/5 transition-all group"
              >
                <ChevronRight className="size-3 text-emerald-500/30 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                <span className="text-emerald-500/55 group-hover:text-emerald-300 transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center space-y-4 py-4">
        <div className="inline-flex items-center gap-2 text-emerald-500/35 text-[9px] font-bold uppercase">
          <div className="h-[1px] w-8 bg-emerald-500/10" />
          <span>OR</span>
          <div className="h-[1px] w-8 bg-emerald-500/10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Still have questions?</h3>
          <p className="text-[10px] text-emerald-500/60 uppercase">
            Our support team is here to help you with anything you need.
          </p>
        </div>
        <Button 
          asChild
          className="h-10 px-6 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all font-mono"
        >
          <Link href="/help/support" className="gap-1.5 justify-center">
            [ CONTACT_SUPPORT_PORTAL.EXE ]
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
