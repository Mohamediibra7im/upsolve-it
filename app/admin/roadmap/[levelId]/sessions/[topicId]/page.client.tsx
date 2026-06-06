"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Target,
  Trash2,
  Award,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  Edit2,
  BookOpen,
  Plus,
  Globe,
  Settings,
  FileText,
  ChevronRight
} from "lucide-react";
import { useAdminRoadmapTopics } from "@/hooks/admin/useAdminRoadmap";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/providers/Toast";
import { cn } from "@/lib/utils";
import Loader from "@/components/shared/Loader";
import type { RoadmapResource, RoadmapProblem } from "@/types/Roadmap";

function extractVideoTitle(url: string): Promise<string> {
  return new Promise(async (resolve) => {
    try {
      const oembedRes = await fetch(
        `https://noembed.com/embed?url=${encodeURIComponent(url)}`
      );
      const data = await oembedRes.json();
      if (data && data.title) {
        resolve(data.title);
        return;
      }
    } catch (e) {
      console.error("Failed to fetch oembed title", e);
    }
    resolve("");
  });
}

function extractCfProblemId(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("codeforces.com")) {
      const contestMatch = url.match(/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/i);
      if (contestMatch) {
        return `${contestMatch[1]}-${contestMatch[2]}`.toUpperCase();
      }
      const problemsetMatch = url.match(/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/i);
      if (problemsetMatch) {
        return `${problemsetMatch[1]}-${problemsetMatch[2]}`.toUpperCase();
      }
    }
  } catch {
    // Ignore
  }
  return "";
}

type ResourceTableProps = {
  list: RoadmapResource[];
  title: string;
  description: string;
  emptyMessage: string;
  onAdd: () => void;
  addButtonText: string;
  badgeColor: string;
  badgeText: string;
  onEdit: (res: RoadmapResource) => void;
  onDelete: (id: string) => void;
};

