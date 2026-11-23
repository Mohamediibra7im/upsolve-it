"use client";

import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserAvatar from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rank } from "@/components/ui/kit";
import type { User } from "@/types/User";

export type RoleChange = { user: User; newRole: "admin" | "user" };

const roleBadge = (role: "admin" | "user") =>
  role === "admin" ? (
    <Badge variant="accent">Admin</Badge>
  ) : (
    <Badge>User</Badge>
  );

export function RoleConfirmationDialog({
  change,
  onClose,
  onConfirm,
}: Readonly<{
  change: RoleChange | null;
  onClose: () => void;
  onConfirm: () => void;
}>) {
  const promote = change?.newRole === "admin";

  return (
    <Dialog open={!!change} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {change && (
          <>
            <DialogHeader>
              <DialogTitle className="t-h2">
                {promote ? "Make this user an admin?" : "Remove admin access?"}
              </DialogTitle>
              <DialogDescription asChild>
                <div className="grid gap-3 text-left">
                  <p className="t-muted">
                    {promote
                      ? "They will be able to open the admin area, change roles and read the logs."
                      : "They keep their account and training history, and lose the admin area."}
                  </p>
                  <div className="u-panel u-panel--sunk flex items-center gap-3 px-4 py-3 text-ink">
                    <UserAvatar {...change.user} />
                    <div className="min-w-0">
                      <b className="block truncate">
                        {change.user.codeforcesHandle || "Unknown user"}
                      </b>
                      <Rank
                        rating={change.user.rating}
                        showRating
                        className="t-sm"
                      />
                    </div>
                    <span className="ml-auto flex items-center gap-2">
                      {roleBadge(change.user.role)}
                      <ArrowRight className="size-4" aria-hidden="true" />
                      <span className="sr-only">becomes</span>
                      {roleBadge(change.newRole)}
                    </span>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={onClose}>
                Keep role
              </Button>
              <Button
                variant={promote ? "default" : "destructive"}
                onClick={onConfirm}
              >
                {promote ? "Make admin" : "Remove admin"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
