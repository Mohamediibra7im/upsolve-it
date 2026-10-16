"use client";

import { useHeatmapData, RoadmapActivityData } from "@/hooks/data";
import { Training } from "@/types/Training";
import { TrainingProblem } from "@/types/TrainingProblem";
import { useMemo, useState } from "react";
import ClientOnly from "@/components/shared/ClientOnly";
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
  roadmapActivity?: RoadmapActivityData;
}

const ActivityHeatmap = ({
  history,
  upsolvedProblems = [],
  roadmapActivity = { problemDates: [], topicDates: [] },
}: ActivityHeatmapProps) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { values: heatmapData, totalSolved } = useHeatmapData(
    history,
    upsolvedProblems,
    roadmapActivity,
  );

  // Extract all unique years from history
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);

    const processTime = (time: number | string | null | undefined) => {
      if (!time) return;
      const num = typeof time === "string" ? Number.parseInt(time, 10) : time;
      if (Number.isNaN(num)) return;
      const ms = num < 10000000000 ? num * 1000 : num;
      years.add(new Date(ms).getFullYear());
    };

    const processDateString = (dateStr: string) => {
      const d = new Date(dateStr);
      if (!Number.isNaN(d.getTime())) {
        years.add(d.getFullYear());
      }
    };

    history.forEach((t) => {
      processTime(t.endTime);
      t.problems?.forEach((p) => processTime(p.solvedTime));
    });
    upsolvedProblems.forEach((p) => processTime(p.solvedTime));
    roadmapActivity.problemDates?.forEach(processDateString);
    roadmapActivity.topicDates?.forEach(processDateString);

    return Array.from(years).sort((a, b) => b - a);
  }, [history, upsolvedProblems, roadmapActivity, currentYear]);

  // Group data by months for the selected year
  const monthsData = useMemo(() => {
    const months: {
      name: string;
      year: number;
      days: ({ date: Date; count: number; dateKey: string } | null)[];
    }[] = [];
    const dataMap = new Map(heatmapData.map((v) => [v.date, v.count]));

    // Generate January to December for the selected year
    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(selectedYear, m, 1);

      const monthName = monthDate.toLocaleString("default", { month: "long" });
      const days = [];
      const lastDay = new Date(selectedYear, m + 1, 0).getDate();

      // Pad beginning of month (Sunday start)
      const firstDayOfWeek = monthDate.getDay();
      for (let j = 0; j < firstDayOfWeek; j++) {
        days.push(null);
      }

      for (let d = 1; d <= lastDay; d++) {
        const date = new Date(selectedYear, m, d);
        const dateKey = `${selectedYear}/${(m + 1).toString().padStart(2, "0")}/${d.toString().padStart(2, "0")}`;
        days.push({
          date,
          dateKey,
          count: dataMap.get(dateKey) || 0,
        });
      }

      months.push({ name: monthName, year: selectedYear, days });
    }
    return months;
  }, [heatmapData, selectedYear]);

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted/70 border-border/50";
    if (count === 1) return "bg-primary/25 border-primary/10";
    if (count === 2) return "bg-primary/45 border-primary/20";
    if (count === 3) return "bg-primary/65 border-primary/30";
    return "bg-primary border-primary";
  };

  return (
    <ClientOnly>
      <section
        aria-label="Practice activity calendar"
        className="w-full space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary">
              <CalendarIcon size={18} />
            </span>
            <div>
              <h3 className="text-base font-medium text-foreground">
                Practice activity
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Small steps, day after day.
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`Select activity year, currently ${selectedYear}`}
                className="flex h-10 items-center gap-3 rounded-xl border border-border bg-card px-3 text-sm text-foreground hover:bg-secondary"
              >
                {selectedYear}
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-32">
              {availableYears.map((year) => (
                <DropdownMenuItem
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={cn(
                    "text-sm",
                    selectedYear === year && "bg-primary/10 text-primary",
                  )}
                >
                  {year}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TooltipProvider delayDuration={150}>
          <div className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {monthsData.map((month) => (
              <div
                key={`${month.name}-${month.year}`}
                className="min-w-0 rounded-2xl border border-border bg-card/60 p-4"
              >
                <h4 className="mb-4 text-sm font-medium text-foreground">
                  {month.name}
                </h4>
                <div className="grid grid-cols-7 gap-1.5">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                    <span
                      key={index}
                      aria-hidden="true"
                      className="mb-1 text-center text-[10px] text-muted-foreground"
                    >
                      {day}
                    </span>
                  ))}
                  {month.days.map((day, index) =>
                    day ? (
                      <Tooltip key={day.dateKey}>
                        <TooltipTrigger asChild>
                          <div
                            role="img"
                            aria-label={`${day.date.toLocaleDateString(undefined, { dateStyle: "medium" })}: ${day.count} milestones`}
                            className={cn(
                              "aspect-square rounded-[4px] border transition-colors hover:border-primary",
                              getIntensityClass(day.count),
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipPortal>
                          <TooltipContent side="top">
                            <p className="text-muted-foreground">
                              {day.date.toLocaleDateString(undefined, {
                                dateStyle: "medium",
                              })}
                            </p>
                            <p className="mt-1 font-medium text-foreground">
                              {day.count}{" "}
                              {day.count === 1 ? "milestone" : "milestones"}
                            </p>
                          </TooltipContent>
                        </TooltipPortal>
                      </Tooltip>
                    ) : (
                      <div
                        key={`empty-${index}`}
                        className="aspect-square"
                        aria-hidden="true"
                      />
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="size-4 text-primary" />
            <span>
              <strong className="font-medium text-foreground">
                {totalSolved.toLocaleString()}
              </strong>{" "}
              recorded milestones
            </span>
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((level) => (
                <span
                  key={level}
                  className={cn(
                    "size-3 rounded-[3px] border",
                    getIntensityClass(level),
                  )}
                />
              ))}
            </div>
            <span>More</span>
          </div>
          <p className="w-full text-xs leading-5 text-muted-foreground">
            The calendar shows activity from the past 12 months. Milestones
            include problem solves and completed roadmap topics.
          </p>
        </div>
      </section>
    </ClientOnly>
  );
};

export default ActivityHeatmap;
