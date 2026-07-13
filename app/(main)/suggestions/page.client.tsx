"use client";

import Link from "next/link";
import { m as motion } from "framer-motion";
import { ChevronLeft, ExternalLink, Globe, BookOpen, Trophy, GraduationCap } from "lucide-react";
import { useSuggestions, type Suggestion } from "@/hooks/admin/useSuggestions";
import Loader from "@/components/shared/Loader";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Practice: Trophy,
  Learning: GraduationCap,
  Resources: BookOpen,
};

function groupByCategory(suggestions: Suggestion[]) {
  const groups: Record<string, Suggestion[]> = {};
  suggestions.forEach((s) => {
    const cat = s.category || "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(s);
  });
  return Object.entries(groups);
}

export default function SuggestionsPage() {
  const { suggestions, isLoading } = useSuggestions();

  if (isLoading) return <Loader message="Loading suggestions..." />;

  const grouped = groupByCategory(suggestions);

  return (
    <section className="min-h-screen relative overflow-hidden bg-[#040604] font-mono text-emerald-400 select-none py-8">
      {/* Background terminal grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_45%,transparent_100%)]" />

      {/* Terminal Scanline overlay */}
      <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.03] pointer-events-none z-50" />

      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500/60 hover:text-emerald-300 transition-colors mb-4"
          >
            <ChevronLeft className="size-3.5" />
            [ HOME ]
          </Link>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/20 border border-emerald-500/15 rounded-sm">
                <Globe className="size-3.5 text-emerald-400" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-300">Resources</span>
              </div>
            </div>
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">
              Suggested Websites
            </h1>
            <p className="text-[10px] text-emerald-500/60 uppercase">
              Hand-picked resources to boost your competitive programming journey
            </p>
          </div>
        </motion.div>

        <div className="mt-8">
          {grouped.length === 0 ? (
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="rounded-sm border border-emerald-500/15 bg-[#060a08]/30 p-12 text-center"
            >
              <Globe className="size-10 text-emerald-500/20 mx-auto mb-3" />
              <p className="text-[10px] uppercase text-emerald-500/50">No suggestions available yet</p>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="space-y-8"
            >
              {grouped.map(([category, items]) => {
                const CategoryIcon = categoryIcons[category] || Globe;
                return (
                  <motion.div key={category} variants={fadeUp} className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-emerald-500/10 pb-1.5">
                      <CategoryIcon className="size-4 text-emerald-400" />
                      <h2 className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                        {category}
                      </h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {items.map((s) => (
                        <motion.div key={s._id} variants={fadeUp}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                          >
                            <div className="rounded-sm border border-emerald-500/15 bg-[#060a08]/30 hover:bg-[#060a08]/50 hover:border-emerald-500/25 transition-all duration-300 p-4">
                              <div className="flex items-start gap-3">
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-xs font-bold text-emerald-300 group-hover:text-emerald-400 transition-colors truncate uppercase">
                                      {s.title}
                                    </h3>
                                    <ExternalLink className="size-3 text-emerald-500/30 group-hover:text-emerald-400 transition-colors shrink-0" />
                                  </div>
                                  <p className="text-[9px] text-emerald-500/60 leading-relaxed uppercase line-clamp-2">
                                    {s.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </a>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
