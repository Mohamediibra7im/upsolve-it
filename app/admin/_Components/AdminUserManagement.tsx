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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Metric Cards - 1/4 width each */}
        <Card className="border-white/5 bg-card/20 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <UserIcon size={120} />
          </div>
          <div className="flex flex-col h-full justify-between">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 w-fit">
              <UserIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="mt-6">
              <div className="text-4xl font-black tracking-tighter text-foreground leading-none">{users.length}</div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">Total Personnel</div>
            </div>
          </div>
        </Card>

        <Card className="border-white/5 bg-card/20 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <Crown size={120} />
          </div>
          <div className="flex flex-col h-full justify-between">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 w-fit">
              <Crown className="h-5 w-5 text-purple-500" />
            </div>
            <div className="mt-6">
              <div className="text-4xl font-black tracking-tighter text-foreground leading-none">
                {users.filter((u: User) => u.role === 'admin').length}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">Command Staff</div>
            </div>
          </div>
        </Card>

        {/* Unified Search & Control - 2/4 width */}
        <Card className="lg:col-span-2 border-primary/10 bg-primary/5 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden border-dashed">
          <div className="flex flex-col h-full gap-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-primary/60 group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                type="text"
                placeholder="Query Registry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 h-14 bg-white/5 border-white/10 focus:border-primary/50 rounded-2xl font-bold tracking-tight text-lg shadow-inner"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortField)}>
                <SelectTrigger className="flex-1 min-w-[140px] h-12 bg-white/5 border-white/10 rounded-xl font-black uppercase tracking-widest text-[9px]">
                  <ArrowUpDown className="h-3 w-3 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="codeforcesHandle">Handle</SelectItem>
                  <SelectItem value="role">Clearance</SelectItem>
                  <SelectItem value="createdAt">Arrival</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="h-12 w-12 bg-white/5 border-white/10 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all shrink-0"
              >
                <ArrowUpDown className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </Button>

              <Badge className="h-12 px-4 bg-primary/20 text-primary border border-primary/30 font-black uppercase tracking-tighter text-[9px] rounded-xl flex items-center shrink-0">
                {filteredAndSortedUsers.length} TARGETS
              </Badge>
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









