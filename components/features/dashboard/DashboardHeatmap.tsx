"use client";

import Link from "next/link";
import {Card} from "@/components/ui/card";
import {LayoutGrid, ChevronRight} from "lucide-react";
import ActivityHeatmap from "@/components/shared/ActivityHeatmap";

type DashboardHeatmapProps = {
  history: any[];
  upsolvedProblems: any[];
  roadmapActivity: any;
};

export default function DashboardHeatmap({
  history,
  upsolvedProblems,
  roadmapActivity,
}: DashboardHeatmapProps) {
  return (
    <Card className="lg:col-span-2 border-border/80 dark:border-border/40 bg-card/70 dark:bg-card/20 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-border/60 dark:border-border/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <LayoutGrid size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight">
              Activity History
            </h3>
            <p className="text-[9px] font-bold text-muted-foreground/75 dark:text-muted-foreground/50 uppercase tracking-widest">
              Training, upsolve & roadmap timeline
            </p>
          </div>
        </div>
        <Link
          href="/statistics"
          className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
        >
          Analytics <ChevronRight className="size-3" />
        </Link>
      </div>
      <div className="p-6 sm:p-8 overflow-x-auto">
        <ActivityHeatmap
          history={history}
          upsolvedProblems={upsolvedProblems}
          roadmapActivity={roadmapActivity}
        />
      </div>
    </Card>
  );
}
