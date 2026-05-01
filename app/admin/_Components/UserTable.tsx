'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Crown, 
  User as UserIcon, 
  Star, 
  ExternalLink, 
  Loader2, 
  Calendar, 
  BarChart, 
  Shield,
  Clock,
  ChevronRight
} from 'lucide-react';
import { User } from '@/types/User';
import getRankFromRating from '@/utils/getRankFromRating';
import { cn } from '@/lib/utils';

const getRankColor = (rating: number): string => {
  if (rating === 0) return 'text-zinc-500';
  if (rating < 1200) return 'text-zinc-400';
  if (rating < 1400) return 'text-emerald-500';
  if (rating < 1600) return 'text-cyan-500';
  if (rating < 1900) return 'text-blue-500';
  if (rating < 2100) return 'text-violet-500';
  if (rating < 2300) return 'text-amber-500';
  if (rating < 2400) return 'text-orange-500';
  if (rating < 2600) return 'text-red-500';
  if (rating < 3000) return 'text-red-600';
  return 'text-red-700';
};

interface UserTableProps {
  users: User[];
  loadingStats: boolean;
  statsDialogId: string | null;
  updatingId: string | null;
  onFetchStats: (id: string) => void;
  onRoleUpdate: (id: string, role: 'admin' | 'user') => void;
}

export function UserTable({ 
  users, 
  loadingStats, 
  statsDialogId, 
  updatingId, 
  onFetchStats, 
  onRoleUpdate 
}: Readonly<UserTableProps>) {
  return (
    <div className="rounded-[2.5rem] border border-white/5 bg-card/10 backdrop-blur-3xl overflow-hidden shadow-2xl">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/5 bg-white/[0.02] hover:bg-white/[0.02]">
            <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Personnel</TableHead>
            <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Clearance</TableHead>
            <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Performance</TableHead>
            <TableHead className="h-16 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Registry Date</TableHead>
            <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right">Operations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user._id}
              className="group border-b border-white/5 hover:bg-white/[0.03] transition-all duration-300"
            >
              {/* User Identity */}
              <TableCell className="px-8 py-6">
                <div className="flex items-center gap-5">
                  <div className="relative group-hover:scale-110 transition-transform duration-500">
                    <Avatar className="h-14 w-14 rounded-2xl border-2 border-white/10 group-hover:border-primary/50 transition-colors shadow-2xl">
                      <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-black text-sm">
                        {user.codeforcesHandle?.slice(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#09090b] shadow-lg" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-black tracking-tight text-foreground hover:text-primary transition-colors flex items-center gap-2 group/link"
                      >
                        {user.codeforcesHandle || "Anonymous"}
                        <ExternalLink size={14} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
                      <Shield size={10} />
                      ID: {user._id.slice(-12)}
                    </div>
                  </div>
                </div>
              </TableCell>

              {/* Role/Clearance */}
              <TableCell className="px-6 py-6">
                <Badge
                  className={cn(
                    "px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[9px] border shadow-lg transition-all duration-500 group-hover:scale-105",
                    user.role === 'admin'
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-white/5 text-muted-foreground border-white/10"
                  )}
                >
                  {user.role === 'admin' ? <Crown className="h-3 w-3 mr-2" /> : <UserIcon className="h-3 w-3 mr-2" />}
                  {user.role}
                </Badge>
              </TableCell>

              {/* Rating/Performance */}
              <TableCell className="px-6 py-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    <span className="text-xl font-black tracking-tighter text-foreground">
                      {user.rating || 0}
                    </span>
                  </div>
                  <div className={cn(
                    "text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                    getRankColor(user.rating)
                  )}>
                    {getRankFromRating(user.rating)}
                  </div>
                </div>
              </TableCell>

              {/* Created Date */}
              <TableCell className="px-6 py-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-foreground font-bold text-sm tracking-tight">
                    <Calendar size={14} className="text-primary/60" />
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest pl-5">
                    <Clock size={10} />
                    {user.createdAt ? new Date(user.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '--:--'}
                  </div>
                </div>
              </TableCell>

              {/* Operations */}
              <TableCell className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onFetchStats(user._id)}
                    disabled={loadingStats}
                    className="h-11 px-5 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all font-black text-[10px] uppercase tracking-widest group/btn"
                  >
                    {loadingStats && statsDialogId === user._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <BarChart size={16} className="mr-2 opacity-60 group-hover/btn:opacity-100" />
                        Intelligence
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRoleUpdate(user._id, user.role === 'admin' ? 'user' : 'admin')}
                    disabled={updatingId === user._id}
                    className={cn(
                      "h-11 px-5 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest group/btn",
                      user.role === 'admin'
                        ? "bg-orange-500/5 border-orange-500/10 text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/30"
                        : "bg-emerald-500/5 border-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30"
                    )}
                  >
                    {updatingId === user._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {user.role === 'admin' ? (
                          <UserIcon size={16} className="mr-2 opacity-60 group-hover/btn:opacity-100" />
                        ) : (
                          <Crown size={16} className="mr-2 opacity-60 group-hover/btn:opacity-100" />
                        )}
                        {user.role === 'admin' ? "Revoke" : "Authorize"}
                      </>
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
