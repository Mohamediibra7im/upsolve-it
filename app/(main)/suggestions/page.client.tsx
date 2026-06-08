"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ChevronLeft, ExternalLink, Globe, BookOpen, Trophy, GraduationCap } from "lucide-react";
import { useSuggestions, type Suggestion } from "@/hooks/admin/useSuggestions";
import Loader from "@/components/shared/Loader";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } },
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
    <section className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.012]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ChevronLeft className="size-3.5" />
              Home
            </Link>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <Globe className="size-3 text-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Resources</span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                Suggested Websites
              </h1>
              <p className="text-sm text-muted-foreground">
                Hand-picked resources to boost your competitive programming journey
              </p>
            </div>
          </m.div>

          {grouped.length === 0 ? (
            <m.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-2xl p-12 text-center"
            >
              <Globe className="size-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">No suggestions available yet</p>
            </m.div>
          ) : (
            <m.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="space-y-8"
            >
              {grouped.map(([category, items]) => {
                const CategoryIcon = categoryIcons[category] || Globe;
                return (
                  <m.div key={category} variants={fadeUp} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CategoryIcon className="size-4 text-primary" />
                      <h2 className="text-sm font-bold text-foreground/80 uppercase tracking-wider">
                        {category}
                      </h2>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {items.map((s) => (
                        <m.div key={s._id} variants={fadeUp}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                          >
                            <div className="rounded-2xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all duration-300 p-5">
                              <div className="flex items-start gap-4">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                      {s.title}
                                    </h3>
                                    <ExternalLink className="size-3 text-muted-foreground/40 shrink-0 group-hover:text-primary/60 transition-colors" />
                                  </div>
                                  <p className="text-[12px] text-muted-foreground/60 leading-relaxed line-clamp-2">
                                    {s.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </a>
                        </m.div>
                      ))}
                    </div>
                  </m.div>
                );
              })}
            </m.div>
          )}
        </div>
      </div>
    </section>
  );
}
