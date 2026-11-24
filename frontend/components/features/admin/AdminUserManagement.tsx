"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHead, Stat } from "@/components/ui/kit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/providers/Toast";
import { UserProfileDialog } from "@/components/features/profile";
import {
  useAdminUsers,
  updateUserRole,
  deleteUser,
  syncBatchUserRatings,
} from "@/hooks/admin/useAdminUsers";
import { cn } from "@/lib/utils";
import { RANKS, rankName } from "@/utils/rank";
import { AdminPager } from "./AdminPager";
import { AdminState, AdminRetry } from "./AdminState";
import {
  RoleConfirmationDialog,
  type RoleChange,
} from "./RoleConfirmationDialog";
import { UserTable } from "./UserTable";
import { DeleteUserDialog, nameOf } from "./DeleteUserDialog";
import type { User } from "@/types/User";

const SORTS = {
  newest: "Newest first",
  oldest: "Oldest first",
  "handle-asc": "Handle A to Z",
  "handle-desc": "Handle Z to A",
} as const;
type Sort = keyof typeof SORTS;

const joined = (createdAt?: string) => Date.parse(createdAt ?? "") || 0;

export default function AdminUserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [rankFilter, setRankFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [updating, setUpdating] = useState<string | null>(null);
  const [roleChange, setRoleChange] = useState<RoleChange | null>(null);
  const [statsUserId, setStatsUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { users, isLoading, isError, mutate } = useAdminUsers();

  const matching = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const direction = sort === "oldest" || sort === "handle-asc" ? 1 : -1;
    return users
      .filter(
        (user) =>
          `${user.codeforcesHandle ?? ""} ${user.username ?? ""}`
            .toLowerCase()
            .includes(term) &&
          (rankFilter === "all" || rankName(user.rating) === rankFilter),
      )
      .sort(
        (a, b) =>
          direction *
          (sort.startsWith("handle")
            ? (a.codeforcesHandle || "").localeCompare(b.codeforcesHandle || "")
            : joined(a.createdAt) - joined(b.createdAt)),
      );
  }, [users, searchTerm, rankFilter, sort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rankFilter, sort, pageSize]);

  const totalPages = Math.max(1, Math.ceil(matching.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  const pageUsers = matching.slice(start, start + pageSize);
  const admins = users.filter((user) => user.role === "admin").length;

  const syncPageRatings = async () => {
    setIsSyncing(true);
    try {
      const result = await syncBatchUserRatings(pageUsers.map((u) => u._id));
      await mutate();
      toast({
        title: "Ratings synced with Codeforces.",
        description: `Updated ${result.synced} of the users on this page.`,
        variant: "success",
        durationMs: 4000,
      });
    } catch (error) {
      toast({
        title: "Sync failed.",
        description:
          error instanceof Error
            ? error.message
            : "Codeforces did not answer. Try again in a minute.",
        variant: "destructive",
        durationMs: 4000,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const confirmRoleChange = async () => {
    if (!roleChange) return;
    const { user, newRole } = roleChange;
    setUpdating(user._id);
    setRoleChange(null);

    try {
      await updateUserRole(user._id, newRole);
      await mutate();
      toast({
        title:
          newRole === "admin"
            ? `${user.codeforcesHandle} is now an admin.`
            : `${user.codeforcesHandle} is no longer an admin.`,
        variant: "success",
        durationMs: 5000,
      });
    } catch (error) {
      toast({
        title: "The role did not change.",
        description:
          error instanceof Error ? error.message : "Try again in a minute.",
        variant: "destructive",
        durationMs: 4000,
      });
    } finally {
      setUpdating(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const name = nameOf(deleting);
    setIsDeleting(true);
    try {
      await deleteUser(deleting._id);
      await mutate();
      setDeleting(null);
      toast({
        title: `${name} was deleted.`,
        description: "The account and everything in it are gone.",
        variant: "success",
        durationMs: 5000,
      });
    } catch (error) {
      toast({
        title: "The account was not deleted.",
        description:
          error instanceof Error ? error.message : "Try again in a minute.",
        variant: "destructive",
        durationMs: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PageHead eyebrow="Admin" title="Users">
        <Button
          onClick={syncPageRatings}
          disabled={isSyncing || pageUsers.length === 0}
        >
          <RefreshCw className={cn(isSyncing && "animate-spin")} />
          {isSyncing ? "Syncing…" : "Sync this page with Codeforces"}
        </Button>
      </PageHead>

      {isLoading ? (
        <AdminState tone="loading" title="Loading users…" />
      ) : isError ? (
        <AdminState
          tone="error"
          title="The users did not load"
          description="The server did not answer. Try again in a minute."
          action={<AdminRetry onRetry={() => mutate()} />}
        />
      ) : (
        <div className="grid gap-6">
          <div className="u-panel u-strip">
            <Stat label="Users" value={users.length} />
            <Stat label="Admins" value={admins} />
            <Stat
              label="Matching"
              value={matching.length}
              sub="After search and rank filter"
            />
          </div>

          <section className="u-panel" aria-label="Users">
            <div className="u-panel__head">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
                <Input
                  type="search"
                  aria-label="Search by handle"
                  placeholder="Search by handle"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full sm:w-64"
                />
                <Select value={rankFilter} onValueChange={setRankFilter}>
                  <SelectTrigger
                    aria-label="Filter by rank"
                    className="h-10 w-full sm:w-56"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ranks</SelectItem>
                    <SelectItem value={rankName(0)}>{rankName(0)}</SelectItem>
                    {RANKS.map((rank) => (
                      <SelectItem key={rank.name} value={rank.name}>
                        {rank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={sort}
                  onValueChange={(value) => setSort(value as Sort)}
                >
                  <SelectTrigger
                    aria-label="Sort users"
                    className="h-10 w-full sm:w-44"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SORTS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="t-sm t-num t-muted">
                {matching.length ? start + 1 : 0}–{start + pageUsers.length} of{" "}
                {matching.length}
              </span>
            </div>

            {pageUsers.length ? (
              <UserTable
                users={pageUsers}
                updatingId={updating}
                onFetchStats={setStatsUserId}
                onRoleUpdate={(user, newRole) =>
                  setRoleChange({ user, newRole })
                }
                onDelete={setDeleting}
              />
            ) : (
              <AdminState
                title="No users match"
                description="Try another handle or a wider rank filter."
                className="border-0"
              />
            )}

            <AdminPager
              page={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPage={setCurrentPage}
              onPageSize={setPageSize}
            />
          </section>
        </div>
      )}

      <RoleConfirmationDialog
        change={roleChange}
        onClose={() => setRoleChange(null)}
        onConfirm={confirmRoleChange}
      />

      <DeleteUserDialog
        user={deleting}
        isDeleting={isDeleting}
        onClose={() => !isDeleting && setDeleting(null)}
        onConfirm={confirmDelete}
      />

      <UserProfileDialog
        statsBase="/api/admin/users"
        userId={statsUserId}
        open={!!statsUserId}
        onOpenChange={(open) => !open && setStatsUserId(null)}
      />
    </>
  );
}
