"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Search, 
  Target, 
  Clock, 
  Layers,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLevels } from "@/hooks/useLevels";
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
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader message="Loading levels..." />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-8">
      {/* Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Target size={12} />
              Operation Parameters
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-foreground">
              Tactical <span className="text-primary">Levels</span>
            </h1>
            <p className="text-muted-foreground font-medium max-w-xl">
              Select your operational intensity based on performance metrics. Each level defines specific problem ratings and time constraints for optimal training.
            </p>
          </div>

          <div className="flex flex-col gap-4 min-w-[300px]">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
              <Input 
                placeholder="Search level or performance..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/30 border-border/40 focus:border-primary/40 h-12 rounded-xl font-bold tracking-tight text-foreground"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(["all", "low", "medium", "high", "expert"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                    filterType === t 
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                      : "bg-card/30 border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Levels Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredLevels.map((level) => (
              <motion.div
                key={level.id}
                layout
                variants={item}
                whileHover={{ y: -5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-emerald-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative bg-card/30 backdrop-blur-sm border border-border/40 group-hover:border-primary/40 p-6 rounded-3xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Level</span>
                      <span className="text-3xl font-black font-mono text-foreground group-hover:text-primary transition-colors">
                        #{level.level.padStart(3, '0')}
                      </span>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Zap size={20} fill="currentColor" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Performance Requirement */}
                    <div className="p-4 rounded-2xl bg-background/50 border border-border/40 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Requirement</span>
                        <span className="text-lg font-black text-foreground">{level.Performance}</span>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Trophy size={14} />
                      </div>
                    </div>

                    {/* Problem Matrix */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "P1", val: level.P1 },
                        { label: "P2", val: level.P2 },
                        { label: "P3", val: level.P3 },
                        { label: "P4", val: level.P4 }
                      ].map((p, idx) => (
                        <div key={idx} className="bg-background/30 p-2 rounded-xl border border-border/20 flex flex-col items-center justify-center">
                          <span className="text-[8px] font-black text-muted-foreground/40 uppercase mb-0.5">{p.label}</span>
                          <span className="text-xs font-bold font-mono text-foreground">{p.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/20">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock size={14} className="opacity-50" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">{level.time} MIN</span>
                      </div>
                      <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-tighter text-muted-foreground/30">
                        Operational Ready
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredLevels.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <Layers className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-foreground">No Matching Parameters</h3>
            <p className="text-muted-foreground text-sm max-w-xs font-medium">
              No tactical levels found matching your current search or filter criteria.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LevelsPage;
