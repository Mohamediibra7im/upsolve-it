'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  HelpCircle,
  Book, 
  MessageCircle, 
  Star, 
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Target,
  BarChart3,
  RefreshCw, 
  User 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import HelpSearch from './HelpSearch';

const helpCategories = [
  {
    id: 'quick-start',
    title: 'Mission Briefing',
    subtitle: 'Quick Start',
    description: 'Get up and running with Training Tracker in minutes. Essential for new recruits.',
    icon: Zap,
    color: 'sky',
    href: '/help/quick-start'
  },
  {
    id: 'faq',
    title: 'Knowledge Base',
    subtitle: 'FAQ & Docs',
    description: 'Comprehensive answers to common questions and detailed feature breakdowns.',
    icon: Book,
    color: 'emerald',
    href: '/help/faq'
  },
  {
    id: 'support',
    title: 'Signal Support',
    subtitle: 'Contact Us',
    description: 'Need direct assistance? Our team is standing by to help with technical issues.',
    icon: MessageCircle,
    color: 'amber',
    href: '/help/support'
  },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20">
      {/* Immersive Hero Section */}
      <motion.div 
        className="relative rounded-[3rem] border border-border/40 bg-card/20 backdrop-blur-2xl overflow-hidden p-8 sm:p-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 p-12 opacity-[0.03] pointer-events-none">
          <HelpCircle size={320} />
        </div>
        
        <div className="relative space-y-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md mx-auto">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Intelligence Center</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground leading-none">
              How can we <span className="text-primary italic">assist?</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto opacity-80">
              Welcome to the Training Tracker Command Center. Master the platform features and resolve technical hurdles.
            </p>
          </div>

          <div className="max-w-2xl mx-auto group">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search intelligence, features, or protocols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-16 pl-14 bg-background/40 border-border/40 rounded-[1.25rem] text-lg focus:ring-primary/20 focus:border-primary/40 transition-all font-medium shadow-2xl"
              />
            </div>
          </div>
          
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-8 max-w-4xl mx-auto text-left"
              >
                <HelpSearch query={searchQuery} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {helpCategories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link href={category.href}>
              <Card 
                className="h-full border-border/40 bg-card/30 backdrop-blur-xl rounded-[2.5rem] overflow-hidden cursor-pointer group hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                <CardContent className="p-10 space-y-8">
                  <div className={cn(
                    "h-16 w-16 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-6",
                    category.color === "sky" && "bg-sky-500/10 border-sky-500/20 text-sky-500",
                    category.color === "emerald" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
                    category.color === "amber" && "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  )}>
                    <category.icon className="h-8 w-8" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{category.subtitle}</span>
                      <div className="h-[1px] w-4 bg-border/40" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{category.title}</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed opacity-80">{category.description}</p>
                  </div>

                  <div className="pt-4 flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                    Access Portal <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Topics & Support Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10 space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Star className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">High Priority Topics</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Start Training', icon: Zap, href: '/help/quick-start' },
                { label: 'Sync Profiles', icon: RefreshCw, href: '/help/quick-start' },
                { label: 'Upsolve Logic', icon: Target, href: '/help/faq' },
                { label: 'Security Protocols', icon: Shield, href: '/help/faq' },
                { label: 'Analytics Insights', icon: BarChart3, href: '/help/faq' },
                { label: 'Account Recovery', icon: User, href: '/help/support' },
              ].map((topic: any, idx) => (
                <Button
                  key={idx}
                  asChild
                  variant="ghost"
                  className="h-16 justify-start px-6 rounded-2xl bg-white/5 hover:bg-primary/10 hover:text-primary border border-border/40 transition-all group"
                >
                  <Link href={topic.href}>
                    <topic.icon className="h-4 w-4 mr-4 opacity-40 group-hover:opacity-100" />
                    <span className="font-bold">{topic.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-primary/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden flex flex-col justify-center text-center p-10 space-y-8 border-dashed">
          <div className="space-y-4">
            <div className="p-6 bg-primary/10 rounded-full w-fit mx-auto border border-primary/20 text-primary">
              <MessageCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-foreground">Still Unresolved?</h3>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                If the intelligence logs don't have what you need, our support engineers are ready to assist.
              </p>
            </div>
          </div>
          <Button 
            asChild
            size="lg" 
            className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs mx-auto shadow-2xl shadow-primary/20"
          >
            <Link href="/help/support">Initiate Contact</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
