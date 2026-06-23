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

import { m, AnimatePresence } from 'framer-motion';

export function UserTable({ 
  users, 
  loadingStats, 
  statsDialogId, 
  updatingId, 
  onFetchStats, 
  onRoleUpdate
}: Readonly<UserTableProps>) {
  return (
    <div className="w-full">
      <Table>
        <TableHeader className="bg-muted/20">
          <TableRow className="border-b border-border hover:bg-transparent transition-none">
            <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Member</TableHead>
            <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Access Role</TableHead>
            <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Rating</TableHead>
            <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Joined On</TableHead>
            <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          <AnimatePresence mode="popLayout">
            {users.map((user, idx) => {
              const roleActionLabel = user.role === 'admin' ? "Demote" : "Promote";
              return (
                <m.tr
                key={user._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="group border-b border-border hover:bg-white/[0.02] transition-colors"
              >
                {/* User Identity */}
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      onClick={() => onFetchStats(user._id)}
                      className="size-10 rounded-lg border border-border shadow-sm cursor-pointer hover:opacity-85 transition-opacity"
                    >
                      <AvatarImage src={user.avatar} alt={user.codeforcesHandle} className="object-cover" />
                      <AvatarFallback className="bg-secondary text-muted-foreground font-bold text-xs uppercase">
                        {user.codeforcesHandle?.slice(0, 2) || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span
                          onClick={() => onFetchStats(user._id)}
                          className="text-sm font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          {user.codeforcesHandle || "Anonymous"}
                        </span>
                        <a
                          href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors opacity-30 hover:opacity-100"
                          title="Open Codeforces Profile"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground font-mono">#{user._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                </TableCell>
  
                {/* Access Role */}
                <TableCell className="px-6 py-4">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border",
                    user.role === 'admin' 
                      ? "bg-primary/10 text-primary border-primary/20" 
                      : "bg-secondary/50 text-muted-foreground border-border"
                  )}>
                    {user.role === 'admin' ? <Crown size={12} /> : <UserIcon size={12} className="opacity-40" />}
                    {user.role}
                  </div>
                </TableCell>
  
                {/* Rating */}
                <TableCell className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-sm font-black text-foreground tabular-nums">{user.rating || 0}</span>
                    <span className={cn("text-[9px] font-bold uppercase tracking-tighter", getRankColor(user.rating))}>
                      {getRankFromRating(user.rating)}
                    </span>
                  </div>
                </TableCell>
  
                {/* Join Date */}
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground/80">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </span>
                    <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
                      {user.createdAt ? new Date(user.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '00:00'}
                    </span>
                  </div>
                </TableCell>
  
                {/* Actions */}
                <TableCell className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onFetchStats(user._id)}
                      disabled={loadingStats}
                      className="h-8 px-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary text-[10px] font-bold uppercase tracking-widest"
                    >
                      {loadingStats && statsDialogId === user._id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        "Stats"
                      )}
                    </Button>
  
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRoleUpdate(user._id, user.role === 'admin' ? 'user' : 'admin')}
                      disabled={updatingId === user._id}
                      className={cn(
                        "h-8 px-3 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-colors",
                        user.role === 'admin'
                          ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                      )}
                    >
                      {updatingId === user._id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        roleActionLabel
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
