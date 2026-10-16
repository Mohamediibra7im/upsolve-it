"use client";

import { AdminState, AdminRetry } from "./AdminState";
import { useAdminConfirmation } from "./useAdminConfirmation";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Check,
  X,
  ArrowRight,
  Search,
  Users,
  KeyRound,
  Lock,
  Unlock,
} from "lucide-react";
import { useAdminRoadmapLevels } from "@/hooks/admin/useAdminRoadmap";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";
import type { RoadmapLevel } from "@/types/Roadmap";

export default function AdminRoadmapLevelsComponent() {
  const {
    levels,
    isLoading,
    error,
    mutateLevels,
    createLevel,
    updateLevel,
    deleteLevel,
    grantLevelAccess,
    revokeLevelAccess,
  } = useAdminRoadmapLevels();
  const adminUsers = useAdminUsers();
  const users = useMemo(() => adminUsers?.users ?? [], [adminUsers?.users]);
  const { toast } = useToast();
  const { askConfirmation, confirmationDialog } = useAdminConfirmation();

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
        u._id?.toLowerCase().includes(q),
    );
  }, [users, userSearch]);

  const grantFilteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    if (!grantUserSearch.trim()) return list;
    const q = grantUserSearch.toLowerCase();
    return list.filter(
      (u) =>
        u.codeforcesHandle?.toLowerCase().includes(q) ||
        u._id?.toLowerCase().includes(q),
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
        toast({
          title: "Level updated",
          description: "Your level changes have been saved.",
          variant: "success",
        });
      } else {
        await createLevel(payload);
        toast({
          title: "Level created",
          description: "Successfully created a roadmap level.",
          variant: "success",
        });
      }
      setIsOpen(false);
      resetForm();
    } catch (err: any) {
      toast({
        title: "Could not save changes",
        description: err.message || "Could not save the level settings.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !(await askConfirmation({
        title: "Delete this level?",
        description:
          "This permanently removes the level and all its sessions, resources, and problems.",
        confirmLabel: "Delete level",
      }))
    )
      return;
    try {
      await deleteLevel(id);
      toast({
        title: "Level deleted",
        description: "The level has been deleted.",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Could not delete",
        description: err.message || "Failed to delete level.",
        variant: "destructive",
      });
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
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
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
        } catch (_revokeErr) {
          if (toGrant.length > 0) {
            await revokeLevelAccess(lvl._id, toGrant).catch(() => {});
          }
          throw new Error("Revoke failed. Grant was rolled back.");
        }
      }
      toast({
        title: "Access updated",
        description: "Member access has been updated.",
        variant: "success",
      });
      setGrantDialogOpen(false);
      resetGrantDialog();
    } catch (err: any) {
      toast({
        title: "Could not update access",
        description: err.message || "Failed to update level keys.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (lvl: RoadmapLevel) => {
    try {
      await updateLevel(lvl._id, { isPublished: !lvl.isPublished });
      toast({
        title: "Level updated",
        description: `Level status set to ${!lvl.isPublished ? "Published" : "Draft"}`,
        variant: "success",
      });
    } catch (_err: any) {
      toast({
        title: "Could not update level",
        description: "Failed to update publish state.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 font-sans text-[#f1f3ee]">
      {/* Overview/Threshold dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-[#2b3031] bg-[#191c1e] p-5 shadow-sm">
          <span className="text-xs font-medium text-[#929b98]">
            Roadmap levels
          </span>
          <p className="text-2xl font-medium text-[#f1f3ee] mt-2">
            {levels.length}
          </p>
          <p className="text-xs text-[#929b98] mt-1">
            {levels.filter((l) => l.isPublished).length} published,{" "}
            {levels.filter((l) => !l.isPublished).length} drafts
          </p>
        </div>
        <div className="rounded-xl border border-[#2b3031] bg-[#191c1e] p-5 shadow-sm">
          <span className="text-xs font-medium text-[#929b98]">Sessions</span>
          <p className="text-2xl font-medium text-[#f1f3ee] mt-2">
            {levels.reduce((sum, l) => sum + (l.topicsCount ?? 0), 0)}
          </p>
          <p className="text-xs text-[#929b98] mt-1">
            Learning paths for your community
          </p>
        </div>
        <div className="rounded-xl border border-[#2b3031] bg-[#191c1e] p-5 shadow-sm">
          <span className="text-xs font-medium text-[#929b98]">
            Available bonus XP
          </span>
          <p className="text-2xl font-medium text-[#b5e3c4] mt-2">
            {levels
              .reduce((sum, l) => sum + (l.levelBonusXp ?? 0), 0)
              .toLocaleString()}{" "}
            XP
          </p>
          <p className="text-xs text-[#929b98] mt-1">
            XP available for completing levels
          </p>
        </div>
      </div>

      {/* Main Levels Table */}
      <div className="rounded-xl border border-[#2b3031] bg-[#191c1e] shadow-none">
        <div className="flex flex-wrap items-center justify-between border-b border-[#2b3031] px-6 py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#131715] border border-[#2b3031] flex items-center justify-center text-[#b5e3c4] shrink-0">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-2xl font-medium text-[#f1f3ee] font-heading tracking-[-0.04em]">
                Roadmap levels
              </h2>
              <p className="text-xs text-[#929b98] font-medium mt-0.5">
                Configure progression thresholds and point weights.
              </p>
            </div>
          </div>

          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) {
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                onClick={handleOpenCreate}
                className="h-10 px-4 rounded-xl bg-[#b5e3c4] hover:bg-[#b5e3c4] text-[#14241b] font-medium text-[13px] font-sans border-transparent"
              >
                <Plus size={12} className="mr-1.5 shrink-0" />
                <span>Create level</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-[#191c1e] border-[#2b3031] text-[#b5e3c4] font-sans rounded-[20px] max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-xl font-medium text-[#f1f3ee] font-heading tracking-tight">
                    {editingLevel ? "Edit level" : "Create a roadmap level"}
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="text-xs text-[#929b98] font-medium">
                      Setup rating bands, progression gates, and XP rewards.
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
                      className="col-span-2 rounded-xl bg-[#101214] border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] text-[#f1f3ee] text-[13px]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-medium text-[#929b98] text-right">
                      Level Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="col-span-2 rounded-xl bg-[#101214] border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] text-[#f1f3ee] text-[13px]"
                      placeholder="e.g. Level 0: Fundamentals"
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
                      placeholder="Brief outline of the level targets"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-medium text-[#929b98] text-right">
                      Level Bonus XP
                    </label>
                    <Input
                      type="number"
                      value={levelBonusXp}
                      onChange={(e) => setLevelBonusXp(Number(e.target.value))}
                      className="col-span-2 rounded-xl bg-[#101214] border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] text-[#f1f3ee] text-[13px]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-medium text-[#929b98] text-right">
                      Status
                    </label>
                    <select
                      title="Select status"
                      value={String(isPublished)}
                      onChange={(e) =>
                        setIsPublished(e.target.value === "true")
                      }
                      className="col-span-2 rounded-xl border border-[#2b3031] bg-[#101214] text-[#f1f3ee] px-3 py-2 text-xs focus:outline-none focus:border-[#2b3031] font-sans"
                    >
                      <option value="true">Published</option>
                      <option value="false">Draft</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label className="text-xs font-medium text-[#929b98] text-right">
                      Visibility
                    </label>
                    <select
                      title="Select visibility"
                      value={visibility}
                      onChange={(e) =>
                        setVisibility(
                          e.target.value as "all" | "specific_users",
                        )
                      }
                      className="col-span-2 rounded-xl border border-[#2b3031] bg-[#101214] text-[#f1f3ee] px-3 py-2 text-xs focus:outline-none focus:border-[#2b3031] font-sans"
                    >
                      <option value="all">All Users</option>
                      <option value="specific_users">
                        Specific Users Only
                      </option>
                    </select>
                  </div>

                  {visibility === "specific_users" && (
                    <div className="col-span-3 space-y-3 rounded-xl border border-[#2b3031] bg-[#101214] p-4">
                      <label className="text-xs font-medium text-[#f1f3ee] flex items-center gap-2">
                        <Users size={12} className="text-[#b5e3c4]" />
                        Allowed Users ({selectedUsers.length})
                      </label>

                      {/* Selected users chips */}
                      {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedUsers.map((u) => (
                            <span
                              key={u._id}
                              className="inline-flex items-center gap-1 rounded-xl bg-[#b5e3c4]/[0.06] border border-[#2b3031] px-2 py-0.5 text-xs font-medium text-[#f1f3ee]"
                            >
                              {u.codeforcesHandle}
                              <button
                                type="button"
                                onClick={() => handleRemoveUser(u._id)}
                                aria-label={`Remove ${u.codeforcesHandle}`}
                                className="ml-1 rounded-xl hover:bg-[#b5e3c4]/[0.06] text-[#929b98] hover:text-[#f1f3ee]"
                              >
                                <X size={9} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Search input */}
                      <div className="relative">
                        <Search
                          size={12}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#929b98]"
                        />
                        <Input
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          placeholder="Search Codeforces handle..."
                          className="pl-8 h-10 rounded-xl bg-[#101214] border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] text-[#f1f3ee] text-[13px] font-sans"
                        />
                      </div>

                      {/* User dropdown */}
                      {userSearch.trim() && filteredUsers.length > 0 && (
                        <div className="max-h-32 overflow-y-auto rounded-xl border border-[#2b3031] bg-[#191c1e] divide-y divide-[#2b3031]">
                          {filteredUsers.slice(0, 15).map((u) => (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => handleAddUser(u._id)}
                              disabled={allowedUserIds.includes(u._id)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-1.5 text-left text-xs font-medium font-sans transition-colors",
                                allowedUserIds.includes(u._id)
                                  ? "opacity-40 cursor-not-allowed"
                                  : "hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] cursor-pointer",
                              )}
                            >
                              <span className="text-[#f1f3ee]">
                                {u.codeforcesHandle}
                              </span>
                              <span className="text-[#929b98]">#{u.rank}</span>
                              <span className="ml-auto text-[#b5e3c4]">
                                {u.rating}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {userSearch.trim() && filteredUsers.length === 0 && (
                        <p className="text-xs font-medium text-[#929b98] text-center py-2">
                          No users found matching &quot;{userSearch}&quot;
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
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
            title="Loading roadmap levels…"
            className="rounded-none border-0"
          />
        ) : error ? (
          <AdminState
            tone="error"
            title="Could not load roadmap levels"
            description="Your roadmap is temporarily unavailable."
            action={<AdminRetry onRetry={() => mutateLevels()} />}
            className="rounded-none border-0"
          />
        ) : levels.length === 0 ? (
          <AdminState
            icon={Layers}
            title="Start your roadmap"
            description="Create your first level to give members a clear learning path."
            className="rounded-none border-0"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#2b3031]">
                  <th className="px-6 py-3 text-xs font-medium text-[#929b98] w-16">
                    Order
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-[#929b98]">
                    Level
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-[#929b98] text-center">
                    Bonus XP
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-[#929b98] text-center">
                    Access
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-[#929b98] text-center">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-[#929b98] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2b3031]">
                {levels.map((lvl) => (
                  <tr
                    key={lvl._id}
                    className="group hover:bg-[#b5e3c4]/[0.06] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center size-10 rounded-xl bg-[#131715] border border-[#2b3031] text-xs font-sans font-medium text-[#b5e3c4]">
                        {lvl.orderIndex}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[280px]">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/roadmap/${lvl._id}`}
                          className="text-xs font-medium text-[#f1f3ee] hover:text-[#f1f3ee]"
                        >
                          {lvl.title}
                        </Link>
                        <span className="text-xs text-[#929b98] font-normal mt-0.5 line-clamp-1">
                          {lvl.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center tabular-nums text-[#f1f3ee] font-medium">
                      {lvl.levelBonusXp ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {lvl.visibility === "specific_users" ? (
                        <button
                          onClick={() => handleOpenGrant(lvl)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 border border-purple-500/25 bg-purple-400/5 text-purple-400 text-[13px] font-medium hover:bg-purple-400/5 transition-all rounded-xl"
                        >
                          <Lock size={10} className="shrink-0" />
                          <span>{lvl.allowedUserIds?.length ?? 0} members</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenGrant(lvl)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#2b3031] bg-[#b5e3c4]/[0.06] text-[#929b98] text-[13px] font-medium hover:bg-[#b5e3c4]/[0.06] transition-all rounded-xl"
                        >
                          <Unlock size={10} className="shrink-0" />
                          <span>Public</span>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(lvl)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 border text-xs font-medium rounded-xl transition-all",
                          lvl.isPublished
                            ? "bg-[#131715] border-[#2b3031] text-[#b5e3c4] hover:bg-[#b5e3c4]/[0.06]"
                            : "bg-amber-400/5 border-amber-500/20 text-amber-400 hover:bg-amber-500/15",
                        )}
                      >
                        <div
                          className={cn(
                            "size-1.5 rounded-xl shrink-0",
                            lvl.isPublished ? "bg-[#b5e3c4]" : "bg-amber-400",
                          )}
                        />
                        <span>{lvl.isPublished ? "Published" : "Draft"}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Edit ${lvl.title}`}
                          onClick={() => handleOpenEdit(lvl)}
                          className="size-10 rounded-xl border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4]"
                        >
                          <Edit2 size={12} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Delete ${lvl.title}`}
                          onClick={() => handleDelete(lvl._id)}
                          className="size-10 rounded-xl border border-red-500/15 hover:bg-red-400/5 text-red-400"
                        >
                          <Trash2 size={12} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          className="h-10 px-2 rounded-xl border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[13px] font-medium text-[#b5e3c4]"
                        >
                          <Link href={`/admin/roadmap/${lvl._id}`}>
                            <span>Sessions</span>
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
      <Dialog
        open={grantDialogOpen}
        onOpenChange={(open) => !open && setGrantDialogOpen(false)}
      >
        <DialogContent className="max-w-lg bg-[#191c1e] border-[#2b3031] text-[#b5e3c4] font-sans rounded-[20px] max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-[#f1f3ee] font-heading tracking-tight">
              Manage level access
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-xs text-[#929b98] font-medium mt-0.5">
                Target: {grantLevel?.title}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-4">
            {/* Allowed users stats */}
            <div className="p-3 bg-[#101214] border border-[#2b3031] rounded-xl">
              <p className="text-xs font-medium text-[#929b98] flex items-center gap-1.5 mb-2">
                <KeyRound size={12} className="text-[#b5e3c4]" />
                Members with access ({grantSelectedIds.length})
              </p>
              {grantSelectedUsers.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {grantSelectedUsers.map((u) => (
                    <span
                      key={u._id}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#b5e3c4]/[0.06] border border-[#2b3031] px-2 py-0.5 text-xs font-medium text-[#f1f3ee]"
                    >
                      {u.codeforcesHandle}
                      <button
                        type="button"
                        onClick={() => handleGrantToggleUser(u._id)}
                        className="ml-1 text-[#929b98] hover:text-[#f1f3ee]"
                      >
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-medium text-[#929b98] italic">
                  No members selected. This level is currently available to
                  everyone.
                </p>
              )}
            </div>

            {/* Search filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#929b98]"
                />
                <Input
                  value={grantUserSearch}
                  onChange={(e) => setGrantUserSearch(e.target.value)}
                  placeholder="Search Codeforces handles…"
                  className="pl-8 h-10 rounded-xl bg-[#101214] border-[#2b3031] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] text-[#f1f3ee] text-[13px] font-sans"
                />
              </div>

              {grantUserSearch.trim() && (
                <div className="max-h-40 overflow-y-auto border border-[#2b3031] bg-[#101214] rounded-xl divide-y divide-[#2b3031]">
                  {grantFilteredUsers.slice(0, 10).map((u) => {
                    const isSelected = grantSelectedIds.includes(u._id);
                    return (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handleGrantToggleUser(u._id)}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[13px] font-medium transition-all hover:bg-[#b5e3c4]/[0.06] font-sans"
                      >
                        <div className="flex flex-col">
                          <span className="text-[#f1f3ee]">
                            {u.codeforcesHandle}
                          </span>
                          <span className="text-xs text-[#929b98]">
                            Rating: {u.rating}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "size-4 border flex items-center justify-center rounded-xl",
                            isSelected
                              ? "border-[#2b3031] text-[#14241b] bg-[#b5e3c4]"
                              : "border-[#2b3031]",
                          )}
                        >
                          <Check size={10} />
                        </div>
                      </button>
                    );
                  })}
                  {grantFilteredUsers.length === 0 && (
                    <p className="text-xs font-medium text-[#929b98] text-center py-3">
                      No users found matching query
                    </p>
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
              className="rounded-xl border border-[#2b3031] text-[#b5e3c4] hover:bg-[#b5e3c4]/[0.06] font-sans text-[13px] h-10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveGrant}
              className="rounded-xl bg-[#b5e3c4] hover:bg-[#b5e3c4] text-[#14241b] font-medium text-[13px] font-sans border-transparent h-10"
            >
              Save access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {confirmationDialog}
    </div>
  );
}
