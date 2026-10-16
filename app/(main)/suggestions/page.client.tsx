"use client";

import { Button } from "@/components/ui/button";

import MemberPageState from "@/components/features/profile/MemberPageState";

import Link from "next/link";
import { m as motion } from "framer-motion";
import { ChevronLeft, ExternalLink, Globe, BookOpen, Trophy, GraduationCap } from "lucide-react";
import { useSuggestions, type Suggestion } from "@/hooks/admin/useSuggestions";

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
  const { suggestions, isLoading, isError, mutate } = useSuggestions();

  if (isLoading) return <MemberPageState kind="loading" title="Gathering good resources" description="Loading places to learn and practice." />;

  const grouped = groupByCategory(suggestions);

  return (
    <section className="min-h-screen relative overflow-hidden font-sans text-foreground py-8">

      <div className="mx-auto w-full max-w-5xl relative z-10">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ChevronLeft className="size-3.5" />
            Home
          </Link>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-card border border-border rounded-lg">
                <Globe className="size-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Resources</span>
              </div>
            </div>
            <h1 className="text-white font-heading text-3xl sm:text-4xl font-medium tracking-tight leading-tight text-foreground">
              Worth exploring.
            </h1>
            <p className="text-sm text-muted-foreground">
              A thoughtful collection of places to learn, practice, and find your next idea.
            </p>
          </div>
        </motion.div>

        <div className="mt-8">
          {isError ? <MemberPageState kind="error" title="Resources are unavailable" description="We couldn’t load our recommendations. Try again in a moment."><Button variant="outline" onClick={() => mutate()}>Try again</Button></MemberPageState> : grouped.length === 0 ? (
            <motion.div
              initial={false}
              animate="show"
              variants={fadeUp}
              className="rounded-lg border border-border bg-card p-12 text-center"
            >
              <Globe className="size-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">New recommendations are on the way.</p>
            </motion.div>
          ) : (
            <motion.div
              initial={false}
              animate="show"
              variants={stagger}
              className="space-y-8"
            >
              {grouped.map(([category, items]) => {
                const CategoryIcon = categoryIcons[category] || Globe;
                return (
                  <motion.div key={category} variants={fadeUp} className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-border pb-1.5">
                      <CategoryIcon className="size-4 text-primary" />
                      <h2 className="font-medium text-foreground font-heading text-xl tracking-tight">
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
                            className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            <div className="h-full rounded-2xl border border-border bg-card hover:bg-muted/40 transition-colors p-5">
                              <div className="flex items-start gap-3">
                                <div className="min-w-0 flex-1 space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate font-heading text-lg tracking-tight">
                                      {s.title}
                                    </h3>
                                    <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
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
