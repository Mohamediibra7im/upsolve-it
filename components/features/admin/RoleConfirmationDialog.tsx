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
    title: isPromotion ? 'PROMOTION: GRANT ADMIN RIGHTS' : 'DEMOTION: REVOKE ADMIN RIGHTS',
    actionText: isPromotion ? 'CONFIRM_PROMOTION.EXE' : 'CONFIRM_DEMOTION.EXE',
    loadingText: isPromotion ? 'PROMOTING...' : 'DEMOTING...',
    description: isPromotion 
      ? 'This user will gain administrative privileges and access to all admin tools.'
      : 'This user will lose administrative privileges and be restricted to regular user bounds.',
    icon: isPromotion ? Crown : UserIcon,
    colorClass: isPromotion ? 'text-amber-400' : 'text-red-400',
    bgColorClass: isPromotion ? 'border-amber-500/20 bg-amber-955/10' : 'border-red-500/20 bg-red-955/10',
    bannerColorClass: isPromotion
      ? 'text-amber-400 bg-amber-955/10 border-amber-500/20'
      : 'text-red-400 bg-red-955/10 border-red-500/20',
    buttonColorClass: isPromotion
      ? 'bg-amber-500 text-amber-950 hover:bg-amber-400 font-bold border-transparent'
      : 'bg-red-600 text-red-50 hover:bg-red-500 font-bold border-transparent'
  };

  const Icon = roleConfig.icon;

  return (
    <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, user: null, newRole: null })}>
      <DialogContent className="w-[95vw] max-w-md mx-auto sm:w-full rounded-none border border-emerald-500/25 bg-[#060a08] font-mono text-emerald-400">
        <DialogHeader className="space-y-3 sm:space-y-4">
          <div className="flex justify-center mb-1">
            <div className={`p-3 border rounded-none ${roleConfig.bgColorClass}`}>
              <Icon className="size-6 shrink-0" />
            </div>
          </div>
          <DialogTitle className={`text-sm font-bold tracking-widest text-center uppercase ${roleConfig.colorClass}`}>
            {roleConfig.title}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 text-emerald-400/80">
              <div className="bg-[#040604]/60 border border-emerald-500/10 p-3 sm:p-4 rounded-none">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Avatar className="size-8 sm:h-10 sm:w-10 rounded-none border border-emerald-500/20">
                    <AvatarImage src={confirmDialog.user?.avatar} alt={confirmDialog.user?.codeforcesHandle} />
                    <AvatarFallback className="bg-emerald-955/15 text-emerald-500/40 text-xs sm:text-sm rounded-none">
                      {confirmDialog.user?.codeforcesHandle?.slice(0, 2).toUpperCase() || 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <p className="font-bold text-emerald-300 text-sm tracking-wider">
                      {confirmDialog.user?.codeforcesHandle || 'UNKNOWN_USER'}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 text-[9px] font-bold mt-1 text-emerald-500/40 uppercase">
                      <Badge variant="outline" className="text-[9px] rounded-none border-emerald-500/15 text-emerald-500/50 bg-transparent">
                        CURRENT: {confirmDialog.user?.role}
                      </Badge>
                      <span className="hidden sm:inline">{"->"}</span>
                      <span className="sm:hidden">|</span>
                      <Badge variant="outline" className="text-[9px] rounded-none border-emerald-500/15 text-emerald-500/50 bg-transparent">
                        NEW: {confirmDialog.newRole}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`flex items-start gap-2.5 p-3 border rounded-none text-left ${roleConfig.bannerColorClass}`}>
                <span className="mt-0.5 shrink-0">
                  {isPromotion ? <Crown className="size-4" /> : <AlertTriangle className="size-4" />}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide leading-relaxed">
                  {roleConfig.description}
                </span>
              </div>

              <p className="text-[10px] font-bold text-center uppercase tracking-widest text-emerald-300">
                Are you sure you want to {isPromotion ? 'promote' : 'demote'} this user node?
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setConfirmDialog({ open: false, user: null, newRole: null })}
            disabled={updating !== null}
            className="w-full sm:w-auto order-2 sm:order-1 rounded-none border border-emerald-500/15 hover:bg-emerald-500/10 text-emerald-400 font-mono text-[9px] uppercase tracking-widest"
          >
            [ CANCEL ]
          </Button>
          <Button
            onClick={handleConfirmRoleChange}
            disabled={updating !== null}
            className={`w-full sm:w-auto order-1 sm:order-2 rounded-none font-mono text-[9px] uppercase tracking-widest ${roleConfig.buttonColorClass}`}
          >
            {updating === null ? (
              <>
                <Icon className="mr-2 size-3.5" />
                <span>{roleConfig.actionText}</span>
              </>
            ) : (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" />
                <span>{roleConfig.loadingText}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
