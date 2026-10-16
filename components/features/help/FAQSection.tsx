"use client";

import { useState } from "react";
import { ArrowLeft, ChevronRight, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    answer:
      "To create an account, enter your Codeforces handle on the homepage and create and confirm a secure password. The system will fetch your profile data from Codeforces and create your account.",
    category: "Account",
    tags: ["registration", "account", "setup"],
    popular: true,
  },
  {
    id: "1.5",
    question: "Do I need a Codeforces account to use this platform?",
    answer:
      "Yes, you need an active Codeforces account to use Upsolve.it. The platform fetches your profile data, solved problems, and submissions from Codeforces. If you don't have one, you can create a free account at codeforces.com/register.",
    category: "Account",
    tags: ["codeforces", "account", "requirement", "registration"],
    popular: true,
  },
  {
    id: "2",
    question: "Why can I not log in with my correct handle and password?",
    answer:
      "Make sure your Codeforces handle is entered exactly as it appears on Codeforces (case-sensitive). Also verify that your password is correct. If the issue persists, try clearing your browser cache or use the password reset feature.",
    category: "Troubleshooting",
    tags: ["login", "authentication", "troubleshooting"],
    popular: true,
  },
  {
    id: "3",
    question: "How does the practice session work?",
    answer:
      "Practice sessions generate random problems based on your selected difficulty level and tags. Choose your training mode, adjust the ladder level, and select specific topics to practice. The system tracks your progress and provides detailed analytics.",
    category: "Training",
    tags: ["training", "problems", "difficulty"],
    popular: true,
  },
  {
    id: "4",
    question: "What are the different difficulty levels?",
    answer:
      "Training levels provide four difficulty targets for ladder sessions. Use the plus and minus controls to adjust your level, or choose Use recommended level to match your Codeforces rating. Other training modes choose ratings based on their goals.",
    category: "Training",
    tags: ["difficulty", "levels", "rating"],
    popular: false,
  },
  {
    id: "5",
    question: "How do I sync my Codeforces profile?",
    answer:
      'Click on your profile avatar in the navigation bar and select "Sync Profile". This updates your rating, solved problems, and recent submissions from Codeforces. You can also sync automatically when logging in.',
    category: "Account",
    tags: ["sync", "profile", "codeforces"],
    popular: true,
  },
  {
    id: "6",
    question: "What are notifications and how do I manage them?",
    answer:
      "Notifications keep you updated with announcements, new features, maintenance, and alerts. Click the bell icon to view your notification center. You can mark notifications as read or delete them individually.",
    category: "Notifications",
    tags: ["notifications", "bell", "admin"],
    popular: false,
  },
  {
    id: "7",
    question: "How do I change my password?",
    answer:
      'Go to your profile settings, click "Change Password", enter your current password, then create and confirm your new secure password. Make sure your new password meets the security requirements.',
    category: "Account",
    tags: ["password", "security", "settings"],
    popular: false,
  },
  {
    id: "8",
    question: "What is upsolving and how does it work?",
    answer:
      "Upsolving refers to solving problems from contests that you could not solve during the contest. The upsolve feature tracks problems you need to solve and helps you manage your practice queue.",
    category: "Upsolve",
    tags: ["upsolve", "contests", "practice"],
    popular: false,
  },
  {
    id: "9",
    question: "How do I read my statistics and analytics?",
    answer:
      "The statistics page shows your performance metrics including rating progression, activity heatmap, solving speed, and problem category distribution. Use these insights to identify areas for improvement.",
    category: "Analytics",
    tags: ["statistics", "analytics", "performance"],
    popular: true,
  },
  {
    id: "10",
    question: "Can I practice specific topics or problem types?",
    answer:
      'Yes! When setting up a practice session, you can select specific tags like "Dynamic Programming", "Graph Theory", "Data Structures", etc. This helps you focus on weak areas or practice specific topics.',
    category: "Training",
    tags: ["tags", "topics", "practice"],
    popular: false,
  },
  {
    id: "11",
    question: "How do I become an admin?",
    answer:
      "Admin privileges are granted by database administrators. Contact the system administrator to request admin access. Admins can create, edit, and delete notifications for all users.",
    category: "Admin",
    tags: ["admin", "privileges", "permissions"],
    popular: false,
  },
  {
    id: "12",
    question: "Is my data safe and secure?",
    answer:
      "Upsolve.it uses its own account password and reads your public Codeforces profile and submissions. You do not need to share your Codeforces password. See the privacy policy for details about how your data is handled.",
    category: "Security",
    tags: ["security", "privacy", "data"],
    popular: false,
  },
];

const categories = [
  "All",
  "Account",
  "Training",
  "Notifications",
  "Analytics",
  "Upsolve",
  "Admin",
  "Security",
  "Troubleshooting",
];

