"use client";

import { useState } from "react";
import { ArrowLeft, ChevronRight, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AnimatePresence, m as motion } from "framer-motion";

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
    id: "1",
    question: "How do I create an account?",
    answer: "To create an account, enter your Codeforces handle on the homepage and create a secure PIN. The system will automatically fetch your profile data from Codeforces and create your account.",
    category: "Account",
    tags: ["registration", "account", "setup"],
    popular: true,
  },
  {
    id: "1.5",
    question: "Do I need a Codeforces account to use this platform?",
    answer: "Yes, you need an active Codeforces account to use Upsolve.it. The platform fetches your profile data, solved problems, and submissions from Codeforces. If you don't have one, you can create a free account at codeforces.com/register.",
    category: "Account",
    tags: ["codeforces", "account", "requirement", "registration"],
    popular: true,
  },
  {
    id: "2",
    question: "Why can I not log in with my correct handle and password?",
    answer: "Make sure your Codeforces handle is entered exactly as it appears on Codeforces (case-sensitive). Also verify that your password is correct. If the issue persists, try clearing your browser cache or use the password reset feature.",
    category: "Troubleshooting",
    tags: ["login", "authentication", "troubleshooting"],
    popular: true,
  },
  {
    id: "3",
    question: "How does the practice session work?",
    answer: "Practice sessions generate random problems based on your selected difficulty level and tags. You can set a custom rating range, choose specific problem types, and practice at your own pace. The system tracks your progress and provides detailed analytics.",
    category: "Training",
    tags: ["training", "problems", "difficulty"],
    popular: true,
  },
  {
    id: "4",
    question: "What are the different difficulty levels?",
    answer: "We offer predefined difficulty levels: Easy (800-1200), Medium (1200-1600), Hard (1600-2000), and Expert (2000-2400). You can also set custom rating ranges to match your current skill level.",
    category: "Training",
    tags: ["difficulty", "levels", "rating"],
    popular: false,
  },
  {
    id: "5",
    question: "How do I sync my Codeforces profile?",
    answer: "Click on your profile avatar in the navigation bar and select \"Sync Profile\". This updates your rating, solved problems, and recent submissions from Codeforces. You can also sync automatically when logging in.",
    category: "Account",
    tags: ["sync", "profile", "codeforces"],
    popular: true,
  },
  {
    id: "6",
    question: "What are notifications and how do I manage them?",
    answer: "Notifications keep you updated with announcements, new features, maintenance, and alerts. Click the bell icon to view your notification center. You can mark notifications as read or delete them individually.",
    category: "Notifications",
    tags: ["notifications", "bell", "admin"],
    popular: false,
  },
  {
    id: "7",
    question: "How do I change my password?",
    answer: "Go to your profile settings, click \"Change Password\", enter your current password, then create and confirm your new secure password. Make sure your new password meets the security requirements.",
    category: "Account",
    tags: ["password", "security", "settings"],
    popular: false,
  },
  {
    id: "8",
    question: "What is upsolving and how does it work?",
    answer: "Upsolving refers to solving problems from contests that you could not solve during the contest. The upsolve feature tracks problems you need to solve and helps you manage your practice queue.",
    category: "Upsolve",
    tags: ["upsolve", "contests", "practice"],
    popular: false,
  },
  {
    id: "9",
    question: "How do I read my statistics and analytics?",
    answer: "The statistics page shows your performance metrics including rating progression, activity heatmap, solving speed, and problem category distribution. Use these insights to identify areas for improvement.",
    category: "Analytics",
    tags: ["statistics", "analytics", "performance"],
    popular: true,
  },
  {
    id: "10",
    question: "Can I practice specific topics or problem types?",
    answer: "Yes! When setting up a practice session, you can select specific tags like \"Dynamic Programming\", \"Graph Theory\", \"Data Structures\", etc. This helps you focus on weak areas or practice specific topics.",
    category: "Training",
    tags: ["tags", "topics", "practice"],
    popular: false,
  },
  {
    id: "11",
    question: "How do I become an admin?",
    answer: "Admin privileges are granted by database administrators. Contact the system administrator to request admin access. Admins can create, edit, and delete notifications for all users.",
    category: "Admin",
    tags: ["admin", "privileges", "permissions"],
    popular: false,
  },
  {
    id: "12",
    question: "Is my data safe and secure?",
    answer: "Yes, your data is secure. We use encrypted PINs, secure JWT tokens, and follow best practices for data protection. Your Codeforces data is fetched read-only and we never store your Codeforces password.",
    category: "Security",
    tags: ["security", "privacy", "data"],
    popular: false,
  },
];

