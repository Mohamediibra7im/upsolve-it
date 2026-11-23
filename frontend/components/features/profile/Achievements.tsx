import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Bar } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

export type Achievement = {
  name: string;
  desc: string;
  value: number;
  target: number;
  unit?: string;
};

/** The four achievements that depend only on training numbers. */
export const trainingAchievements = (s: {
  sessions: number;
  solveRate: number;
  upsolved: number;
  avgPerformance: number;
}): Achievement[] => [
  {
    name: "Gladiator",
    desc: "Complete 5 training sessions.",
    value: s.sessions,
    target: 5,
  },
  {
    name: "Marksman",
    desc: "Keep a solve rate of 70% or more.",
    value: s.solveRate,
    target: 70,
    unit: "%",
  },
  {
    name: "Upsolve Elite",
    desc: "Solve a problem from your upsolve queue.",
    value: s.upsolved,
    target: 1,
  },
  {
    name: "Performance Titan",
    desc: "Average a performance of 1200 or more.",
    value: s.avgPerformance,
    target: 1200,
  },
];

export const isEarned = (a: Achievement) => a.value >= a.target;

export function Achievements({
  items,
  className,
}: {
  items: Achievement[];
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {items.map((a) => (
        <li key={a.name} className="u-panel grid content-between gap-4 p-5">
          <div>
            <h3 className="t-h3">{a.name}</h3>
            <p className="t-sm t-muted mt-1">{a.desc}</p>
          </div>
          {isEarned(a) ? (
            <Badge variant="solved" className="justify-self-start">
              <Check />
              Earned
            </Badge>
          ) : (
            <div className="grid gap-2">
              <span className="t-sm t-num">
                {a.value}
                {a.unit} of {a.target}
                {a.unit}
              </span>
              <Bar
                value={(a.value / a.target) * 100}
                label={`${a.name} progress`}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
