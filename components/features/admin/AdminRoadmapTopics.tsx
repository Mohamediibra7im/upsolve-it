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
          title: "Updated",
          description: "Session updated successfully",
          variant: "success",
        });
      } else {
        await createTopic(payload);
        toast({
          title: "Created",
          description: "Session created successfully",
          variant: "success",
        });
      }
      setIsTopicDialogOpen(false);
      resetTopicForm();
      setEditingTopic(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to save topic",
        variant: "destructive",
      });
    }
  };

  const handleTopicDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this session, including its resources and problems?"
      )
    )
      return;
    try {
      await deleteTopic(id);
      toast({
        title: "Deleted",
        description: "Session deleted successfully",
        variant: "success",
      });
    } catch (_err: any) {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header back navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/roadmap"
          className="inline-flex items-center gap-2 rounded-2xl border border-border/40 bg-card/30 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary/40 hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to Levels
        </Link>
      </div>

      {/* Sessions List */}
      <div className="rounded-3xl border border-border/40 bg-card/60 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between border-b border-border/40 px-8 py-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ListMusic size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">
                Level Sessions
              </h2>
              <p className="text-xs text-muted-foreground">
                Click on a session to manage its resources and problems.
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
                className="rounded-xl bg-primary text-xs font-black uppercase tracking-[0.1em] text-primary-foreground gap-2"
              >
                <Plus size={16} />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleTopicSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingTopic ? "Edit Session" : "Create Session"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure session details, progression gates, and XP
                    rewards.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4 text-left">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">
                      Order Index
                    </label>
                    <Input
                      type="number"
                      value={orderIndex}
                      onChange={(e) =>
                        setOrderIndex(Number(e.target.value))
                      }
                      className="col-span-2 rounded-xl"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">
                      Session Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="col-span-2 rounded-xl"
                      placeholder="e.g. Session 1: Binary Search"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">
                      Description
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="col-span-2 rounded-xl"
                      placeholder="Brief outline of the session"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">
                      Subtopics (comma split)
                    </label>
                    <Input
                      value={subtopicsRaw}
                      onChange={(e) => setSubtopicsRaw(e.target.value)}
                      className="col-span-2 rounded-xl"
                      placeholder="e.g. Lower Bound, Upper Bound"
                    />
                  </div>

                  <div className="border-t border-border/40 pt-4 space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Progression Gates
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">
                        Req. Learning %
                      </label>
                      <Input
                        type="number"
                        value={requiredLearningPct}
                        onChange={(e) =>
                          setRequiredLearningPct(Number(e.target.value))
                        }
                        className="col-span-2 rounded-xl"
                        min={0}
                        max={100}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">
                        Req. Problem %
                      </label>
                      <Input
                        type="number"
                        value={requiredProblemPct}
                        onChange={(e) =>
                          setRequiredProblemPct(Number(e.target.value))
                        }
                        className="col-span-2 rounded-xl"
                        min={0}
                        max={100}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">
                        Topic XP Reward
                      </label>
                      <Input
                        type="number"
                        value={topicXpReward}
                        onChange={(e) =>
                          setTopicXpReward(Number(e.target.value))
                        }
                        className="col-span-2 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsTopicDialogOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl bg-primary text-primary-foreground"
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading sessions...
          </div>
        ) : topics.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground italic">
            No sessions registered for this level yet. Create one!
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-background/40">
              <TableRow>
                <TableHead className="px-6 py-4">#</TableHead>
                <TableHead className="px-6 py-4">Session Title</TableHead>
                <TableHead className="px-6 py-4 text-center">
                  Resources
                </TableHead>
                <TableHead className="px-6 py-4 text-center">
                  Problems
                </TableHead>
                <TableHead className="px-6 py-4 text-center">
                  Learn %
                </TableHead>
                <TableHead className="px-6 py-4 text-center">
                  Problem %
                </TableHead>
                <TableHead className="px-6 py-4 text-center">
                  XP
                </TableHead>
                <TableHead className="px-6 py-4 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topics.map((t) => (
                <TableRow
                  key={t._id}
                  className="hover:bg-card/25 cursor-pointer group"
                  onClick={() =>
                    router.push(
                      `/admin/roadmap/${levelId}/sessions/${t._id}`
                    )
                  }
                >
                  <TableCell className="px-6 py-4 font-mono font-bold text-xs">
                    {t.orderIndex}
                  </TableCell>
                  <TableCell className="px-6 py-4 font-bold">
                    <div className="flex flex-col">
                      <span className="group-hover:text-primary transition-colors">
                        {t.title}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(t.subtopics ?? []).map((sub) => (
                          <span
                            key={sub}
                            className="rounded-full bg-secondary px-2 py-0.5 text-[8px] font-bold text-muted-foreground"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center font-mono text-xs font-black">
                    {t.resourcesCount ?? 0}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center font-mono text-xs font-black">
                    {t.problemsCount ?? 0}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-muted-foreground/80">
                      {t.requiredLearningPct ?? 80}%
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-muted-foreground/80">
                      {t.requiredProblemPct ?? 60}%
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span className="text-sm font-black text-primary">
                      +{t.topicXpReward ?? 100}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditTopic(t);
                        }}
                        className="rounded-xl size-8 hover:bg-secondary"
                      >
                        <Edit2
                          size={12}
                          className="text-muted-foreground"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTopicDelete(t._id);
                        }}
                        className="rounded-xl size-8 hover:bg-destructive/10"
                      >
                        <Trash2 size={12} className="text-destructive" />
                      </Button>
                      <ChevronRight
                        size={16}
                        className="text-muted-foreground/40 ml-2 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
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
