"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Layers, Check, X, ArrowRight, Search, Users, Eye, EyeOff, KeyRound, Lock, Unlock, Loader2 } from "lucide-react";
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
        toast({ title: "ROADMAP: LEVEL UPDATED", description: "Successfully updated roadmap level parameters.", variant: "success" });
      } else {
        await createLevel(payload);
        toast({ title: "ROADMAP: LEVEL CREATED", description: "Successfully injected a new roadmap level node.", variant: "success" });
      }
      setIsOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: "SYS.ERR: WRITE FAILED", description: err.message || "Failed to commit level settings.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this level and all its sessions/problems? This cannot be undone!")) return;
    try {
      await deleteLevel(id);
      toast({ title: "ROADMAP: LEVEL REMOVED", description: "Level node deleted.", variant: "success" });
    } catch (err: any) {
      toast({ title: "SYS.ERR: DELETE FAILED", description: err.message || "Failed to delete level.", variant: "destructive" });
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
          if (toGrant.length > 0) {
            await revokeLevelAccess(lvl._id, toGrant).catch(() => {});
          }
          throw new Error("Revoke failed. Grant was rolled back.");
        }
      }
      toast({ title: "ROADMAP: ACCESS GRANTED", description: "Successfully updated registry clearance parameters.", variant: "success" });
      setGrantDialogOpen(false);
      resetGrantDialog();
    } catch (err: any) {
      toast({ title: "SYS.ERR: ACCESS UPDATE FAILED", description: err.message || "Failed to update level keys.", variant: "destructive" });
    }
  };

  const handleTogglePublish = async (lvl: RoadmapLevel) => {
    try {
      await updateLevel(lvl._id, { isPublished: !lvl.isPublished });
      toast({
        title: "ROADMAP: LEVEL UPDATED",
        description: `Level status set to ${!lvl.isPublished ? "PUBLISHED" : "DRAFT"}`,
        variant: "success",
      });
    } catch (_err: any) {
      toast({ title: "SYS.ERR: LEVE_UPDATE FAILED", description: "Failed to update publish state.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 font-mono text-emerald-400">
      {/* Overview/Threshold dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-none border border-emerald-500/15 bg-[#060a08]/30 p-5 shadow-sm">
          <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/35">TOTAL_LEVEL_NODES</span>
          <p className="text-2xl font-bold text-emerald-300 mt-2">{levels.length}</p>
          <p className="text-[9px] text-emerald-500/40 mt-1 uppercase">
            {levels.filter((l) => l.isPublished).length} published, {levels.filter((l) => !l.isPublished).length} drafts
          </p>
        </div>
        <div className="rounded-none border border-emerald-500/15 bg-[#060a08]/30 p-5 shadow-sm">
          <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/35">TOTAL_TOPIC_SESSIONS</span>
          <p className="text-2xl font-bold text-emerald-300 mt-2">
            {levels.reduce((sum, l) => sum + (l.topicsCount ?? 0), 0)}
          </p>
          <p className="text-[9px] text-emerald-500/40 mt-1 uppercase">
            Curriculum sector nodes
          </p>
        </div>
        <div className="rounded-none border border-emerald-500/15 bg-[#060a08]/30 p-5 shadow-sm">
          <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-500/35">BONUS_XP_POOL_POOL</span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {levels.reduce((sum, l) => sum + (l.levelBonusXp ?? 0), 0).toLocaleString()} XP
          </p>
          <p className="text-[9px] text-emerald-500/40 mt-1 uppercase">
            Sum of all reward vectors
          </p>
        </div>
      </div>

      {/* Main Levels Table */}
      <div className="rounded-none border border-emerald-500/15 bg-[#060a08]/10 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between border-b border-emerald-500/15 px-6 py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-none bg-emerald-950/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-300">ROADMAP_LEVEL_SECTORS</h2>
              <p className="text-[9px] text-emerald-500/40 font-bold uppercase mt-0.5">Configure progression thresholds and point weights.</p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate} className="h-8 px-4 rounded-none bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.25)] border-transparent">
                <Plus size={12} className="mr-1.5 shrink-0" />
                <span>[ CREATE_LEVEL.EXE ]</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-[#060a08] border-emerald-500/25 text-emerald-400 font-mono rounded-none max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                    {editingLevel ? "EDIT_LEVEL_NODE" : "CREATE_ROADMAP_LEVEL"}
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="text-[10px] text-emerald-500/40 font-bold uppercase tracking-wider">
                      Setup rating bands, progression gates, and XP rewards.
                    </div>
                  </DialogDescription>
                </DialogHeader>

                <div className="py-2 space-y-3 text-left">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45 text-right">Order Index</label>
                    <Input type="number" value={orderIndex} onChange={(e) => setOrderIndex(Number(e.target.value))} className="col-span-2 rounded-none bg-[#040604]/50 border-emerald-500/15 focus:ring-0 focus:border-emerald-500/45 text-emerald-300 text-xs" required />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45 text-right">Level Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-2 rounded-none bg-[#040604]/50 border-emerald-500/15 focus:ring-0 focus:border-emerald-500/45 text-emerald-300 text-xs" placeholder="e.g. Level 0: Fundamentals" required />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45 text-right">Description</label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-2 rounded-none bg-[#040604]/50 border-emerald-500/15 focus:ring-0 focus:border-emerald-500/45 text-emerald-300 text-xs font-mono min-h-20" placeholder="Brief outline of the level targets" />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45 text-right">Level Bonus XP</label>
                    <Input type="number" value={levelBonusXp} onChange={(e) => setLevelBonusXp(Number(e.target.value))} className="col-span-2 rounded-none bg-[#040604]/50 border-emerald-500/15 focus:ring-0 focus:border-emerald-500/45 text-emerald-300 text-xs" required />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45 text-right">Status</label>
                    <select title="Select status" value={String(isPublished)} onChange={(e) => setIsPublished(e.target.value === "true")} className="col-span-2 rounded-none border border-emerald-500/15 bg-[#040604]/50 text-emerald-300 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/45 font-mono">
                      <option value="true">Published</option>
                      <option value="false">Draft</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/45 text-right">Visibility</label>
                    <select title="Select visibility" value={visibility} onChange={(e) => setVisibility(e.target.value as "all" | "specific_users")} className="col-span-2 rounded-none border border-emerald-500/15 bg-[#040604]/50 text-emerald-300 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500/45 font-mono">
                      <option value="all">All Users</option>
                      <option value="specific_users">Specific Users Only</option>
                    </select>
                  </div>

                  {visibility === "specific_users" && (
                    <div className="col-span-3 space-y-3 rounded-none border border-emerald-500/15 bg-[#040604]/40 p-4">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-300 flex items-center gap-2">
                        <Users size={12} className="text-emerald-400" />
                        Allowed Users ({selectedUsers.length})
                      </label>

                      {/* Selected users chips */}
                      {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedUsers.map((u) => (
                            <span
                              key={u._id}
                              className="inline-flex items-center gap-1 rounded-none bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[8px] font-bold text-emerald-300"
                            >
                              {u.codeforcesHandle}
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(u._id)}
                                aria-label={`Remove ${u.codeforcesHandle}`}
                                className="ml-1 rounded-none hover:bg-emerald-500/20 text-emerald-500/60 hover:text-emerald-300"
                              >
                                <X size={9} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Search input */}
                      <div className="relative">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/40" />
                        <Input
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search Codeforces handle..."
                          className="pl-8 h-8 rounded-none bg-[#040604]/60 border-emerald-500/15 focus:ring-0 focus:border-emerald-500/45 text-emerald-300 text-xs font-mono"
                        />
                      </div>

                      {/* User dropdown */}
                      {userSearch.trim() && filteredUsers.length > 0 && (
                        <div className="max-h-32 overflow-y-auto rounded-none border border-emerald-500/20 bg-[#060a08] divide-y divide-emerald-500/[0.08]">
                          {filteredUsers.slice(0, 15).map((u) => (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => handleAddUser(u._id)}
                              disabled={allowedUserIds.includes(u._id)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-1.5 text-left text-[10px] font-bold font-mono transition-colors",
                                allowedUserIds.includes(u._id)
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:bg-emerald-500/10 text-emerald-450 cursor-pointer"
                              )}
                            >
                              <span className="text-emerald-300">{u.codeforcesHandle}</span>
                              <span className="text-emerald-500/30">#{u.rank}</span>
                              <span className="ml-auto text-emerald-400">{u.rating}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {userSearch.trim() && filteredUsers.length === 0 && (
                        <p className="text-[8px] font-bold text-emerald-500/25 text-center py-2 uppercase">No users found matching &quot;{userSearch}&quot;</p>
                      )}
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-none border border-emerald-500/15 text-emerald-400 hover:bg-emerald-500/10 font-mono text-[9px] uppercase tracking-widest h-8">
                    [ CANCEL ]
                  </Button>
                  <Button type="submit" className="rounded-none bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.25)] border-transparent h-8">
                    [ SAVE_CHANGES.EXE ]
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs font-bold text-emerald-500/40 uppercase tracking-widest animate-pulse">Loading roadmap levels...</div>
        ) : levels.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-emerald-500/35 uppercase tracking-widest italic">[ NO_LEVELS_CREATED_YET ]</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="border-b border-emerald-500/15">
                  <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 w-16">ORDER</th>
                  <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">LEVEL_TITLE</th>
                  <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 text-center">BONUS_XP</th>
                  <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 text-center">ACCESS_KEYS</th>
                  <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 text-center">STATE</th>
                  <th className="px-6 py-3 text-[9px] font-bold uppercase tracking-widest text-emerald-500/40 text-right">OPERATIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/[0.08]">
                {levels.map((lvl) => (
                  <tr key={lvl._id} className="group hover:bg-emerald-500/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center size-7 rounded-none bg-emerald-950/10 border border-emerald-500/15 text-[10px] font-mono font-bold text-emerald-400">
                        {lvl.orderIndex}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[280px]">
                      <div className="flex flex-col">
                        <Link href={`/admin/roadmap/${lvl._id}`} className="text-xs font-bold text-emerald-300 hover:text-emerald-200 tracking-wider">
                          {lvl.title}
                        </Link>
                        <span className="text-[9px] text-emerald-500/35 font-normal mt-0.5 line-clamp-1 uppercase">{lvl.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center tabular-nums text-emerald-300 font-bold">
                      {lvl.levelBonusXp ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {lvl.visibility === "specific_users" ? (
                        <button
                          onClick={() => handleOpenGrant(lvl)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 border border-purple-500/25 bg-purple-955/10 text-purple-400 text-[8px] font-bold uppercase hover:bg-purple-955/20 transition-all rounded-none"
                        >
                          <Lock size={10} className="shrink-0" />
                          <span>[{lvl.allowedUserIds?.length ?? 0} KEYS]</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenGrant(lvl)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 border border-emerald-500/15 bg-emerald-500/5 text-emerald-500/60 text-[8px] font-bold uppercase hover:bg-emerald-500/10 transition-all rounded-none"
                        >
                          <Unlock size={10} className="shrink-0 animate-pulse" />
                          <span>[PUBLIC]</span>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(lvl)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 border text-[8px] font-bold uppercase tracking-wider rounded-none transition-all",
                          lvl.isPublished
                            ? "bg-emerald-955/10 border-emerald-500/20 text-emerald-450 hover:bg-emerald-500/15"
                            : "bg-amber-955/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/15"
                        )}
                      >
                        <div className={cn("size-1.5 rounded-none shrink-0", lvl.isPublished ? "bg-emerald-400" : "bg-amber-400")} />
                        <span>{lvl.isPublished ? "[LIVE]" : "[DRAFT]"}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEdit(lvl)}
                          className="size-7 rounded-none border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-450"
                        >
                          <Edit2 size={12} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(lvl._id)}
                          className="size-7 rounded-none border border-red-500/15 hover:bg-red-955/10 text-red-400"
                        >
                          <Trash2 size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          className="h-7 px-2 rounded-none border border-emerald-500/15 hover:bg-emerald-500/10 text-[8px] font-bold uppercase tracking-widest text-emerald-450"
                        >
                          <Link href={`/admin/roadmap/${lvl._id}`}>
                            <span>[ SESSIONS ]</span>
                            <ArrowRight size={10} className="ml-1 shrink-0" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grant Access Modal */}
      <Dialog open={grantDialogOpen} onOpenChange={(open) => !open && setGrantDialogOpen(false)}>
        <DialogContent className="max-w-lg bg-[#060a08] border-emerald-500/25 text-emerald-400 font-mono rounded-none max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              GRANT_SECTOR_ clearance
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-[10px] text-emerald-500/40 font-bold uppercase mt-0.5">
                Target: {grantLevel?.title}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-4">
            {/* Allowed users stats */}
            <div className="p-3 bg-[#040604]/60 border border-emerald-500/15 rounded-none">
              <p className="text-[9px] font-bold text-emerald-500/35 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <KeyRound size={12} className="text-emerald-400" />
                Clearance Keys Granted ({grantSelectedIds.length})
              </p>
              {grantSelectedUsers.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {grantSelectedUsers.map((u) => (
                    <span
                      key={u._id}
                      className="inline-flex items-center gap-1 rounded-none bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[8px] font-bold text-emerald-300"
                    >
                      {u.codeforcesHandle}
                      <button
                        type="button"
                        onClick={() => handleGrantToggleUser(u._id)}
                        className="ml-1 text-emerald-500/40 hover:text-emerald-300"
                      >
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[8px] font-bold text-emerald-500/20 uppercase italic">No specific clearance tags granted. Sector defaults to public access.</p>
              )}
            </div>

            {/* Search filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/40" />
                <Input
                  value={grantUserSearch}
                  onChange={(e) => setGrantUserSearch(e.target.value)}
                  placeholder="Search user logs by handle..."
                  className="pl-8 h-8 rounded-none bg-[#040604]/60 border-emerald-500/15 focus:ring-0 focus:border-emerald-500/45 text-emerald-300 text-xs font-mono"
                />
              </div>

              {grantUserSearch.trim() && (
                <div className="max-h-40 overflow-y-auto border border-emerald-500/15 bg-[#040604]/40 rounded-none divide-y divide-emerald-500/[0.08]">
                  {grantFilteredUsers.slice(0, 10).map((u) => {
                    const isSelected = grantSelectedIds.includes(u._id);
                    return (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handleGrantToggleUser(u._id)}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[10px] font-bold transition-all hover:bg-emerald-500/10 font-mono"
                      >
                        <div className="flex flex-col">
                          <span className="text-emerald-300">{u.codeforcesHandle}</span>
                          <span className="text-[8px] text-emerald-500/35">Rating: {u.rating}</span>
                        </div>
                        <div className={cn(
                          "size-4 border flex items-center justify-center rounded-none",
                          isSelected
                            ? "border-emerald-500 text-emerald-950 bg-emerald-500"
                            : "border-emerald-500/20 text-transparent"
                        )}>
                          <Check size={10} />
                        </div>
                      </button>
                    );
                  })}
                  {grantFilteredUsers.length === 0 && (
                    <p className="text-[8px] font-bold text-emerald-500/20 text-center py-3 uppercase">No users found matching query</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setGrantDialogOpen(false);
                resetGrantDialog();
              }}
              className="rounded-none border border-emerald-500/15 text-emerald-400 hover:bg-emerald-500/10 font-mono text-[9px] uppercase tracking-widest h-8"
            >
              [ CANCEL ]
            </Button>
            <Button
              type="button"
              onClick={handleSaveGrant}
              className="rounded-none bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[9px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.25)] border-transparent h-8"
            >
              [ COMMIT_CLEARANCE.EXE ]
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
