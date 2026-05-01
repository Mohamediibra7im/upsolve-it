'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Crown, 
  User as UserIcon, 
  ExternalLink, 
  Loader2, 
  BarChart, 
  Shield,
  Clock
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

interface UserMobileCardsProps {
  users: User[];
  loadingStats: boolean;
  statsDialogId: string | null;
  updatingId: string | null;
  onFetchStats: (id: string) => void;
  onRoleUpdate: (id: string, role: 'admin' | 'user') => void;
  searchTerm: string;
}

export function UserMobileCards({ 
  users, 
  loadingStats, 
  statsDialogId, 
  updatingId, 
  onFetchStats, 
  onRoleUpdate, 
  searchTerm 
}: Readonly<UserMobileCardsProps>) {
  if (users.length === 0) {
    return (
      <div className="text-center py-24 space-y-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative p-8 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl">
            <UserIcon className="h-16 w-16 text-muted-foreground/40 mx-auto" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black tracking-tight text-foreground uppercase">Zero Matches</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            {searchTerm ? `Registry contains no entities for "${searchTerm}"` : 'The registry is currently empty'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {users.map((user) => (
        <Card key={user._id} className="border-white/5 bg-card/20 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl group active:scale-[0.98] transition-all">
          <CardContent className="p-8 space-y-8">
            {/* Header: Avatar & Identity */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar className="h-16 w-16 rounded-2xl border-2 border-white/10 shadow-2xl">
                  <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
                  <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">
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
                    className="text-xl font-black tracking-tight text-foreground flex items-center gap-2"
                  >
                    {user.codeforcesHandle || "Anonymous"}
                    <ExternalLink size={14} className="opacity-40" />
                  </a>
                </div>
                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
                  <Shield size={10} />
                  ID: {user._id.slice(-8)}
                </div>
              </div>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <div className="text-xl font-black text-foreground leading-none">{user.rating || 0}</div>
                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-3">Current Rating</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                <div className={cn("text-sm font-black uppercase tracking-tight leading-tight", getRankColor(user.rating))}>
                  {getRankFromRating(user.rating)}
                </div>
                <div className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-3">Personnel Rank</div>
              </div>
            </div>

            {/* Tags & Meta */}
            <div className="flex flex-wrap gap-2">
              <Badge className={cn(
                "px-3 py-1 rounded-lg font-black uppercase tracking-widest text-[7px] border",
                user.role === 'admin' ? "bg-primary/10 text-primary border-primary/20" : "bg-white/5 text-muted-foreground border-white/10"
              )}>
                {user.role === 'admin' ? <Crown size={9} className="mr-1.5" /> : <UserIcon size={9} className="mr-1.5" />}
                {user.role}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 rounded-lg font-black uppercase tracking-widest text-[7px] border-white/5 bg-white/5">
                <Clock size={9} className="mr-1.5" />
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Badge>
            </div>

            {/* Operations */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => onFetchStats(user._id)}
                disabled={loadingStats}
                className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:text-primary transition-all font-black text-[9px] uppercase tracking-widest"
              >
                {loadingStats && statsDialogId === user._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <BarChart size={14} className="mr-2 opacity-60" />
                    Intelligence
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => onRoleUpdate(user._id, user.role === 'admin' ? 'user' : 'admin')}
                disabled={updatingId === user._id}
                className={cn(
                  "flex-1 h-12 rounded-xl border transition-all font-black text-[9px] uppercase tracking-widest",
                  user.role === 'admin'
                    ? "bg-orange-500/5 border-orange-500/10 text-orange-500"
                    : "bg-emerald-500/5 border-emerald-500/10 text-emerald-500"
                )}
              >
                {updatingId === user._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {user.role === 'admin' ? <UserIcon size={14} className="mr-2 opacity-60" /> : <Crown size={14} className="mr-2 opacity-60" />}
                    {user.role === 'admin' ? "Revoke" : "Authorize"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
