"use client";

import { Button } from "@/components/ui/button";

import MemberPageState from "@/components/features/profile/MemberPageState";

import { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Search,
  Target,
  Clock,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLevels } from "@/hooks/roadmap";

const LevelsPage = () => {
  const { levels: levelsData, isLoading, error, mutateLevels } = useLevels();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "low" | "medium" | "high" | "expert">("all");

  const filteredLevels = useMemo(() => {
    return levelsData.filter((level) => {
      const matchesSearch =
        level.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
        level.Performance.includes(searchQuery);

      const perf = parseInt(level.Performance);
      const matchesFilter =
        filterType === "all" ||
        (filterType === "low" && perf < 1500) ||
        (filterType === "medium" && perf >= 1500 && perf < 2100) ||
        (filterType === "high" && perf >= 2100 && perf < 2600) ||
        (filterType === "expert" && perf >= 2600);

      return matchesSearch && matchesFilter;
    });
  }, [levelsData, searchQuery, filterType]);

  if (isLoading) return <MemberPageState kind="loading" title="Finding your next challenge" description="Loading the training levels." />;
  if (error && levelsData.length === 0) return <MemberPageState kind="error" title="Training levels are unavailable" description="We couldn’t load the level catalog. Try again in a moment."><Button variant="outline" onClick={() => mutateLevels()}>Try again</Button></MemberPageState>;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen relative pb-12 font-sans text-foreground">
      {/* Background Accents */}

      <div className="mx-auto w-full md:px-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Target size={12} className="text-primary" />
              <span>Find your training level</span>
              <span className="flex-1 border-b border-border" />
              <span>Available: {filteredLevels.length} levels</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-foreground font-heading text-3xl sm:text-4xl font-medium tracking-tight leading-tight">
                A challenge at every level.
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
                Find the right amount of challenge. Each level combines four problem ratings for a focused practice session.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[280px] shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                aria-label="Search levels or ratings"
                placeholder="Search levels or ratings"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 rounded-lg border border-border bg-card text-xs text-primary placeholder:text-muted-foreground focus:border-border focus-visible:ring-2 focus-visible:ring-ring font-sans"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(["all", "low", "medium", "high", "expert"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    "h-9 px-3 rounded-lg border font-medium text-xs transition-all duration-200 font-sans",
                    filterType === t
                      ? "bg-primary text-primary-foreground border-border"
                      : "bg-transparent border-border text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                   {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <m.div
          variants={container}
          initial={false}
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredLevels.map((level) => (
              <m.div
                key={level.id}
                layout
                variants={item}
                className="relative overflow-hidden rounded-2xl border border-border bg-card"
              >
                {/* Station status bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Zap size={10} className="text-primary" />
                    <span>Level {level.level}</span>
                  </div>
                  <div className="size-1.5 rounded-full bg-primary/10" />
                </div>

                {/* Body details */}
                <div className="p-4 space-y-4">
                  {/* XP / Time */}
                  <div className="flex items-center justify-between text-sm border-b border-border pb-3">
                    <div>
                      <span className="text-xs text-muted-foreground block">Performance</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Trophy size={11} className="text-primary" />
                        <span className="font-medium text-foreground">{level.Performance}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">Duration</span>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <Clock size={11} className="text-primary" />
                        <span className="font-medium text-foreground">{level.time} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Ratings matrix */}
                  <div>
                    <span className="text-xs text-muted-foreground block mb-2">Problem ratings</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "P1", val: level.P1 },
                        { label: "P2", val: level.P2 },
                        { label: "P3", val: level.P3 },
                        { label: "P4", val: level.P4 },
                      ].map((p) => (
                        <div
                          key={p.label}
                          className="flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-border bg-card text-xs"
                        >
                          <span className="font-medium text-muted-foreground">{p.label}</span>
                          <span className="font-medium text-foreground tabular-nums">{p.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </m.div>

        {filteredLevels.length === 0 && <MemberPageState title="No levels match yet" description="Try a different rating or clear your filters to explore every level."><Button variant="outline" onClick={() => { setSearchQuery(""); setFilterType("all"); }}>Clear filters</Button></MemberPageState>}

      </div>
    </div>
  );
};

export default LevelsPage;
