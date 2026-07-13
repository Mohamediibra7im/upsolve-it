"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  ListMusic,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAdminRoadmapTopics } from "@/hooks/admin/useAdminRoadmap";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/providers/Toast";
import type { RoadmapTopicSummary } from "@/types/Roadmap";
import { cn } from "@/lib/utils";

interface AdminRoadmapTopicsProps {
  levelId: string;
}

export default function AdminRoadmapTopicsComponent({
  levelId,
}: AdminRoadmapTopicsProps) {
  const {
    topics,
    isLoading,
    createTopic,
    updateTopic,
    deleteTopic,
  } = useAdminRoadmapTopics(levelId);

  const { toast } = useToast();
  const router = useRouter();

  // Dialog States
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] =
    useState<RoadmapTopicSummary | null>(null);

  // Form States - Topic
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [subtopicsRaw, setSubtopicsRaw] = useState("");
  const [requiredLearningPct, setRequiredLearningPct] = useState(80);
  const [requiredProblemPct, setRequiredProblemPct] = useState(60);
  const [topicXpReward, setTopicXpReward] = useState(100);

  const resetTopicForm = () => {
    setTitle("");
    setDescription("");
    setOrderIndex(topics.length);
    setSubtopicsRaw("");
    setRequiredLearningPct(80);
    setRequiredProblemPct(60);
    setTopicXpReward(100);
  };

  const handleOpenCreateTopic = () => {
    setEditingTopic(null);
    resetTopicForm();
    setIsTopicDialogOpen(true);
  };

  const handleOpenEditTopic = (t: RoadmapTopicSummary) => {
    setEditingTopic(t);
    setTitle(t.title);
    setDescription(t.description || "");
    setOrderIndex(t.orderIndex);
    setSubtopicsRaw(t.subtopics?.join(", ") ?? "");
    setRequiredLearningPct(t.requiredLearningPct ?? 80);
    setRequiredProblemPct(t.requiredProblemPct ?? 60);
    setTopicXpReward(t.topicXpReward ?? 100);
    setIsTopicDialogOpen(true);
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      orderIndex: Number(orderIndex),
      subtopics: subtopicsRaw
        ? subtopicsRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      requiredLearningPct: Number(requiredLearningPct),
      requiredProblemPct: Number(requiredProblemPct),
      topicXpReward: Number(topicXpReward),
    };

    try {
      if (editingTopic) {
        await updateTopic(editingTopic._id, payload);
        toast({
          title: "ROADMAP: SESSION UPDATED",
          description: "Successfully updated training session details.",
          variant: "success",
        });
      } else {
        await createTopic(payload);
        toast({
          title: "ROADMAP: SESSION INJECTED",
          description: "Successfully registered a new training session node.",
          variant: "success",
        });
      }
      setIsTopicDialogOpen(false);
      resetTopicForm();
      setEditingTopic(null);
    } catch (err: any) {
      toast({
        title: "SYS.ERR: WRITE FAILED",
        description: err.message || "Failed to save session configuration.",
        variant: "destructive",
      });
    }
  };

  const handleTopicDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this session, including its resources and problems? This action is permanent!"
      )
    )
      return;
    try {
      await deleteTopic(id);
      toast({
        title: "ROADMAP: SESSION REMOVED",
        description: "Session node deleted.",
        variant: "success",
      });
    } catch (_err: any) {
      toast({
        title: "SYS.ERR: DELETE FAILED",
        description: "Failed to delete training session.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 font-mono text-emerald-400">
      {/* Header back navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/roadmap"
          className="inline-flex items-center gap-2 rounded-none border border-emerald-500/15 bg-[#060a08]/30 px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-500/60 hover:text-emerald-300 hover:border-emerald-500/30 transition-all shadow-sm"
        >
          <ArrowLeft className="size-3" />
          <span>[ BACK_TO_LEVELS.SH ]</span>
        </Link>
      </div>

      {/* Sessions List */}
      <div className="rounded-none border border-emerald-500/15 bg-[#060a08]/10 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between border-b border-emerald-500/15 px-6 py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-none bg-emerald-950/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <ListMusic size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                LEVEL_SESSIONS
              </h2>
              <p className="text-[9px] text-emerald-500/40 font-bold uppercase mt-0.5">
                Click on a session row to manage its resources and problems.
              </p>
            </div>
          </div>

          <Dialog
            open={isTopicDialogOpen}
            onOpenChange={(open) => {
              setIsTopicDialogOpen(open);
              if (!open) {
                setEditingTopic(null);
                resetTopicForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={handleOpenCreateTopic}
                className="h-8 px-4 rounded-none bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.25)] border-transparent"
              >
                <Plus size={12} className="mr-1.5 shrink-0" />
                <span>[ CREATE_SESSION.EXE ]</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-[#060a08] border-emerald-500/25 text-emerald-400 font-mono rounded-none max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleTopicSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                    {editingTopic ? "EDIT_SESSION_NODE" : "CREATE_SESSION_NODE"}
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="text-[10px] text-emerald-500/40 font-bold uppercase mt-0.5">
                      Configure session details, progression gates, and XP rewards.
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="py-2 space-y-3 text-left">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45 text-right">
                      Order Index
                    </label>
                    <Input
                      type="number"
                      value={orderIndex}
                      onChange={(e) =>
                        setOrderIndex(Number(e.target.value))
                      }
                      className="col-span-2 rounded-none bg-[#040604]/50 border-emerald-500/15 focus:ring-0 focus:border-emerald-500/45 text-emerald-300 text-xs font-mono"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45 text-right">
                      Session Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="col-span-2 rounded-none bg-[#040604]/50 border-emerald-500/15 focus:ring-0 focus:border-emerald-500/45 text-emerald-300 text-xs font-mono"
                      placeholder="e.g. Session 1: Binary Search"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45 text-right">
                      Description
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="col-span-2 rounded-none bg-[#040604]/50 border-emerald-500/15 focus:ring-0 focus:border-emerald-500/45 text-emerald-300 text-xs font-mono min-h-20"
                      placeholder="Brief outline of the session"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45 text-right">
                      Subtopics
                    </label>
                    <Input
                      value={subtopicsRaw}
                      onChange={(e) => setSubtopicsRaw(e.target.value)}
                      className="col-span-2 rounded-none bg-[#040604]/50 border-emerald-500/15 focus:ring-0 focus:border-emerald-500/45 text-emerald-300 text-xs font-mono"
                      placeholder="e.g. Lower Bound, Upper Bound"
                    />
                  </div>

                  <div className="border-t border-emerald-500/15 pt-3 space-y-3">
                    <div className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/35">
                      {"// PROGRESSION_GATES"}
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45 text-right">
                        Req. Learn %
                      </label>
                      <Input
                        type="number"
                        value={requiredLearningPct}
                        onChange={(e) =>
                          setRequiredLearningPct(Number(e.target.value))
                        }
                        className="col-span-2 rounded-none bg-[#040604]/50 border-emerald-500/15 focus:ring-0 focus:border-emerald-500/45 text-emerald-300 text-xs font-mono"
                        min={0}
                        max={100}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45 text-right">
                        Req. Problem %
                      </label>
                      <Input
                        type="number"
                        value={requiredProblemPct}
                        onChange={(e) =>
                          setRequiredProblemPct(Number(e.target.value))
                        }
                        className="col-span-2 rounded-none bg-[#040604]/50 border-emerald-500/15 focus:ring-0 focus:border-emerald-500/45 text-emerald-300 text-xs font-mono"
                        min={0}
                        max={100}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45 text-right">
                        XP Reward
                      </label>
                      <Input
                        type="number"
                        value={topicXpReward}
                        onChange={(e) =>
                          setTopicXpReward(Number(e.target.value))
                        }
                        className="col-span-2 rounded-none bg-[#040604]/50 border-emerald-500/15 focus:ring-0 focus:border-emerald-500/45 text-emerald-300 text-xs font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsTopicDialogOpen(false)}
                    className="rounded-none border border-emerald-500/15 text-emerald-400 hover:bg-emerald-500/10 font-mono text-[9px] uppercase tracking-widest h-8"
                  >
                    [ CANCEL ]
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-none bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.25)] border-transparent h-8"
                  >
                    [ SAVE_CHANGES.EXE ]
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs font-bold text-emerald-500/40 uppercase tracking-widest animate-pulse">
            Loading roadmap session nodes...
          </div>
        ) : topics.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-emerald-500/35 uppercase tracking-widest italic">
            [ NO_SESSIONS_REGISTERED_FOR_LEVEL ]
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-black/20">
              <TableRow className="border-b border-emerald-500/15 hover:bg-transparent">
                <TableHead className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 w-16">#</TableHead>
                <TableHead className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">SESSION_TITLE</TableHead>
                <TableHead className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 text-center">RESOURCES</TableHead>
                <TableHead className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 text-center">PROBLEMS</TableHead>
                <TableHead className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 text-center">REQ_LEARN</TableHead>
                <TableHead className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 text-center">REQ_PROBLEMS</TableHead>
                <TableHead className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 text-center">XP_REWARD</TableHead>
                <TableHead className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 text-right">OPERATIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((t) => (
                <TableRow
                  key={t._id}
                  className="hover:bg-emerald-500/[0.02] border-b border-emerald-500/[0.08] cursor-pointer group"
                  onClick={() =>
                    router.push(
                      `/admin/roadmap/${levelId}/sessions/${t._id}`
                    )
                  }
                >
                  <TableCell className="px-6 py-4 font-mono font-bold text-xs text-emerald-500/35">
                    {String(t.orderIndex).padStart(2, '0')}
                  </TableCell>
                  <TableCell className="px-6 py-4 font-bold">
                    <div className="flex flex-col">
                      <span className="text-emerald-300 group-hover:text-emerald-200 transition-colors tracking-wider">
                        {t.title}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(t.subtopics ?? []).map((sub) => (
                          <span
                            key={sub}
                            className="bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 text-[8px] font-bold text-emerald-500/60 uppercase rounded-none"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center font-mono text-xs font-bold text-emerald-300">
                    {t.resourcesCount ?? 0}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center font-mono text-xs font-bold text-emerald-300">
                    {t.problemsCount ?? 0}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-emerald-500/60">
                      {t.requiredLearningPct ?? 80}%
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-emerald-500/60">
                      {t.requiredProblemPct ?? 60}%
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-emerald-400">
                      +{t.topicXpReward ?? 100} XP
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div
                      className="flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditTopic(t);
                        }}
                        className="size-7 rounded-none border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-450"
                      >
                        <Edit2 size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTopicDelete(t._id);
                        }}
                        className="size-7 rounded-none border border-red-500/15 hover:bg-red-955/10 text-red-400"
                      >
                        <Trash2 size={12} />
                      </Button>
                      <ChevronRight
                        size={14}
                        className="text-emerald-500/30 ml-1 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
