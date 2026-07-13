"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { KeyRound, ShieldAlert, CheckCircle } from "lucide-react";
import { validatePassword } from "@/utils/passwordValidation";
import { useUser } from "@/hooks/auth";

const ChangePasswordDialog = () => {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { resetPassword } = useUser();

  const handleReset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError("Current password is required.");
      return;
    }

    if (!newPassword) {
      setError("New password is required.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors.join(". "));
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(currentPassword, newPassword);
      if (response.success) {
        setSuccess("Password changed successfully!");
        setTimeout(() => {
          setOpen(false);
          handleReset();
        }, 1500);
      } else {
        setError(response.error || "Failed to change password.");
      }
    } catch (_error) {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    handleReset();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-10 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-450 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500/10 transition-all font-mono"
        >
          <KeyRound className="mr-1.5 size-3.5" />
          <span>[ CHANGE_PASSWORD ]</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto border-t border-emerald-500/25 bg-[#060a08] font-mono text-emerald-400 p-6 shadow-[0_-6px_22px_rgba(0,0,0,0.6)]">
        <SheetHeader className="space-y-1 pt-2">
          <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-500/40 uppercase tracking-widest">
            <span>SECURITY_PROTOCOL</span>
            <span>{"//"}</span>
            <span>CREDENTIAL_ROTATION</span>
          </div>
          <SheetTitle className="text-sm font-bold uppercase tracking-wider text-white">Change Password</SheetTitle>
          <SheetDescription className="text-[10px] text-emerald-500/60 uppercase">
            Enter your current password and create a new strong password.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mx-auto max-w-md mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-emerald-500/50">
                [ CURRENT_PASSWORD ]:
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                className="h-10 rounded-sm bg-[#040604] border border-emerald-500/20 text-xs text-emerald-300 placeholder-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-emerald-500/50">
                [ NEW_PASSWORD ]:
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                className="h-10 rounded-sm bg-[#040604] border border-emerald-500/20 text-xs text-emerald-300 placeholder-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-mono"
              />
              <div className="pt-0.5">
                <PasswordStrengthIndicator password={newPassword} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-emerald-500/50">
                [ CONFIRM_NEW_PASSWORD ]:
              </label>
              <Input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                className="h-10 rounded-sm bg-[#040604] border border-emerald-500/20 text-xs text-emerald-300 placeholder-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-mono"
              />
            </div>

            {error && (
              <div className="p-3 rounded-sm bg-red-955/10 border border-red-500/20 text-red-400 text-[9px] uppercase tracking-wide text-center flex items-center justify-center gap-1.5">
                <ShieldAlert size={12} className="shrink-0 animate-pulse" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-sm bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-[9px] uppercase tracking-wide text-center flex items-center justify-center gap-1.5">
                <CheckCircle size={12} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-emerald-500/10">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 h-10 rounded-sm border border-emerald-500/20 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500/10 transition-all font-mono"
              >
                [ CANCEL ]
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 h-10 rounded-sm bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold uppercase tracking-widest text-[10px] shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all font-mono"
              >
                {isLoading ? (
                  <span>UPDATING...</span>
                ) : (
                  <span>[ ROTATE_KEY.EXE ]</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChangePasswordDialog;
