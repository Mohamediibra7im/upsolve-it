"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserAvatar from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Rank } from "@/components/ui/kit";
import type { User } from "@/types/User";

/** What an account is known by: its Codeforces handle, or its own username. */
export const nameOf = (user: User) =>
  user.codeforcesHandle || user.username || "Unknown user";

/**
 * Deleting an account cannot be undone, so the button stays off until the
 * account's name has been typed.
 */
export function DeleteUserDialog({
  user,
  isDeleting,
  onClose,
  onConfirm,
}: Readonly<{
  user: User | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}>) {
  const [typed, setTyped] = useState("");
  useEffect(() => setTyped(""), [user]);
  const name = user ? nameOf(user) : "";
  const matches = typed.trim().toLowerCase() === name.toLowerCase();

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {user && (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (matches && !isDeleting) onConfirm();
            }}
          >
            <DialogHeader>
              <DialogTitle className="t-h2">Delete this account?</DialogTitle>
              <DialogDescription asChild>
                <div className="grid gap-3 text-left">
                  <p className="t-muted">
                    The account goes, and everything in it with it: training
                    sessions, the upsolve queue, statistics and friends. This
                    cannot be undone.
                  </p>
                  <div className="u-panel u-panel--sunk flex items-center gap-3 px-4 py-3 text-ink">
                    <UserAvatar {...user} />
                    <div className="min-w-0">
                      <b className="block truncate">{name}</b>
                      <Rank rating={user.rating} showRating className="t-sm" />
                    </div>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="u-field">
              <label htmlFor="delete-user-name">
                Type <b className="t-num">{name}</b> to confirm
              </label>
              <input
                id="delete-user-name"
                className="u-input"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={name}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Keep account
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={!matches || isDeleting}
              >
                <Trash2 />
                {isDeleting ? "Deleting…" : "Delete account"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
