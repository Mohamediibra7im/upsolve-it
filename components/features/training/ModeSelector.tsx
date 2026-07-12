"use client";

import { cn } from "@/lib/utils";
import type { TrainingMode } from "@/types/TrainingMode";
import { Terminal, Activity, Zap, ShieldAlert, Disc } from "lucide-react";

const MODES: {
  id: TrainingMode;
  name: string;
  filename: string;
  description: string;
  problems: string;
  time: string;
  useCase: string;
  icon: any;
  tone: string;
}[] = [
  {
    id: "ladder",
    name: "Ladder Mode",
    filename: "LADDER_TRAINING.EXE",
    description: "Classic rating-based training. Best for steady, incremental progress.",
    problems: "04",
    time: "120 MIN",
    useCase: "DAILY GRIND",
    icon: Activity,
    tone: "text-emerald-400 border-emerald-500/25 bg-emerald-950/5 hover:border-emerald-500/50",
  },
  {
    id: "weakness",
    name: "Weakness Mode",
    filename: "WEAKNESS_CORRECT.SYS",
    description: "Analyses history logs to target tags and ratings you struggle with most.",
    problems: "04",
    time: "120 MIN",
    useCase: "FIX REGISTRY GAPS",
    icon: ShieldAlert,
    tone: "text-amber-400 border-amber-500/25 bg-amber-950/5 hover:border-amber-500/50",
  },
  {
    id: "speed",
    name: "Speed Mode",
    filename: "SPEED_BURST.COM",
    description: "Lower-rated problems under strict timeout constraints. Focuses on speed.",
    problems: "04",
    time: "45-60 MIN",
    useCase: "SPEED Telemetry",
    icon: Zap,
    tone: "text-cyan-400 border-cyan-500/25 bg-cyan-950/5 hover:border-cyan-500/50",
  },
  {
    id: "contest",
    name: "Contest Simulation",
    filename: "CONTEST_SIM.BAT",
    description: "Masked rating logs, strict session timers, and final compiling review.",
    problems: "04",
    time: "120 MIN",
    useCase: "EXAM MODE",
    icon: Terminal,
    tone: "text-purple-400 border-purple-500/25 bg-purple-950/5 hover:border-purple-500/50",
  },
  {
    id: "endurance",
    name: "Endurance Mode",
    filename: "ENDURANCE_TEST.BAT",
    description: "Extended runtime modules featuring high problem density sets.",
    problems: "06-08",
    time: "180-240 MIN",
    useCase: "DEEP STAMINA RUN",
    icon: Disc,
    tone: "text-rose-400 border-rose-500/25 bg-rose-950/5 hover:border-rose-500/50",
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 font-mono text-emerald-400">
      {MODES.map((m) => {
        const Icon = m.icon;
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={cn(
              "text-left rounded-xl transition-all border p-5 relative overflow-hidden select-none hover:bg-emerald-950/5",
              active
                ? "border-emerald-500 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/25"
                : "border-emerald-500/15 text-emerald-500/60 hover:border-emerald-500/35"
            )}
          >
            {/* Scanline CRT overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-terminal-scanlines opacity-[0.08]" />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <span className={cn("text-[10px] font-black uppercase tracking-wider", active ? "text-emerald-400 glow-text-emerald" : "text-emerald-500/55")}>
                  {active ? `[ RUNNING: ${m.filename} ]` : `[ ${m.filename} ]`}
                </span>
                <Icon size={14} className={cn("animate-pulse", active ? "text-emerald-400" : "text-emerald-500/40")} />
              </div>

              <p className="text-[11px] leading-relaxed opacity-75 min-h-[44px]">
                {m.description}
              </p>

              <div className="border-t border-emerald-500/10 pt-3 space-y-1 text-[9px] uppercase tracking-wider text-emerald-500/50">
                <div className="flex justify-between">
                  <span>&gt; SESS.PROBLEMS</span>
                  <span className="text-emerald-400 font-bold">{m.problems}</span>
                </div>
                <div className="flex justify-between">
                  <span>&gt; SESS.TIMEOUT</span>
                  <span className="text-emerald-400 font-bold">{m.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>&gt; TARGET.OBJECT</span>
                  <span className="text-emerald-400 font-bold truncate max-w-[150px]">{m.useCase}</span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
