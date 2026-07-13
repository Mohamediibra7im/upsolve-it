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
import { m, AnimatePresence } from 'framer-motion';

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
      <div className="text-center py-12 rounded-none border border-dashed border-emerald-500/10 space-y-3 font-mono text-emerald-500/40">
        <UserIcon className="size-8 text-emerald-500/20 mx-auto animate-pulse" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest">[ NO_USERS_FOUND ]</h3>
          <p className="text-[9px] font-bold text-emerald-500/25 uppercase tracking-wide">
            {searchTerm ? `No matches for: "${searchTerm}"` : 'Directory empty'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-4 font-mono text-emerald-400">
      <AnimatePresence mode="popLayout">
        {users.map((user, idx) => {
          const roleActionLabel = user.role === 'admin' ? "DEMOTE.BAT" : "PROMOTE.BAT";
          return (
            <m.div
              key={user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="bg-[#060a08]/30 border-emerald-500/15 rounded-none overflow-hidden shadow-md">
                <CardContent className="p-4 space-y-4">
                  {/* Identity Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        onClick={() => onFetchStats(user._id)}
                        className="size-10 rounded-none border border-emerald-500/20 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <AvatarImage src={user.avatar} alt={user.codeforcesHandle} className="object-cover" />
                        <AvatarFallback className="bg-emerald-955/10 text-emerald-500/40 font-bold text-[9px] uppercase rounded-none">
                          {user.codeforcesHandle?.slice(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <span
                            onClick={() => onFetchStats(user._id)}
                            className="hover:text-emerald-250 transition-colors cursor-pointer"
                          >
                            {user.codeforcesHandle || "ANONYMOUS"}
                          </span>
                          <a
                            href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-500/40 hover:text-emerald-300 transition-colors"
                            title="Open Codeforces Profile"
                          >
                            <ExternalLink size={10} />
                          </a>
                        </div>
                        <div className="text-[8px] font-bold text-emerald-500/30 uppercase tracking-widest">ROLE: {user.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-300 tabular-nums">{user.rating || 0}</div>
                      <div className={cn("text-[7px] font-bold uppercase tracking-wider mt-0.5", getRankColor(user.rating))}>
                        {getRankFromRating(user.rating)}
                      </div>
                    </div>
                  </div>

                  {/* Info Bar */}
                  <div className="flex items-center justify-between p-3 rounded-none bg-[#040604]/50 border border-emerald-500/10">
                    <div className="space-y-0.5">
                      <div className="text-[8px] font-bold text-emerald-500/35 uppercase tracking-widest">USER_ID_HEX</div>
                      <div className="text-[9px] text-emerald-500/50 uppercase">#{user._id.slice(-8).toUpperCase()}</div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className="text-[8px] font-bold text-emerald-500/35 uppercase tracking-widest">REGISTRATION_DATE</div>
                      <div className="text-[9px] font-bold text-emerald-500/50 uppercase">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString().toUpperCase() : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => onFetchStats(user._id)}
                      disabled={loadingStats}
                      className="flex-1 h-8 rounded-none bg-transparent border border-emerald-500/15 hover:bg-emerald-500/10 text-[8px] font-bold uppercase tracking-widest text-emerald-400"
                    >
                      {loadingStats && statsDialogId === user._id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        "[ STATS ]"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onRoleUpdate(user._id, user.role === 'admin' ? 'user' : 'admin')}
                      disabled={updatingId === user._id}
                      className={cn(
                        "flex-1 h-8 rounded-none border text-[8px] font-bold uppercase tracking-widest",
                        user.role === 'admin'
                          ? "bg-red-950/10 border-red-500/20 text-red-400 hover:bg-red-500/15"
                          : "bg-emerald-955/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15"
                      )}
                    >
                      {updatingId === user._id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        `[ ${roleActionLabel} ]`
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
