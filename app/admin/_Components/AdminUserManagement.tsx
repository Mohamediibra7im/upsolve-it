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
import { Crown, Shield, User as UserIcon, Search, ArrowUpDown, Loader2 } from 'lucide-react';
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
    <div className="space-y-12">
      {/* Integrated Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Metric Cards */}
        <Card className="group relative border-none bg-gradient-to-br from-blue-600/20 to-blue-900/20 backdrop-blur-3xl rounded-[3rem] p-8 overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-125 transition-transform duration-700 pointer-events-none">
            <UserIcon size={180} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between gap-8">
            <div className="flex items-center justify-between">
              <div className="h-14 w-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-500/10">
                <UserIcon className="h-7 w-7" />
              </div>
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
            </div>
            <div>
              <div className="text-6xl font-black tracking-tighter text-foreground leading-none group-hover:text-blue-400 transition-colors">{users.length}</div>
              <div className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mt-3">Personnel Registry</div>
            </div>
          </div>
        </Card>

        <Card className="group relative border-none bg-gradient-to-br from-amber-600/20 to-amber-900/20 backdrop-blur-3xl rounded-[3rem] p-8 overflow-hidden shadow-2xl transition-all duration-500 hover:scale-[1.02]">
          <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:scale-125 transition-transform duration-700 pointer-events-none">
            <Crown size={180} />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between gap-8">
            <div className="flex items-center justify-between">
              <div className="h-14 w-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
                <Crown className="h-7 w-7" />
              </div>
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
            </div>
            <div>
              <div className="text-6xl font-black tracking-tighter text-foreground leading-none group-hover:text-amber-400 transition-colors">
                {users.filter((u: User) => u.role === 'admin').length}
              </div>
              <div className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mt-3">Authorized Officers</div>
            </div>
          </div>
        </Card>

        {/* Unified Search & Control Console */}
        <Card className="lg:col-span-2 border-primary/10 bg-card/20 backdrop-blur-3xl rounded-[3rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
          <div className="flex flex-col h-full gap-8 relative z-10">
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-primary/40 group-focus-within/input:text-primary transition-colors duration-300" />
              </div>
              <Input
                type="text"
                placeholder="Initialize Personnel Query..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-16 h-16 bg-white/5 border-white/5 focus:border-primary/40 focus:ring-primary/20 rounded-2xl font-bold tracking-tight text-xl shadow-inner transition-all duration-300"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortField)}>
                  <SelectTrigger className="h-14 bg-white/5 border-white/5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] focus:ring-primary/20">
                    <div className="flex items-center gap-3">
                      <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                      <SelectValue placeholder="Sort Parameters" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10 rounded-2xl">
                    <SelectItem value="codeforcesHandle" className="text-[10px] font-black uppercase tracking-widest">Sort by Handle</SelectItem>
                    <SelectItem value="role" className="text-[10px] font-black uppercase tracking-widest">Sort by Clearance</SelectItem>
                    <SelectItem value="createdAt" className="text-[10px] font-black uppercase tracking-widest">Sort by Arrival</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="h-14 w-14 bg-white/5 border-white/5 rounded-2xl hover:bg-primary/20 hover:text-primary hover:border-primary/40 transition-all duration-300 group/sort"
              >
                <ArrowUpDown className={cn("h-5 w-5 transition-transform duration-500", sortOrder === 'desc' ? 'rotate-180' : '')} />
              </Button>

              <div className="h-14 px-6 bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl flex items-center shadow-lg shadow-primary/5">
                {filteredAndSortedUsers.length} Units Found
              </div>
            </div>
          </div>
        </Card>
      </div>
      {/* Users List Interface */}
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-[1.25rem] bg-accent/10 flex items-center justify-center text-accent border border-accent/20 shadow-lg">
              <Shield size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase text-foreground leading-none">Personnel Registry</h2>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-2 opacity-60">Authorized Access Matrix</p>
            </div>
          </div>
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









