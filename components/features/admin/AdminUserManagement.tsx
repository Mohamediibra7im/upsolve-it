'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Crown, Shield, Search, ArrowUpDown, Loader2, Users, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/providers/Toast';
import { useAdminUsers, updateUserRole, syncBatchUserRatings } from '@/hooks/admin/useAdminUsers';
import { User } from '@/types/User';

import { UserTable } from './UserTable';
import { UserMobileCards } from './UserMobileCards';
import { RoleConfirmationDialog } from './RoleConfirmationDialog';
import { UserProfileDialog } from '@/components/features/profile';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const RATING_FILTERS = [
  { label: 'ALL RATINGS', value: 'all', min: -1, max: Infinity },
  { label: 'UNRATED', value: 'unrated', min: 0, max: 0 },
  { label: 'NEWBIE (< 1200)', value: 'newbie', min: 1, max: 1199 },
  { label: 'PUPIL (1200–1399)', value: 'pupil', min: 1200, max: 1399 },
  { label: 'SPECIALIST (1400–1599)', value: 'specialist', min: 1400, max: 1599 },
  { label: 'EXPERT (1600–1899)', value: 'expert', min: 1600, max: 1899 },
  { label: 'CANDIDATE MASTER (1900–2099)', value: 'cm', min: 1900, max: 2099 },
  { label: 'MASTER (2100–2299)', value: 'master', min: 2100, max: 2299 },
  { label: 'INTERNATIONAL MASTER (2300–2399)', value: 'im', min: 2300, max: 2399 },
  { label: 'GRANDMASTER (2400–2599)', value: 'gm', min: 2400, max: 2599 },
  { label: 'INTL. GRANDMASTER (2600–2999)', value: 'igm', min: 2600, max: 2999 },
  { label: 'LEGENDARY GM (3000+)', value: 'lgm', min: 3000, max: Infinity },
] as const;

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

interface ConfirmationDialog {
  open: boolean;
  user: User | null;
  newRole: 'admin' | 'user' | null;
}

type SortField = 'createdAt' | 'name';
type SortOrder = 'asc' | 'desc';
type RatingFilterValue = typeof RATING_FILTERS[number]['value'];

