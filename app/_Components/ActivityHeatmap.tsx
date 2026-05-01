"use client";

import { useTheme } from "next-themes";
import { useHeatmapData } from "@/hooks/useHeatmapData";
import { Training } from "@/types/Training";
import { TrainingProblem } from "@/types/TrainingProblem";
import { useMemo, useState } from "react";
import ClientOnly from "@/app/_Components/ClientOnly";
import { cn } from "@/lib/utils";
import { Activity, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipPortal,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActivityHeatmapProps {
  history: Training[];
  upsolvedProblems?: TrainingProblem[];
}

const ActivityHeatmap = ({
  history,
  upsolvedProblems = [],
}: ActivityHeatmapProps) => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const { values: heatmapData, totalSolved } = useHeatmapData(history, upsolvedProblems);

  // Extract all unique years from history
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    
    const processTime = (time: number | string | null | undefined) => {
      if (!time) return;
      const num = typeof time === 'string' ? Number.parseInt(time, 10) : time;
      if (Number.isNaN(num)) return;
      const ms = num < 10000000000 ? num * 1000 : num;
      years.add(new Date(ms).getFullYear());
    };

    history.forEach(t => {
      processTime(t.endTime);
      t.problems?.forEach(p => processTime(p.solvedTime));
    });
    upsolvedProblems.forEach(p => processTime(p.solvedTime));

    return Array.from(years).sort((a, b) => b - a);
  }, [history, upsolvedProblems, currentYear]);

  // Group data by months for the selected year
  const monthsData = useMemo(() => {
    const months: { name: string; year: number; days: { date: Date; count: number; dateKey: string }[] }[] = [];
    const dataMap = new Map(heatmapData.map(v => [v.date, v.count]));

    // Generate January to December for the selected year
    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(selectedYear, m, 1);
      
      // If the month is in the future relative to "today" and it's the current year, stop or mark as future
      if (selectedYear === currentYear && m > new Date().getMonth()) {
        // We can still show it but it will be empty
      }

      const monthName = monthDate.toLocaleString('default', { month: 'long' });
      const days = [];
      const lastDay = new Date(selectedYear, m + 1, 0).getDate();
      
      // Pad beginning of month (Sunday start)
      const firstDayOfWeek = monthDate.getDay();
      for (let j = 0; j < firstDayOfWeek; j++) {
        days.push(null);
      }

      for (let d = 1; d <= lastDay; d++) {
        const date = new Date(selectedYear, m, d);
        const dateKey = `${selectedYear}/${(m + 1).toString().padStart(2, '0')}/${d.toString().padStart(2, '0')}`;
        days.push({
          date,
          dateKey,
          count: dataMap.get(dateKey) || 0,
        });
      }
      
      months.push({ name: monthName, year: selectedYear, days: days as any });
    }
    return months;
  }, [heatmapData, selectedYear, currentYear]);

  const getIntensityClass = (count: number) => {
    if (count === 0) {
      return theme === "dark" 
        ? "bg-white/[0.05] border-white/5" 
        : "bg-black/[0.1] border-black/[0.05]";
    }
    if (count === 1) return "bg-emerald-500/20 border-emerald-500/10";
    if (count === 2) return "bg-emerald-500/40 border-emerald-500/20";
    if (count === 3) return "bg-emerald-500/60 border-emerald-500/30";
    return "bg-emerald-500 border-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
  };

  return (
    <ClientOnly>
      <div className="relative w-full space-y-8 select-none">
        {/* Tactical Header with Year Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <CalendarIcon size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/80">Activity Grid</h3>
              <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Temporal Intelligence Sync</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/[0.06] transition-all group">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                  Year: {selectedYear}
                </span>
                <ChevronDown size={14} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 dark:bg-card/95 backdrop-blur-2xl border-black/10 dark:border-white/10 rounded-xl min-w-[120px] z-[300]">
              {availableYears.map((year) => (
                <DropdownMenuItem 
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest cursor-pointer py-2.5 px-4 focus:bg-primary/10 focus:text-primary transition-colors",
                    selectedYear === year ? "text-primary bg-primary/5" : "text-muted-foreground/60"
                  )}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Monthly Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {monthsData.map((month) => (
            <div key={`${month.name}-${month.year}`} className="relative group/month p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/5 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all duration-500 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 dark:text-muted-foreground/40 group-hover/month:text-primary transition-colors">
                  {month.name}
                </span>
                <Activity size={10} className="text-muted-foreground/20 group-hover/month:text-primary/40 transition-colors" />
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={`header-${month.name}-${idx}`} className="text-[7px] font-black text-center text-muted-foreground/40 dark:text-muted-foreground/10 mb-1">
                    {day}
                  </div>
                ))}
                
                {month.days.map((day, dIdx) => (
                  <div key={day ? day.dateKey : `empty-${dIdx}`} className="aspect-square">
                    {day ? (
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={cn(
                                "w-full h-full rounded-[2px] border transition-all duration-300 hover:scale-125 hover:z-10 cursor-crosshair",
                                getIntensityClass(day.count)
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipPortal>
                            <TooltipContent 
                              side="top" 
                              className="bg-card/95 backdrop-blur-2xl border-white/10 p-2.5 rounded-xl shadow-2xl z-[9999]"
                            >
                              <div className="text-[10px] font-black uppercase space-y-1">
                                <div className="text-muted-foreground/50 tracking-[0.1em] border-b border-white/5 pb-1 mb-1">
                                  {day.date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <div className={cn(
                                  "flex items-center gap-2 tracking-widest",
                                  day.count > 0 ? "text-primary" : "text-muted-foreground/30"
                                )}>
                                  <Activity size={10} />
                                  {day.count} {day.count === 1 ? 'Operation' : 'Operations'}
                                </div>
                              </div>
                            </TooltipContent>
                          </TooltipPortal>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <div className="w-full h-full opacity-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tactical Status Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Annual Output Analysis
              </span>
            </div>
            
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div 
                    key={level}
                    className={cn(
                      "w-2.5 h-2.5 rounded-[1px] border",
                      getIntensityClass(level)
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-tighter transition-colors",
                totalSolved > 0 ? "text-foreground" : "text-rose-500/60"
              )}>
                {totalSolved} TOTAL OPERATIONS
              </span>
              <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest leading-none">
                YEAR {selectedYear} STRATEGIC AUDIT
              </span>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
};

export default ActivityHeatmap;
