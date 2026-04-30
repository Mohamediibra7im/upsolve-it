'use client';

import { Card, CardContent } from '@/components/ui/card';
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
      <div className="text-center py-12 sm:py-16 px-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-muted/20 to-muted/20 rounded-2xl opacity-50"></div>
          <div className="relative p-6 sm:p-8">
            <div className="p-3 sm:p-4 rounded-full bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/30 w-fit mx-auto mb-4 sm:mb-6">
              <UserIcon className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </h3>
            {searchTerm && (
              <div className="space-y-2">
                <p className="text-sm sm:text-base text-muted-foreground">
                  Try adjusting your search terms or clear the search to see all users.
                </p>
                <Badge variant="outline" className="mt-2 sm:mt-3 bg-muted/50 text-muted-foreground text-xs sm:text-sm">
                  Searched for: &ldquo;{searchTerm}&rdquo;
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {users.map((user) => (
        <Card key={user._id} className="border-border/50 hover:shadow-md transition-all duration-300 hover:scale-[1.01] bg-gradient-to-r from-card to-muted/10 rounded-2xl">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl flex-shrink-0">
                    <AvatarImage src={user.avatar} alt={user.codeforcesHandle} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-2xl">
                      {user.codeforcesHandle?.slice(0, 2).toUpperCase() || 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    {user.codeforcesHandle ? (
                      <a
                        href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1 transition-colors text-base sm:text-lg font-semibold"
                      >
                        <span className="break-words">{user.codeforcesHandle}</span>
                        <ExternalLink className="h-4 w-4 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-base sm:text-lg font-medium">No handle</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onFetchStats(user._id)}
                    disabled={loadingStats}
                    className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-all text-xs sm:text-sm rounded-xl"
                  >
                    {loadingStats && statsDialogId === user._id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <BarChart className="h-3 w-3 mr-1" />
                        <span>Stats</span>
                      </>
                    )}
                  </Button>
                  {user.role === 'user' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRoleUpdate(user._id, 'admin')}
                      disabled={updatingId === user._id}
                      className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800 transition-all text-xs sm:text-sm rounded-xl"
                    >
                      {updatingId === user._id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Crown className="h-3 w-3 mr-1" />
                          <span>Admin</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRoleUpdate(user._id, 'user')}
                      disabled={updatingId === user._id}
                      className="bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 hover:text-gray-800 transition-all text-xs sm:text-sm rounded-xl"
                    >
                      {updatingId === user._id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <UserIcon className="h-3 w-3 mr-1" />
                          <span>User</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                  className={user.role === 'admin'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-2xl'
                    : 'bg-muted text-muted-foreground text-xs rounded-2xl'
                  }
                >
                  {user.role === 'admin' ? (
                    <Crown className="h-3 w-3 mr-1" />
                  ) : (
                    <UserIcon className="h-3 w-3 mr-1" />
                  )}
                  {user.role}
                </Badge>

                <Badge variant="outline" className="text-xs rounded-2xl">
                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                  {user.rating || 'Unrated'}
                </Badge>

                <Badge variant="outline" className={`${getRankColor(user.rating)} border-current text-xs rounded-2xl`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {getRankFromRating(user.rating)}
                </Badge>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-border/30">
                <Calendar className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-muted-foreground">
                  Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
