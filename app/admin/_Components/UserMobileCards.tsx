'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Crown, 
  User as UserIcon, 
  ExternalLink, 
  Loader2, 
  BarChart, 
  Shield} from 'lucide-react';
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

import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="text-center py-32 space-y-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
          <div className="relative p-10 rounded-[3rem] bg-white/5 border border-white/10 shadow-2xl backdrop-blur-3xl">
            <UserIcon className="h-20 w-20 text-muted-foreground/20 mx-auto" />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-3xl font-black tracking-tighter text-foreground uppercase">Registry Empty</h3>
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 max-w-xs mx-auto">
            {searchTerm ? `No tactical entities found matching the query "${searchTerm}"` : 'Tactical personnel registry is currently unpopulated'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AnimatePresence mode="popLayout">
        {users.map((user, idx) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.5 }}
          >
            <Card className="group relative border-none bg-card/20 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 active:scale-[0.97]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
              <CardContent className="p-8 space-y-10 relative z-10">
                {/* Header: Avatar & Identity */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <Avatar className="h-20 w-20 rounded-[2rem] border-2 border-white/10 shadow-2xl relative z-10">
                      <AvatarImage src={user.avatar} alt={user.codeforcesHandle} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-black text-xl">
                        {user.codeforcesHandle?.slice(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-[4px] border-[#09090b] shadow-lg z-20" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <a
                        href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl font-black tracking-tighter text-foreground flex items-center gap-2"
                      >
                        {user.codeforcesHandle || "Anonymous"}
                        <ExternalLink size={16} className="text-primary/60" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/5 w-fit">
                      <Shield size={10} className="text-muted-foreground/40" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">ID: {user._id.slice(-8)}</span>
                    </div>
                  </div>
                </div>

                {/* Tactical Performance Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col justify-between group/metric">
                    <div className="text-3xl font-black text-foreground leading-none group-hover/metric:text-primary transition-colors">{user.rating || 0}</div>
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-4">Current Rating</div>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col justify-between group/metric">
                    <div className={cn("text-sm font-black uppercase tracking-tighter leading-tight", getRankColor(user.rating))}>
                      {getRankFromRating(user.rating)}
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 mt-4">Personnel Rank</div>
                  </div>
                </div>

                {/* Authorization Status */}
                <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                      user.role === 'admin' ? "bg-primary/10 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-muted-foreground/40"
                    )}>
                      {user.role === 'admin' ? <Crown size={20} /> : <UserIcon size={20} />}
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-1">Authorization</div>
                      <div className={cn("text-xs font-black uppercase tracking-widest", user.role === 'admin' ? "text-primary" : "text-foreground")}>
                        {user.role} Level
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-1">Registry</div>
                    <div className="text-xs font-black text-foreground/80">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Operations Menu */}
                <div className="flex gap-4 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => onFetchStats(user._id)}
                    disabled={loadingStats}
                    className="flex-1 h-16 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all duration-300 font-black text-[11px] uppercase tracking-[0.3em] shadow-xl group/btn"
                  >
                    {loadingStats && statsDialogId === user._id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-3">
                        <BarChart size={18} className="opacity-40 group-hover/btn:opacity-100 transition-opacity" />
                        Analytics
                      </div>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onRoleUpdate(user._id, user.role === 'admin' ? 'user' : 'admin')}
                    disabled={updatingId === user._id}
                    className={cn(
                      "flex-1 h-16 rounded-2xl border transition-all duration-300 font-black text-[11px] uppercase tracking-[0.3em] shadow-xl",
                      user.role === 'admin'
                        ? "bg-orange-500/5 border-orange-500/10 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/40"
                        : "bg-emerald-500/5 border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40"
                    )}
                  >
                    {updatingId === user._id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-3">
                        {user.role === 'admin' ? <UserIcon size={18} className="opacity-40" /> : <Crown size={18} className="opacity-40" />}
                        {user.role === 'admin' ? "Demote" : "Promote"}
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
