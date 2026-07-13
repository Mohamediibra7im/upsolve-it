'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Crown, 
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
    <div className="w-full font-mono text-emerald-400">
      <Table>
        <TableHeader className="bg-black/20">
          <TableRow className="border-b border-emerald-500/15 hover:bg-transparent transition-none">
            <TableHead className="h-10 px-6 text-[9px] font-bold uppercase tracking-widest text-emerald-500/35">MEMBER_NODE</TableHead>
            <TableHead className="h-10 px-6 text-[9px] font-bold uppercase tracking-widest text-emerald-500/35">SECURITY_ROLE</TableHead>
            <TableHead className="h-10 px-6 text-[9px] font-bold uppercase tracking-widest text-emerald-500/35 text-center">RATING</TableHead>
            <TableHead className="h-10 px-6 text-[9px] font-bold uppercase tracking-widest text-emerald-500/35">REGISTRATION_DATE</TableHead>
            <TableHead className="h-10 px-6 text-[9px] font-bold uppercase tracking-widest text-emerald-500/35 text-right">OPERATIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          <AnimatePresence mode="popLayout">
            {users.map((user, idx) => {
              const roleActionLabel = user.role === 'admin' ? "DEMOTE.BAT" : "PROMOTE.BAT";
              return (
                <m.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="group border-b border-emerald-500/[0.08] hover:bg-emerald-950/5 transition-colors"
                >
                  {/* User Identity */}
                  <TableCell className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        onClick={() => onFetchStats(user._id)}
                        className="size-9 rounded-none border border-emerald-500/20 bg-emerald-950/10 cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <AvatarImage src={user.avatar} alt={user.codeforcesHandle} className="object-cover" />
                        <AvatarFallback className="bg-emerald-950/10 text-emerald-500/40 font-bold text-[9px] uppercase rounded-none">
                          {user.codeforcesHandle?.slice(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => onFetchStats(user._id)}
                            className="text-xs font-bold text-emerald-300 hover:text-emerald-250 cursor-pointer tracking-wider"
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
                        <span className="text-[8px] font-bold text-emerald-500/30">ID: {user._id.slice(-8).toUpperCase()}</span>
                      </div>
                    </div>
                  </TableCell>
    
                  {/* Access Role */}
                  <TableCell className="px-6 py-3.5">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[8px] font-bold uppercase tracking-widest border",
                      user.role === 'admin' 
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                        : "bg-emerald-500/5 text-emerald-500/60 border-emerald-500/15"
                    )}>
                      {user.role === 'admin' ? <Crown size={10} /> : <UserIcon size={10} className="opacity-40" />}
                      <span>[{user.role}]</span>
                    </div>
                  </TableCell>
    
                  {/* Rating */}
                  <TableCell className="px-6 py-3.5 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-emerald-300 tabular-nums">{user.rating || 0}</span>
                      <span className={cn("text-[7px] font-bold uppercase tracking-wider mt-0.5", getRankColor(user.rating))}>
                        {getRankFromRating(user.rating)}
                      </span>
                    </div>
                  </TableCell>
    
                  {/* Join Date */}
                  <TableCell className="px-6 py-3.5">
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold text-emerald-500/60">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }).toUpperCase() : 'N/A'}
                      </span>
                      <span className="text-[8px] font-bold text-emerald-500/25 uppercase tracking-wider mt-0.5">
                        {user.createdAt ? new Date(user.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        }) : '00:00'}
                      </span>
                    </div>
                  </TableCell>
    
                  {/* Actions */}
                  <TableCell className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onFetchStats(user._id)}
                        disabled={loadingStats}
                        className="h-7 px-2.5 rounded-none bg-transparent border border-emerald-500/15 hover:bg-emerald-500/10 text-[8px] font-bold uppercase tracking-widest text-emerald-400"
                      >
                        {loadingStats && statsDialogId === user._id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          "[ STATS ]"
                        )}
                      </Button>
    
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRoleUpdate(user._id, user.role === 'admin' ? 'user' : 'admin')}
                        disabled={updatingId === user._id}
                        className={cn(
                          "h-7 px-2.5 rounded-none border text-[8px] font-bold uppercase tracking-widest transition-colors",
                          user.role === 'admin'
                            ? "bg-red-950/10 border-red-500/20 text-red-400 hover:bg-red-500/15 hover:border-red-500/35"
                            : "bg-emerald-955/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/35"
                        )}
                      >
                        {updatingId === user._id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          `[ ${roleActionLabel} ]`
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </m.tr>
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
