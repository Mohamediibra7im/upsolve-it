"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Layers, Check, X, ArrowRight } from "lucide-react";
import { useAdminRoadmapLevels } from "@/hooks/admin/useAdminRoadmap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/providers/Toast";
import { cn } from "@/lib/utils";
import type { RoadmapLevel } from "@/types/Roadmap";

export default function AdminRoadmapLevelsComponent() {
  const { levels, isLoading, createLevel, updateLevel, deleteLevel } = useAdminRoadmapLevels();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<RoadmapLevel | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [videoUnlockSheetPct, setVideoUnlockSheetPct] = useState(80);
  const [sheetUnlockTopicPct, setSheetUnlockTopicPct] = useState(60);
  const [levelCompletionPct, setLevelCompletionPct] = useState(80);
  const [xpPerAcceptedProblem, setXpPerAcceptedProblem] = useState(50);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setOrderIndex(levels.length);
    setIsPublished(true);
    setVideoUnlockSheetPct(80);
    setSheetUnlockTopicPct(60);
    setLevelCompletionPct(80);
    setXpPerAcceptedProblem(50);
    setEditingLevel(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (lvl: RoadmapLevel) => {
    setEditingLevel(lvl);
    setTitle(lvl.title);
    setDescription(lvl.description || "");
    setOrderIndex(lvl.orderIndex);
    setIsPublished(lvl.isPublished);
    setVideoUnlockSheetPct(lvl.videoUnlockSheetPct);
    setSheetUnlockTopicPct(lvl.sheetUnlockTopicPct);
    setLevelCompletionPct(lvl.levelCompletionPct);
    setXpPerAcceptedProblem(lvl.xpPerAcceptedProblem);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      orderIndex: Number(orderIndex),
      isPublished,
      videoUnlockSheetPct: Number(videoUnlockSheetPct),
      sheetUnlockTopicPct: Number(sheetUnlockTopicPct),
      levelCompletionPct: Number(levelCompletionPct),
      xpPerAcceptedProblem: Number(xpPerAcceptedProblem),
    };

    try {
      if (editingLevel) {
        await updateLevel(editingLevel._id, payload);
        toast({ title: "Success", description: "Level updated successfully", variant: "success" });
      } else {
        await createLevel(payload);
        toast({ title: "Success", description: "Level created successfully", variant: "success" });
      }
      setIsOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save level", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this level and all its sessions/problems? This cannot be undone!")) return;
    try {
      await deleteLevel(id);
      toast({ title: "Success", description: "Level deleted successfully", variant: "success" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete level", variant: "destructive" });
    }
  };

  const handleTogglePublish = async (lvl: RoadmapLevel) => {
    try {
      await updateLevel(lvl._id, { isPublished: !lvl.isPublished });
      toast({
        title: "Updated",
        description: `Level is now ${!lvl.isPublished ? "Published" : "Draft"}`,
        variant: "success",
      });
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to update publish state", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Overview/Threshold dashboard */}
      <div className="grid gap-6 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Levels</span>
          <p className="text-3xl font-heading font-black text-foreground mt-2">{levels.length}</p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Standard Video Unlock</span>
          <p className="text-3xl font-heading font-black text-primary mt-2">80%</p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Standard Sheet Unlock</span>
          <p className="text-3xl font-heading font-black text-emerald-400 mt-2">60%</p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Standard Level Complete</span>
          <p className="text-3xl font-heading font-black text-amber-500 mt-2">80%</p>
        </div>
      </div>

      {/* Main Levels Table */}
      <div className="rounded-3xl border border-border/40 bg-card/60 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between border-b border-border/40 px-8 py-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-foreground">Roadmap Levels</h2>
              <p className="text-xs text-muted-foreground">Configure global progression thresholds and point weights.</p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate} className="rounded-xl bg-primary text-xs font-black uppercase tracking-[0.1em] text-primary-foreground gap-2">
                <Plus size={16} />
                Create Level
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card border-border text-foreground">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingLevel ? "Edit Level" : "Create Roadmap Level"}</DialogTitle>
                  <DialogDescription>Setup rating bands, progression gates, and XP rewards.</DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4 text-left">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Order Index</label>
                    <Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(Number(e.target.value))} className="col-span-2 rounded-xl" required />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Level Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-2 rounded-xl" placeholder="e.g. Level 0: Fundamentals" required />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Description</label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-2 rounded-xl" placeholder="Brief outline of the level targets" />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">XP Per Problem</label>
                    <Input type="number" value={xpPerAcceptedProblem} onChange={(e) => setXpPerAcceptedProblem(Number(e.target.value))} className="col-span-2 rounded-xl" required />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Video Watch %</label>
                    <Input type="number" value={videoUnlockSheetPct} onChange={(e) => setVideoUnlockSheetPct(Number(e.target.value))} className="col-span-2 rounded-xl" required />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Sheet Solve %</label>
                    <Input type="number" value={sheetUnlockTopicPct} onChange={(e) => setSheetUnlockTopicPct(Number(e.target.value))} className="col-span-2 rounded-xl" required />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Completion %</label>
                    <Input type="number" value={levelCompletionPct} onChange={(e) => setLevelCompletionPct(Number(e.target.value))} className="col-span-2 rounded-xl" required />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Status</label>
                    <select title="Select status" value={String(isPublished)} onChange={(e) => setIsPublished(e.target.value === "true")} className="col-span-2 rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs focus:outline-none">
                      <option value="true">Published</option>
                      <option value="false">Draft</option>
                    </select>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl">Cancel</Button>
                  <Button type="submit" className="rounded-xl bg-primary text-primary-foreground">Save Changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading levels...</div>
        ) : levels.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground italic">No levels created yet. Click "Create Level" to start the curriculum.</div>
        ) : (
          <Table>
            <TableHeader className="bg-background/40">
              <TableRow>
                <TableHead className="px-6 py-4">Order</TableHead>
                <TableHead className="px-6 py-4">Title</TableHead>
                <TableHead className="px-6 py-4">Video watch %</TableHead>
                <TableHead className="px-6 py-4">Sheet solve %</TableHead>
                <TableHead className="px-6 py-4">Level complete %</TableHead>
                <TableHead className="px-6 py-4">XP Per accepted</TableHead>
                <TableHead className="px-6 py-4">Status</TableHead>
                <TableHead className="px-6 py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {levels.map((lvl) => (
                <TableRow key={lvl._id} className="hover:bg-card/20">
                  <TableCell className="px-6 py-4 font-mono font-bold text-xs">{lvl.orderIndex}</TableCell>
                  <TableCell className="px-6 py-4 font-bold">
                    <div className="flex flex-col">
                      <span className="text-foreground">{lvl.title}</span>
                      <span className="text-[10px] text-muted-foreground font-normal mt-0.5 line-clamp-1 max-w-[240px]">{lvl.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-xs font-mono">{lvl.videoUnlockSheetPct}%</TableCell>
                  <TableCell className="px-6 py-4 text-xs font-mono">{lvl.sheetUnlockTopicPct}%</TableCell>
                  <TableCell className="px-6 py-4 text-xs font-mono">{lvl.levelCompletionPct}%</TableCell>
                  <TableCell className="px-6 py-4 text-xs font-mono text-primary font-bold">+{lvl.xpPerAcceptedProblem} XP</TableCell>
                  <TableCell className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublish(lvl)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]",
                        lvl.isPublished
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      )}
                    >
                      {lvl.isPublished ? <Check size={10} /> : <X size={10} />}
                      {lvl.isPublished ? "Published" : "Draft"}
                    </button>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/roadmap/${lvl._id}`} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em] bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-xl hover:bg-primary/25 transition">
                        Sessions
                        <ArrowRight size={12} />
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(lvl)} className="rounded-xl size-8 hover:bg-secondary">
                        <Edit2 size={14} className="text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(lvl._id)} className="rounded-xl size-8 hover:bg-destructive/10">
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
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
