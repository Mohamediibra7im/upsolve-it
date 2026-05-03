"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/app/_Components/Toast";
import { ladderRatingsFromPerformance } from "@/utils/training/modeRatings";
import {
  TRAINING_LEVELS_SWR_KEY,
  fetchTrainingLevelsFromApi,
  type Level,
} from "@/hooks/useLevels";
import { Loader2, Plus, Save, Trash2, Layers, Info, Database } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Matches `getDefaultTrainingLevelDocs()` in the backend (IDs 1…110). */
const CANONICAL_LEVEL_COUNT = 110;

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
  const [reseeding, setReseeding] = useState(false);

  const handleReseed = async () => {
    setReseeding(true);
    try {
      const result = await apiClient.post<{ count: number }>(
        "/api/admin/levels/reseed",
      );
      toast({
        title: "Database reseeded",
        description: `Inserted ${result.count} built-in default levels.`,
      });
      await mutate();
      await globalMutate(TRAINING_LEVELS_SWR_KEY);
      setDraft(null);
    } catch (e) {
      toast({
        title: "Reseed failed",
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setReseeding(false);
    }
  };

  useEffect(() => {
    if (data && draft === null) {
      setDraft(data.map((r) => ({ ...r })));
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
        ? Number.parseInt(base[base.length - 1].Performance, 10)
        : 800;
      const nextPerf = Number.isFinite(lastPerf) ? lastPerf + 25 : 900;
      return [
        ...base,
        {
          id: maxId + 1,
          level: String(maxId + 1),
          time: "120",
          Performance: String(Math.min(4000, nextPerf)),
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
          Performance: Number.parseInt(r.Performance, 10),
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
      <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading levels…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 space-y-4 max-w-xl">
        <p className="text-sm text-destructive font-medium">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <p className="text-xs text-muted-foreground">
          This replaces all rows in MongoDB with the built-in {CANONICAL_LEVEL_COUNT} default levels
          (IDs 1–{CANONICAL_LEVEL_COUNT}; targets 900–4050). Requires admin API access.
        </p>
        <Button
          type="button"
          onClick={handleReseed}
          disabled={reseeding}
          className="rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]"
        >
          {reseeding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          Reseed default levels
        </Button>
      </div>
    );
  }

  if (!draft?.length) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Layers className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Training ladder
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase">
            Level distribution
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Each row is a target rating. Problem slots P1–P4 are computed from that
            target (tight band, at least one problem above target). Edit targets here;
            the app stays in sync via the API.
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 text-muted-foreground hover:text-foreground"
                aria-label="How ladder targets work"
              >
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              align="start"
              sideOffset={8}
              className="z-[300] max-w-[min(20rem,calc(100vw-2rem))] overflow-visible whitespace-normal break-words px-3 py-2.5 text-left text-xs leading-relaxed"
            >
              Stored: level label, session time, and target rating. P1 to P4 are a
              preview of ladder pool targets (same values as on the Training page).
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/30 overflow-hidden">
        <div className="max-h-[min(65vh,560px)] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40">
              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-3 w-14">ID</th>
                <th className="px-3 py-3">Label</th>
                <th className="px-3 py-3 w-20">Time</th>
                <th className="px-3 py-3 w-28">Target</th>
                <th className="px-3 py-3 w-16">P1</th>
                <th className="px-3 py-3 w-16">P2</th>
                <th className="px-3 py-3 w-16">P3</th>
                <th className="px-3 py-3 w-16">P4</th>
                <th className="px-3 py-3 w-14" />
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-border/20 hover:bg-white/[0.03]",
                    index % 2 === 1 && "bg-muted/10",
                  )}
                >
                  <td className="px-3 py-2 tabular-nums text-muted-foreground">
                    {row.id}
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={draft[index].level}
                      onChange={(e) =>
                        updateRow(index, { level: e.target.value })
                      }
                      className="h-9 bg-background/60 font-medium"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={draft[index].time}
                      onChange={(e) =>
                        updateRow(index, { time: e.target.value })
                      }
                      className="h-9 bg-background/60 tabular-nums"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={800}
                      max={4000}
                      value={draft[index].Performance}
                      onChange={(e) =>
                        updateRow(index, { Performance: e.target.value })
                      }
                      className="h-9 bg-background/60 tabular-nums font-semibold"
                    />
                  </td>
                  <td className="px-3 py-2 tabular-nums text-muted-foreground">
                    {row.P1}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-muted-foreground">
                    {row.P2}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-muted-foreground">
                    {row.P3}
                  </td>
                  <td className="px-3 py-2 tabular-nums font-medium text-primary">
                    {row.P4}
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      disabled={draft.length <= 1}
                      onClick={() => removeRow(index)}
                      aria-label="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save to database
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReseed}
            disabled={reseeding}
            className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2"
          >
            {reseeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Reseed {CANONICAL_LEVEL_COUNT} levels
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={addRow}
            className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2"
          >
            <Plus className="h-4 w-4" />
            Add level
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (data) setDraft(data.map((r) => ({ ...r })));
            }}
            className="rounded-xl text-xs"
          >
            Revert changes
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Built-in ladder has {CANONICAL_LEVEL_COUNT} levels (last ID {CANONICAL_LEVEL_COUNT}). This
          editor shows {draft.length} row{draft.length === 1 ? "" : "s"}.
        </p>
      </div>
    </div>
  );
}
