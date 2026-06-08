'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronRight, Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AnimatePresence, m } from 'framer-motion';

interface FAQSectionProps {
  onBack: () => void;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  popular: boolean;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How do I create an account?',
    answer: 'To create an account, enter your Codeforces handle on the homepage and create a secure PIN. The system will automatically fetch your profile data from Codeforces and create your account.',
    category: 'Account',
    tags: ['registration', 'account', 'setup'],
    popular: true,
  },
  {
    id: '1.5',
    question: 'Do I need a Codeforces account to use this platform?',
    answer: 'Yes, you need an active Codeforces account to use Upsolve.it. The platform fetches your profile data, solved problems, and submissions from Codeforces. If you don\'t have one, you can create a free account at codeforces.com/register.',
    category: 'Account',
    tags: ['codeforces', 'account', 'requirement', 'registration'],
    popular: true,
  },
  {
    id: '2',
    question: 'Why can I not log in with my correct handle and password?',
    answer: 'Make sure your Codeforces handle is entered exactly as it appears on Codeforces (case-sensitive). Also verify that your password is correct. If the issue persists, try clearing your browser cache or use the password reset feature.',
    category: 'Troubleshooting',
    tags: ['login', 'authentication', 'troubleshooting'],
    popular: true,
  },
  {
    id: '3',
    question: 'How does the practice session work?',
    answer: 'Practice sessions generate random problems based on your selected difficulty level and tags. You can set a custom rating range, choose specific problem types, and practice at your own pace. The system tracks your progress and provides detailed analytics.',
    category: 'Training',
    tags: ['training', 'problems', 'difficulty'],
    popular: true,
  },
  {
    id: '4',
    question: 'What are the different difficulty levels?',
    answer: 'We offer predefined difficulty levels: Easy (800-1200), Medium (1200-1600), Hard (1600-2000), and Expert (2000-2400). You can also set custom rating ranges to match your current skill level.',
    category: 'Training',
    tags: ['difficulty', 'levels', 'rating'],
    popular: false,
  },
  {
    id: '5',
    question: 'How do I sync my Codeforces profile?',
    answer: 'Click on your profile avatar in the navigation bar and select "Sync Profile". This updates your rating, solved problems, and recent submissions from Codeforces. You can also sync automatically when logging in.',
    category: 'Account',
    tags: ['sync', 'profile', 'codeforces'],
    popular: true,
  },
  {
    id: '6',
    question: 'What are notifications and how do I manage them?',
    answer: 'Notifications keep you updated with announcements, new features, maintenance, and alerts. Click the bell icon to view your notification center. You can mark notifications as read or delete them individually.',
    category: 'Notifications',
    tags: ['notifications', 'bell', 'admin'],
    popular: false,
  },
  {
    id: '7',
    question: 'How do I change my password?',
    answer: 'Go to your profile settings, click "Change Password", enter your current password, then create and confirm your new secure password. Make sure your new password meets the security requirements.',
    category: 'Account',
    tags: ['password', 'security', 'settings'],
    popular: false,
  },
  {
    id: '8',
    question: 'What is upsolving and how does it work?',
    answer: 'Upsolving refers to solving problems from contests that you could not solve during the contest. The upsolve feature tracks problems you need to solve and helps you manage your practice queue.',
    category: 'Upsolve',
    tags: ['upsolve', 'contests', 'practice'],
    popular: false,
  },
  {
    id: '9',
    question: 'How do I read my statistics and analytics?',
    answer: 'The statistics page shows your performance metrics including rating progression, activity heatmap, solving speed, and problem category distribution. Use these insights to identify areas for improvement.',
    category: 'Analytics',
    tags: ['statistics', 'analytics', 'performance'],
    popular: true,
  },
  {
    id: '10',
    question: 'Can I practice specific topics or problem types?',
    answer: 'Yes! When setting up a practice session, you can select specific tags like "Dynamic Programming", "Graph Theory", "Data Structures", etc. This helps you focus on weak areas or practice specific topics.',
    category: 'Training',
    tags: ['tags', 'topics', 'practice'],
    popular: false,
  },
  {
    id: '11',
    question: 'How do I become an admin?',
    answer: 'Admin privileges are granted by database administrators. Contact the system administrator to request admin access. Admins can create, edit, and delete notifications for all users.',
    category: 'Admin',
    tags: ['admin', 'privileges', 'permissions'],
    popular: false,
  },
  {
    id: '12',
    question: 'Is my data safe and secure?',
    answer: 'Yes, your data is secure. We use encrypted PINs, secure JWT tokens, and follow best practices for data protection. Your Codeforces data is fetched read-only and we never store your Codeforces password.',
    category: 'Security',
    tags: ['security', 'privacy', 'data'],
    popular: false,
  },
];

const categories = ['All', 'Account', 'Training', 'Notifications', 'Analytics', 'Upsolve', 'Admin', 'Security', 'Troubleshooting'];

export default function FAQSection({ onBack }: Readonly<FAQSectionProps>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="size-12 rounded-2xl bg-white/5 hover:bg-primary/10 hover:text-primary border border-border/40 transition-all"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">FAQ</span>
              <div className="h-[1px] w-6 bg-primary/30" />
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight">Frequently Asked Questions</h1>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 pl-12 bg-card/20 border-border/40 rounded-2xl focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              className={cn(
                "h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border border-border/40 transition-all",
                selectedCategory === category 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-white/5 hover:bg-white/10 text-muted-foreground"
              )}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* FAQ Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            {searchQuery || selectedCategory !== 'All' ? 'Search Results' : 'All Questions'}
          </h2>
          <Badge variant="outline" className="rounded-lg border-border/40 bg-white/5 font-black">
            {filteredFAQs.length} RESULTS
          </Badge>
        </div>

        {filteredFAQs.length === 0 ? (
          <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2.5rem]">
            <CardContent className="py-20 text-center space-y-4">
              <div className="size-16 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto text-muted-foreground/40">
                <HelpCircle size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-foreground">No results found.</h3>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                  Try a different search term or browse all questions.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredFAQs.map((faq) => (
                <m.div
                  key={faq.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className={cn(
                    "border-border/40 bg-card/20 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all duration-500",
                    openFAQ === faq.id && "border-primary/30 ring-1 ring-primary/20 bg-card/30 shadow-2xl shadow-primary/5"
                  )}>
                    <CardContent className="p-0">
                      <Button
                        variant="ghost"
                        className="w-full justify-between h-auto p-8 hover:bg-transparent text-left group"
                        onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                      >
                        <div className="flex items-start gap-6">
                          <div className={cn(
                            "mt-1 shrink-0 size-6 rounded-lg border border-border/40 flex items-center justify-center transition-all duration-500",
                            openFAQ === faq.id ? "bg-primary text-primary-foreground border-primary rotate-90" : "bg-white/5 text-muted-foreground"
                          )}>
                            <ChevronRight className="size-3.5" />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary opacity-60">{faq.category}</span>
                            <h3 className="text-lg font-black text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors">
                              {faq.question}
                            </h3>
                          </div>
                        </div>
                        {faq.popular && !openFAQ && (
                          <Badge className="hidden sm:flex bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black text-[9px] tracking-widest px-2 py-0.5">
                            POPULAR
                          </Badge>
                        )}
                      </Button>

                      <AnimatePresence>
                        {openFAQ === faq.id && (
                          <m.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-20 pb-8 space-y-6">
                              <div className="h-[1px] w-full bg-border/40" />
                              <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl">
                                {faq.answer}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {faq.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="bg-white/5 border-border/40 text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </m.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </m.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