const categories = ["All", "Account", "Training", "Notifications", "Analytics", "Upsolve", "Admin", "Security", "Troubleshooting"];

export default function FAQSection({ onBack }: Readonly<FAQSectionProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-mono text-emerald-400 select-none relative z-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="h-9 px-3 rounded-sm border border-emerald-500/10 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/5 font-mono text-[9px] font-bold uppercase tracking-widest"
        >
          <ArrowLeft className="size-3.5 mr-1" /> [ BACK ]
        </Button>
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-500/40 uppercase tracking-widest">
            <span>DATABASE</span>
             <span>{"//"}</span>
            <span>FAQ_MODULE</span>
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wider text-white">Frequently Asked Questions</h1>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500/30 group-focus-within:text-emerald-400 transition-colors" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-9 bg-[#040604] border border-emerald-500/20 rounded-sm text-xs text-emerald-300 placeholder-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-mono"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              className={cn(
                "h-8 px-3 rounded-sm font-bold uppercase text-[9px] tracking-wider border transition-all font-mono",
                selectedCategory === category 
                  ? "bg-emerald-500 text-emerald-950 border-emerald-500" 
                  : "bg-emerald-500/5 border-emerald-500/15 text-emerald-400 hover:bg-emerald-500/10"
              )}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* FAQ Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/40">
            {searchQuery || selectedCategory !== "All" ? "Search Results" : "All Questions"}
          </h2>
          <span className="text-[8px] font-bold uppercase bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-sm text-emerald-300">
            {filteredFAQs.length} RECORDS
          </span>
        </div>

        {filteredFAQs.length === 0 ? (
          <Card className="border border-emerald-500/15 bg-[#060a08]/20 rounded-sm">
            <CardContent className="py-16 text-center space-y-3">
              <div className="size-10 rounded-sm bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center mx-auto text-emerald-500/30">
                <HelpCircle size={18} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">No records found.</h3>
                <p className="text-[9px] text-emerald-500/50 uppercase">
                  Try a different search term or browse all questions.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredFAQs.map((faq) => (
                <motion.div
                  key={faq.id}
                  layout
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className={cn(
                    "border border-emerald-500/15 bg-[#060a08]/30 rounded-sm overflow-hidden transition-all duration-300",
                    openFAQ === faq.id && "border-emerald-500/25 ring-1 ring-emerald-500/10 bg-[#060a08]/50"
                  )}>
                    <CardContent className="p-0">
                      <Button
                        variant="ghost"
                        className="w-full justify-between h-auto p-4 hover:bg-transparent text-left group flex items-center font-mono"
                        onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "mt-0.5 shrink-0 size-5 rounded-sm border border-emerald-500/15 flex items-center justify-center transition-all duration-300",
                            openFAQ === faq.id ? "bg-emerald-500 text-emerald-950 border-emerald-500 rotate-90" : "bg-emerald-500/5 text-emerald-400"
                          )}>
                            <ChevronRight className="size-3" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-500/40">{faq.category}</span>
                            <h3 className="text-[10px] font-bold text-emerald-300 leading-normal tracking-wide group-hover:text-emerald-400 transition-colors uppercase">
                              {faq.question}
                            </h3>
                          </div>
                        </div>
                        {faq.popular && !openFAQ && (
                          <span className="hidden sm:inline bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[8px] tracking-wider px-1.5 py-0.5 rounded-sm shrink-0">
                            POPULAR
                          </span>
                        )}
                      </Button>

                      <AnimatePresence>
                        {openFAQ === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-12 pr-6 pb-4 space-y-3">
                              <div className="h-[1px] w-full bg-emerald-500/10" />
                              <p className="text-[10px] text-emerald-500/70 leading-relaxed uppercase">
                                {faq.answer}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {faq.tags.map((tag) => (
                                  <span key={tag} className="bg-emerald-500/5 border border-emerald-500/15 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm text-emerald-400">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
