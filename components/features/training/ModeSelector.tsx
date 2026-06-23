"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TrainingMode } from "@/types/TrainingMode";

const MODES: {
  id: TrainingMode;
  name: string;
  description: string;
  problems: string;
  time: string;
  useCase: string;
}[] = [
  {
    id: "ladder",
    name: "Ladder Mode",
    description: "Classic rating-based training. Best for steady progress.",
    problems: "4",
    time: "120 min",
    useCase: "Daily grind",
  },
  {
    id: "weakness",
    name: "Weakness Mode",
    description:
      "Targets the tags and ratings you struggle with most.",
    problems: "4",
    time: "120 min",
    useCase: "Fix gaps",
  },
  {
    id: "speed",
    name: "Speed Mode",
    description:
      "Lower-rated problems with stricter time pressure. Best for improving speed.",
    problems: "4",
    time: "45-60 min",
    useCase: "Speed push",
  },
  {
    id: "contest",
    name: "Contest Simulation",
    description:
      "Hidden ratings, strict timer, and final review only. Best for contest mindset.",
    problems: "4",
    time: "120 min",
    useCase: "Exam mode",
  },
  {
    id: "endurance",
    name: "Endurance Mode",
    description:
      "Longer sessions with more problems. Best for deep weekend practice.",
    problems: "6-8",
    time: "3-4 h",
    useCase: "Weekend block",
  },
];

export default function ModeSelector({
  value,
  onChange,
}: {
  value: TrainingMode;
  onChange: (m: TrainingMode) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={cn(
            "text-left rounded-2xl transition-all border bg-card/30 backdrop-blur-sm p-5 hover:bg-card/50",
            value === m.id
              ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10"
              : "border-border/50 hover:border-primary/40",
          )}
        >
          <Card className="border-0 bg-transparent shadow-none p-0 space-y-3">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              {m.name}
            </div>
            <p className="text-sm text-muted-foreground leading-snug">
              {m.description}
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span className="px-2 py-0.5 rounded-md bg-muted/40 border border-border/40">
                {m.problems} problems
              </span>
              <span className="px-2 py-0.5 rounded-md bg-muted/40 border border-border/40">
                {m.time}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-muted/40 border border-border/40">
                {m.useCase}
              </span>
            </div>
          </Card>
        </button>
      ))}
    </div>
  );
}
