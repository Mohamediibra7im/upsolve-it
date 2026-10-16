"use client";

import { AdminState, AdminRetry } from "./AdminState";

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
import { Loader2, Plus, Save, Trash2, Layers, Info } from "lucide-react";
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

  const updateRow = useCallback((index: number, patch: Partial<LevelRow>) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }, []);

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
          Performance: snapTargetPerformance(
            Number.parseInt(r.Performance, 10),
          ),
        })),
      };
      await apiClient.put("/api/admin/levels", payload);
      toast({
        title: "Training levels saved",
        description: `Successfully stored ${payload.levels.length} training parameters rows in database.`,
        variant: "success",
      });
      await mutate();
      await globalMutate(TRAINING_LEVELS_SWR_KEY);
      setDraft(null);
    } catch (e) {
      toast({
        title: "Could not save changes",
        description: e instanceof Error ? e.message : "Database write error.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !data) {
    return (
      <AdminState
        tone="loading"
        title="Loading training levels…"
        description="Preparing your difficulty settings."
      />
    );
  }

  if (
    error &&
    !draft?.length &&
    error instanceof Error &&
    error.message.startsWith("No training levels in the database.")
  ) {
    return (
      <AdminState
        icon={Layers}
        title="Build your first training level"
        description="Set a target rating and session duration to start shaping your members’ practice."
        action={
          <Button
            onClick={addRow}
            className="h-11 rounded-xl bg-[#b5e3c4] text-[#14241b] hover:bg-[#c7edd3]"
          >
            <Plus size={16} /> Add first level
          </Button>
        }
      />
    );
  }

  if (error && !draft?.length) {
    return (
      <AdminState
        tone="error"
        title="Could not load training levels"
        description="Your difficulty settings are temporarily unavailable."
        action={<AdminRetry onRetry={() => mutate()} />}
      />
    );
  }

  if (draft === null)
    return <AdminState tone="loading" title="Preparing training levels…" />;

  if (!draft.length) {
    return (
      <AdminState
        icon={Layers}
        title="Build your first training level"
        description="Set a target rating and session duration to start shaping your members’ practice."
        action={
          <Button
            onClick={addRow}
            className="h-11 rounded-xl bg-[#b5e3c4] text-[#14241b] hover:bg-[#c7edd3]"
          >
            <Plus size={16} /> Add first level
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8 font-sans text-[#f1f3ee]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#929b98] font-medium text-xs">
            <Layers size={12} className="text-[#b5e3c4]" />
            Training difficulty
          </div>
          <h2 className="text-2xl font-medium text-[#f1f3ee] font-heading tracking-[-0.04em]">
            Training levels
          </h2>
          <p className="text-xs text-[#929b98] font-medium max-w-xl leading-relaxed">
            Configure target rating steps ({LADDER_RATING_BAND_STEP}pts). The
            P1–P4 ladder bands are automatically derived from the target
            baseline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="size-10 rounded-xl border border-[#2b3031] bg-[#191c1e] flex items-center justify-center text-[#929b98] cursor-help hover:text-[#f1f3ee]">
                  <Info size={14} />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="bg-[#191c1e] border-[#2b3031] text-[#b5e3c4] text-xs font-medium max-w-xs rounded-xl font-sans"
              >
                Stored: level label, session time, and target rating. Ladder
                bands are calculated in real-time.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="border border-[#2b3031] rounded-xl overflow-hidden bg-[#191c1e] shadow-none">
        <div className="max-h-[560px] overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[#191c1e] border-b border-[#2b3031]">
              <tr className="text-xs font-medium text-[#929b98]">
                <th className="px-6 py-3 w-16">Level</th>
                <th className="px-4 py-3">Level name</th>
                <th className="px-4 py-3 w-28">Minutes</th>
                <th className="px-4 py-3 w-32">Target rating</th>
                <th className="px-4 py-3 w-20 text-center">P1</th>
                <th className="px-4 py-3 w-20 text-center">P2</th>
                <th className="px-4 py-3 w-20 text-center">P3</th>
                <th className="px-4 py-3 w-20 text-center">P4</th>
                <th className="px-6 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b3031]">
              {previewRows.map((row, index) => (
                <tr
                  key={row.id}
                  className="hover:bg-[#b5e3c4]/[0.06] transition-colors group"
                >
                  <td className="px-6 py-3 tabular-nums text-[#929b98] font-sans">
                    #{String(row.id).padStart(3, "0")}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      aria-label={`Level ${index + 1} name`}
                      value={draft[index].level}
                      onChange={(e) =>
                        updateRow(index, { level: e.target.value })
                      }
                      className="h-10 bg-[#101214] border-[#2b3031] rounded-xl text-[#f1f3ee] font-medium focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] font-sans"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      aria-label={`Level ${index + 1} duration`}
                      value={draft[index].time}
                      onChange={(e) =>
                        updateRow(index, { time: e.target.value })
                      }
                      className="h-10 bg-[#101214] border-[#2b3031] rounded-xl text-[#b5e3c4] tabular-nums focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] font-sans"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={800}
                      max={MAX_LEVEL_PERFORMANCE}
                      step={LADDER_RATING_BAND_STEP}
                      aria-label={`Level ${index + 1} target rating`}
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
                      className="h-10 bg-[#101214] border-[#2b3031] rounded-xl text-[#f1f3ee] font-medium tabular-nums focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] font-sans"
                    />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-[#929b98] text-center font-medium">
                    {row.P1}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-[#929b98] text-center font-medium">
                    {row.P2}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-[#929b98] text-center font-medium">
                    {row.P3}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-[#b5e3c4] text-center font-medium">
                    {row.P4}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-10 rounded-xl text-[#929b98] hover:text-red-400 hover:bg-red-400/5 hover:border hover:border-red-500/20 opacity-100 sm:opacity-60 sm:group-hover:opacity-100 transition-opacity"
                      disabled={draft.length <= 1}
                      aria-label={`Remove level ${index + 1}`}
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
          className="h-10 px-4 rounded-xl bg-[#b5e3c4] hover:bg-[#b5e3c4] text-[#14241b] font-medium text-[13px] gap-2 border-transparent font-sans"
        >
          {saving ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Save className="size-3" />
          )}
          <span>Save changes</span>
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={addRow}
          className="h-10 px-4 rounded-xl bg-transparent border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] font-medium text-[13px] gap-2 font-sans"
        >
          <Plus className="size-3" />
          <span>Add level</span>
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
          className="h-10 px-3 rounded-xl text-[#929b98] hover:text-[#f1f3ee] text-[13px] font-medium font-sans"
        >
          Reset changes
        </Button>
      </div>
    </div>
  );
}
