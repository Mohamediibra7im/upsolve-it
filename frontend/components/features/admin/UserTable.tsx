"use client";

import { BadgeCheck, CircleDashed, ExternalLink } from "lucide-react";
import UserAvatar from "@/components/shared/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rank } from "@/components/ui/kit";
import type { User } from "@/types/User";

export function UserTable({
  users,
  updatingId,
  onFetchStats,
  onRoleUpdate,
}: Readonly<{
  users: User[];
  updatingId: string | null;
  onFetchStats: (id: string) => void;
  onRoleUpdate: (user: User, role: "admin" | "user") => void;
}>) {
  // The users endpoint does not send isVerified yet; show the column once it does.
  const showVerified = users.some((user) => user.isVerified !== undefined);

  return (
    <div className="overflow-x-auto">
      <table className="u-table">
        <thead>
          <tr>
            <th>Handle</th>
            <th className="num">Rating</th>
            <th>Role</th>
            {showVerified && <th>Verified</th>}
            <th>Joined</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isAdmin = user.role === "admin";
            return (
              <tr key={user._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <UserAvatar {...user} size={32} />
                    <div className="min-w-0">
                      <a
                        href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-semibold hover:underline"
                      >
                        {user.codeforcesHandle || "Unknown user"}
                        <ExternalLink
                          className="size-3 text-ink-muted"
                          aria-hidden="true"
                        />
                        <span className="sr-only">(Codeforces, new tab)</span>
                      </a>
                      <Rank rating={user.rating} className="t-sm" />
                    </div>
                  </div>
                </td>
                <td className="num">{user.rating || "–"}</td>
                <td>
                  {isAdmin ? (
                    <Badge variant="accent">Admin</Badge>
                  ) : (
                    <Badge>User</Badge>
                  )}
                </td>
                {showVerified && (
                  <td>
                    {user.isVerified ? (
                      <Badge variant="solved">
                        <BadgeCheck />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="pending">
                        <CircleDashed />
                        Unverified
                      </Badge>
                    )}
                  </td>
                )}
                <td className="t-num whitespace-nowrap text-ink-muted">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "–"}
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFetchStats(user._id)}
                    >
                      View stats
                    </Button>
                    <Button
                      size="sm"
                      variant={isAdmin ? "destructive" : "outline"}
                      disabled={!!updatingId}
                      onClick={() =>
                        onRoleUpdate(user, isAdmin ? "user" : "admin")
                      }
                    >
                      {updatingId === user._id
                        ? "Saving…"
                        : isAdmin
                          ? "Remove admin"
                          : "Make admin"}
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
