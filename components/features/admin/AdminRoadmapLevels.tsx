"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Layers, Check, X, ArrowRight, Search, Users, Eye, EyeOff, KeyRound } from "lucide-react";
import { useAdminRoadmapLevels } from "@/hooks/admin/useAdminRoadmap";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/providers/Toast";
import { cn } from "@/lib/utils";
import type { RoadmapLevel } from "@/types/Roadmap";

export default function AdminRoadmapLevelsComponent() {
  const { levels, isLoading, createLevel, updateLevel, deleteLevel, grantLevelAccess, revokeLevelAccess } = useAdminRoadmapLevels();
  const adminUsers = useAdminUsers();
  const users = useMemo(() => adminUsers?.users ?? [], [adminUsers?.users]);
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<RoadmapLevel | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isPublished, setIsPublished] = useState(true);
  const [visibility, setVisibility] = useState<"all" | "specific_users">("all");
  const [allowedUserIds, setAllowedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [levelBonusXp, setLevelBonusXp] = useState(500);

  // Grant dialog state
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [grantLevel, setGrantLevel] = useState<RoadmapLevel | null>(null);
  const [grantUserSearch, setGrantUserSearch] = useState("");
  const [grantSelectedIds, setGrantSelectedIds] = useState<string[]>([]);

  const filteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    if (!userSearch.trim()) return list;
    const q = userSearch.toLowerCase();
    return list.filter(
      (u) =>
        u.codeforcesHandle?.toLowerCase().includes(q) ||
        u._id?.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const grantFilteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    if (!grantUserSearch.trim()) return list;
    const q = grantUserSearch.toLowerCase();
    return list.filter(
      (u) =>
        u.codeforcesHandle?.toLowerCase().includes(q) ||
        u._id?.toLowerCase().includes(q)
    );
  }, [users, grantUserSearch]);

  const grantSelectedUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return list.filter((u) => grantSelectedIds.includes(u._id));
  }, [users, grantSelectedIds]);

  const selectedUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return list.filter((u) => allowedUserIds.includes(u._id));
  }, [users, allowedUserIds]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setOrderIndex(levels.length);
    setIsPublished(true);
    setVisibility("all");
    setAllowedUserIds([]);
    setUserSearch("");
    setLevelBonusXp(500);
    setEditingLevel(null);
  };

  const resetGrantDialog = () => {
    setGrantLevel(null);
    setGrantSelectedIds([]);
    setGrantUserSearch("");
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
    setVisibility(lvl.visibility || "all");
    setAllowedUserIds(lvl.allowedUserIds || []);
    setUserSearch("");
    setLevelBonusXp(lvl.levelBonusXp ?? 500);
    setIsOpen(true);
  };

  const handleAddUser = (userId: string) => {
    if (!allowedUserIds.includes(userId)) {
      setAllowedUserIds((prev) => [...prev, userId]);
    }
    setUserSearch("");
  };

  const handleRemoveUser = (userId: string) => {
    setAllowedUserIds((prev) => prev.filter((id) => id !== userId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      orderIndex: Number(orderIndex),
      isPublished,
      visibility,
      allowedUserIds: visibility === "specific_users" ? allowedUserIds : [],
      levelBonusXp: Number(levelBonusXp),
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

  const handleOpenGrant = (lvl: RoadmapLevel) => {
    setGrantLevel(lvl);
    setGrantSelectedIds(lvl.allowedUserIds ? [...lvl.allowedUserIds] : []);
    setGrantUserSearch("");
    setGrantDialogOpen(true);
  };

  const handleGrantToggleUser = (userId: string) => {
    setGrantSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSaveGrant = async () => {
    if (!grantLevel) return;
    const lvl = grantLevel;
    const oldIds = lvl.allowedUserIds ?? [];
    const toGrant = grantSelectedIds.filter((id) => !oldIds.includes(id));
    const toRevoke = oldIds.filter((id) => !grantSelectedIds.includes(id));

    if (toGrant.length === 0 && toRevoke.length === 0) {
      setGrantDialogOpen(false);
      resetGrantDialog();
      return;
    }

    try {
      if (toGrant.length > 0) {
        await grantLevelAccess(lvl._id, toGrant);
      }
      if (toRevoke.length > 0) {
        try {
          await revokeLevelAccess(lvl._id, toRevoke);
        } catch (revokeErr) {
          // rollback grant if revoke fails
          if (toGrant.length > 0) {
            await revokeLevelAccess(lvl._id, toGrant).catch(() => {});
          }
          throw new Error("Revoke failed. Grant was rolled back.");
        }
      }
      toast({ title: "Success", description: "Level access updated", variant: "success" });
      setGrantDialogOpen(false);
      resetGrantDialog();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update access", variant: "destructive" });
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
    } catch (_err: any) {
      toast({ title: "Error", description: "Failed to update publish state", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Overview/Threshold dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Levels</span>
          <p className="text-3xl font-heading font-black text-foreground mt-2">{levels.length}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {levels.filter((l) => l.isPublished).length} published, {levels.filter((l) => !l.isPublished).length} drafts
          </p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Sessions</span>
          <p className="text-3xl font-heading font-black text-foreground mt-2">
            {levels.reduce((sum, l) => sum + (l.topicsCount ?? 0), 0)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Across all levels
          </p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Bonus XP Pool</span>
          <p className="text-3xl font-heading font-black text-primary mt-2">
            {levels.reduce((sum, l) => sum + (l.levelBonusXp ?? 0), 0).toLocaleString()} XP
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Sum of all level bonuses
          </p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Avg Level Bonus XP</span>
          <p className="text-3xl font-heading font-black text-primary mt-2">
            {levels.length > 0 ? Math.round(levels.reduce((sum, l) => sum + (l.levelBonusXp ?? 0), 0) / levels.length) : 0} XP
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Per level average
          </p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Restricted Levels</span>
          <p className="text-3xl font-heading font-black text-purple-400 mt-2">
            {levels.filter((l) => l.visibility === "specific_users").length}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {levels.filter((l) => l.visibility === "all").length} open to all users
          </p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Published Rate</span>
          <p className="text-3xl font-heading font-black text-emerald-400 mt-2">
            {levels.length > 0 ? Math.round((levels.filter((l) => l.isPublished).length / levels.length) * 100) : 0}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {levels.filter((l) => l.isPublished).length} of {levels.length} levels live
          </p>
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
            <DialogContent className="max-w-lg bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
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
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Level Bonus XP</label>
                    <Input type="number" value={levelBonusXp} onChange={(e) => setLevelBonusXp(Number(e.target.value))} className="col-span-2 rounded-xl" required />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Status</label>
                    <select title="Select status" value={String(isPublished)} onChange={(e) => setIsPublished(e.target.value === "true")} className="col-span-2 rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs focus:outline-none">
                      <option value="true">Published</option>
                      <option value="false">Draft</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground text-right">Visibility</label>
                    <select title="Select visibility" value={visibility} onChange={(e) => setVisibility(e.target.value as "all" | "specific_users")} className="col-span-2 rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs focus:outline-none">
                      <option value="all">All Users</option>
                      <option value="specific_users">Specific Users</option>
                    </select>
                  </div>

                  {visibility === "specific_users" && (
                    <div className="space-y-3 rounded-xl border border-border/40 bg-background/30 p-4">
                      <label className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground flex items-center gap-2">
                        <Users size={14} />
                        Allowed Users ({selectedUsers.length})
                      </label>

                      {/* Selected users chips */}
                      {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedUsers.map((u) => (
                            <span
                              key={u._id}
                              className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[10px] font-bold text-primary"
                            >
                              {u.codeforcesHandle}
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(u._id)}
                                aria-label={`Remove ${u.codeforcesHandle}`}
                                className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5"
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Search input */}
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search by Codeforces handle..."
                          className="pl-9 rounded-xl text-xs"
                        />
                      </div>

                      {/* User dropdown */}
                      {userSearch.trim() && filteredUsers.length > 0 && (
                        <div className="max-h-40 overflow-y-auto rounded-xl border border-border/40 bg-background/80 divide-y divide-border/20">
                          {filteredUsers.slice(0, 15).map((u) => (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => handleAddUser(u._id)}
                              disabled={allowedUserIds.includes(u._id)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 text-left text-xs transition-colors",
                                allowedUserIds.includes(u._id)
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:bg-primary/5 cursor-pointer"
                              )}
                            >
                              <span className="font-bold text-foreground">{u.codeforcesHandle}</span>
                              <span className="text-muted-foreground">#{u.rank}</span>
                              <span className="ml-auto text-muted-foreground">{u.rating}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {userSearch.trim() && filteredUsers.length === 0 && (
                        <p className="text-[10px] text-muted-foreground text-center py-2">No users found matching &quot;{userSearch}&quot;</p>
                      )}
                    </div>
                  )}
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
          <div className="p-12 text-center text-muted-foreground italic">No levels created yet. Click &quot;Create Level&quot; to start the curriculum.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 w-16">Order</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Title</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">Bonus XP</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">Visibility</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {levels.map((lvl) => (
                  <tr key={lvl._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center justify-center size-8 rounded-lg bg-muted/50 text-xs font-mono font-bold text-muted-foreground">
                        {lvl.orderIndex}
                      </span>
                    </td>
                    <td className="px-6 py-5 max-w-[280px]">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{lvl.title}</span>
                        <span className="text-[11px] text-muted-foreground/60 font-normal mt-1 line-clamp-1">{lvl.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-black text-primary">+{lvl.levelBonusXp ?? 0} XP</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {lvl.visibility === "specific_users" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                          <EyeOff size={11} />
                          {lvl.allowedUserIds?.length ?? 0} Users
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                          <Eye size={11} />
                          All
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => handleTogglePublish(lvl)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                          lvl.isPublished
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                        )}
                      >
                        {lvl.isPublished ? <Check size={11} /> : <X size={11} />}
                        {lvl.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/roadmap/${lvl._id}`}
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 hover:border-primary/30 transition-all"
                        >
                          Sessions
                          <ArrowRight size={12} />
                        </Link>
                        <button
                          onClick={() => handleOpenGrant(lvl)}
                          aria-label={`Grant access to ${lvl.title}`}
                          className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                          title="Grant/Revoke User Access"
                        >
                          <KeyRound size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(lvl)}
                          aria-label={`Edit ${lvl.title}`}
                          className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(lvl._id)}
                          aria-label={`Delete ${lvl.title}`}
                          className="inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grant Access Dialog */}
      <Dialog open={grantDialogOpen} onOpenChange={(open) => {
        setGrantDialogOpen(open);
        if (!open) resetGrantDialog();
      }}>
        <DialogContent className="max-w-lg bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Level Access</DialogTitle>
            <DialogDescription>
              {grantLevel ? `Grant or revoke access to "${grantLevel.title}"` : "Select users who can access this level"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 text-left">
            {/* Selected users chips */}
            {grantSelectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {grantSelectedUsers.map((u) => (
                  <span
                    key={u._id}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[10px] font-bold text-primary"
                  >
                    {u.codeforcesHandle}
                    <button
                      type="button"
                      onClick={() => handleGrantToggleUser(u._id)}
                      aria-label={`Remove ${u.codeforcesHandle}`}
                      className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={grantUserSearch}
                onChange={(e) => setGrantUserSearch(e.target.value)}
                placeholder="Search users by Codeforces handle..."
                className="pl-9 rounded-xl text-xs"
              />
            </div>

            {/* User list for selection */}
            {grantUserSearch.trim() && grantFilteredUsers.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-xl border border-border/40 bg-background/80 divide-y divide-border/20">
                {grantFilteredUsers.slice(0, 15).map((u) => {
                  const isSelected = grantSelectedIds.includes(u._id);
                  return (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => handleGrantToggleUser(u._id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-left text-xs transition-colors",
                        isSelected ? "bg-primary/10" : "hover:bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "size-4 rounded border flex items-center justify-center",
                        isSelected ? "bg-primary border-primary" : "border-border"
                      )}>
                        {isSelected && <Check size={10} className="text-primary-foreground" />}
                      </div>
                      <span className="font-bold text-foreground">{u.codeforcesHandle}</span>
                      <span className="text-muted-foreground">#{u.rank}</span>
                      <span className="ml-auto text-muted-foreground">{u.rating}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {grantUserSearch.trim() && grantFilteredUsers.length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center py-2">No users found matching &quot;{grantUserSearch}&quot;</p>
            )}

            {!grantUserSearch.trim() && (
              <p className="text-[10px] text-muted-foreground text-center py-2">
                {grantSelectedIds.length > 0
                  ? `${grantSelectedIds.length} user(s) currently granted access. Search to add or remove users.`
                  : "No users granted access. Search to add users."}
              </p>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {grantSelectedIds.length} user(s) selected
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => { setGrantDialogOpen(false); resetGrantDialog(); }} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={handleSaveGrant} className="rounded-xl bg-primary text-primary-foreground">
                Save Access
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
