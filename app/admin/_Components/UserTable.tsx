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
  ExternalLink, 
  Loader2, 
  Calendar, 
  BarChart, 
  Shield,
  Clock} from 'lucide-react';
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

import { motion, AnimatePresence } from 'framer-motion';

export function UserTable({ 
  users, 
  loadingStats, 
  statsDialogId, 
  updatingId, 
  onFetchStats, 
  onRoleUpdate 
}: Readonly<UserTableProps>) {
  return (
    <div className="rounded-[3rem] border border-white/5 bg-card/5 backdrop-blur-3xl overflow-hidden shadow-2xl relative">
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:50px_50px] pointer-events-none" />
      <Table>
        <TableHeader>
          <TableRow className="border-b border-white/5 bg-white/[0.02] hover:bg-white/[0.02]">
            <TableHead className="h-20 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Registry Subject</TableHead>
            <TableHead className="h-20 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Authorization</TableHead>
            <TableHead className="h-20 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Tactical Rating</TableHead>
            <TableHead className="h-20 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Enlistment Date</TableHead>
            <TableHead className="h-20 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 text-right">Operations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence mode="popLayout">
            {users.map((user, idx) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02, duration: 0.4 }}
                className="group border-b border-white/5 hover:bg-white/[0.04] transition-all duration-500 relative"
              >
                {/* User Identity */}
                <TableCell className="px-10 py-8">
                  <div className="flex items-center gap-6">
                    <div className="relative group/avatar">
                      <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700" />
                      <Avatar className="h-16 w-16 rounded-2xl border-2 border-white/10 group-hover:border-primary/50 transition-all duration-500 shadow-2xl relative z-10">
                        <AvatarImage src={user.avatar} alt={user.codeforcesHandle} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-black text-lg">
                          {user.codeforcesHandle?.slice(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full border-[4px] border-[#09090b] shadow-lg z-20" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xl font-black tracking-tight text-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 group/link"
                        >
                          {user.codeforcesHandle || "Anonymous"}
                          <ExternalLink size={14} className="text-primary opacity-0 group-hover/link:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-white/5 border border-white/5 w-fit">
                        <Shield size={10} className="text-muted-foreground/40" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">ID: {user._id.slice(-8)}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
  
                {/* Role/Clearance */}
                <TableCell className="px-8 py-8">
                  <div className="flex flex-col gap-2">
                    <Badge
                      className={cn(
                        "w-fit px-5 py-2 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] border shadow-xl transition-all duration-500 group-hover:shadow-primary/10",
                        user.role === 'admin'
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-white/5 text-muted-foreground border-white/10"
                      )}
                    >
                      {user.role === 'admin' ? <Crown className="h-3.5 w-3.5 mr-2.5" /> : <UserIcon className="h-3.5 w-3.5 mr-2.5 opacity-50" />}
                      {user.role}
                    </Badge>
                  </div>
                </TableCell>
  
                {/* Rating/Performance */}
                <TableCell className="px-8 py-8">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        user.rating > 0 ? "bg-primary animate-pulse shadow-[0_0_12px_rgba(var(--primary),0.8)]" : "bg-zinc-700"
                      )} />
                      <span className="text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
                        {user.rating || 0}
                      </span>
                    </div>
                    <div className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 px-2 py-1 rounded-lg bg-black/20 border border-white/5 w-fit",
                      getRankColor(user.rating)
                    )}>
                      {getRankFromRating(user.rating)}
                    </div>
                  </div>
                </TableCell>
  
                {/* Created Date */}
                <TableCell className="px-8 py-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-foreground font-bold text-sm tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                      <Calendar size={14} className="text-primary/60" />
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </div>
                    <div className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] pl-6">
                      <Clock size={11} />
                      {user.createdAt ? new Date(user.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '--:--'}
                    </div>
                  </div>
                </TableCell>
  
                {/* Operations */}
                <TableCell className="px-10 py-8 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onFetchStats(user._id)}
                      disabled={loadingStats}
                      className="h-12 px-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-primary/10 hover:text-primary hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] group/btn"
                    >
                      {loadingStats && statsDialogId === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <>
                          <BarChart size={16} className="mr-3 opacity-40 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all" />
                          Analytics
                        </>
                      )}
                    </Button>
  
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRoleUpdate(user._id, user.role === 'admin' ? 'user' : 'admin')}
                      disabled={updatingId === user._id}
                      className={cn(
                        "h-12 px-6 rounded-2xl border transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] group/btn",
                        user.role === 'admin'
                          ? "bg-orange-500/5 border-orange-500/10 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/10"
                          : "bg-emerald-500/5 border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
                      )}
                    >
                      {updatingId === user._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          {user.role === 'admin' ? (
                            <UserIcon size={16} className="mr-3 opacity-40 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all" />
                          ) : (
                            <Crown size={16} className="mr-3 opacity-40 group-hover/btn:opacity-100 group-hover/btn:scale-110 transition-all" />
                          )}
                          {user.role === 'admin' ? "Demote" : "Promote"}
                        </>
                      )}
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
