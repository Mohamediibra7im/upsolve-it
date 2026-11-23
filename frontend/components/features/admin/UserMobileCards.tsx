"use client";

import { AdminState } from "./AdminState";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon, ExternalLink, Loader2 } from "lucide-react";
import { User } from "@/types/User";
import getRankFromRating from "@/utils/getRankFromRating";
import { cn } from "@/lib/utils";
import { m, AnimatePresence } from "framer-motion";

const getRankColor = (rating: number): string => {
  if (rating === 0) return "text-zinc-500";
  if (rating < 1200) return "text-zinc-400";
  if (rating < 1400) return "text-[#b5e3c4]";
  if (rating < 1600) return "text-cyan-500";
  if (rating < 1900) return "text-blue-500";
  if (rating < 2100) return "text-violet-500";
  if (rating < 2300) return "text-amber-500";
  if (rating < 2400) return "text-orange-500";
  if (rating < 2600) return "text-red-500";
  if (rating < 3000) return "text-red-600";
  return "text-red-700";
};

interface UserMobileCardsProps {
  users: User[];
  loadingStats: boolean;
  statsDialogId: string | null;
  updatingId: string | null;
  onFetchStats: (id: string) => void;
  onRoleUpdate: (id: string, role: "admin" | "user") => void;
  searchTerm: string;
}

export function UserMobileCards({
  users,
  loadingStats,
  statsDialogId,
  updatingId,
  onFetchStats,
  onRoleUpdate,
  searchTerm,
}: Readonly<UserMobileCardsProps>) {
  if (users.length === 0) {
    return (
      <AdminState
        icon={UserIcon}
        title="No members found"
        description={
          searchTerm
            ? `No matches for “${searchTerm}”. Try a different handle or broaden your filters.`
            : "New members will appear here when they create an account."
        }
        className="rounded-none border-0 px-0 [&_p]:break-words"
      />
    );
  }

  return (
    <div className="relative space-y-4 font-sans text-[#f1f3ee]">
      <AnimatePresence mode="popLayout">
        {users.map((user, idx) => {
          const roleActionLabel =
            user.role === "admin" ? "Remove admin" : "Make admin";
          return (
            <m.div
              key={user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="bg-[#191c1e] border-[#2b3031] rounded-[20px] overflow-hidden shadow-none">
                <CardContent className="p-4 space-y-4">
                  {/* Identity Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar
                        onClick={() => onFetchStats(user._id)}
                        className="size-10 rounded-xl border border-[#2b3031] cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <AvatarImage
                          src={user.avatar}
                          alt={user.codeforcesHandle}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-[#131715] text-[#929b98] font-medium text-xs rounded-xl">
                          {user.codeforcesHandle?.slice(0, 2).toUpperCase() ||
                            "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <div className="text-xs font-medium text-[#f1f3ee] flex items-center gap-1.5">
                          <span
                            onClick={() => onFetchStats(user._id)}
                            className="truncate hover:text-[#f1f3ee] transition-colors cursor-pointer"
                          >
                            {user.codeforcesHandle || "Unknown member"}
                          </span>
                          <a
                            href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#929b98] hover:text-[#f1f3ee] transition-colors"
                            title="Open Codeforces Profile"
                          >
                            <ExternalLink size={10} />
                          </a>
                        </div>
                        <div className="text-xs font-medium text-[#929b98]">
                          Role: {user.role}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-xs font-medium text-[#f1f3ee] tabular-nums">
                        {user.rating || 0}
                      </div>
                      <div
                        className={cn(
                          "text-xs font-medium mt-0.5",
                          getRankColor(user.rating),
                        )}
                      >
                        {getRankFromRating(user.rating)}
                      </div>
                    </div>
                  </div>

                  {/* Info Bar */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#101214] border border-[#2b3031]">
                    <div className="space-y-0.5">
                      <div className="text-xs font-medium text-[#929b98]">
                        Member ID
                      </div>
                      <div className="text-xs text-[#929b98]">
                        #{user._id.slice(-8).toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <div className="text-xs font-medium text-[#929b98]">
                        Joined
                      </div>
                      <div className="text-xs font-medium text-[#929b98]">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => onFetchStats(user._id)}
                      disabled={loadingStats}
                      className="flex-1 h-10 rounded-xl bg-transparent border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[13px] font-medium text-[#b5e3c4]"
                    >
                      {loadingStats && statsDialogId === user._id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        "View stats"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        onRoleUpdate(
                          user._id,
                          user.role === "admin" ? "user" : "admin",
                        )
                      }
                      disabled={updatingId === user._id}
                      className={cn(
                        "flex-1 h-10 rounded-xl border text-xs font-medium",
                        user.role === "admin"
                          ? "bg-red-950/10 border-red-500/20 text-red-400 hover:bg-red-500/15"
                          : "bg-[#131715] border-[#2b3031] text-[#b5e3c4] hover:bg-[#b5e3c4]/[0.06]",
                      )}
                    >
                      {updatingId === user._id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        roleActionLabel
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </m.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
