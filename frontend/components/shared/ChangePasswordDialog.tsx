"use client";

import { useState } from "react";
import { Check, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { FormError, PasswordField } from "@/components/features/auth";
import { validatePassword } from "@/utils/passwordValidation";
import { useUser } from "@/hooks/auth";

const ChangePasswordDialog = () => {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useUser();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) return;
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }
    if (!newPassword) {
      setError("Enter a new password.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("The new passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setError("Choose a new password that differs from your current one.");
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
        setSuccess(true);
        setTimeout(() => handleOpenChange(false), 1500);
      } else {
        setError(
          response.error || "We could not change your password. Try again.",
        );
      }
    } catch {
      setError("We could not reach the server. Try again in a minute.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <KeyRound />
          Change password
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-5 sm:max-w-md">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="t-h2">Change your password</DialogTitle>
          <DialogDescription className="t-muted">
            Enter your current password, then choose a new one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <PasswordField
            id="current-password"
            label="Current password"
            placeholder="Your current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <PasswordField
            id="new-password"
            label="New password"
            placeholder="8+ characters, with a number and a symbol"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          >
            <PasswordStrengthIndicator password={newPassword} />
          </PasswordField>
          <PasswordField
            id="confirm-password"
            label="Confirm new password"
            placeholder="Repeat your new password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          {error && <FormError>{error}</FormError>}
          {success && (
            <p role="status">
              <Badge variant="solved">
                <Check />
                Password changed
              </Badge>
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || success}>
              {isLoading ? "Saving…" : "Save new password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
