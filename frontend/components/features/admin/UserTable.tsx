"use client";

import { AdminState } from "./AdminState";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Crown, User as UserIcon, ExternalLink, Loader2 } from "lucide-react";
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

interface UserTableProps {
  users: User[];
  loadingStats: boolean;
  statsDialogId: string | null;
  updatingId: string | null;
  onFetchStats: (id: string) => void;
  onRoleUpdate: (id: string, role: "admin" | "user") => void;
}

export function UserTable({
  users,
  loadingStats,
  statsDialogId,
  updatingId,
  onFetchStats,
  onRoleUpdate,
}: Readonly<UserTableProps>) {
  if (!users.length)
    return (
      <AdminState
        icon={UserIcon}
        title="No members found"
        description="Try a different handle or broaden your filters."
        className="rounded-none border-0"
      />
    );

  return (
    <div className="w-full font-sans text-[#b5e3c4]">
      <Table>
        <TableHeader className="bg-black/20">
          <TableRow className="border-b border-[#2b3031] hover:bg-transparent transition-none">
            <TableHead className="h-10 px-6 text-xs font-medium text-[#929b98]">
              Member
            </TableHead>
            <TableHead className="h-10 px-6 text-xs font-medium text-[#929b98]">
              Role
            </TableHead>
            <TableHead className="h-10 px-6 text-xs font-medium text-[#929b98] text-center">
              Rating
            </TableHead>
            <TableHead className="h-10 px-6 text-xs font-medium text-[#929b98]">
              Joined
            </TableHead>
            <TableHead className="h-10 px-6 text-xs font-medium text-[#929b98] text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="relative">
          <AnimatePresence mode="popLayout">
            {users.map((user, idx) => {
              const roleActionLabel =
                user.role === "admin" ? "Remove admin" : "Make admin";
              return (
                <m.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="group border-b border-[#2b3031] hover:bg-[#131715] transition-colors"
                >
                  {/* User Identity */}
                  <TableCell className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar
                        onClick={() => onFetchStats(user._id)}
                        className="size-9 rounded-xl border border-[#2b3031] bg-[#131715] cursor-pointer hover:opacity-80 transition-opacity"
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
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => onFetchStats(user._id)}
                            className="text-xs font-medium text-[#f1f3ee] hover:text-[#f1f3ee] cursor-pointer"
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
                        <span className="text-xs font-medium text-[#929b98]">
                          ID: {user._id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Access Role */}
                  <TableCell className="px-6 py-3.5">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl text-xs font-medium border",
                        user.role === "admin"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-[#b5e3c4]/[0.06] text-[#929b98] border-[#2b3031]",
                      )}
                    >
                      {user.role === "admin" ? (
                        <Crown size={10} />
                      ) : (
                        <UserIcon size={10} className="opacity-40" />
                      )}
                      <span>{user.role}</span>
                    </div>
                  </TableCell>

                  {/* Rating */}
                  <TableCell className="px-6 py-3.5 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-[#f1f3ee] tabular-nums">
                        {user.rating || 0}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium mt-0.5",
                          getRankColor(user.rating),
                        )}
                      >
                        {getRankFromRating(user.rating)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Join Date */}
                  <TableCell className="px-6 py-3.5">
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-medium text-[#929b98]">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "N/A"}
                      </span>
                      <span className="text-xs font-medium text-[#929b98] mt-0.5">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              },
                            )
                          : "00:00"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onFetchStats(user._id)}
                        disabled={loadingStats}
                        className="h-10 px-2.5 rounded-xl bg-transparent border border-[#2b3031] hover:bg-[#b5e3c4]/[0.06] text-[13px] font-medium text-[#b5e3c4]"
                      >
                        {loadingStats && statsDialogId === user._id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          "View stats"
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          onRoleUpdate(
                            user._id,
                            user.role === "admin" ? "user" : "admin",
                          )
                        }
                        disabled={updatingId === user._id}
                        className={cn(
                          "h-10 px-2.5 rounded-xl border text-xs font-medium transition-colors",
                          user.role === "admin"
                            ? "bg-red-950/10 border-red-500/20 text-red-400 hover:bg-red-500/15 hover:border-red-500/35"
                            : "bg-[#131715] border-[#2b3031] text-[#b5e3c4] hover:bg-[#b5e3c4]/[0.06] hover:border-[#2b3031]",
                        )}
                      >
                        {updatingId === user._id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          roleActionLabel
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </m.tr>
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}
