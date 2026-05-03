"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useHistory from "@/hooks/useHistory";
import useUser from "@/hooks/useUser";
import Loader from "@/app/_Components/Loader";
import { Training } from "@/types/Training";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ClipboardList,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

function sessionLabel(t: Training): string {
  const mode = t.trainingMode ?? "ladder";
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

function solvedCount(t: Training): number {
  return t.problems.filter(
    (p) => p.isSolved || p.solvedTime != null,
  ).length;
}

export default function TrainingReviewsPage() {
  const { user, isLoading: userLoading } = useUser();
  const { history, isLoading: historyLoading } = useHistory();

  if (userLoading || historyLoading || !user) {
    return <Loader message="Loading reviews..." />;
  }

  const sorted = [...history]
    .filter((t) => Boolean(t._id))
    .sort((a, b) => b.endTime - a.endTime);

  return (
    <section className="min-h-screen pb-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href="/training"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
                Training
              </Link>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                <ClipboardList className="h-3.5 w-3.5" />
                Session reviews
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Past sessions
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Open the full breakdown for any completed training session,
              including stats, timing, and insights.
            </p>
          </div>
          <Button asChild className="rounded-2xl font-black uppercase tracking-widest text-[10px] shrink-0">
            <Link href="/training">New session</Link>
          </Button>
        </div>

        {sorted.length === 0 ? (
          <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2rem]">
            <CardContent className="p-12 text-center space-y-4">
              <ClipboardList className="h-12 w-12 mx-auto opacity-30 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">
                No completed sessions yet. Finish a training run to see reviews
                here.
              </p>
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/training">Start training</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-4">
            {sorted.map((t, i) => {
              const id = t._id as string;
              const total = t.problems?.length ?? 0;
              const solved = solvedCount(t);
              const date = new Date(t.endTime);

              return (
                <li key={id}>
                  <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                >
                  <Link
                    href={`/training/session/${id}/review`}
                    className="block group"
                  >
                    <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2rem] overflow-hidden transition-all hover:bg-card/35 hover:border-primary/30">
                      <CardContent className="p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="space-y-3 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-muted/40 border border-border/40 text-muted-foreground">
                                {sessionLabel(t)}
                              </span>
                              <span
                                className={cn(
                                  "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border",
                                  solved === total
                                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                                    : "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400",
                                )}
                              >
                                {solved}/{total} solved
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4 shrink-0 opacity-70" />
                              <time dateTime={date.toISOString()}>
                                {date.toLocaleString(undefined, {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })}
                              </time>
                            </div>
                            <div className="flex items-center gap-2 text-foreground">
                              <Trophy className="h-4 w-4 text-primary shrink-0" />
                              <span className="font-black tabular-nums text-lg">
                                Performance {t.performance}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] shrink-0">
                            View review
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
