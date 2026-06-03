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

/** Matches `getDefaultTrainingLevelDocs()` in the backend (IDs 1…110). */
const CANONICAL_LEVEL_COUNT = 110;

/** Must stay in sync with `LevelRowDto` / seed max (900…4050 in seed; extra rows may step above). */
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
        title: "Levels saved",
        description: `${payload.levels.length} rows stored. Training uses the ladder formula from each target rating.`,
      });
      await mutate();
      await globalMutate(TRAINING_LEVELS_SWR_KEY);
      setDraft(null);
    } catch (e) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="size-10 animate-spin text-primary opacity-50" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Accessing training matrix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border-destructive/20 bg-destructive/5 p-8 space-y-4 max-w-xl text-center mx-auto">
        <div className="size-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
          <Shield className="text-destructive opacity-50" size={24} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-destructive uppercase tracking-widest">Initialization Failed</h3>
          <p className="text-xs text-muted-foreground">
            {error instanceof Error ? error.message : "Training levels could not be synchronized."}
          </p>
        </div>
        <Button onClick={() => globalThis.location.reload()} variant="outline" className="rounded-xl border-border hover:bg-secondary/50">
          Retry Sync
        </Button>
      </div>
    );
  }

  if (!draft?.length) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
            <Layers size={12} />
            Training Configuration
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Distribution Matrix</h2>
          <p className="text-xs text-muted-foreground font-medium max-w-xl">
            Configure target rating steps ({LADDER_RATING_BAND_STEP}pts). The P1–P4 ladder bands are automatically derived from the target baseline.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="size-9 rounded-xl border border-border bg-secondary/50 flex items-center justify-center text-muted-foreground cursor-help">
                  <span className="sr-only">Help</span>
                  <Info size={16} />
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-card border-border text-muted-foreground text-[10px] max-w-xs">
                Stored: level label, session time, and target rating. Ladder bands are calculated in real-time.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-background/50 shadow-2xl">
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full text-[11px]">
            <thead className="sticky top-0 z-10 bg-muted border-b border-border">
              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4 w-16">ID</th>
                <th className="px-4 py-4">Label</th>
                <th className="px-4 py-4 w-24">Time (min)</th>
                <th className="px-4 py-4 w-32">Target</th>
                <th className="px-4 py-4 w-20 text-center">P1</th>
                <th className="px-4 py-4 w-20 text-center">P2</th>
                <th className="px-4 py-4 w-20 text-center">P3</th>
                <th className="px-4 py-4 w-20 text-center">P4</th>
                <th className="px-6 py-4 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {previewRows.map((row, index) => (
                <tr
                  key={row.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-3 tabular-nums text-muted-foreground font-mono">
                    #{String(row.id).padStart(3, '0')}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={draft[index].level}
                      onChange={(e) =>
                        updateRow(index, { level: e.target.value })
                      }
                      className="h-9 bg-background/50 border-border rounded-lg text-foreground font-bold focus:ring-primary/20"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={draft[index].time}
                      onChange={(e) =>
                        updateRow(index, { time: e.target.value })
                      }
                      className="h-9 bg-background/50 border-border rounded-lg text-muted-foreground tabular-nums focus:ring-primary/20"
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
                      className="h-9 bg-background border-primary/20 rounded-lg text-foreground font-black tabular-nums focus:ring-primary/30"
                    />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground text-center font-bold">
                    {row.P1}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground text-center font-bold">
                    {row.P2}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground text-center font-bold">
                    {row.P3}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-primary text-center font-black">
                    {row.P4}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={draft.length <= 1}
                      onClick={() => removeRow(index)}
                    >
                      <Trash2 size={14} />
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
          className="h-10 px-6 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Commit Changes
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={addRow}
          className="h-10 px-6 rounded-xl bg-secondary/50 border border-border hover:bg-secondary text-foreground font-bold uppercase tracking-widest text-[10px] gap-2"
        >
          <Plus className="size-4 text-primary" />
          Add Matrix Row
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
          className="h-10 px-4 rounded-xl text-muted-foreground hover:text-foreground text-[10px] font-bold uppercase tracking-widest"
        >
          Reset Draft
        </Button>
      </div>
    </div>
  );
}
