"use client";

import { AdminState, AdminRetry } from "./AdminState";
import { useAdminConfirmation } from "./useAdminConfirmation";

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

interface AdminRoadmapTopicsProps {
  levelId: string;
}

export default function AdminRoadmapTopicsComponent({
  levelId,
}: AdminRoadmapTopicsProps) {
  const {
    topics,
    isLoading,
    error,
    mutateTopics,
    createTopic,
    updateTopic,
    deleteTopic,
  } = useAdminRoadmapTopics(levelId);

  const { toast } = useToast();
  const { askConfirmation, confirmationDialog } = useAdminConfirmation();
  const router = useRouter();

  // Dialog States
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<RoadmapTopicSummary | null>(
    null,
  );

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
          title: "Session updated",
          description: "Successfully updated training session details.",
          variant: "success",
        });
      } else {
        await createTopic(payload);
        toast({
          title: "Session created",
          description: "Successfully created a learning session.",
          variant: "success",
        });
      }
      setIsTopicDialogOpen(false);
      resetTopicForm();
      setEditingTopic(null);
    } catch (err: any) {
      toast({
        title: "Could not save changes",
        description: err.message || "Failed to save session configuration.",
        variant: "destructive",
      });
    }
  };

  const handleTopicDelete = async (id: string) => {
    if (
      !(await askConfirmation({
        title: "Delete this session?",
        description:
          "This permanently removes the session and all its resources and problems.",
        confirmLabel: "Delete session",
      }))
    )
      return;
    try {
      await deleteTopic(id);
      toast({
        title: "Session deleted",
        description: "The session has been deleted.",
        variant: "success",
      });
    } catch (_err: any) {
      toast({
        title: "Could not delete",
        description: "Failed to delete training session.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 font-sans text-[#f1f3ee]">
      {/* Header back navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/roadmap"
          className="inline-flex items-center gap-2 rounded-xl border border-[#2b3031] bg-[#191c1e] px-4 py-1.5 text-xs font-medium text-[#929b98] hover:text-[#f1f3ee] hover:border-[#2b3031] transition-all shadow-sm"
        >
          <ArrowLeft className="size-3" />
          <span>Back to levels</span>
        </Link>
      </div>

      {/* Sessions List */}
      <div className="rounded-xl border border-[#2b3031] bg-[#191c1e] shadow-none">
        <div className="flex flex-wrap items-center justify-between border-b border-[#2b3031] px-6 py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#131715] border border-[#2b3031] flex items-center justify-center text-[#b5e3c4] shrink-0">
              <ListMusic size={16} />
            </div>
            <div>
              <h2 className="text-2xl font-medium text-[#f1f3ee] font-heading tracking-[-0.04em]">
                Learning sessions
              </h2>
              <p className="text-xs text-[#929b98] font-medium mt-0.5">
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
                className="h-10 px-4 rounded-xl bg-[#b5e3c4] hover:bg-[#b5e3c4] text-[#14241b] font-medium text-[13px] font-sans border-transparent"
              >
                <Plus size={12} className="mr-1.5 shrink-0" />
                <span>Create session</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-[#191c1e] border-[#2b3031] text-[#b5e3c4] font-sans rounded-[20px] max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto">
              <form onSubmit={handleTopicSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-xl font-medium text-[#f1f3ee] font-heading tracking-tight">
                    {editingTopic ? "Edit session" : "Create session"}
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="text-xs text-[#929b98] font-medium mt-0.5">
                      Configure session details, progression gates, and XP
                      rewards.
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="py-2 space-y-3 text-left">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-medium text-[#929b98] text-right">
                      Order Index
                    </label>
                    <Input
                      type="number"
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(Number(e.target.value))}
                      className="col-span-2 rounded-xl bg-[#101214] border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] text-[#f1f3ee] text-[13px] font-sans"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-medium text-[#929b98] text-right">
                      Session Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="col-span-2 rounded-xl bg-[#101214] border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] text-[#f1f3ee] text-[13px] font-sans"
                      placeholder="e.g. Session 1: Binary Search"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-medium text-[#929b98] text-right">
                      Description
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="col-span-2 rounded-xl bg-[#101214] border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] text-[#f1f3ee] text-[13px] font-sans min-h-20"
                      placeholder="Brief outline of the session"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-medium text-[#929b98] text-right">
                      Subtopics
                    </label>
                    <Input
                      value={subtopicsRaw}
                      onChange={(e) => setSubtopicsRaw(e.target.value)}
                      className="col-span-2 rounded-xl bg-[#101214] border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] text-[#f1f3ee] text-[13px] font-sans"
                      placeholder="e.g. Lower Bound, Upper Bound"
                    />
                  </div>

                  <div className="border-t border-[#2b3031] pt-3 space-y-3">
                    <div className="text-xs font-medium text-[#929b98]">
                      {"Completion requirements"}
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label className="text-xs font-medium text-[#929b98] text-right">
                        Req. Learn %
                      </label>
                      <Input
                        type="number"
                        value={requiredLearningPct}
                        onChange={(e) =>
                          setRequiredLearningPct(Number(e.target.value))
                        }
                        className="col-span-2 rounded-xl bg-[#101214] border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] text-[#f1f3ee] text-[13px] font-sans"
                        min={0}
                        max={100}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label className="text-xs font-medium text-[#929b98] text-right">
                        Req. Problem %
                      </label>
                      <Input
                        type="number"
                        value={requiredProblemPct}
                        onChange={(e) =>
                          setRequiredProblemPct(Number(e.target.value))
                        }
                        className="col-span-2 rounded-xl bg-[#101214] border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] text-[#f1f3ee] text-[13px] font-sans"
                        min={0}
                        max={100}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label className="text-xs font-medium text-[#929b98] text-right">
                        XP Reward
                      </label>
                      <Input
                        type="number"
                        value={topicXpReward}
                        onChange={(e) =>
                          setTopicXpReward(Number(e.target.value))
                        }
                        className="col-span-2 rounded-xl bg-[#101214] border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] text-[#f1f3ee] text-[13px] font-sans"
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
                    className="rounded-xl border border-[#2b3031] text-[#b5e3c4] hover:bg-[#b5e3c4]/[0.06] font-sans text-[13px] h-10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl bg-[#b5e3c4] hover:bg-[#b5e3c4] text-[#14241b] font-medium text-[13px] font-sans border-transparent h-10"
                  >
                    Save changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <AdminState
            tone="loading"
            title="Loading sessions…"
            className="rounded-none border-0"
          />
        ) : error ? (
          <AdminState
            tone="error"
            title="Could not load sessions"
            description="Your roadmap is temporarily unavailable."
            action={<AdminRetry onRetry={() => mutateTopics()} />}
            className="rounded-none border-0"
          />
        ) : topics.length === 0 ? (
          <AdminState
            icon={ListMusic}
            title="Ready for the first session"
            description="Add a session to organize this level into focused learning steps."
            className="rounded-none border-0"
          />
        ) : (
          <Table>
            <TableHeader className="bg-black/20">
              <TableRow className="border-b border-[#2b3031] hover:bg-transparent">
                <TableHead className="px-6 py-3 text-xs font-medium text-[#929b98] w-16">
                  #
                </TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium text-[#929b98]">
                  Session
                </TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium text-[#929b98] text-center">
                  Resources
                </TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium text-[#929b98] text-center">
                  Problems
                </TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium text-[#929b98] text-center">
                  Learning required
                </TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium text-[#929b98] text-center">
                  Problems required
                </TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium text-[#929b98] text-center">
                  XP reward
                </TableHead>
                <TableHead className="px-6 py-3 text-xs font-medium text-[#929b98] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((t) => (
                <TableRow
                  key={t._id}
                  className="hover:bg-[#b5e3c4]/[0.06] border-b border-[#2b3031] cursor-pointer group"
                  onClick={() =>
                    router.push(`/admin/roadmap/${levelId}/sessions/${t._id}`)
                  }
                >
                  <TableCell className="px-6 py-4 font-sans font-medium text-[13px] text-[#929b98]">
                    {String(t.orderIndex).padStart(2, "0")}
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium">
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/roadmap/${levelId}/sessions/${t._id}`}
                        onClick={(event) => event.stopPropagation()}
                        className="rounded-sm text-[#f1f3ee] hover:text-[#b5e3c4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b5e3c4]"
                      >
                        {t.title}
                      </Link>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(t.subtopics ?? []).map((sub) => (
                          <span
                            key={sub}
                            className="bg-[#b5e3c4]/[0.06] border border-[#2b3031] px-1.5 py-0.5 text-xs font-medium text-[#929b98] rounded-xl"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center font-sans text-[13px] font-medium text-[#f1f3ee]">
                    {t.resourcesCount ?? 0}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center font-sans text-[13px] font-medium text-[#f1f3ee]">
                    {t.problemsCount ?? 0}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-xs font-medium text-[#929b98]">
                      {t.requiredLearningPct ?? 80}%
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-xs font-medium text-[#929b98]">
                      {t.requiredProblemPct ?? 60}%
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-xs font-medium text-[#b5e3c4]">
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
                        aria-label={`Edit ${t.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditTopic(t);
                        }}
                        className="size-10 rounded-xl border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4]"
                      >
                        <Edit2 size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${t.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTopicDelete(t._id);
                        }}
                        className="size-10 rounded-xl border border-red-500/15 hover:bg-red-400/5 text-red-400"
                      >
                        <Trash2 size={12} />
                      </Button>
                      <ChevronRight
                        size={14}
                        className="text-[#929b98] ml-1 group-hover:text-[#f1f3ee] group-hover:translate-x-0.5 transition-all"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {confirmationDialog}
    </div>
  );
}
