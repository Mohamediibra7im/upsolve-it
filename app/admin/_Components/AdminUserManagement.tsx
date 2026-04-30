'use client';

import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Crown, Shield, User as UserIcon, Search, ArrowUpDown, Loader2 } from 'lucide-react';
import { useToast } from '@/app/_Components/Toast';
import { useAdminUsers, updateUserRole } from '@/hooks/useAdminUsers';
import { apiFetcher } from '@/lib/apiClient';
import { User } from '@/types/User';

// Import new modular components
import { UserTable } from './UserTable';
import { UserMobileCards } from './UserMobileCards';
import { RoleConfirmationDialog } from './RoleConfirmationDialog';
import { UserStatsDialog } from './UserStatsDialog';

const getRankColor = (rating: number): string => {
  if (rating === 0) return 'text-gray-500';
  if (rating < 1200) return 'text-gray-600';
  if (rating < 1400) return 'text-green-600';
  if (rating < 1600) return 'text-cyan-600';
  if (rating < 1900) return 'text-blue-600';
  if (rating < 2100) return 'text-purple-600';
  if (rating < 2300) return 'text-yellow-600';
  if (rating < 2400) return 'text-orange-600';
  if (rating < 2600) return 'text-red-600';
  if (rating < 3000) return 'text-red-700';
  return 'text-red-800';
};

interface ConfirmationDialog {
  open: boolean;
  user: User | null;
  newRole: 'admin' | 'user' | null;
}

interface UserStats {
  user: {
    codeforcesHandle: string;
    rating: number;
    rank: string;
    maxRating: number;
    maxRank: string;
  };
  stats: {
    totalSessions: number;
    totalProblems: number;
    solvedProblems: number;
    upsolvedCount: number;
    upsolvedSolvedCount: number;
    averagePerformance: number;
    bestPerformance: number;
    worstPerformance: number;
    solvingRate: number;
    averageRating: number;
    recentTrend: number;
    recentSessions: number;
  };
  trainings: Array<{
    id: string;
    startTime: number;
    endTime: number;
    performance: number;
    problemsCount: number;
    solvedCount: number;
  }>;
}

type SortField = 'createdAt' | 'name';
type SortOrder = 'asc' | 'desc';

export default function AdminUserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
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
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const { toast } = useToast();

  // Use the optimized hook instead of manual fetching
  const { users, isLoading, isError, mutate } = useAdminUsers();

  // Move helper logic outside the main component to reduce complexity
  const parseDate = (dateStr: string | undefined): number => {
    if (!dateStr) return 0;
    const parsed = Date.parse(dateStr);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  // Memoized filtered and sorted users
  const filteredAndSortedUsers = useMemo(() => {
    // 1. Filter
    let result = users.filter((user: User) => {
      const handle = user.codeforcesHandle || '';
      return handle.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // 2. Sort
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
  }, [users, searchTerm, sortBy, sortOrder]);

  // Handle error state
  useEffect(() => {
    if (isError) {
      toast({
        title: "❌ Failed to Load Users",
        description: "Unable to fetch user data. Please try refreshing the page.",
        variant: "destructive",
        durationMs: 4000
      });
    }
  }, [isError, toast]);

  const fetchUserStats = async (userId: string) => {
    setLoadingStats(true);
    try {
      const data = await apiFetcher<UserStats>(`/api/admin/users/${userId}/stats`);
      setUserStats(data);
      setStatsDialog({ open: true, userId });
    } catch (error) {
      toast({
        title: "❌ Failed to Load Statistics",
        description: error instanceof Error ? error.message : "Unable to fetch user statistics. Please try again.",
        variant: "destructive",
        durationMs: 4000
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleUserRoleUpdate = async (userId: string, newRole: 'admin' | 'user') => {
    if (updating) return;

    const user = users.find((u: User) => u._id === userId);
    if (!user) return;

    // Open confirmation dialog instead of using browser confirm
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

      // Refresh the data using SWR mutate
      await mutate();

      // Beautiful success toast
      const isPromotion = newRole === 'admin';
      toast({
        title: isPromotion ? "🎉 User Promoted Successfully!" : "✅ User Role Updated!",
        description: isPromotion
          ? `${user.codeforcesHandle} is now an administrator with full access to admin features.`
          : `${user.codeforcesHandle} has been demoted to a regular user account.`,
        variant: "success",
        durationMs: 5000
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "❌ Role Update Failed",
        description: error instanceof Error ? error.message : 'Failed to update user role. Please try again.',
        variant: "destructive",
        durationMs: 4000
      });
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Loading users...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header Stats */}
      <div className="bg-card/20 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/40">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-500 font-black uppercase tracking-widest px-4 py-2 rounded-xl text-[10px]">
            <UserIcon className="h-4 w-4 mr-2" />
            <span className="text-sm">{users.length}</span>
            <span className="ml-2">Active Entities</span>
          </Badge>
          <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-500 font-black uppercase tracking-widest px-4 py-2 rounded-xl text-[10px]">
            <Crown className="h-4 w-4 mr-2" />
            <span className="text-sm">{users.filter((u: User) => u.role === 'admin').length}</span>
            <span className="ml-2">Command Staff</span>
          </Badge>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-500" />
            </div>
            <Input
              type="text"
              placeholder="Query Personnel by Codeforces Handle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-card/20 backdrop-blur-xl border-border/40 focus:border-primary/50 rounded-2xl font-medium tracking-tight text-lg shadow-2xl shadow-black/5"
            />
            {searchTerm && (
              <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground font-black uppercase tracking-tighter text-[10px] rounded-lg">
                {filteredAndSortedUsers.length} Matches Found
              </Badge>
            )}
          </div>
          <div className="flex gap-4">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortField)}>
              <SelectTrigger className="w-[200px] h-14 bg-card/20 backdrop-blur-xl border-border/40 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort Parameters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="codeforcesHandle">Handle</SelectItem>
                <SelectItem value="role">Clearance Level</SelectItem>
                <SelectItem value="createdAt">Arrival Date</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-14 w-14 bg-card/20 backdrop-blur-xl border-border/40 rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all duration-500"
            >
              <ArrowUpDown className={`h-5 w-5 transition-transform duration-500 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
      {/* Users List */}
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase">Personnel Registry</h2>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Authorized Access Control</p>
            </div>
          </div>
          {searchTerm && (
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black text-[10px] uppercase px-3 py-1">
              Active Search Filter
            </Badge>
          )}
        </div>

        <div className="w-full">
          {/* Desktop Table View */}
          <div className="hidden lg:block w-full">
            <UserTable
              users={filteredAndSortedUsers}
              loadingStats={loadingStats}
              statsDialogId={statsDialog.userId}
              updatingId={updating}
              onFetchStats={fetchUserStats}
              onRoleUpdate={handleUserRoleUpdate}
            />
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4 p-4">
            <UserMobileCards
              users={filteredAndSortedUsers}
              loadingStats={loadingStats}
              statsDialogId={statsDialog.userId}
              updatingId={updating}
              onFetchStats={fetchUserStats}
              onRoleUpdate={handleUserRoleUpdate}
              searchTerm={searchTerm}
            />
          </div>
        </div>
      </div>

      {/* User Interaction Dialogs */}
      <RoleConfirmationDialog
        confirmDialog={confirmDialog}
        setConfirmDialog={setConfirmDialog}
        updating={updating}
        handleConfirmRoleChange={handleConfirmRoleChange}
      />

      <UserStatsDialog
        statsDialog={statsDialog}
        setStatsDialog={setStatsDialog}
        userStats={userStats}
      />
    </div>
  );
}









