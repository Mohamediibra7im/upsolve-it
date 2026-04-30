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
  Shield 
} from 'lucide-react';
import { User } from '@/types/User';
import getRankFromRating from '@/utils/getRankFromRating';

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
    <div className="overflow-x-auto rounded-2xl border border-border/50 shadow-sm w-full">
      <Table className="w-full min-w-[800px]">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-muted/40 via-muted/30 to-muted/40 border-b border-border/30 hover:bg-muted/50 transition-colors">
            <TableHead className="h-14 px-3 xl:px-4 font-bold text-foreground/90 text-xs xl:text-sm whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-xl bg-primary/10">
                  <UserIcon className="h-3 w-3 xl:h-4 xl:w-4 text-primary" />
                </div>
                <span>User</span>
              </div>
            </TableHead>
            <TableHead className="h-14 px-3 xl:px-4 font-bold text-foreground/90 text-xs xl:text-sm whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-xl bg-purple-500/10">
                  <Crown className="h-3 w-3 xl:h-4 xl:w-4 text-purple-600" />
                </div>
                <span>Role</span>
              </div>
            </TableHead>
            <TableHead className="h-14 px-3 xl:px-4 font-bold text-foreground/90 text-xs xl:text-sm whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-xl bg-yellow-500/10">
                  <Star className="h-3 w-3 xl:h-4 xl:w-4 text-yellow-600" />
                </div>
                <span>Rating</span>
              </div>
            </TableHead>
            <TableHead className="h-14 px-3 xl:px-4 font-bold text-foreground/90 text-xs xl:text-sm whitespace-nowrap">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-xl bg-emerald-500/10">
                  <Calendar className="h-3 w-3 xl:h-4 xl:w-4 text-emerald-600" />
                </div>
                <span>Created</span>
              </div>
            </TableHead>
            <TableHead className="h-14 px-3 xl:px-4 font-bold text-foreground/90 text-xs xl:text-sm text-center whitespace-nowrap">
              <div className="flex items-center justify-center space-x-2">
                <div className="p-1 rounded-xl bg-blue-500/10">
                  <Shield className="h-3 w-3 xl:h-4 xl:w-4 text-blue-600" />
                </div>
                <span>Actions</span>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border/30">
          {users.map((user, index) => (
            <TableRow
              key={user._id}
              className={`group hover:bg-gradient-to-r hover:from-muted/30 hover:via-muted/20 hover:to-muted/30 transition-all duration-300 border-border/20 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
              }`}
            >
              <TableCell className="px-3 xl:px-4 py-4">
                <div className="flex items-center space-x-2 xl:space-x-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10 xl:h-12 xl:w-12 rounded-xl xl:rounded-2xl ring-2 ring-primary/10 transition-all duration-300 group-hover:ring-primary/20">
                      <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs xl:text-sm font-bold rounded-xl xl:rounded-2xl">
                        {user.codeforcesHandle?.slice(0, 2).toUpperCase() || 'UN'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 xl:w-4 xl:h-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                      <div className="w-1.5 h-1.5 xl:w-2 xl:h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {user.codeforcesHandle ? (
                      <div className="space-y-0.5">
                        <a
                          href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 xl:space-x-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors font-semibold text-sm xl:text-base group-hover:text-blue-700"
                        >
                          <span className="truncate max-w-[120px] xl:max-w-none">{user.codeforcesHandle}</span>
                          <ExternalLink className="h-3 w-3 xl:h-4 xl:w-4 flex-shrink-0 opacity-70" />
                        </a>
                        <p className="text-xs text-muted-foreground font-medium truncate">
                          {user._id.slice(-8)}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-muted-foreground font-medium text-sm">No handle</span>
                        <p className="text-xs text-muted-foreground truncate">
                          {user._id.slice(-8)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-3 xl:px-4 py-4">
                <div className="flex items-center">
                  <Badge
                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                    className={`${user.role === 'admin'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200 shadow-lg shadow-gray-500/10'
                    } font-bold px-2 xl:px-3 py-1 xl:py-1.5 rounded-xl xl:rounded-2xl transition-all duration-300 group-hover:scale-105 text-xs xl:text-sm`}
                  >
                    {user.role === 'admin' ? (
                      <Crown className="h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-1.5" />
                    ) : (
                      <UserIcon className="h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-1.5" />
                    )}
                    <span className="uppercase tracking-wide">
                      {user.role}
                    </span>
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="px-3 xl:px-4 py-4">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-1.5 xl:space-x-2">
                    <div className="p-0.5 xl:p-1 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg xl:rounded-xl">
                      <Star className="h-3 w-3 xl:h-4 xl:w-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="font-bold text-base xl:text-lg text-foreground">
                      {user.rating || 'Unrated'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className={`${getRankColor(user.rating)} border-current font-bold px-2 xl:px-3 py-0.5 xl:py-1 rounded-xl xl:rounded-2xl bg-background/50 backdrop-blur-sm text-xs`}
                    >
                      <Shield className="h-2.5 w-2.5 xl:h-3 xl:w-3 mr-1" />
                      {getRankFromRating(user.rating)}
                    </Badge>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-3 xl:px-4 py-4">
                <div className="flex flex-col space-y-0.5">
                  <div className="flex items-center space-x-1.5 xl:space-x-2">
                    <Calendar className="h-3 w-3 xl:h-4 xl:w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="font-medium text-xs xl:text-sm text-foreground whitespace-nowrap">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground pl-4 xl:pl-6">
                    {user.createdAt ? new Date(user.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ''}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-3 xl:px-4 py-4">
                <div className="flex items-center justify-center gap-1.5 xl:gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onFetchStats(user._id)}
                    disabled={loadingStats}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-all rounded-xl xl:rounded-2xl font-semibold px-2 xl:px-3 py-1.5 xl:py-2 shadow-sm hover:shadow-md disabled:opacity-50 text-xs xl:text-sm"
                    title="View Statistics"
                  >
                    {loadingStats && statsDialogId === user._id ? (
                      <>
                        <Loader2 className="h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2 animate-spin" />
                        <span className="hidden xl:inline">Loading...</span>
                      </>
                    ) : (
                      <>
                        <BarChart className="h-3 w-3 xl:h-4 xl:w-4 xl:mr-2" />
                        <span className="hidden xl:inline">Stats</span>
                      </>
                    )}
                  </Button>
                  {user.role === 'user' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRoleUpdate(user._id, 'admin')}
                      disabled={updatingId === user._id}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 text-green-700 hover:text-green-800 transition-all rounded-xl xl:rounded-2xl font-semibold px-2 xl:px-3 py-1.5 xl:py-2 shadow-sm hover:shadow-md disabled:opacity-50 text-xs xl:text-sm"
                      title="Promote to Admin"
                    >
                      {updatingId === user._id ? (
                        <>
                          <Loader2 className="h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2 animate-spin" />
                          <span className="hidden xl:inline">Promoting...</span>
                        </>
                      ) : (
                        <>
                          <Crown className="h-3 w-3 xl:h-4 xl:w-4 xl:mr-2" />
                          <span className="hidden xl:inline">Promote</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRoleUpdate(user._id, 'user')}
                      disabled={updatingId === user._id}
                      className="bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border-gray-200 text-gray-700 hover:text-gray-800 transition-all rounded-xl xl:rounded-2xl font-semibold px-2 xl:px-3 py-1.5 xl:py-2 shadow-sm hover:shadow-md disabled:opacity-50 text-xs xl:text-sm"
                      title="Demote to User"
                    >
                      {updatingId === user._id ? (
                        <>
                          <Loader2 className="h-3 w-3 xl:h-4 xl:w-4 mr-1 xl:mr-2 animate-spin" />
                          <span className="hidden xl:inline">Demoting...</span>
                        </>
                      ) : (
                        <>
                          <UserIcon className="h-3 w-3 xl:h-4 xl:w-4 xl:mr-2" />
                          <span className="hidden xl:inline">Demote</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
