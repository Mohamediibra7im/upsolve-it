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
        setSuccess("Password changed.");
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
          className="w-full h-10 rounded-xl border border-border bg-transparent text-primary font-medium   text-xs hover:bg-primary/10 transition-all font-sans"
        >
          <KeyRound className="mr-1.5 size-3.5" />
          <span>Change password</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-auto max-h-[90dvh] overflow-y-auto rounded-t-3xl border-t border-border bg-card font-sans text-foreground p-6 shadow-none"
      >
        <SheetHeader className="mx-auto max-w-md space-y-2 pt-2 text-left">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground  ">
            <span>Account security</span>
            <span aria-hidden="true">/</span>
            <span>Password</span>
          </div>
          <SheetTitle className="text-2xl font-medium text-foreground">
            Change Password
          </SheetTitle>
          <SheetDescription className="text-sm leading-relaxed text-muted-foreground">
            Enter your current password and create a new strong password.
          </SheetDescription>
        </SheetHeader>

        <div className="mx-auto max-w-md mt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-muted-foreground"
              >
                Current password
              </label>
              <Input
                type="password"
                id="current-password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                className="h-10 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 outline-none transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-muted-foreground"
              >
                New password
              </label>
              <Input
                type="password"
                id="new-password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a strong password"
                required
                className="h-10 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 outline-none transition-all font-sans"
              />
              <div className="pt-0.5">
                <PasswordStrengthIndicator password={newPassword} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-muted-foreground"
              >
                Confirm new password
              </label>
              <Input
                type="password"
                id="confirm-password"
                autoComplete="new-password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                className="h-10 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/50 outline-none transition-all font-sans"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-red-500/20 text-red-400 text-xs   text-center flex items-center justify-center gap-1.5">
                <ShieldAlert size={12} className="shrink-0 " />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-primary/5 border border-border text-foreground text-xs   text-center flex items-center justify-center gap-1.5">
                <CheckCircle size={12} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 h-10 rounded-xl border border-border bg-transparent text-primary font-medium   text-xs hover:bg-primary/10 transition-all font-sans"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium   text-xs shadow-none transition-all font-sans"
              >
                {isLoading ? (
                  <span>Saving…</span>
                ) : (
                  <span>Save new password</span>
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
