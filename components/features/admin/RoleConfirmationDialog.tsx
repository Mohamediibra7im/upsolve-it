'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Crown, User as UserIcon, AlertTriangle, Loader2 } from 'lucide-react';
import { User } from '@/types/User';

interface ConfirmationDialog {
  open: boolean;
  user: User | null;
  newRole: 'admin' | 'user' | null;
}

interface RoleConfirmationDialogProps {
  confirmDialog: ConfirmationDialog;
  setConfirmDialog: (dialog: ConfirmationDialog) => void;
  updating: string | null;
  handleConfirmRoleChange: () => void;
}

export function RoleConfirmationDialog({ 
  confirmDialog, 
  setConfirmDialog, 
  updating, 
  handleConfirmRoleChange 
}: Readonly<RoleConfirmationDialogProps>) {
  const isPromotion = confirmDialog.newRole === 'admin';
  
  const roleConfig = {
    title: isPromotion ? 'Promote to Admin' : 'Demote to User',
    actionText: isPromotion ? 'Promote User' : 'Demote User',
    loadingText: isPromotion ? 'Promoting...' : 'Demoting...',
    description: isPromotion 
      ? 'This user will gain administrative privileges and access to all admin features.'
      : 'This user will lose administrative privileges and be restricted to regular user features.',
    icon: isPromotion ? Crown : UserIcon,
    colorClass: isPromotion ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400',
    bgColorClass: isPromotion 
      ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20'
      : 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800',
    bannerColorClass: isPromotion
      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
      : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    buttonColorClass: isPromotion
      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
      : 'bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700'
  };

  const Icon = roleConfig.icon;

  return (
    <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, user: null, newRole: null })}>
      <DialogContent className="w-[95vw] max-w-md mx-auto sm:w-full rounded-xl">
        <DialogHeader className="text-center space-y-3 sm:space-y-4">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className={`rounded-full p-2 sm:p-3 ${roleConfig.bgColorClass}`}>
              <Icon className={`size-6 sm:h-8 sm:w-8 ${roleConfig.colorClass}`} />
            </div>
          </div>
          <DialogTitle className={`text-lg sm:text-xl font-semibold ${roleConfig.colorClass}`}>
            {roleConfig.title}
          </DialogTitle>
          <DialogDescription className="text-center space-y-3 sm:space-y-4">
            <div className="bg-muted/50 rounded-2xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
                <Avatar className="size-8 sm:h-10 sm:w-10 rounded-2xl">
                  <AvatarImage src={confirmDialog.user?.avatar} alt={confirmDialog.user?.codeforcesHandle} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs sm:text-sm rounded-2xl">
                    {confirmDialog.user?.codeforcesHandle?.slice(0, 2).toUpperCase() || 'UN'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                    {confirmDialog.user?.codeforcesHandle || 'Unknown User'}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground mt-1">
                    <Badge variant="outline" className="text-xs rounded-2xl">
                      Current: {confirmDialog.user?.role}
                    </Badge>
                    <span className="hidden sm:inline">→</span>
                    <span className="sm:hidden">↓</span>
                    <Badge variant="outline" className="text-xs rounded-2xl">
                      New: {confirmDialog.newRole}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-2xl ${roleConfig.bannerColorClass}`}>
              <span className="flex items-center justify-center">
                {isPromotion ? <Crown className="size-5" /> : <AlertTriangle className="size-5" />}
              </span>
              <span className="text-xs sm:text-sm font-medium text-center">
                {roleConfig.description}
              </span>
            </div>

            <p className="text-sm sm:text-base font-medium">
              Are you sure you want to {isPromotion ? 'promote' : 'demote'} this user?
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setConfirmDialog({ open: false, user: null, newRole: null })}
            disabled={updating !== null}
            className="w-full sm:w-auto order-2 sm:order-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRoleChange}
            disabled={updating !== null}
            className={`w-full sm:w-auto order-1 sm:order-2 rounded-xl ${roleConfig.buttonColorClass}`}
          >
            {updating === null ? (
              <>
                <Icon className="mr-2 size-3 sm:h-4 sm:w-4" />
                <span className="text-sm sm:text-base">
                  {roleConfig.actionText}
                </span>
              </>
            ) : (
              <>
                <Loader2 className="mr-2 size-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="text-sm sm:text-base">
                  {roleConfig.loadingText}
                </span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
