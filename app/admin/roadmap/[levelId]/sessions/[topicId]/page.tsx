"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Video,
  Target,
  Trash2,
  Award,
  PlusCircle,
  ExternalLink,
  RefreshCw,
  X,
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
import { useToast } from "@/components/providers/Toast";
import { cn } from "@/lib/utils";
import Loader from "@/components/shared/Loader";

// Helpers for fetching YouTube meta
let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    const win = window as any;
    if (win.YT?.Player) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existing) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const prevReady = win.onYouTubeIframeAPIReady;
    win.onYouTubeIframeAPIReady = () => {
      prevReady?.();
      resolve();
    };
  });

  return youtubeApiPromise;
}

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const parts = u.pathname.split("/").filter(Boolean);
      return parts[0] ?? null;
    }
    if (u.searchParams.get("v")) {
      return u.searchParams.get("v");
    }
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "embed" && parts[1]) {
      return parts[1];
    }
  } catch {
    // Check if it's just an ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }
    return null;
  }
  return null;
}

export default function AdminSessionDetailPage() {
  const params = useParams<{ levelId: string; topicId: string }>();
  const levelId = params?.levelId ?? "";
  const topicId = params?.topicId ?? "";
  const router = useRouter();
  const { toast } = useToast();

  const { upsertVideo, deleteVideo, upsertSheet, addProblem, addProblems, deleteProblem, deleteProblems } =
    useAdminRoadmapTopics(levelId);

  const [activeTab, setActiveTab] = useState<"video" | "problems">("video");
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [topicData, setTopicData] = useState<any>(null);

  // Video form
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [durationSec, setDurationSec] = useState(1200);
  const [isFetchingVideoMeta, setIsFetchingVideoMeta] = useState(false);

  // Auto-fetch video duration and title on youtubeUrl change
  useEffect(() => {
    if (!youtubeUrl) return;

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) return;

    // Avoid fetching if the URL is the same as already saved in the database
    if (topicData?.video?.youtubeUrl === youtubeUrl) return;

    let isCancelled = false;

    // Set loader after a brief timeout to avoid flicker on rapid typing
    const timer = setTimeout(() => {
      setIsFetchingVideoMeta(true);

      const fetchMeta = async () => {
        try {
          let fetchedTitle = "";
          try {
            const oembedRes = await fetch(
              `https://noembed.com/embed?url=${encodeURIComponent(youtubeUrl)}`
            );
            const data = await oembedRes.json();
            if (data && data.title) {
              fetchedTitle = data.title;
            }
          } catch (e) {
            console.error("Failed to fetch oembed title", e);
          }

          if (isCancelled) return;

          await loadYouTubeApi();
          if (isCancelled) return;

          const win = window as any;
          if (!win.YT?.Player) return;

          // Create a hidden div for YT player to get duration
          const tempDiv = document.createElement("div");
          tempDiv.style.position = "absolute";
          tempDiv.style.width = "0px";
          tempDiv.style.height = "0px";
          tempDiv.style.opacity = "0";
          tempDiv.style.pointerEvents = "none";
          tempDiv.id = "temp-yt-player-meta";
          document.body.appendChild(tempDiv);

          const player = new win.YT.Player(tempDiv, {
            videoId: videoId,
            playerVars: {
              autoplay: 0,
              mute: 1,
              controls: 0,
              showinfo: 0,
              rel: 0,
            },
            events: {
              onReady: (event: any) => {
                if (isCancelled) {
                  player.destroy();
                  tempDiv.remove();
                  return;
                }
                const duration = event.target.getDuration();
                if (duration > 0) {
                  setDurationSec(Math.round(duration));
                }

                if (!fetchedTitle) {
                  const videoData = event.target.getVideoData?.();
                  if (videoData?.title) {
                    fetchedTitle = videoData.title;
                  }
                }

                if (fetchedTitle) {
                  setVideoTitle(fetchedTitle);
                }

                setIsFetchingVideoMeta(false);
                player.destroy();
                tempDiv.remove();
              },
              onError: (err: any) => {
                console.error("Temp YT Player error", err);
                setIsFetchingVideoMeta(false);
                tempDiv.remove();
              },
            },
          });
        } catch (err) {
          console.error("Failed to fetch video metadata:", err);
          setIsFetchingVideoMeta(false);
        }
      };

      fetchMeta();
    }, 600);

    return () => {
      clearTimeout(timer);
      isCancelled = true;
      setIsFetchingVideoMeta(false);
      const existing = document.getElementById("temp-yt-player-meta");
      if (existing) existing.remove();
    };
  }, [youtubeUrl, topicData]);

  // Sheet form
  const [cfGroupUrl, setCfGroupUrl] = useState("");
  const [groupNote, setGroupNote] = useState("");
  const [sheetId, setSheetId] = useState("");

  // Problem form
  const [probTitle, setProbTitle] = useState("");
  const [cfProblemId, setCfProblemId] = useState("");
  const [probOrderIndex, setProbOrderIndex] = useState(0);
  const [xpReward, setXpReward] = useState(0);

  // Problems list
  const [activeProblems, setActiveProblems] = useState<any[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(new Set());
  const [bulkMarkdown, setBulkMarkdown] = useState("");
  const [isBulkAdding, setIsBulkAdding] = useState(false);

  // Load topic data on mount
  const loadTopicData = useCallback(async () => {
    if (!levelId || !topicId) return;
    setIsPageLoading(true);
    try {
      const res = await apiClient.get<any>(
        `/api/roadmap/levels/${levelId}/topics/${topicId}`
      );
      if (res) {
        setTopicData(res);
        if (res.video) {
          setYoutubeUrl(res.video.youtubeUrl || "");
          setVideoTitle(res.video.title || "");
          setDurationSec(res.video.durationSec || 1200);
        }
        if (res.sheet) {
          setCfGroupUrl(res.sheet.cfGroupUrl || "");
          setGroupNote(res.sheet.groupNote || "");
          setSheetId(res.sheet._id || "");
        }
        if (res.problems) {
          setActiveProblems(res.problems);
        }
        if (res.level?.xpPerAcceptedProblem != null) {
          setXpReward(res.level.xpPerAcceptedProblem);
        }
      }
    } catch (err) {
      console.error("Failed to load topic data:", err);
      toast({
        title: "Error",
        description: "Failed to load session data",
        variant: "destructive",
      });
    } finally {
      setIsPageLoading(false);
    }
  }, [levelId, topicId, toast]);

  useEffect(() => {
    loadTopicData();
  }, [loadTopicData]);

  const refreshProblems = async () => {
    try {
      const res = await apiClient.get<any>(
        `/api/roadmap/levels/${levelId}/topics/${topicId}`
      );
      if (res?.problems) {
        setActiveProblems(res.problems);
      }
      if (res?.sheet?._id) {
        setSheetId(res.sheet._id);
      }
    } catch (e) {
      console.error("Failed to reload problems:", e);
    }
  };

  // Video submit
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertVideo(topicId, {
        youtubeUrl,
        title: videoTitle || `${topicData?.topic?.title ?? "Session"} Lecture`,
        durationSec: Number(durationSec),
      });
      toast({
        title: "Success",
        description: "Video added/updated",
        variant: "success",
      });
      await loadTopicData();
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to save video",
        variant: "destructive",
      });
    }
  };

  // Sheet submit
  const handleSheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await upsertSheet(topicId, {
        cfGroupUrl,
        groupNote,
      });
      if (res && res._id) {
        setSheetId(res._id);
      }
      toast({
        title: "Success",
        description: "Problem sheet configured",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to save sheet settings",
        variant: "destructive",
      });
    }
  };

  // Problem add
  const handleProblemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let activeSheetId = sheetId;
    if (!activeSheetId) {
      try {
        const res = await apiClient.get<any>(
          `/api/roadmap/levels/${levelId}/topics/${topicId}`
        );
        if (res?.sheet?._id) {
          activeSheetId = res.sheet._id;
          setSheetId(activeSheetId);
        }
      } catch (err) {
        console.error("Failed to fetch sheet:", err);
      }
    }

    if (!activeSheetId) {
      toast({
        title: "Error",
        description:
          "Please configure and save the Problem Sheet Settings first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addProblem(activeSheetId, {
        title: probTitle,
        cfProblemId,
        orderIndex: Number(probOrderIndex),
        xpReward: Number(xpReward),
      });
      toast({
        title: "Success",
        description: "Problem added to sheet",
        variant: "success",
      });
      setProbTitle("");
      setCfProblemId("");
      setProbOrderIndex(activeProblems.length + 1);
      setXpReward(topicData?.level?.xpPerAcceptedProblem ?? 10);
      await refreshProblems();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add problem",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;
    try {
      await deleteProblem(problemId);
      toast({
        title: "Deleted",
        description: "Problem removed from sheet",
        variant: "success",
      });
      await refreshProblems();
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to delete problem",
        variant: "destructive",
      });
    }
  };

  const toggleProblemSelection = (id: string) => {
    setSelectedProblems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProblems.size === activeProblems.length) {
      setSelectedProblems(new Set());
    } else {
      setSelectedProblems(new Set(activeProblems.map((p) => p._id)));
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
      await refreshProblems();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete problems",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Delete ALL problems from this sheet? This cannot be undone.")) return;
    try {
      await deleteProblems(activeProblems.map((p) => p._id));
      toast({
        title: "Deleted",
        description: "All problems removed from sheet",
        variant: "success",
      });
      setSelectedProblems(new Set());
      await refreshProblems();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete problems",
        variant: "destructive",
      });
    }
  };

  // Bulk markdown import
  const handleBulkMarkdownSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let activeSheetId = sheetId;
    if (!activeSheetId) {
      try {
        const res = await apiClient.get<any>(
          `/api/roadmap/levels/${levelId}/topics/${topicId}`
        );
        if (res?.sheet?._id) {
          activeSheetId = res.sheet._id;
          setSheetId(activeSheetId);
        }
      } catch (err) {
        console.error("Failed to fetch sheet:", err);
      }
    }

    if (!activeSheetId) {
      toast({
        title: "Error",
        description:
          "Please configure and save the Problem Sheet Settings first.",
        variant: "destructive",
      });
      return;
    }

    const lines = bulkMarkdown
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
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
        description:
          "Please make sure your markdown table starts and ends with '|' characters on each row.",
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
          if (
            lower.includes("name") ||
            lower.includes("title") ||
            lower.includes("problem")
          ) {
            nameColIdx = idx;
          } else if (
            lower.includes("link") ||
            lower.includes("url") ||
            lower.includes("href")
          ) {
            linkColIdx = idx;
          }
        });
        dataRows = rows.slice(1);
        if (
          dataRows.length > 0 &&
          dataRows[0].every((cell) => cell.includes("-") || cell === "")
        ) {
          dataRows = dataRows.slice(1);
        }
      }

      const problemsToAdd: Array<{ title: string; cfProblemId: string; xpReward: number }> = [];

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
          problemsToAdd.push({
            title: parsedTitle,
            cfProblemId: parsedLink,
            xpReward: topicData?.level?.xpPerAcceptedProblem ?? 10,
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

      const result = await addProblems(activeSheetId, problemsToAdd);

      toast({
        title: "Bulk Import Complete",
        description: `Imported ${result.inserted} problem(s)${result.skipped > 0 ? `, skipped ${result.skipped} duplicate(s)` : ""}.`,
        variant: "success",
      });
      setBulkMarkdown("");
      await refreshProblems();
    } catch (err: any) {
      toast({
        title: "Bulk Add Partial Success / Error",
        description: err.message || "An error occurred during bulk importing.",
        variant: "destructive",
      });
      await refreshProblems();
    } finally {
      setIsBulkAdding(false);
    }
  };

  if (isPageLoading) {
    return <Loader message="Loading session details..." />;
  }

  if (!topicData?.topic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-muted-foreground text-sm">
          Session not found or failed to load.
        </p>
        <Link
          href={`/admin/roadmap/${levelId}`}
          className="text-primary hover:underline text-xs font-bold uppercase tracking-widest"
        >
          ← Back to Sessions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/admin/roadmap/${levelId}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-border/40 bg-card/30 px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary/40 hover:text-primary hover:scale-[1.02] active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Link>

        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground bg-card/25 border border-border/40 px-4 py-2 rounded-2xl">
          Session Config
        </div>
      </div>

      {/* SESSION HERO */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/25 p-8 sm:p-10 backdrop-blur-xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 right-0 h-40 w-40 rounded-full bg-primary/5 blur-[80px]" />
          <div className="absolute bottom-0 left-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-[60px]" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-primary">
            <Target className="h-3.5 w-3.5" />
            Session #{topicData.topic.orderIndex}
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-black uppercase tracking-tight text-foreground leading-tight">
            {topicData.topic.title}
          </h1>
          {topicData.topic.description && (
            <p className="text-sm text-muted-foreground/90 leading-relaxed max-w-3xl">
              {topicData.topic.description}
            </p>
          )}
          {(topicData.topic.subtopics ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topicData.topic.subtopics.map((sub: string) => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-primary"
                >
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  {sub}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TABS SELECTOR */}
      <div className="flex max-w-lg mx-auto rounded-2xl border border-border/40 bg-card/40 p-1">
        <button
          onClick={() => setActiveTab("video")}
          className={cn(
            "flex-1 rounded-xl py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
            activeTab === "video"
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Video className="h-3.5 w-3.5" />
          Session Video
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
          Problems
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "video" ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* VIDEO FORM */}
          <div className="rounded-[2rem] border border-border/40 bg-card/40 p-6 sm:p-8 backdrop-blur-xl">
            <form onSubmit={handleVideoSubmit} className="space-y-5">
              <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border/30 pb-4">
                <Video size={18} className="text-primary" />
                Lecture Video Settings
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Video Title
                  </label>
                  <Input
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="rounded-xl"
                    placeholder="e.g. Master Binary Search Basics"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      YouTube URL / Embed Link
                    </label>
                    {isFetchingVideoMeta && (
                      <span className="text-[9px] font-bold text-primary flex items-center gap-1 animate-pulse">
                        <RefreshCw size={10} className="animate-spin" />
                        Fetching duration & title...
                      </span>
                    )}
                  </div>
                  <Input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="rounded-xl"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Video Duration (seconds)
                  </label>
                  <Input
                    type="number"
                    value={durationSec}
                    onChange={(e) => setDurationSec(Number(e.target.value))}
                    className="rounded-xl"
                    placeholder="1200"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="rounded-xl bg-primary text-primary-foreground flex-1 font-black uppercase tracking-[0.1em] text-xs"
                >
                  Save Video Settings
                </Button>
                {topicData?.video && (
                  <Button
                    type="button"
                    onClick={async () => {
                      await deleteVideo(topicId);
                      toast({
                        title: "Deleted",
                        description: "Video removed",
                        variant: "success",
                      });
                      await loadTopicData();
                    }}
                    variant="ghost"
                    className="rounded-xl hover:bg-destructive/10 text-destructive gap-1 font-black uppercase tracking-[0.1em] text-xs"
                  >
                    <Trash2 size={14} />
                    Remove Video
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Video Preview */}
          {topicData?.video?.youtubeUrl && (
            <div className="rounded-[2rem] border border-border/40 bg-card/20 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                <Video size={14} className="text-primary" />
                Current Video Preview
              </div>
              <div className="rounded-2xl overflow-hidden border border-border/30 bg-black/50 shadow-xl aspect-video">
                <iframe
                  src={(() => {
                    const url = topicData.video.youtubeUrl;
                    const match = url.match(
                      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^?&/]+)/
                    );
                    return match
                      ? `https://www.youtube.com/embed/${match[1]}`
                      : url;
                  })()}
                  className="w-full h-full"
                  allowFullScreen
                  title="Video Preview"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* SHEET SETTINGS CARD */}
          <div className="rounded-[2rem] border border-border/40 bg-card/40 p-6 sm:p-8 backdrop-blur-xl">
            <form onSubmit={handleSheetSubmit} className="space-y-5">
              <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border/30 pb-4">
                <Target size={18} className="text-emerald-400" />
                Codeforces Group Settings
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Codeforces Group / Contest URL(s)
                  </label>
                  <Textarea
                    value={cfGroupUrl}
                    onChange={(e) => setCfGroupUrl(e.target.value)}
                    className="rounded-xl min-h-[80px]"
                    placeholder="https://codeforces.com/group/...&#10;https://codeforces.com/group/... (Add one URL per line or comma-separated)"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Group Join Note / Notice
                  </label>
                  <Textarea
                    value={groupNote}
                    onChange={(e) => setGroupNote(e.target.value)}
                    className="rounded-xl"
                    placeholder="Provide instructions on how to join the CF group."
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-[0.1em] text-xs"
              >
                Save Sheet Settings
              </Button>
            </form>
          </div>

          {/* CURRENT PROBLEMS TABLE */}
          <div className="rounded-[2rem] border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-border/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <Award size={18} className="text-amber-500" />
                  Current Sheet Problems ({activeProblems.length})
                </div>
                <button
                  onClick={refreshProblems}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border/40 bg-card/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/30 transition"
                >
                  <RefreshCw size={12} />
                  Refresh
                </button>
              </div>
            </div>

            {activeProblems.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground italic text-sm">
                No problems have been added to this sheet yet.
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
                          checked={activeProblems.length > 0 && selectedProblems.size === activeProblems.length}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-border/60 accent-primary cursor-pointer"
                        />
                      </TableHead>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                        #
                      </TableHead>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                        Title
                      </TableHead>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                        Link / CF ID
                      </TableHead>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">
                        XP
                      </TableHead>
                      <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeProblems.map((p) => (
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
                            className="h-4 w-4 rounded border-border/60 accent-primary cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="px-6 py-3 font-mono text-xs font-bold text-muted-foreground">
                          {p.orderIndex}
                        </TableCell>
                        <TableCell className="px-6 py-3 text-sm font-bold text-foreground truncate max-w-[200px]">
                          {p.title}
                        </TableCell>
                        <TableCell className="px-6 py-3">
                          <a
                            href={
                              /^https?:\/\//i.test(p.cfProblemId)
                                ? p.cfProblemId
                                : `https://codeforces.com/problemset/problem/${p.cfProblemId}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-[200px]"
                            title={p.cfProblemId}
                          >
                            {p.cfProblemId.length > 40
                              ? p.cfProblemId.slice(0, 40) + "..."
                              : p.cfProblemId}
                            <ExternalLink size={10} />
                          </a>
                        </TableCell>
                        <TableCell className="px-6 py-3 text-center text-xs font-bold text-primary">
                          +{p.xpReward}
                        </TableCell>
                        <TableCell className="px-6 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProblem(p._id)}
                            className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 size={12} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end px-6 py-3 border-t border-border/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteAll}
                    className="rounded-xl text-destructive hover:bg-destructive/10 text-xs font-black uppercase tracking-[0.1em] gap-1.5"
                  >
                    <Trash2 size={12} />
                    Delete All
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ADD SINGLE PROBLEM */}
          <div className="rounded-[2rem] border border-border/40 bg-card/40 p-6 sm:p-8 backdrop-blur-xl">
            <form onSubmit={handleProblemSubmit} className="space-y-5">
              <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-primary border-b border-border/30 pb-4">
                <PlusCircle size={18} />
                Add Single Problem
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    Problem Title
                  </label>
                  <Input
                    value={probTitle}
                    onChange={(e) => setProbTitle(e.target.value)}
                    className="rounded-xl"
                    placeholder="e.g. Lower Bound Practice"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    Problem Link / URL
                  </label>
                  <Input
                    value={cfProblemId}
                    onChange={(e) => setCfProblemId(e.target.value)}
                    className="rounded-xl"
                    placeholder="https://codeforces.com/..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    XP Reward
                  </label>
                  <Input
                    type="number"
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    className="rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    Order Index
                  </label>
                  <Input
                    type="number"
                    value={probOrderIndex}
                    onChange={(e) =>
                      setProbOrderIndex(Number(e.target.value))
                    }
                    className="rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-[0.1em] text-xs h-10"
              >
                <PlusCircle size={14} className="mr-2" />
                Add Problem
              </Button>
            </form>
          </div>

          {/* BULK ADD VIA MARKDOWN */}
          <div className="rounded-[2rem] border border-amber-500/20 bg-amber-500/[0.02] p-6 sm:p-8 backdrop-blur-xl">
            <form onSubmit={handleBulkMarkdownSubmit} className="space-y-5">
              <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.2em] text-amber-500 border-b border-amber-500/15 pb-4">
                <Award size={18} />
                Bulk Add Problems (Markdown Table)
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Paste a markdown table containing <b>Name</b> and <b>Link</b>{" "}
                columns. The parser auto-detects headers.
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
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-[0.1em] text-xs h-10"
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
        </div>
      )}
    </div>
  );
}