export default function AdminUserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [ratingFilter, setRatingFilter] = useState<RatingFilterValue>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    open: false,
    user: null,
    newRole: null
  });
  const [statsDialog, setStatsDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null
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
      const handle = user.codeforcesHandle || '';
      return handle.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (ratingFilter !== 'all') {
      const filterConfig = RATING_FILTERS.find(f => f.value === ratingFilter);
      if (filterConfig) {
        result = result.filter((user: User) => {
          const rating = user.rating || 0;
          if (filterConfig.value === 'unrated') return rating === 0;
          return rating >= filterConfig.min && rating <= filterConfig.max;
        });
      }
    }

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison = parseDate(a.createdAt) - parseDate(b.createdAt);
      } else if (sortBy === 'name') {
        const nameA = (a.codeforcesHandle || '').toLowerCase();
        const nameB = (b.codeforcesHandle || '').toLowerCase();
        comparison = nameA.localeCompare(nameB);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
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
        title: "SYSOP: REGISTRY LOAD ERROR",
        description: "Unable to sync user registry data. Please reload the console.",
        variant: "destructive",
        durationMs: 4000
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
        title: "REGISTRY: RATINGS SYNCED",
        description: `Successfully synchronized Codeforces ratings for ${result.synced} user(s) on this page.`,
        variant: "success",
        durationMs: 4000
      });
    } catch (error) {
      toast({
        title: "SYS.ERR: BATCH SYNC FAILED",
        description: error instanceof Error ? error.message : "Unable to pull stats from Codeforces API.",
        variant: "destructive",
        durationMs: 4000
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUserRoleUpdate = async (userId: string, newRole: 'admin' | 'user') => {
    if (updating) return;

    const user = users.find((u: User) => u._id === userId);
    if (!user) return;

    setConfirmDialog({
      open: true,
      user,
      newRole
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

      const isPromotion = newRole === 'admin';
      toast({
        title: isPromotion ? "REGISTRY: ROLE PROMOTED" : "REGISTRY: ROLE UPDATED",
        description: isPromotion
          ? `${user.codeforcesHandle} has been granted administrator status.`
          : `${user.codeforcesHandle} has been set to regular user status.`,
        variant: "success",
        durationMs: 5000
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "SYS.ERR: ROLE ROTATION FAILED",
        description: error instanceof Error ? error.message : 'Failed to update user security clearance.',
        variant: "destructive",
        durationMs: 4000
      });
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 font-mono text-emerald-400">
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="size-5 animate-spin text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-widest">Loading user registry...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono text-emerald-400">
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500/40 font-bold text-[9px] uppercase tracking-widest">
            <Shield size={12} className="text-emerald-400" />
            SYSOP_DIRECTORY // REGISTRY_ACL
          </div>
          <h2 className="text-lg font-bold tracking-widest text-emerald-300 uppercase">Member Registry</h2>
          <p className="text-[10px] text-emerald-500/40 font-bold max-w-md uppercase tracking-wider">Manage user permissions, monitor performance logs, and edit the registry access controls.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-none bg-[#060a08]/30 border border-emerald-500/15 flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {users.slice(0, 3).map((u: User) => (
                <div key={u._id} className="size-5 rounded-none border border-emerald-500/20 bg-emerald-950/10 overflow-hidden shrink-0">
                  <Image src={u.avatar} alt="" width={20} height={20} unoptimized className="size-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">
              {users.length} ACTIVE_USERS
            </div>
          </div>

          <Button
            onClick={handleSyncBatchRatings}
            disabled={isSyncing || paginatedUsers.length === 0}
            className={cn(
              "h-8 px-3 rounded-none text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
              "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)] border-transparent",
              "disabled:opacity-40 disabled:pointer-events-none"
            )}
          >
            <RefreshCw size={10} className={cn(isSyncing ? "animate-spin" : "")} />
            {isSyncing ? "SYNCING..." : "[ SYNC_PAGE_RATINGS.EXE ]"}
          </Button>
        </div>
      </div>

      {/* Registry Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-none bg-[#060a08]/30 border-emerald-500/15 p-5 shadow-md">
          <div className="flex flex-col gap-3">
            <div className="size-8 rounded-none border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-center text-emerald-400 shrink-0">
              <Users size={16} />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-300 tabular-nums">{users.length}</div>
              <div className="text-[8px] font-bold text-emerald-500/35 uppercase tracking-widest mt-1">TOTAL_REGISTERED_USERS</div>
            </div>
          </div>
        </Card>

        <Card className="rounded-none bg-[#060a08]/30 border-emerald-500/15 p-5 shadow-md">
          <div className="flex flex-col gap-3">
            <div className="size-8 rounded-none border border-amber-500/20 bg-amber-955/10 flex items-center justify-center text-amber-500 shrink-0">
              <Crown size={16} />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400 tabular-nums">
                {users.filter((u: User) => u.role === 'admin').length}
              </div>
              <div className="text-[8px] font-bold text-emerald-500/35 uppercase tracking-widest mt-1">ADMINISTRATIVE_ROOTS</div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 rounded-none bg-[#060a08]/30 border-emerald-500/15 p-5 shadow-md">
          <div className="h-full flex flex-col justify-center gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-none border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <ArrowUpDown size={16} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Advanced Search filters</div>
                  <div className="text-[8px] font-bold text-emerald-500/30 uppercase tracking-wider">Refine directory search parameters</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="size-8 bg-transparent border border-emerald-500/15 rounded-none hover:bg-emerald-500/10 text-emerald-400 shrink-0"
              >
                <ArrowUpDown size={12} className={cn("transition-transform", sortOrder === 'desc' ? "rotate-180" : "")} />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative group/search flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-emerald-500/40 group-focus-within/search:text-emerald-400" />
                <Input
                  placeholder="SEARCH_HANDLE..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 pl-8 bg-[#040604]/50 border-emerald-500/15 rounded-none text-xs text-emerald-300 placeholder:text-emerald-500/25 focus:ring-0 focus:border-emerald-500/45 font-mono"
                />
              </div>
              <Select value={ratingFilter} onValueChange={(value) => setRatingFilter(value as RatingFilterValue)}>
                <SelectTrigger className="h-9 bg-[#040604]/50 border-emerald-500/15 rounded-none text-[9px] font-bold uppercase tracking-widest text-emerald-400 focus:ring-0">
                  <div className="flex items-center gap-1.5">
                    <Filter size={10} className="text-emerald-500/40 shrink-0" />
                    <SelectValue placeholder="FILTER_RATING" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#060a08] border-emerald-500/25 rounded-none font-mono">
                  {RATING_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value} className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-300">
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortField)}>
                <SelectTrigger className="h-9 bg-[#040604]/50 border-emerald-500/15 rounded-none text-[9px] font-bold uppercase tracking-widest text-emerald-400 focus:ring-0">
                  <SelectValue placeholder="SORT_BY" />
                </SelectTrigger>
                <SelectContent className="bg-[#060a08] border-emerald-500/25 rounded-none font-mono">
                  <SelectItem value="codeforcesHandle" className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-300">By Handle</SelectItem>
                  <SelectItem value="role" className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-300">By Role</SelectItem>
                  <SelectItem value="createdAt" className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-300">By Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>

      {/* Main List Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-none bg-emerald-500 animate-pulse" />
            <div className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">Live Registry Result</div>
          </div>
          <div className="text-[8px] font-bold text-emerald-500/30 uppercase tracking-widest">
            Showing {startIndex + 1}–{endIndex} of {totalFilteredUsers} members
            {ratingFilter !== 'all' && ` (filtered from ${users.length})`}
          </div>
        </div>

        <div className="bg-[#060a08]/30 border border-emerald-500/15 rounded-none overflow-hidden shadow-2xl">
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3.5 border-t border-emerald-500/15 bg-black/10">
              {/* Page Size Selector */}
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest">Rows per page</span>
                <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="h-8 w-16 bg-[#040604]/50 border-emerald-500/15 rounded-none text-[9px] font-bold text-emerald-400 focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#060a08] border-emerald-500/25 rounded-none font-mono">
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)} className="text-[9px] font-bold text-emerald-400">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Page Info & Navigation */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-widest mr-2">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="size-8 rounded-none bg-transparent border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-400 disabled:opacity-30 shrink-0"
                >
                  <ChevronsLeft size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="size-8 rounded-none bg-transparent border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-400 disabled:opacity-30 shrink-0"
                >
                  <ChevronLeft size={12} />
                </Button>

                {/* Page number buttons */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                      if (idx > 0 && page - (acc[acc.length - 1] as number) > 1) {
                        acc.push('ellipsis');
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span key={`ellipsis-${idx}`} className="text-[9px] font-bold text-emerald-500/25 px-1 font-mono">...</span>
                      ) : (
                        <Button
                          key={item}
                          variant="ghost"
                          size="icon"
                          onClick={() => goToPage(item as number)}
                          className={cn(
                            "size-8 rounded-none text-[9px] font-bold font-mono transition-all border",
                            currentPage === item
                              ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400 border-transparent"
                              : "bg-transparent border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-400"
                          )}
                        >
                          {item}
                        </Button>
                      )
                    )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="size-8 rounded-none bg-transparent border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-400 disabled:opacity-30 shrink-0"
                >
                  <ChevronRight size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="size-8 rounded-none bg-transparent border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-400 disabled:opacity-30 shrink-0"
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
        onOpenChange={(open) => !open && setStatsDialog({ open: false, userId: null })}
      />
    </div>
  );
}
