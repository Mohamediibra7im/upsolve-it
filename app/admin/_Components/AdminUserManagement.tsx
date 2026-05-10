'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Crown, Shield, Search, ArrowUpDown, Loader2, Users } from 'lucide-react';
import { useToast } from '@/components/providers/Toast';
import { useAdminUsers, updateUserRole } from '@/hooks/admin/useAdminUsers';
import { apiFetcher } from '@/lib/apiClient';
import { User } from '@/types/User';
import type { UserTrainingStatsView } from '@/types/userTrainingStats';

// Import new modular components
import { UserTable } from './UserTable';
import { UserMobileCards } from './UserMobileCards';
import { RoleConfirmationDialog } from './RoleConfirmationDialog';
import { UserStatsDialog } from './UserStatsDialog';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
  const [userStats, setUserStats] = useState<UserTrainingStatsView | null>(null);
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
      const data = await apiFetcher<UserTrainingStatsView>(`/api/admin/users/${userId}/stats`);
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
      {/* Page Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
            <Shield size={12} />
            System Administration
          </div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Member Directory</h2>
          <p className="text-xs text-muted-foreground font-medium max-w-md">Manage user permissions, monitor performance metrics, and oversee the community registry.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-secondary/50 border border-border flex items-center gap-3">
            <div className="flex -space-x-2">
              {users.slice(0, 3).map((u: User, i) => (
                <div key={u._id} className="h-6 w-6 rounded-full border-2 border-background bg-secondary overflow-hidden">
                  <img src={u.avatar} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-[10px] font-bold text-muted-foreground">
              {users.length} Active Members
            </div>
          </div>
        </div>
      </div>

      {/* Registry Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-card border-border p-6 rounded-2xl group">
          <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 rounded-full" />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Users size={20} />
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tabular-nums">{users.length}</div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Total Registered Users</div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-card border-border p-6 rounded-2xl group">
          <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/10 blur-[50px] -mr-16 -mt-16 rounded-full" />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Crown size={20} />
            </div>
            <div>
              <div className="text-3xl font-black text-foreground tabular-nums">
                {users.filter((u: User) => u.role === 'admin').length}
              </div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Platform Administrators</div>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2 relative overflow-hidden bg-card border-border p-6 rounded-2xl group">
          <div className="relative z-10 h-full flex flex-col justify-center gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <ArrowUpDown size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">Advanced Filter</div>
                  <div className="text-[10px] font-medium text-muted-foreground">Refine user list and sort parameters</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="h-10 w-10 bg-secondary/50 border border-border rounded-xl hover:bg-secondary"
                >
                  <ArrowUpDown size={16} className={cn("transition-transform", sortOrder === 'desc' ? "rotate-180" : "")} />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative group/search flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                <Input
                  placeholder="Search handle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 pl-10 bg-background/50 border-border rounded-xl text-sm focus:ring-primary/20"
                />
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortField)}>
                <SelectTrigger className="h-11 bg-background/50 border-border rounded-xl text-[10px] font-bold uppercase tracking-widest focus:ring-primary/20">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-xl">
                  <SelectItem value="codeforcesHandle" className="text-[10px] font-bold uppercase tracking-widest">By Handle</SelectItem>
                  <SelectItem value="role" className="text-[10px] font-bold uppercase tracking-widest">By Role</SelectItem>
                  <SelectItem value="createdAt" className="text-[10px] font-bold uppercase tracking-widest">By Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>

      {/* Main List Area */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Live Registry Result</div>
          </div>
          <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
            Showing {filteredAndSortedUsers.length} of {users.length} members
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
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
          <div className="lg:hidden space-y-4 p-6">
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

      {/* Interaction Dialogs */}
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