export default function FAQSection({ onBack }: Readonly<FAQSectionProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans text-[#f1f3ee]  relative z-10">
      {/* Header */}
      <div className="flex flex-col items-start gap-5 sm:gap-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="h-9 px-3 rounded-xl border border-[#2b3031] text-[#b5e3c4] hover:text-[#b5e3c4] hover:bg-[#b5e3c4]/5 font-sans text-xs font-medium tracking-normal"
        >
          <ArrowLeft className="size-3.5 mr-1" /> Back
        </Button>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#929b98] tracking-normal">
            <span>Help center</span>
            <span aria-hidden="true">/</span>
            <span>Questions & answers</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-medium leading-[1.12] tracking-[-0.04em] text-[#f1f3ee]">
            Good questions. Clear answers.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#929b98]">
            A practical guide to the details that make your practice work.
          </p>
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
        {/* Search and Filter */}
        <aside
          aria-label="Filter questions"
          className="space-y-5 lg:sticky lg:top-28"
        >
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#929b98] group-focus-within:text-[#b5e3c4] transition-colors" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search help"
              className="h-12 pl-10 bg-[#101214] border border-[#2b3031] rounded-xl text-sm text-[#f1f3ee] placeholder:text-[#929b98] focus:border-[#b5e3c4] outline-none transition-all font-sans"
            />
          </div>

          <div className="flex flex-wrap gap-2 lg:flex-col">
            {categories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                className={cn(
                  "h-11 px-4 rounded-xl font-medium text-sm border transition-colors font-sans lg:justify-start",
                  selectedCategory === category
                    ? "bg-[#b5e3c4]/10 text-[#b5e3c4] border-[#b5e3c4]/30"
                    : "bg-transparent border-transparent text-[#929b98] hover:bg-[#191c1e] hover:text-[#f1f3ee]",
                )}
                aria-pressed={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </aside>

        {/* FAQ Results */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-medium tracking-normal text-[#929b98]">
              {searchQuery || selectedCategory !== "All"
                ? "Search results"
                : "All questions"}
            </h2>
            <span className="text-xs font-medium bg-[#b5e3c4]/5 border border-[#2b3031] px-2 py-0.5 rounded-xl text-[#b5e3c4]">
              {filteredFAQs.length} questions
            </span>
          </div>

          {filteredFAQs.length === 0 ? (
            <Card className="border border-[#2b3031] bg-[#191c1e] rounded-2xl">
              <CardContent className="py-16 text-center space-y-3">
                <div className="size-10 rounded-xl bg-[#b5e3c4]/5 border border-[#2b3031] flex items-center justify-center mx-auto text-[#929b98]">
                  <HelpCircle size={18} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-[#b5e3c4] tracking-normal">
                    No matching questions.
                  </h3>
                  <p className="text-sm text-[#929b98]">
                    Try a different search term or browse all questions.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="mt-2 rounded-xl"
                  >
                    Clear filters
                  </Button>
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
                    <Card
                      className={cn(
                        "border border-[#2b3031] bg-[#191c1e] rounded-2xl overflow-hidden transition-all duration-300",
                        openFAQ === faq.id &&
                          "border-[#2b3031] ring-1 ring-[#b5e3c4]/20 bg-[#191c1e]",
                      )}
                    >
                      <CardContent className="p-0">
                        <Button
                          variant="ghost"
                          className="w-full justify-between h-auto whitespace-normal p-5 hover:bg-transparent text-left group flex items-center font-sans"
                          aria-expanded={openFAQ === faq.id}
                          aria-controls={`faq-answer-${faq.id}`}
                          onClick={() =>
                            setOpenFAQ(openFAQ === faq.id ? null : faq.id)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "mt-0.5 shrink-0 size-5 rounded-xl border border-[#2b3031] flex items-center justify-center transition-all duration-300",
                                openFAQ === faq.id
                                  ? "bg-[#b5e3c4] text-[#101214] border-[#2b3031] rotate-90"
                                  : "bg-[#b5e3c4]/5 text-[#b5e3c4]",
                              )}
                            >
                              <ChevronRight className="size-3" />
                            </div>
                            <div className="space-y-2">
                              <span className="text-xs font-medium tracking-normal text-[#929b98]">
                                {faq.category}
                              </span>
                              <h3 className="text-base font-medium text-[#f1f3ee] leading-relaxed tracking-normal group-hover:text-[#b5e3c4] transition-colors ">
                                {faq.question}
                              </h3>
                            </div>
                          </div>
                          {faq.popular && !openFAQ && (
                            <span className="hidden sm:inline bg-[#b5e3c4]/10 text-[#b5e3c4] border border-[#2b3031] font-medium text-xs tracking-normal px-1.5 py-0.5 rounded-xl shrink-0">
                              Popular
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
                              <div
                                id={`faq-answer-${faq.id}`}
                                className="pl-5 pr-5 pb-5 space-y-4 sm:pl-14"
                              >
                                <div className="h-[1px] w-full bg-[#b5e3c4]/10" />
                                <p className="text-sm text-[#929b98] leading-relaxed ">
                                  {faq.answer}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {faq.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="bg-[#b5e3c4]/5 border border-[#2b3031] text-xs font-medium tracking-normal px-2 py-0.5 rounded-xl text-[#b5e3c4]"
                                    >
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
    </div>
  );
}
