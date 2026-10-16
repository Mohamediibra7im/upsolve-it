"use client";

import { cn } from "@/lib/utils";
import type { TrainingMode } from "@/types/TrainingMode";
import {
  ArrowUpRight,
  Check,
  Clock3,
  Focus,
  Flag,
  Layers3,
  Zap,
  type LucideIcon,
} from "lucide-react";

const MODES: {
  id: TrainingMode;
  name: string;
  description: string;
  problems: string;
  time: string;
  icon: LucideIcon;
}[] = [
  {
    id: "ladder",
    name: "Ladder",
    description: "Build confidence, one level at a time.",
    problems: "4 problems",
    time: "120 min",
    icon: ArrowUpRight,
  },
  {
    id: "weakness",
    name: "Weakness",
    description: "Give your challenging topics more attention.",
    problems: "4 problems",
    time: "120 min",
    icon: Focus,
  },
  {
    id: "speed",
    name: "Speed round",
    description: "Find your rhythm with a shorter, faster session.",
    problems: "4 problems",
    time: "52 min",
    icon: Zap,
  },
  {
    id: "contest",
    name: "Contest",
    description: "Practice under pressure, with ratings hidden.",
    problems: "4 problems",
    time: "120 min",
    icon: Flag,
  },
  {
    id: "endurance",
    name: "Endurance",
    description: "Settle in and strengthen your staying power.",
    problems: "6–8 problems",
    time: "180–240 min",
    icon: Layers3,
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
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      aria-label="Training mode"
    >
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const active = value === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(mode.id)}
            className={cn(
              "group flex flex-col rounded-2xl border p-4 sm:p-5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4] focus-visible:ring-offset-4 focus-visible:ring-offset-[#191c1e]",
              active
                ? "border-[#b5e3c4]/60 bg-[#b5e3c4]/[0.07]"
                : "border-[#2b3031] bg-[#15181a] hover:border-[#69746e] hover:bg-[#1d2220]",
            )}
          >
            <div className="mb-4 flex w-full items-center gap-3">
              <Icon
                aria-hidden="true"
                strokeWidth={1.6}
                className={cn(
                  "size-5 shrink-0",
                  active ? "text-[#b5e3c4]" : "text-[#929b98]",
                )}
              />
              <h3 className="flex-1 font-heading text-base font-semibold tracking-tight text-[#f1f3ee]">
                {mode.name}
              </h3>
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border",
                  active
                    ? "border-[#b5e3c4] bg-[#b5e3c4] text-[#101214]"
                    : "border-[#48504b]",
                )}
              >
                {active && <Check className="size-3.5" aria-hidden="true" />}
              </span>
            </div>
            <p className="mb-4 flex-1 text-sm leading-relaxed text-[#929b98]">
              {mode.description}
            </p>
            <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[#2b3031] pt-3 text-xs text-[#b8c0bb] xl:block xl:space-y-2">
              <span className="block">{mode.problems}</span>
              <span className="flex items-center gap-1.5 text-[#929b98]">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {mode.time}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
