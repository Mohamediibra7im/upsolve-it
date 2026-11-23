"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Crown, User as UserIcon, AlertTriangle, Loader2 } from "lucide-react";
import { User } from "@/types/User";

interface ConfirmationDialog {
  open: boolean;
  user: User | null;
  newRole: "admin" | "user" | null;
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
  handleConfirmRoleChange,
}: Readonly<RoleConfirmationDialogProps>) {
  const isPromotion = confirmDialog.newRole === "admin";

  const roleConfig = {
    title: isPromotion ? "Grant admin access?" : "Remove admin access?",
    actionText: isPromotion ? "Grant access" : "Remove access",
    loadingText: isPromotion ? "Updating…" : "Updating…",
    description: isPromotion
      ? "This user will gain administrative privileges and access to all admin tools."
      : "This user will lose administrative privileges and be restricted to a standard member account.",
    icon: isPromotion ? Crown : UserIcon,
    colorClass: isPromotion ? "text-[#d3b98b]" : "text-[#cb9390]",
    bgColorClass: isPromotion
      ? "border-amber-500/20 bg-amber-400/5"
      : "border-red-500/20 bg-red-400/5",
    bannerColorClass: isPromotion
      ? "text-[#d3b98b] bg-amber-400/5 border-amber-500/20"
      : "text-[#cb9390] bg-red-400/5 border-red-500/20",
    buttonColorClass: isPromotion
      ? "bg-[#d3b98b] text-[#28241b] hover:bg-[#e0ca9f] font-medium border-transparent"
      : "bg-[#cb9390] text-[#281b1a] hover:bg-[#deb0ad] font-medium border-transparent",
  };

  const Icon = roleConfig.icon;

  return (
    <Dialog
      open={confirmDialog.open}
      onOpenChange={(open) =>
        !open && setConfirmDialog({ open: false, user: null, newRole: null })
      }
    >
      <DialogContent className="max-w-md mx-auto rounded-[20px] border border-[#2b3031] bg-[#191c1e] font-sans text-[#b5e3c4] w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="space-y-3 sm:space-y-4">
          <div className="flex justify-center mb-1">
            <div className={`p-3 border rounded-xl ${roleConfig.bgColorClass}`}>
              <Icon className="size-6 shrink-0" />
            </div>
          </div>
          <DialogTitle
            className={`text-2xl font-heading text-center font-medium tracking-[-0.04em] ${roleConfig.colorClass}`}
          >
            {roleConfig.title}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4 text-[#929b98]">
              <div className="bg-[#101214] border border-[#2b3031] p-3 sm:p-4 rounded-xl">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Avatar className="size-10 sm:h-10 sm:w-10 rounded-xl border border-[#2b3031]">
                    <AvatarImage
                      src={confirmDialog.user?.avatar}
                      alt={confirmDialog.user?.codeforcesHandle}
                    />
                    <AvatarFallback className="bg-[#131715] text-[#929b98] text-xs sm:text-sm rounded-xl">
                      {confirmDialog.user?.codeforcesHandle
                        ?.slice(0, 2)
                        .toUpperCase() || "UN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <p className="font-medium text-[#f1f3ee] text-sm break-all">
                      {confirmDialog.user?.codeforcesHandle || "Unknown member"}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 text-xs font-medium mt-1 text-[#929b98]">
                      <Badge
                        variant="outline"
                        className="text-xs rounded-xl border-[#2b3031] text-[#929b98] bg-transparent"
                      >
                        Current role: {confirmDialog.user?.role}
                      </Badge>
                      <span className="hidden sm:inline">{"->"}</span>
                      <span className="sm:hidden">|</span>
                      <Badge
                        variant="outline"
                        className="text-xs rounded-xl border-[#2b3031] text-[#929b98] bg-transparent"
                      >
                        New role: {confirmDialog.newRole}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`flex items-start gap-2.5 p-3 border rounded-xl text-left ${roleConfig.bannerColorClass}`}
              >
                <span className="mt-0.5 shrink-0">
                  {isPromotion ? (
                    <Crown className="size-4" />
                  ) : (
                    <AlertTriangle className="size-4" />
                  )}
                </span>
                <span className="text-[13px] leading-6">
                  {roleConfig.description}
                </span>
              </div>

              <p className="text-xs font-medium text-center text-[#f1f3ee]">
                Are you sure you want to {isPromotion ? "promote" : "demote"}{" "}
                this member?
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-center pt-2">
          <Button
            variant="outline"
            onClick={() =>
              setConfirmDialog({ open: false, user: null, newRole: null })
            }
            disabled={updating !== null}
            className="w-full sm:w-auto order-2 sm:order-1 h-11 rounded-xl border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[#b5e3c4] font-sans text-[13px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmRoleChange}
            disabled={updating !== null}
            className={`w-full sm:w-auto order-1 sm:order-2 h-11 rounded-xl font-sans text-sm ${roleConfig.buttonColorClass}`}
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
