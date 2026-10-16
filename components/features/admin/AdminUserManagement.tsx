"use client";

import { AdminState, AdminRetry } from "./AdminState";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Shield,
  Search,
  ArrowUpDown,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/providers/Toast";
import {
  useAdminUsers,
  updateUserRole,
  syncBatchUserRatings,
} from "@/hooks/admin/useAdminUsers";
import { User } from "@/types/User";

import { UserTable } from "./UserTable";
import { UserMobileCards } from "./UserMobileCards";
import { RoleConfirmationDialog } from "./RoleConfirmationDialog";
import { UserProfileDialog } from "@/components/features/profile";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const RATING_FILTERS = [
  { label: "All ratings", value: "all", min: -1, max: Infinity },
  { label: "Unrated", value: "unrated", min: 0, max: 0 },
  { label: "Newbie (< 1200)", value: "newbie", min: 1, max: 1199 },
  { label: "Pupil (1200–1399)", value: "pupil", min: 1200, max: 1399 },
  {
    label: "Specialist (1400–1599)",
    value: "specialist",
    min: 1400,
    max: 1599,
  },
  { label: "Expert (1600–1899)", value: "expert", min: 1600, max: 1899 },
  { label: "Candidate master (1900–2099)", value: "cm", min: 1900, max: 2099 },
  { label: "Master (2100–2299)", value: "master", min: 2100, max: 2299 },
  {
    label: "International master (2300–2399)",
    value: "im",
    min: 2300,
    max: 2399,
  },
  { label: "Grandmaster (2400–2599)", value: "gm", min: 2400, max: 2599 },
  {
    label: "International grandmaster (2600–2999)",
    value: "igm",
    min: 2600,
    max: 2999,
  },
  {
    label: "Legendary grandmaster (3000+)",
    value: "lgm",
    min: 3000,
    max: Infinity,
  },
] as const;

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

interface ConfirmationDialog {
  open: boolean;
  user: User | null;
  newRole: "admin" | "user" | null;
}

type SortField = "createdAt" | "name";
type SortOrder = "asc" | "desc";
type RatingFilterValue = (typeof RATING_FILTERS)[number]["value"];

