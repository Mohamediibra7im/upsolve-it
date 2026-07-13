"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/providers/Toast";
import {
  ladderRatingsFromPerformance,
  LADDER_RATING_BAND_STEP,
} from "@/services/training/modeRatings";
import {
  TRAINING_LEVELS_SWR_KEY,
  fetchTrainingLevelsFromApi,
  type Level,
} from "@/hooks/roadmap";
import { Loader2, Plus, Save, Trash2, Layers, Info, Shield } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MAX_LEVEL_PERFORMANCE = 4100;

function snapTargetPerformance(raw: number): number {
  if (!Number.isFinite(raw)) return 800;
  const snapped =
    Math.round(raw / LADDER_RATING_BAND_STEP) * LADDER_RATING_BAND_STEP;
  return Math.max(800, Math.min(MAX_LEVEL_PERFORMANCE, snapped));
}

type LevelRow = Pick<Level, "id" | "level" | "time" | "Performance">;

export default function AdminLevelsManagement() {
  const { toast } = useToast();
  const { mutate: globalMutate } = useSWRConfig();
  const { data, isLoading, error, mutate } = useSWR<LevelRow[]>(
    TRAINING_LEVELS_SWR_KEY,
    fetchTrainingLevelsFromApi,
    { revalidateOnFocus: false, dedupingInterval: 5_000 },
  );

  const [draft, setDraft] = useState<LevelRow[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && draft === null) {
      setDraft(
        data.map((r) => ({
          ...r,
          Performance: String(
            snapTargetPerformance(Number.parseInt(r.Performance, 10)),
          ),
        })),
      );
    }
  }, [data, draft]);

  const previewRows = useMemo(() => {
    if (!draft?.length) return [];
    return draft.map((row) => {
      const perf = Number.parseInt(row.Performance, 10);
      const r = ladderRatingsFromPerformance(
        Number.isFinite(perf) ? perf : 900,
      );
      return { ...row, ...r };
    });
  }, [draft]);

  const updateRow = useCallback(
    (index: number, patch: Partial<LevelRow>) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const next = [...prev];
        next[index] = { ...next[index], ...patch };
        return next;
      });
    },
    [],
  );

  const addRow = useCallback(() => {
    setDraft((prev) => {
      const base = prev ?? [];
      const maxId = base.length ? Math.max(...base.map((r) => r.id)) : 0;
      const lastPerf = base.length
        ? Number.parseInt(base.at(-1)!.Performance, 10)
        : 800;
      const nextPerf = Number.isFinite(lastPerf)
        ? lastPerf + LADDER_RATING_BAND_STEP
        : 900;
      return [
        ...base,
        {
          id: maxId + 1,
          level: String(maxId + 1),
          time: "120",
          Performance: String(snapTargetPerformance(nextPerf)),
        },
      ];
    });
  }, []);

  const removeRow = useCallback((index: number) => {
    setDraft((prev) => {
      if (!prev || prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleSave = async () => {
    if (!draft?.length) return;
    setSaving(true);
    try {
      const payload = {
        levels: draft.map((r) => ({
          id: r.id,
          level: r.level,
          time: r.time,
          Performance: snapTargetPerformance(Number.parseInt(r.Performance, 10)),
        })),
      };
      await apiClient.put("/api/admin/levels", payload);
      toast({
        title: "LEVELS: MATRIX SAVE COMMITTED",
        description: `Successfully stored ${payload.levels.length} training parameters rows in database.`,
        variant: "success"
      });
      await mutate();
      await globalMutate(TRAINING_LEVELS_SWR_KEY);
      setDraft(null);
    } catch (e) {
      toast({
        title: "SYS.ERR: COMMIT FAILED",
        description: e instanceof Error ? e.message : "Database write error.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 font-mono text-emerald-400">
        <Loader2 className="size-8 animate-spin text-emerald-400" />
        <p className="text-[10px] font-bold uppercase tracking-widest animate-pulse">ACCESSING_TRAINING_MATRIX.SYS...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-none border border-red-500/25 bg-red-955/10 p-8 space-y-4 max-w-xl text-center mx-auto font-mono text-red-400">
        <div className="size-10 bg-red-955/20 border border-red-500/20 flex items-center justify-center mx-auto">
          <Shield className="text-red-400" size={18} />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-widest">INITIALIZATION_FAILED</h3>
          <p className="text-[10px] text-red-500/50 uppercase">
            {error instanceof Error ? error.message : "Training levels could not be synchronized."}
          </p>
        </div>
        <Button onClick={() => globalThis.location.reload()} variant="outline" className="rounded-none border-red-500/20 hover:bg-red-500/10 text-red-400 font-mono text-[9px] uppercase tracking-widest h-8">
          Retry Sync
        </Button>
      </div>
    );
  }

  if (!draft?.length) {
    return null;
  }

  return (
    <div className="space-y-8 font-mono text-emerald-400">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500/40 font-bold text-[9px] uppercase tracking-widest">
            <Layers size={12} className="text-emerald-400" />
            SYSOP_MATRIX // LEVEL_DIFFICULTY_ACL
          </div>
          <h2 className="text-lg font-bold tracking-widest text-emerald-300 uppercase">Distribution Matrix</h2>
          <p className="text-[10px] text-emerald-500/40 font-bold max-w-xl uppercase tracking-wider leading-relaxed">
            Configure target rating steps ({LADDER_RATING_BAND_STEP}pts). The P1–P4 ladder bands are automatically derived from the target baseline.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="size-8 rounded-none border border-emerald-500/15 bg-[#060a08]/30 flex items-center justify-center text-emerald-500/60 cursor-help hover:text-emerald-300">
                  <Info size={14} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-[#060a08] border-emerald-500/25 text-emerald-400 text-[9px] font-bold uppercase tracking-wider max-w-xs rounded-none font-mono">
                Stored: level label, session time, and target rating. Ladder bands are calculated in real-time.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="border border-emerald-500/15 rounded-none overflow-hidden bg-[#060a08]/10 shadow-2xl">
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full text-left text-[10px]">
            <thead className="sticky top-0 z-10 bg-[#060a08] border-b border-emerald-500/15">
              <tr className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">
                <th className="px-6 py-3 w-16">ID_REF</th>
                <th className="px-4 py-3">LABEL</th>
                <th className="px-4 py-3 w-28">TIME (MIN)</th>
                <th className="px-4 py-3 w-32">TARGET_RATING</th>
                <th className="px-4 py-3 w-20 text-center">P1</th>
                <th className="px-4 py-3 w-20 text-center">P2</th>
                <th className="px-4 py-3 w-20 text-center">P3</th>
                <th className="px-4 py-3 w-20 text-center">P4</th>
                <th className="px-6 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/[0.08]">
              {previewRows.map((row, index) => (
                <tr
                  key={row.id}
                  className="hover:bg-emerald-500/[0.02] transition-colors group"
                >
                  <td className="px-6 py-3 tabular-nums text-emerald-500/35 font-mono">
                    #{String(row.id).padStart(3, '0')}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={draft[index].level}
                      onChange={(e) =>
                        updateRow(index, { level: e.target.value })
                      }
                      className="h-8 bg-[#040604]/50 border-emerald-500/15 rounded-none text-emerald-300 font-bold focus:ring-0 focus:border-emerald-500/45 font-mono"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={draft[index].time}
                      onChange={(e) =>
                        updateRow(index, { time: e.target.value })
                      }
                      className="h-8 bg-[#040604]/50 border-emerald-500/15 rounded-none text-emerald-400 tabular-nums focus:ring-0 focus:border-emerald-500/45 font-mono"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={800}
                      max={MAX_LEVEL_PERFORMANCE}
                      step={LADDER_RATING_BAND_STEP}
                      value={draft[index].Performance}
                      onChange={(e) =>
                        updateRow(index, { Performance: e.target.value })
                      }
                      onBlur={() => {
                        const n = Number.parseInt(draft[index].Performance, 10);
                        const snapped = snapTargetPerformance(n);
                        if (snapped !== n) {
                          updateRow(index, {
                            Performance: String(snapped),
                          });
                        }
                      }}
                      className="h-8 bg-[#040604]/50 border-emerald-500/15 rounded-none text-emerald-300 font-bold tabular-nums focus:ring-0 focus:border-emerald-500/45 font-mono"
                    />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-emerald-500/50 text-center font-bold">
                    {row.P1}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-emerald-500/50 text-center font-bold">
                    {row.P2}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-emerald-500/50 text-center font-bold">
                    {row.P3}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-emerald-400 text-center font-black">
                    {row.P4}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-none text-emerald-500/40 hover:text-red-400 hover:bg-red-955/10 hover:border hover:border-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={draft.length <= 1}
                      onClick={() => removeRow(index)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-8 px-4 rounded-none bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] gap-2 shadow-[0_0_15px_rgba(16,185,129,0.25)] border-transparent font-mono"
        >
          {saving ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Save className="size-3" />
          )}
          <span>[ COMMIT_CHANGES.EXE ]</span>
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={addRow}
          className="h-8 px-4 rounded-none bg-transparent border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-widest text-[9px] gap-2 font-mono"
        >
          <Plus className="size-3" />
          <span>[ ADD_MATRIX_ROW.BAT ]</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (data)
              setDraft(
                data.map((r) => ({
                  ...r,
                  Performance: String(
                    snapTargetPerformance(Number.parseInt(r.Performance, 10)),
                  ),
                })),
              );
          }}
          className="h-8 px-3 rounded-none text-emerald-500/50 hover:text-emerald-300 text-[9px] font-bold uppercase tracking-widest font-mono"
        >
          [ RESET_DRAFT.SH ]
        </Button>
      </div>
    </div>
  );
}
