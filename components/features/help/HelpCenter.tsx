'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Book, 
  MessageCircle, 
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { m, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import HelpSearch from './HelpSearch';

const helpCategories = [
  {
    id: 'quick-start',
    title: 'Getting Started',
    description: 'Set up your account and start training in under 5 minutes.',
    icon: Zap,
    color: 'bg-sky-500/10 border-sky-500/20 text-sky-500',
    hoverColor: 'hover:border-sky-500/40',
    href: '/help/quick-start',
    time: '5 min read',
  },
  {
    id: 'faq',
    title: 'FAQ & Guides',
    description: 'Answers to the most common questions about every feature.',
    icon: Book,
    color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    hoverColor: 'hover:border-emerald-500/40',
    href: '/help/faq',
    time: 'Browse all',
  },
  {
    id: 'support',
    title: 'Contact Support',
    description: 'Still need help? Reach out to our team directly.',
    icon: MessageCircle,
    color: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    hoverColor: 'hover:border-amber-500/40',
    href: '/help/support',
    time: '24-48h response',
  },
];

const quickLinks = [
  { label: 'How do I create an account?', href: '/help/faq' },
  { label: 'How do I sync my profile?', href: '/help/faq' },
  { label: 'How do practice sessions work?', href: '/help/faq' },
  { label: 'What is upsolving?', href: '/help/faq' },
  { label: 'How do I change my password?', href: '/help/faq' },
  { label: 'Is my data safe?', href: '/help/faq' },
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Hero */}
      <div className="text-center space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
          <Sparkles className="size-3" />
          Help Center
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-foreground leading-none">
          How can we <span className="text-primary">help?</span>
        </h1>
        <p className="text-muted-foreground font-medium max-w-xl mx-auto">
          Find answers to your questions, learn how to use the platform, or get in touch with our team.
        </p>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search questions or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 pl-14 bg-card/40 border-border/40 rounded-2xl text-base focus:ring-primary/20 focus:border-primary/40 transition-all font-medium shadow-lg"
            />
          </div>
        </div>

        <AnimatePresence>
          {searchQuery && (
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="max-w-3xl mx-auto text-left"
            >
              <HelpSearch query={searchQuery} />
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {helpCategories.map((category, idx) => (
          <m.div
            key={category.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link href={category.href}>
              <Card 
                className={cn(
                  "h-full border-border/40 bg-card/30 backdrop-blur-md rounded-3xl cursor-pointer group transition-all duration-300 hover:shadow-lg hover:shadow-primary/5",
                  category.hoverColor
                )}
              >
                <CardContent className="p-8 space-y-5">
                  <div className={cn(
                    "size-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110",
                    category.color
                  )}>
                    <category.icon className="size-6" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {category.title}
                      </h3>
                      <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    <Clock className="size-3" />
                    {category.time}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </m.div>
        ))}
      </div>

      {/* Quick Links */}
      <Card className="border-border/40 bg-card/20 backdrop-blur-md rounded-3xl">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Zap className="size-4" />
            </div>
            <h2 className="text-lg font-black text-foreground tracking-tight">Common Questions</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors group"
              >
                <ChevronRight className="size-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                <span className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 text-muted-foreground/60">
          <div className="h-px w-12 bg-border/40" />
          <span className="text-xs font-medium">or</span>
          <div className="h-px w-12 bg-border/40" />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-black text-foreground">Still have questions?</h3>
          <p className="text-sm text-muted-foreground font-medium">
            Our support team is here to help you with anything you need.
          </p>
        </div>
        <Button 
          asChild
          className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
        >
          <Link href="/help/support" className="gap-2">
            Contact Support
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