export default function AdminUserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [ratingFilter, setRatingFilter] = useState<RatingFilterValue>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    open: false,
    user: null,
    newRole: null,
  });
  const [statsDialog, setStatsDialog] = useState<{
    open: boolean;
    userId: string | null;
  }>({
    open: false,
    userId: null,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const { users, isLoading, isError, mutate } = useAdminUsers();

  const parseDate = (dateStr: string | undefined): number => {
    if (!dateStr) return 0;
    const parsed = Date.parse(dateStr);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = users.filter((user: User) => {
      const handle = user.codeforcesHandle || "";
      return handle.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (ratingFilter !== "all") {
      const filterConfig = RATING_FILTERS.find((f) => f.value === ratingFilter);
      if (filterConfig) {
        result = result.filter((user: User) => {
          const rating = user.rating || 0;
          if (filterConfig.value === "unrated") return rating === 0;
          return rating >= filterConfig.min && rating <= filterConfig.max;
        });
      }
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "createdAt") {
        comparison = parseDate(a.createdAt) - parseDate(b.createdAt);
      } else if (sortBy === "name") {
        const nameA = (a.codeforcesHandle || "").toLowerCase();
        const nameB = (b.codeforcesHandle || "").toLowerCase();
        comparison = nameA.localeCompare(nameB);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [users, searchTerm, ratingFilter, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, ratingFilter, sortBy, sortOrder, pageSize]);

  const totalFilteredUsers = filteredAndSortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredUsers / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFilteredUsers);
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  useEffect(() => {
    if (isError) {
      toast({
        title: "Could not load members",
        description: "Unable to load members. Please refresh the page.",
        variant: "destructive",
        durationMs: 4000,
      });
    }
  }, [isError, toast]);

  const fetchUserStats = (userId: string) => {
    setStatsDialog({ open: true, userId });
  };

  const handleSyncBatchRatings = async () => {
    if (isSyncing || paginatedUsers.length === 0) return;

    setIsSyncing(true);
    const userIds = paginatedUsers.map((u: User) => u._id);
    try {
      const result = await syncBatchUserRatings(userIds);
      await mutate();
      toast({
        title: "Ratings updated",
        description: `Successfully synchronized Codeforces ratings for ${result.synced} user(s) on this page.`,
        variant: "success",
        durationMs: 4000,
      });
    } catch (error) {
      toast({
        title: "Could not sync ratings",
        description:
          error instanceof Error
            ? error.message
            : "Unable to pull stats from Codeforces API.",
        variant: "destructive",
        durationMs: 4000,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUserRoleUpdate = async (
    userId: string,
    newRole: "admin" | "user",
  ) => {
    if (updating) return;

    const user = users.find((u: User) => u._id === userId);
    if (!user) return;

    setConfirmDialog({
      open: true,
      user,
      newRole,
    });
  };

  const handleConfirmRoleChange = async () => {
    if (!confirmDialog.user || !confirmDialog.newRole) return;

    const { user, newRole } = confirmDialog;
    setUpdating(user._id);
    setConfirmDialog({ open: false, user: null, newRole: null });

    try {
      await updateUserRole(user._id, newRole);
      await mutate();

      const isPromotion = newRole === "admin";
      toast({
        title: isPromotion ? "Admin access granted" : "Member role updated",
        description: isPromotion
          ? `${user.codeforcesHandle} has been granted administrator status.`
          : `${user.codeforcesHandle} has been set to regular user status.`,
        variant: "success",
        durationMs: 5000,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Could not update role",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update member access.",
        variant: "destructive",
        durationMs: 4000,
      });
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <AdminState
        tone="loading"
        title="Loading members…"
        description="Getting the latest community details."
      />
    );
  }

  if (isError) {
    return (
      <AdminState
        tone="error"
        title="Could not load members"
        description="The member directory is temporarily unavailable."
        action={<AdminRetry onRetry={() => mutate()} />}
      />
    );
  }

  return (
    <div className="space-y-8 font-sans text-[#f1f3ee]">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#929b98] font-medium text-xs">
            <Shield size={12} className="text-[#b5e3c4]" />
            Community members
          </div>
          <h2 className="text-2xl font-medium text-[#f1f3ee] font-heading tracking-[-0.04em]">
            Members
          </h2>
          <p className="text-xs text-[#929b98] font-medium max-w-md">
            Manage member access and explore their training progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[#191c1e] border border-[#2b3031] flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {users.slice(0, 3).map((u: User) => (
                <div
                  key={u._id}
                  className="size-5 rounded-xl border border-[#2b3031] bg-[#131715] overflow-hidden shrink-0"
                >
                  {u.avatar ? (
                    <Image
                      src={u.avatar}
                      alt=""
                      width={20}
                      height={20}
                      unoptimized
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-[10px] font-medium text-[#b5e3c4]">
                      {u.codeforcesHandle?.[0]}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="text-xs font-medium text-[#929b98]">
              {users.length} members
            </div>
          </div>

          <Button
            onClick={handleSyncBatchRatings}
            disabled={isSyncing || paginatedUsers.length === 0}
            className={cn(
              "h-10 px-3 rounded-xl text-xs font-medium flex items-center gap-2 transition-all",
              "bg-[#b5e3c4] hover:bg-[#b5e3c4] text-[#14241b] font-sans border-transparent",
              "disabled:opacity-40 disabled:pointer-events-none",
            )}
          >
            <RefreshCw
              size={10}
              className={cn(isSyncing ? "animate-spin" : "")}
            />
            {isSyncing ? "Syncing…" : "Sync page ratings"}
          </Button>
        </div>
      </div>

      {/* Registry Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-[20px] bg-[#191c1e] border-[#2b3031] p-5 shadow-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="size-10 rounded-xl border border-[#2b3031] bg-[#131715] flex items-center justify-center text-[#b5e3c4] shrink-0">
              <Users size={16} />
            </div>
            <div>
              <div className="text-2xl font-medium text-[#f1f3ee] tabular-nums">
                {users.length}
              </div>
              <div className="text-xs font-medium text-[#929b98] mt-1">
                Registered members
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[20px] bg-[#191c1e] border-[#2b3031] p-5 shadow-none">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="size-10 rounded-xl border border-amber-500/20 bg-amber-400/5 flex items-center justify-center text-amber-500 shrink-0">
              <Crown size={16} />
            </div>
            <div>
              <div className="text-2xl font-medium text-amber-400 tabular-nums">
                {users.filter((u: User) => u.role === "admin").length}
              </div>
              <div className="text-xs font-medium text-[#929b98] mt-1">
                Administrators
              </div>
            </div>
          </div>
        </Card>

        <Card className="col-span-2 rounded-[20px] bg-[#191c1e] border-[#2b3031] p-5 shadow-none">
          <div className="h-full flex flex-col justify-center gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl border border-[#2b3031] bg-[#131715] flex items-center justify-center text-[#b5e3c4] shrink-0">
                  <ArrowUpDown size={16} />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#f1f3ee]">
                    Find a member
                  </div>
                  <div className="text-xs font-medium text-[#929b98]">
                    Search, filter, and sort your community.
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Reverse sort order"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="size-10 bg-transparent border border-[#2b3031] rounded-xl hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] shrink-0"
              >
                <ArrowUpDown
                  size={12}
                  className={cn(
                    "transition-transform",
                    sortOrder === "desc" ? "rotate-180" : "",
                  )}
                />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(150px,1fr)_minmax(150px,1fr)]">
              <div className="relative group/search flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-[#929b98] group-focus-within/search:text-[#b5e3c4]" />
                <Input
                  aria-label="Search members"
                  placeholder="Search Codeforces handles…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 pl-8 bg-[#101214] border-[#2b3031] rounded-xl text-[13px] text-[#f1f3ee] placeholder:text-[#929b98] focus:ring-2 focus:ring-[#b5e3c4]/30 focus:border-[#2b3031] font-sans"
                />
              </div>
              <Select
                value={ratingFilter}
                onValueChange={(value) =>
                  setRatingFilter(value as RatingFilterValue)
                }
              >
                <SelectTrigger className="h-10 bg-[#101214] border-[#2b3031] rounded-xl text-xs font-medium text-[#b5e3c4] focus:ring-2 focus:ring-[#b5e3c4]/30">
                  <div className="flex items-center gap-1.5">
                    <Filter size={10} className="text-[#929b98] shrink-0" />
                    <SelectValue placeholder="Filter by rating" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#191c1e] border-[#2b3031] rounded-xl font-sans">
                  {RATING_FILTERS.map((filter) => (
                    <SelectItem
                      key={filter.value}
                      value={filter.value}
                      className="text-xs font-medium text-[#b5e3c4] focus:bg-[#b5e3c4]/[0.06] focus:text-[#f1f3ee]"
                    >
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortField)}
              >
                <SelectTrigger className="h-10 bg-[#101214] border-[#2b3031] rounded-xl text-xs font-medium text-[#b5e3c4] focus:ring-2 focus:ring-[#b5e3c4]/30">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-[#191c1e] border-[#2b3031] rounded-xl font-sans">
                  <SelectItem
                    value="codeforcesHandle"
                    className="text-xs font-medium text-[#b5e3c4] focus:bg-[#b5e3c4]/[0.06] focus:text-[#f1f3ee]"
                  >
                    By Handle
                  </SelectItem>
                  <SelectItem
                    value="role"
                    className="text-xs font-medium text-[#b5e3c4] focus:bg-[#b5e3c4]/[0.06] focus:text-[#f1f3ee]"
                  >
                    By Role
                  </SelectItem>
                  <SelectItem
                    value="createdAt"
                    className="text-xs font-medium text-[#b5e3c4] focus:bg-[#b5e3c4]/[0.06] focus:text-[#f1f3ee]"
                  >
                    By Date
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>

      {/* Main List Area */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-xl bg-[#b5e3c4]" />
            <div className="text-xs font-medium text-[#929b98]">
              Matching members
            </div>
          </div>
          <div className="text-xs font-medium text-[#929b98]">
            Showing {totalFilteredUsers ? startIndex + 1 : 0}–{endIndex} of{" "}
            {totalFilteredUsers} members
            {ratingFilter !== "all" && ` (filtered from ${users.length})`}
          </div>
        </div>

        <div className="bg-[#191c1e] border border-[#2b3031] rounded-xl overflow-hidden shadow-none">
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full">
            <UserTable
              users={paginatedUsers}
              loadingStats={false}
              statsDialogId={statsDialog.userId}
              updatingId={updating}
              onFetchStats={fetchUserStats}
              onRoleUpdate={handleUserRoleUpdate}
            />
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4 p-5">
            <UserMobileCards
              users={paginatedUsers}
              loadingStats={false}
              statsDialogId={statsDialog.userId}
              updatingId={updating}
              onFetchStats={fetchUserStats}
              onRoleUpdate={handleUserRoleUpdate}
              searchTerm={searchTerm}
            />
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3.5 border-t border-[#2b3031] bg-black/10">
              {/* Page Size Selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-[#929b98]">
                  Rows per page
                </span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="h-10 w-16 bg-[#101214] border-[#2b3031] rounded-xl text-xs font-medium text-[#b5e3c4] focus:ring-2 focus:ring-[#b5e3c4]/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#191c1e] border-[#2b3031] rounded-xl font-sans">
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem
                        key={size}
                        value={String(size)}
                        className="text-xs font-medium text-[#b5e3c4]"
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Page Info & Navigation */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#929b98] mr-2">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="size-10 rounded-xl bg-transparent border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] disabled:opacity-30 shrink-0"
                >
                  <ChevronsLeft size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="size-10 rounded-xl bg-transparent border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] disabled:opacity-30 shrink-0"
                >
                  <ChevronLeft size={12} />
                </Button>

                {/* Page number buttons */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .reduce<(number | "ellipsis")[]>((acc, page, idx) => {
                      if (
                        idx > 0 &&
                        page - (acc[acc.length - 1] as number) > 1
                      ) {
                        acc.push("ellipsis");
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "ellipsis" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="text-xs font-medium text-[#929b98] px-1 font-sans"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={item}
                          variant="ghost"
                          size="icon"
                          onClick={() => goToPage(item as number)}
                          className={cn(
                            "size-10 rounded-xl text-xs font-medium font-sans transition-all border",
                            currentPage === item
                              ? "bg-[#b5e3c4] text-[#14241b] hover:bg-[#b5e3c4] border-transparent"
                              : "bg-transparent border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4]",
                          )}
                        >
                          {item}
                        </Button>
                      ),
                    )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="size-10 rounded-xl bg-transparent border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] disabled:opacity-30 shrink-0"
                >
                  <ChevronRight size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="size-10 rounded-xl bg-transparent border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] disabled:opacity-30 shrink-0"
                >
                  <ChevronsRight size={12} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <RoleConfirmationDialog
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
        updating={updating}
        handleConfirmRoleChange={handleConfirmRoleChange}
      />

      <UserProfileDialog
        userId={statsDialog.userId}
        open={statsDialog.open}
        onOpenChange={(open) =>
          !open && setStatsDialog({ open: false, userId: null })
        }
      />
    </div>
  );
}
