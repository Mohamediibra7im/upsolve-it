"use client";

import { useState, useMemo } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Search,
  Target,
  Clock,
  Layers,
  Zap,
  Cpu,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLevels } from "@/hooks/roadmap";
import Loader from "@/components/shared/Loader";

const LevelsPage = () => {
  const { levels: levelsData, isLoading } = useLevels();
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-0">
        <Loader message="Loading levels..." />
      </div>
    );
  }

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
    <div className="min-h-screen relative pb-12 font-mono text-emerald-400">
      {/* Background Accents */}
      <div className="absolute inset-0 -z-10 bg-[#040604]">
        <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.04]" />
      </div>

      <div className="container mx-auto px-4 md:px-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
              <Target size={12} className="text-emerald-400" />
              <span>LEVELS_DATABASE // ROADMAP_STATIONS</span>
              <span className="flex-1 border-b border-emerald-500/10" />
              <Cpu size={10} className="text-emerald-500/30" />
              <span>ACTIVE: {filteredLevels.length} STATIONS</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-emerald-300 uppercase tracking-wider">
                Tactical Level Database
              </h1>
              <p className="text-[11px] text-emerald-500/40 max-w-xl leading-relaxed">
                Select your training difficulty based on rating requirements. Each node specifies ratings and constraints for practice sessions.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[300px] shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/30" size={14} />
              <Input
                placeholder="search_parameters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-9 rounded border border-emerald-500/20 bg-[#060a08] text-xs text-emerald-400 placeholder:text-emerald-500/30 focus:border-emerald-500/40 focus:ring-0 font-mono"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(["all", "low", "medium", "high", "expert"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    "h-8 px-3 rounded border font-bold uppercase tracking-wider text-[9px] transition-all duration-200 font-mono",
                    filterType === t
                      ? "bg-emerald-500 text-emerald-950 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                      : "bg-transparent border-emerald-500/15 text-emerald-500/50 hover:text-emerald-300 hover:border-emerald-500/40"
                  )}
                >
                  [ {t.toUpperCase()} ]
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <m.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredLevels.map((level) => (
              <m.div
                key={level.id}
                layout
                variants={item}
                className="relative overflow-hidden rounded-lg border border-emerald-500/15 bg-emerald-950/[0.02]"
              >
                {/* Station status bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/10 bg-[#081210]">
                  <div className="flex items-center gap-1.5 text-[8px] font-bold tracking-wider text-emerald-400/55">
                    <Zap size={10} className="text-emerald-400" />
                    <span>LEVEL_NODE #{level.level.padStart(3, "0")}</span>
                  </div>
                  <div className="size-1.5 rounded-full bg-emerald-500/40" />
                </div>

                {/* Body details */}
                <div className="p-4 space-y-4">
                  {/* XP / Time */}
                  <div className="flex items-center justify-between text-[11px] border-b border-emerald-500/[0.07] pb-3">
                    <div>
                      <span className="text-[8px] text-emerald-500/35 uppercase tracking-wider block">Requirement</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Trophy size={11} className="text-emerald-400" />
                        <span className="font-bold text-emerald-300">{level.Performance}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] text-emerald-500/35 uppercase tracking-wider block">Duration</span>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <Clock size={11} className="text-emerald-400" />
                        <span className="font-bold text-emerald-300">{level.time} MIN</span>
                      </div>
                    </div>
                  </div>

                  {/* Ratings matrix */}
                  <div>
                    <span className="text-[8px] text-emerald-500/35 uppercase tracking-wider block mb-2">TARGET_RATINGS_MATRIX</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "P1", val: level.P1 },
                        { label: "P2", val: level.P2 },
                        { label: "P3", val: level.P3 },
                        { label: "P4", val: level.P4 },
                      ].map((p) => (
                        <div
                          key={p.label}
                          className="flex items-center justify-between py-1.5 px-2.5 rounded border border-emerald-500/10 bg-emerald-950/5 text-[10px]"
                        >
                          <span className="font-bold text-emerald-500/40">{p.label}</span>
                          <span className="font-bold text-emerald-300 tabular-nums">{p.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </m.div>

        {filteredLevels.length === 0 && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-4"
          >
            <Layers className="size-14 text-emerald-500/20" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">No Matching Parameters</h3>
              <p className="text-[11px] text-emerald-500/40 max-w-xs mx-auto">
                No tactical levels matched the filter parameters.
              </p>
            </div>
          </m.div>
        )}
      </div>
    </div>
  );
};

export default LevelsPage;
