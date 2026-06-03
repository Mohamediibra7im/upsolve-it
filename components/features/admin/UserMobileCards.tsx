'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  User as UserIcon, 
  ExternalLink, 
  Loader2
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

import { m, AnimatePresence } from 'framer-motion';

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
      <div className="text-center py-20 bg-muted/20 rounded-2xl border border-border space-y-4">
        <UserIcon className="size-12 text-muted-foreground/30 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">No Users Found</h3>
          <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto">
            {searchTerm ? `No matches for "${searchTerm}"` : 'The member directory is empty'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      <AnimatePresence mode="popLayout">
        {users.map((user, idx) => {
          const roleActionLabel = user.role === 'admin' ? "Demote" : "Promote";
          return (
            <m.div
            key={user._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <Card className="bg-card border-border rounded-2xl overflow-hidden shadow-xl active:scale-[0.98] transition-transform">
              <CardContent className="p-5 space-y-4">
                {/* Identity Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-11 rounded-xl border border-border">
                      <AvatarImage src={user.avatar} alt={user.codeforcesHandle} className="object-cover" />
                      <AvatarFallback className="bg-secondary text-muted-foreground font-bold text-xs">
                        {user.codeforcesHandle?.slice(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        {user.codeforcesHandle || "Anonymous"}
                        <ExternalLink size={10} className="opacity-30" />
                      </div>
                      <div className="text-[9px] font-black text-primary uppercase tracking-widest">{user.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-foreground tabular-nums">{user.rating || 0}</div>
                    <div className={cn("text-[8px] font-bold uppercase tracking-tighter", getRankColor(user.rating))}>
                      {getRankFromRating(user.rating)}
                    </div>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border">
                  <div className="space-y-0.5">
                    <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">ID Reference</div>
                    <div className="text-[9px] font-mono text-muted-foreground/80">#{user._id.slice(-8).toUpperCase()}</div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Member Since</div>
                    <div className="text-[9px] font-bold text-muted-foreground/80">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">

                  <Button
                    variant="secondary"
                    onClick={() => onFetchStats(user._id)}
                    disabled={loadingStats}
                    className="flex-1 h-10 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-[10px] font-bold uppercase tracking-widest border-none"
                  >
                    {loadingStats && statsDialogId === user._id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "Stats"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onRoleUpdate(user._id, user.role === 'admin' ? 'user' : 'admin')}
                    disabled={updatingId === user._id}
                    className={cn(
                      "flex-1 h-10 rounded-xl border text-[10px] font-bold uppercase tracking-widest",
                      user.role === 'admin' ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    )}
                  >
                    {updatingId === user._id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      roleActionLabel
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </m.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