function ResourceTable({
  list,
  title,
  description,
  emptyMessage,
  onAdd,
  addButtonText,
  badgeColor,
  badgeText,
  onEdit,
  onDelete,
}: ResourceTableProps) {
  return (
    <div className="rounded-[2rem] border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between border-b border-border/40 px-8 py-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-foreground">{title}</h2>
              <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border", badgeColor)}>
                {badgeText}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button
          onClick={onAdd}
          className="rounded-xl bg-primary text-xs font-black uppercase tracking-[0.1em] text-primary-foreground gap-2"
        >
          <Plus size={16} />
          {addButtonText}
        </Button>
      </div>
      {list.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground italic text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background/30">
              <TableRow>
                <TableHead className="px-6 py-4 w-12 text-[10px] font-black uppercase tracking-widest">#</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Title</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Lang</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Type</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Weight</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">XP</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((res, i) => (
                <TableRow key={res._id} className="hover:bg-card/30">
                  <TableCell className="px-6 py-4 font-mono text-xs font-bold text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">{res.title}</span>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-1 truncate max-w-sm"
                      >
                        {res.url}
                        <ExternalLink size={10} />
                      </a>
                      {res.description && (
                        <span className="text-[10px] text-muted-foreground/60 mt-1 italic">{res.description}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                        res.language === "Arabic"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                      )}
                    >
                      <Globe size={10} />
                      {res.language}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {res.type}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className={cn("text-xs font-bold", res.weight === 0 ? "text-muted-foreground/40" : "text-emerald-400")}>
                      {res.weight === 0 ? "Optional" : `${res.weight} pts`}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center text-xs font-bold text-primary">
                    +{res.xpReward} XP
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(res)}
                        className="h-8 w-8 rounded-lg hover:bg-secondary"
                      >
                        <Edit2 size={12} className="text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(res._id)}
                        className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function AdminSessionDetailClient() {
  const params = useParams<{ levelId: string; topicId: string }>();
  const levelId = params?.levelId ?? "";
  const topicId = params?.topicId ?? "";
  const { toast } = useToast();

  const {
    topics,
    addResource,
    updateResource,
    deleteResource,
    addProblem,
    addProblems,
    updateProblem,
    deleteProblem,
    deleteProblems,
    importProblems,
    updateTopic,
  } = useAdminRoadmapTopics(levelId);

  const [activeTab, setActiveTab] = useState<"resources" | "problems">("resources");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [topicData, setTopicData] = useState<any>(null);

  // Modal States
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isProblemDialogOpen, setIsProblemDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<RoadmapResource | null>(null);
  const [editingProblem, setEditingProblem] = useState<RoadmapProblem | null>(null);

  // Resource Form States
  const [resTitle, setResTitle] = useState("");
  const [resDescription, setResDescription] = useState("");
  const [resLanguage, setResLanguage] = useState<"Arabic" | "English">("Arabic");
  const [resType, setResType] = useState<RoadmapResource["type"]>("Video");
  const [resUrl, setResUrl] = useState("");
  const [resWeight, setResWeight] = useState(1);
  const [resXpReward, setResXpReward] = useState(10);
  const [resVideoThreshold, setResVideoThreshold] = useState(85);
  const [resOrderIndex, setResOrderIndex] = useState(0);
  const [isFetchingVideoMeta, setIsFetchingVideoMeta] = useState(false);

  // Problem Form States
  const [probName, setProbName] = useState("");
  const [probUrl, setProbUrl] = useState("");
  const [probCfProblemId, setProbCfProblemId] = useState("");
  const [probXpReward, setProbXpReward] = useState(20);
  const [probOrderIndex, setProbOrderIndex] = useState(0);

  // Bulk Markdown & Import States
  const [bulkMarkdown, setBulkMarkdown] = useState("");
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [importContestId, setImportContestId] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Checkbox Selection for problems
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(new Set());

  // Group Settings
  const [groupLinks, setGroupLinks] = useState("");
  const [groupNote, setGroupNote] = useState("");
  const [isSavingGroupSettings, setIsSavingGroupSettings] = useState(false);

  // Load topic detail data
  const loadTopicData = useCallback(async () => {
    if (!levelId || !topicId) return;
    setIsPageLoading(true);
    try {
      const res = await apiClient.get<any>(
        `/api/roadmap/levels/${levelId}/topics/${topicId}`
      );
      if (res) {
        setTopicData(res);
      }
    } catch (err) {
      console.error("Failed to load topic details:", err);
      toast({
        title: "Error",
        description: "Failed to load topic details",
        variant: "destructive",
      });
    } finally {
      setIsPageLoading(false);
    }
  }, [levelId, topicId, toast]);

  useEffect(() => {
    loadTopicData();
  }, [loadTopicData]);

  // Sync group settings from topic data
  useEffect(() => {
    if (topicData?.topic) {
      const raw = topicData.topic.groupLinks;
      setGroupLinks(
        Array.isArray(raw)
          ? raw.map((g: any) => g?.link ?? g?.toString() ?? "").filter(Boolean).join("\n")
          : typeof raw === "string"
            ? raw
            : ""
      );
      setGroupNote(topicData.topic.groupNote || "");
    }
  }, [topicData]);

  // Watch URL for Video Title auto-fetch
  useEffect(() => {
    if (resType !== "Video" || !resUrl || editingResource) return;
    
    // Check if it looks like a youtube URL
    if (!resUrl.includes("youtu")) return;

    let active = true;
    const timer = setTimeout(async () => {
      setIsFetchingVideoMeta(true);
      const title = await extractVideoTitle(resUrl);
      if (active && title) {
        setResTitle(title);
      }
      setIsFetchingVideoMeta(false);
    }, 800);

    return () => {
      active = false;
      clearTimeout(timer);
      setIsFetchingVideoMeta(false);
    };
  }, [resUrl, resType, editingResource]);

  // Watch Problem URL for automatic CF ID extraction
  useEffect(() => {
    if (!probUrl) return;
    const extracted = extractCfProblemId(probUrl);
    if (extracted) {
      setProbCfProblemId(extracted);
    }
  }, [probUrl]);

  // Resource Form Helpers
  const resetResourceForm = (lang?: "Arabic" | "English") => {
    setResTitle("");
    setResDescription("");
    setResLanguage(lang ?? "Arabic");
    setResType("Video");
    setResUrl("");
    setResWeight(1);
    setResXpReward(10);
    setResVideoThreshold(85);
    const resources = topicData?.resources ?? [];
    const sameLangCount = lang
      ? resources.filter((r: RoadmapResource) => r.language === lang).length
      : resources.length;
    setResOrderIndex(sameLangCount + 1);
    setEditingResource(null);
  };

  const handleOpenEditResource = (res: RoadmapResource) => {
    setEditingResource(res);
    setResTitle(res.title);
    setResDescription(res.description || "");
    setResLanguage(res.language);
    setResType(res.type);
    setResUrl(res.url);
    setResWeight(res.weight ?? 1);
    setResXpReward(res.xpReward ?? 10);
    setResVideoThreshold(res.videoCompletionThresholdPct ?? 80);
    setResOrderIndex(res.orderIndex);
    setIsResourceDialogOpen(true);
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await deleteResource(id);
      toast({ title: "Deleted", description: "Resource deleted successfully", variant: "success" });
      await loadTopicData();
    } catch (_err: unknown) {
      toast({ title: "Error", description: "Failed to delete resource", variant: "destructive" });
    }
  };

  const handleOpenCreateResource = (
    presetLang: "Arabic" | "English" = "Arabic",
    presetType: RoadmapResource["type"] = "Video",
    presetWeight: number = 1
  ) => {
    resetResourceForm(presetLang);
    setResType(presetType);
    setResWeight(presetWeight);
    setIsResourceDialogOpen(true);
  };


  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: resTitle,
      description: resDescription,
      language: resLanguage,
      type: resType,
      url: resUrl,
      weight: Number(resWeight),
      xpReward: Number(resXpReward),
      videoCompletionThresholdPct: resType === "Video" ? Number(resVideoThreshold) : undefined,
      orderIndex: Number(resOrderIndex),
    };

    try {
      if (editingResource) {
        await updateResource(editingResource._id, payload);
        toast({ title: "Updated", description: "Resource updated successfully", variant: "success" });
      } else {
        await addResource(topicId, payload);
        toast({ title: "Created", description: "Resource created successfully", variant: "success" });
      }
      setIsResourceDialogOpen(false);
      resetResourceForm();
      await loadTopicData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save resource",
        variant: "destructive",
      });
    }
  };


  // Problem Form Helpers
  const resetProblemForm = () => {
    setProbName("");
    setProbUrl("");
    setProbCfProblemId("");
    setProbXpReward(20);
    setProbOrderIndex(topicData?.problems?.length ?? 0);
    setEditingProblem(null);
  };


  const handleOpenEditProblem = (p: RoadmapProblem) => {
    setEditingProblem(p);
    setProbName(p.name);
    setProbUrl(p.url);
    setProbCfProblemId(p.cfProblemId || "");
    setProbXpReward(p.xpReward ?? 20);
    setProbOrderIndex(p.orderIndex);
    setIsProblemDialogOpen(true);
  };

  const handleProblemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: probName,
      url: probUrl,
      cfProblemId: probCfProblemId || undefined,
      xpReward: Number(probXpReward),
      orderIndex: Number(probOrderIndex),
    };

    try {
      if (editingProblem) {
        await updateProblem(editingProblem._id, payload);
        toast({ title: "Updated", description: "Problem updated successfully", variant: "success" });
      } else {
        await addProblem(topicId, payload);
        toast({ title: "Created", description: "Problem added successfully", variant: "success" });
      }
      setIsProblemDialogOpen(false);
      resetProblemForm();
      await loadTopicData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save problem",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProblem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;
    try {
      await deleteProblem(id);
      toast({ title: "Deleted", description: "Problem deleted successfully", variant: "success" });
      await loadTopicData();
    } catch (_err: unknown) {
      toast({ title: "Error", description: "Failed to delete problem", variant: "destructive" });
    }
  };

  // Group Settings Save
  const handleSaveGroupSettings = async () => {
    setIsSavingGroupSettings(true);
    try {
      await updateTopic(topicId, {
        groupLinks: groupLinks || undefined,
        groupNote: groupNote || undefined,
      });
      toast({ title: "Saved", description: "Group settings updated successfully", variant: "success" });
      await loadTopicData();
    } catch (_err: unknown) {
      toast({ title: "Error", description: "Failed to save group settings", variant: "destructive" });
    } finally {
      setIsSavingGroupSettings(false);
    }
  };

  // Bulk Selections
  const toggleProblemSelection = (id: string) => {
    setSelectedProblems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const list = topicData?.problems ?? [];
    if (selectedProblems.size === list.length) {
      setSelectedProblems(new Set());
    } else {
      setSelectedProblems(new Set(list.map((p: any) => p._id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedProblems.size} selected problem(s)?`)) return;
    try {
      await deleteProblems(Array.from(selectedProblems));
      toast({
        title: "Deleted",
        description: `${selectedProblems.size} problem(s) removed`,
        variant: "success",
      });
      setSelectedProblems(new Set());
      await loadTopicData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete problems",
        variant: "destructive",
      });
    }
  };

  // Markdown Import Parser
  const handleBulkMarkdownSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkMarkdown.split("\n").map((l) => l.trim()).filter(Boolean);
    const rows: string[][] = [];

    for (const line of lines) {
      if (line.startsWith("|") && line.endsWith("|")) {
        const cells = line.split("|").map((c) => c.trim());
        cells.shift();
        cells.pop();
        rows.push(cells);
      }
    }

    if (rows.length === 0) {
      toast({
        title: "Parsing Failed",
        description: "Make sure markdown table rows start and end with '|' characters.",
        variant: "destructive",
      });
      return;
    }

    setIsBulkAdding(true);

    try {
      let nameColIdx = 0;
      let linkColIdx = 1;

      const headerRow = rows[0];
      const isHeader = headerRow.some(
        (cell) =>
          cell.toLowerCase().includes("name") ||
          cell.toLowerCase().includes("title") ||
          cell.toLowerCase().includes("link") ||
          cell.toLowerCase().includes("url")
      );

      let dataRows = rows;
      if (isHeader) {
        headerRow.forEach((cell, idx) => {
          const lower = cell.toLowerCase();
          if (lower.includes("name") || lower.includes("title") || lower.includes("problem")) {
            nameColIdx = idx;
          } else if (lower.includes("link") || lower.includes("url")) {
            linkColIdx = idx;
          }
        });
        dataRows = rows.slice(1);
        if (dataRows.length > 0 && dataRows[0].every((cell) => cell.includes("-") || cell === "")) {
          dataRows = dataRows.slice(1);
        }
      }

      const problemsToAdd: Array<{ name: string; url: string; xpReward: number; cfProblemId: string }> = [];

      for (const row of dataRows) {
        if (row.length < 2) continue;
        const title = row[nameColIdx] || "";
        const link = row[linkColIdx] || "";

        let parsedLink = link;
        const linkMatch = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          parsedLink = linkMatch[2];
        }

        let parsedTitle = title;
        const titleMatch = title.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (titleMatch) {
          parsedTitle = titleMatch[1];
          if (!parsedLink) parsedLink = titleMatch[2];
        }

        if (parsedTitle && parsedLink) {
          const cfId = extractCfProblemId(parsedLink);
          problemsToAdd.push({
            name: parsedTitle,
            url: parsedLink,
            xpReward: 20, // default
            cfProblemId: cfId || "",
          });
        }
      }

      if (problemsToAdd.length === 0) {
        toast({
          title: "No problems found",
          description: "Could not parse any valid problems from the table.",
          variant: "destructive",
        });
        return;
      }

      await addProblems(topicId, problemsToAdd);
      toast({
        title: "Bulk Import Complete",
        description: `Imported ${problemsToAdd.length} problem(s)`,
        variant: "success",
      });
      setBulkMarkdown("");
      await loadTopicData();
    } catch (err: any) {
      toast({
        title: "Bulk Import Failed",
        description: err.message || "An error occurred during bulk importing.",
        variant: "destructive",
      });
    } finally {
      setIsBulkAdding(false);
    }
  };

  // Codeforces Contest Import Handler
  const handleContestImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importContestId || isNaN(Number(importContestId))) {
      toast({ title: "Error", description: "Please enter a valid numeric contest ID", variant: "destructive" });
      return;
    }
    setIsImporting(true);
    try {
      const res: any = await importProblems(topicId, { contestId: Number(importContestId) });
      toast({
        title: "Contest Imported",
        description: `Successfully imported ${res.inserted || 0} problems. Skipped ${res.skipped || 0}.`,
        variant: "success",
      });
      setImportContestId("");
      await loadTopicData();
    } catch (err: any) {
      toast({
        title: "Import Error",
        description: err.message || "Failed to import Codeforces contest",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const totalLearningWeight = useMemo(() => {
    const list = topicData?.resources ?? [];
    return list.reduce((sum: number, r: RoadmapResource) => sum + (r.weight ?? 0), 0);
  }, [topicData?.resources]);

  const resourcesList: RoadmapResource[] = useMemo(
    () => topicData?.resources ?? [],
    [topicData?.resources],
  );
  const arabicMainResources = useMemo(() => {
    return resourcesList.filter((r) => r.language === "Arabic" && r.type === "Video");
  }, [resourcesList]);

  const arabicGeneralResources = useMemo(() => {
    return resourcesList.filter((r) => r.language === "Arabic" && r.type !== "Video");
  }, [resourcesList]);

  const englishResources = useMemo(() => {
    return resourcesList.filter((r) => r.language === "English");
  }, [resourcesList]);

  const problemsList: RoadmapProblem[] = topicData?.problems ?? [];

  if (isPageLoading) {
    return <Loader message="Loading session details..." />;
  }

  if (!topicData?.topic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-muted-foreground text-sm">Session not found.</p>
        <Link href={`/admin/roadmap/${levelId}`} className="text-primary hover:underline text-xs font-bold uppercase">
          ← Back to Sessions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* HEADER NAV */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/admin/roadmap/${levelId}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-border/40 bg-card/30 px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary/40 hover:text-primary hover:scale-[1.02] active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Link>

        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground bg-card/25 border border-border/40 px-4 py-2 rounded-2xl">
          Session Editor
        </div>
      </div>

      {/* TOPIC HERO */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/25 p-8 sm:p-10 backdrop-blur-xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 right-0 h-40 w-40 rounded-full bg-primary/5 blur-[80px]" />
          <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-[60px]" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-primary">
            <Settings className="h-3.5 w-3.5" />
            Session #{topicData.topic.orderIndex}
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black uppercase tracking-tight text-foreground leading-tight">
            {topicData.topic.title}
          </h1>
          {topicData.topic.description && (
            <p className="text-sm text-muted-foreground/80 max-w-3xl leading-relaxed">
              {topicData.topic.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <div className="bg-background/40 border border-border/20 px-3.5 py-2 rounded-xl">
              <span className="text-muted-foreground block text-[9px] font-black uppercase">Req. Learning</span>
              <span className="font-bold text-foreground">{topicData.topic.requiredLearningPct}%</span>
            </div>
            <div className="bg-background/40 border border-border/20 px-3.5 py-2 rounded-xl">
              <span className="text-muted-foreground block text-[9px] font-black uppercase">Req. Problems</span>
              <span className="font-bold text-foreground">{topicData.topic.requiredProblemPct}%</span>
            </div>
            <div className="bg-background/40 border border-border/20 px-3.5 py-2 rounded-xl">
              <span className="text-muted-foreground block text-[9px] font-black uppercase">XP Reward</span>
              <span className="font-bold text-primary">+{topicData.topic.topicXpReward} XP</span>
            </div>
            <div className="bg-background/40 border border-border/20 px-3.5 py-2 rounded-xl">
              <span className="text-muted-foreground block text-[9px] font-black uppercase">Total Learning Weight</span>
              <span className="font-bold text-emerald-400">{totalLearningWeight} pts</span>
            </div>
          </div>
        </div>
      </section>

      {/* TABS SELECTOR */}
      <div className="flex max-w-lg mx-auto rounded-2xl border border-border/40 bg-card/40 p-1">
        <button
          onClick={() => setActiveTab("resources")}
          className={cn(
            "flex-1 rounded-xl py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
            activeTab === "resources"
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Learning Resources ({resourcesList.length})
        </button>
        <button
          onClick={() => setActiveTab("problems")}
          className={cn(
            "flex-1 rounded-xl py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
            activeTab === "problems"
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Target className="h-3.5 w-3.5" />
          Problems ({problemsList.length})
        </button>
      </div>

      {/* TAB 1: LEARNING RESOURCES */}
      {activeTab === "resources" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <ResourceTable
            list={arabicMainResources}
            title="Arabic Path: Main Resources"
            description="Video lectures and tutorials with automatic watch progress tracking."
            emptyMessage="No Arabic main resources (videos) added yet. Click 'Add Main Resource' to begin."
            onAdd={() => handleOpenCreateResource("Arabic", "Video", 1)}
            addButtonText="Add Main Resource"
            badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
            badgeText="Arabic Video"
            onEdit={handleOpenEditResource}
            onDelete={handleDeleteResource}
          />

          <ResourceTable
            list={arabicGeneralResources}
            title="Arabic Path: General Resources"
            description="Articles, documentation, PDFs, and general manuals. Weight is typically 0."
            emptyMessage="No Arabic general resources (manuals, PDFs, etc.) added yet. Click 'Add General Resource' to begin."
            onAdd={() => handleOpenCreateResource("Arabic", "Article", 0)}
            addButtonText="Add General Resource"
            badgeColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
            badgeText="Arabic General"
            onEdit={handleOpenEditResource}
            onDelete={handleDeleteResource}
          />

          <ResourceTable
            list={englishResources}
            title="English Path: Resources"
            description="Reading lists, course links, and checklists for the English track."
            emptyMessage="No English resources added yet. Click 'Add English Resource' to begin."
            onAdd={() => handleOpenCreateResource("English", "Article", 1)}
            addButtonText="Add English Resource"
            badgeColor="bg-sky-500/10 text-sky-400 border-sky-500/20"
            badgeText="English Path"
            onEdit={handleOpenEditResource}
            onDelete={handleDeleteResource}
          />
        </div>
      )}

      {/* TAB 2: PROBLEMS */}
      {activeTab === "problems" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* GROUP SETTINGS */}
          <div className="rounded-[2rem] border border-border/40 bg-card/40 p-6 sm:p-8 backdrop-blur-xl">
            <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-emerald-400 border-b border-border/30 pb-4 mb-5">
              <Settings size={18} />
              Codeforces Group Settings
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Codeforces Group / Contest URL(s)</label>
                <textarea
                  value={groupLinks}
                  onChange={(e) => setGroupLinks(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={3}
                  placeholder={"https://codeforces.com/group/xxxxx\nhttps://codeforces.com/group/yyyyy"}
                />
                <p className="text-[10px] text-muted-foreground/50">Separate multiple links with a new line</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Group Join Note / Notice</label>
                <textarea
                  value={groupNote}
                  onChange={(e) => setGroupNote(e.target.value)}
                  className="w-full rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={2}
                  placeholder="e.g. You Must Join this Codeforces Group First"
                />
              </div>
              <Button
                type="button"
                onClick={handleSaveGroupSettings}
                disabled={isSavingGroupSettings}
                className="w-full rounded-xl bg-primary text-primary-foreground font-black uppercase text-xs h-10"
              >
                {isSavingGroupSettings ? "Saving..." : "Save Sheet Settings"}
              </Button>
            </div>
          </div>

          {/* BULK CF IMPORT & MANUAL ADD COMBINED ROW */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* MANUAL ADD SINGLE */}
            <div className="rounded-[2rem] border border-border/40 bg-card/40 p-6 sm:p-8 backdrop-blur-xl">
              <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border/30 pb-4 mb-4">
                <PlusCircle size={18} />
                Add Single Problem
              </div>
              <form onSubmit={handleProblemSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Problem Title</label>
                    <Input
                      value={probName}
                      onChange={(e) => setProbName(e.target.value)}
                      className="rounded-xl"
                      placeholder="e.g. Merge Sort Practice"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Problem URL</label>
                    <Input
                      value={probUrl}
                      onChange={(e) => setProbUrl(e.target.value)}
                      className="rounded-xl"
                      placeholder="https://codeforces.com/..."
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">CF ID (Auto)</label>
                    <Input
                      value={probCfProblemId}
                      onChange={(e) => setProbCfProblemId(e.target.value)}
                      className="rounded-xl"
                      placeholder="e.g. 123-A"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">XP Reward</label>
                    <Input
                      type="number"
                      value={probXpReward}
                      onChange={(e) => setProbXpReward(Number(e.target.value))}
                      className="rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Order</label>
                    <Input
                      type="number"
                      value={probOrderIndex}
                      onChange={(e) => setProbOrderIndex(Number(e.target.value))}
                      className="rounded-xl"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full rounded-xl bg-primary text-primary-foreground font-black uppercase text-xs h-10 mt-2">
                  <PlusCircle size={14} className="mr-2" />
                  Add Problem
                </Button>
              </form>
            </div>

            {/* CODEFORCES CONTEST IMPORT */}
            <div className="rounded-[2rem] border border-border/40 bg-card/40 p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-emerald-400 border-b border-border/30 pb-4 mb-4">
                  <RefreshCw size={18} />
                  Import Contest from Codeforces
                </div>
                <p className="text-[11px] text-muted-foreground mb-4">
                  Enter a numeric contest ID (e.g. 1950) to instantly import all problems. This connects CF Syncing automatically.
                </p>
              </div>
              <form onSubmit={handleContestImport} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Codeforces Contest ID</label>
                  <Input
                    value={importContestId}
                    onChange={(e) => setImportContestId(e.target.value)}
                    className="rounded-xl"
                    placeholder="e.g. 1920"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isImporting || !importContestId}
                  className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase text-xs h-10"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw size={14} className="mr-2 animate-spin text-black" />
                      Importing from CF API...
                    </>
                  ) : (
                    "Import Contest Problems"
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* LIST OF PROBLEMS */}
          <div className="rounded-[2rem] border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-border/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <Award size={18} className="text-amber-500" />
                  Topic Practice Problems ({problemsList.length})
                </div>
              </div>
            </div>

            {problemsList.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic text-sm">
                No problems have been added to this session yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                {selectedProblems.size > 0 && (
                  <div className="flex items-center gap-3 px-6 py-3 border-b border-border/30 bg-primary/5">
                    <span className="text-xs font-bold text-primary">
                      {selectedProblems.size} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteSelected}
                      className="rounded-xl text-destructive hover:bg-destructive/10 text-xs font-black uppercase tracking-[0.1em] gap-1.5"
                    >
                      <Trash2 size={12} />
                      Delete Selected
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProblems(new Set())}
                      className="rounded-xl text-muted-foreground hover:text-foreground text-xs font-black uppercase tracking-[0.1em]"
                    >
                      Clear
                    </Button>
                  </div>
                )}
                <Table>
                  <TableHeader className="bg-background/30">
                    <TableRow>
                      <TableHead className="px-6 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={problemsList.length > 0 && selectedProblems.size === problemsList.length}
                          onChange={toggleSelectAll}
                          aria-label="Select all problems"
                          className="h-4 w-4 rounded border-border/60 accent-primary cursor-pointer"
                        />
                      </TableHead>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest w-12">#</TableHead>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Title</TableHead>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">CF ID</TableHead>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">XP Reward</TableHead>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problemsList.map((p) => (
                      <TableRow
                        key={p._id}
                        className={cn(
                          "hover:bg-card/30",
                          selectedProblems.has(p._id) && "bg-primary/5"
                        )}
                      >
                        <TableCell className="px-6 py-3">
                          <input
                            type="checkbox"
                            checked={selectedProblems.has(p._id)}
                            onChange={() => toggleProblemSelection(p._id)}
                            aria-label={`Select problem ${p.name}`}
                            className="h-4 w-4 rounded border-border/60 accent-primary cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="px-6 py-3 font-mono text-xs font-bold text-muted-foreground">
                          {p.orderIndex}
                        </TableCell>
                        <TableCell className="px-6 py-3 text-sm font-bold text-foreground">
                          {p.name}
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-sm"
                          >
                            {p.cfProblemId || "Link"}
                            <ExternalLink size={10} />
                          </a>
                        </TableCell>
                        <TableCell className="px-6 py-3 text-center text-xs font-bold text-primary">
                          +{p.xpReward} XP
                        </TableCell>
                        <TableCell className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditProblem(p)}
                              className="h-8 w-8 rounded-lg hover:bg-secondary"
                            >
                              <Edit2 size={12} className="text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProblem(p._id)}
                              className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* BULK ADD VIA MARKDOWN */}
          <div className="rounded-[2rem] border border-amber-500/20 bg-amber-500/[0.02] p-6 sm:p-8 backdrop-blur-xl">
            <form onSubmit={handleBulkMarkdownSubmit} className="space-y-4">
              <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-amber-500 border-b border-amber-500/15 pb-4">
                <FileText size={18} />
                Bulk Add Problems (Markdown Table)
              </div>

              <p className="text-[11px] text-muted-foreground">
                Paste a markdown table containing <b>Name</b> and <b>Link</b> columns. The parser will extract URLs and names, and auto-detect Codeforces problem IDs.
              </p>

              <Textarea
                value={bulkMarkdown}
                onChange={(e) => setBulkMarkdown(e.target.value)}
                placeholder={`| Problem Name | Link |\n| --- | --- |\n| Binary Search | https://codeforces.com/contest/1234/problem/A |\n| Two Pointers | https://codeforces.com/contest/1234/problem/B |`}
                className="font-mono text-xs rounded-xl min-h-[140px] border-amber-500/20 focus-visible:ring-amber-500/40"
                required
              />

              <Button
                type="submit"
                disabled={isBulkAdding || !bulkMarkdown.trim()}
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs h-10"
              >
                {isBulkAdding ? (
                  <>
                    <RefreshCw size={14} className="mr-2 animate-spin" />
                    Importing Table...
                  </>
                ) : (
                  "Import Markdown Table"
                )}
              </Button>
              </form>
            </div>

          {/* NEXT TOPIC */}
          {(() => {
            const currentIndex = topics.findIndex((t) => t._id === topicId);
            const nextTopic = currentIndex !== -1 ? topics[currentIndex + 1] : null;
            if (!nextTopic) return null;
            return (
              <div className="flex justify-end">
                <Link
                  href={`/admin/roadmap/${levelId}/sessions/${nextTopic._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary hover:text-emerald-500 transition duration-300"
                >
                  Next: {nextTopic.title}
                  <ChevronRight size={14} />
                </Link>
              </div>
            );
          })()}
        </div>
      )}

      {/* RESOURCE FORM DIALOG */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <form onSubmit={handleResourceSubmit}>
            <DialogHeader>
              <DialogTitle>{editingResource ? "Edit Resource" : "Create Learning Resource"}</DialogTitle>
              <DialogDescription>Setup resource URL, weight, and completion rules.</DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4 text-left">
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Language</label>
                <select
                  title="Resource Language"
                  value={resLanguage}
                  onChange={(e) => setResLanguage(e.target.value as "Arabic" | "English")}
                  className="col-span-2 rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Arabic">Arabic</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Type</label>
                <select
                  title="Resource Type"
                  value={resType}
                  onChange={(e) => setResType(e.target.value as RoadmapResource["type"])}
                  className="col-span-2 rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Video">Video</option>
                  <option value="Article">Article</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Course">External Course</option>
                  <option value="PDF">PDF File</option>
                  <option value="Website">Website</option>
                </select>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Resource URL</label>
                <div className="col-span-2 relative">
                  <Input
                    value={resUrl}
                    onChange={(e) => setResUrl(e.target.value)}
                    className="rounded-xl"
                    placeholder="https://..."
                    required
                  />
                  {isFetchingVideoMeta && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-primary animate-pulse">
                      Fetching Title...
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Title</label>
                <Input
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  className="col-span-2 rounded-xl"
                  placeholder="e.g. Master Segment Trees"
                  required
                />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Description</label>
                <Textarea
                  value={resDescription}
                  onChange={(e) => setResDescription(e.target.value)}
                  className="col-span-2 rounded-xl"
                  placeholder="Optional brief outline"
                />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Progress Weight</label>
                <div className="col-span-2 space-y-1">
                  <Input
                    type="number"
                    value={resWeight}
                    onChange={(e) => setResWeight(Number(e.target.value))}
                    className="rounded-xl"
                    min={0}
                    required
                  />
                  <span className="text-[10px] text-muted-foreground/60 block leading-tight">
                    Weight used to compute learning progress. Arabic optional resources should be set to 0.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">XP Reward</label>
                <Input
                  type="number"
                  value={resXpReward}
                  onChange={(e) => setResXpReward(Number(e.target.value))}
                  className="col-span-2 rounded-xl"
                  required
                />
              </div>

              {resType === "Video" && (
                <div className="grid grid-cols-3 items-center gap-4">
                  <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Video Watch % Threshold</label>
                  <Input
                    type="number"
                    value={resVideoThreshold}
                    onChange={(e) => setResVideoThreshold(Number(e.target.value))}
                    className="col-span-2 rounded-xl"
                    min={1}
                    max={100}
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Order Index</label>
                <Input
                  type="number"
                  value={resOrderIndex}
                  onChange={(e) => setResOrderIndex(Number(e.target.value))}
                  className="col-span-2 rounded-xl"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsResourceDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" className="rounded-xl bg-primary text-primary-foreground">Save Resource</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PROBLEM FORM DIALOG */}
      <Dialog open={isProblemDialogOpen} onOpenChange={setIsProblemDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border text-foreground">
          <form onSubmit={handleProblemSubmit}>
            <DialogHeader>
              <DialogTitle>{editingProblem ? "Edit Problem" : "Add Practice Problem"}</DialogTitle>
              <DialogDescription>Configure problem parameters.</DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4 text-left">
              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Problem URL</label>
                <Input
                  value={probUrl}
                  onChange={(e) => setProbUrl(e.target.value)}
                  className="col-span-2 rounded-xl"
                  placeholder="https://codeforces.com/..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Problem Title</label>
                <Input
                  value={probName}
                  onChange={(e) => setProbName(e.target.value)}
                  className="col-span-2 rounded-xl"
                  placeholder="e.g. Segment Tree practice"
                  required
                />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">CF Problem ID</label>
                <Input
                  value={probCfProblemId}
                  onChange={(e) => setProbCfProblemId(e.target.value)}
                  className="col-span-2 rounded-xl"
                  placeholder="e.g. 1920-A (Auto-extracted from URL)"
                />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">XP Reward</label>
                <Input
                  type="number"
                  value={probXpReward}
                  onChange={(e) => setProbXpReward(Number(e.target.value))}
                  className="col-span-2 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Order Index</label>
                <Input
                  type="number"
                  value={probOrderIndex}
                  onChange={(e) => setProbOrderIndex(Number(e.target.value))}
                  className="col-span-2 rounded-xl"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsProblemDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" className="rounded-xl bg-primary text-primary-foreground">Save Problem</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
