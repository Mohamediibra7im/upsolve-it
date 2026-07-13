"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import {
  Users,
  UserPlus,
  BarChart2,
  Trash2,
  Loader2,
  Check,
  X,
  Ban,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/auth";
import { useFriends } from "@/hooks/social";
import { useFriendRequests } from "@/hooks/social";
import { apiClient } from "@/lib/apiClient";
import type { FriendSummary } from "@/types/Friend";
import Loader from "@/components/shared/Loader";
import { UserProfileDialog } from "@/components/features/profile";
import { useToast } from "@/components/providers/Toast";
import { cn } from "@/lib/utils";
import {
  isValidCodeforcesHandleFormat,
  normalizeCodeforcesHandleInput,
} from "@/services/codeforces/handle";

function friendRequestErrorMessage(raw: string): { title: string; description?: string } {
  const m = raw.toLowerCase();
  if (
    m.includes("nobody with that handle") ||
    m.includes("registered on this app") ||
    m.includes("no registered user")
  ) {
    return {
      title: "No account on this site",
      description:
        "Nobody with that handle has signed up here yet. They need to register before you can add them.",
    };
  }
  return {
    title: "Could not send request",
    description: raw,
  };
}

function formatRequestTime(createdAt?: string) {
  if (!createdAt) return "";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function FriendsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const { friends, isLoading, mutate: mutateFriends } = useFriends(!!user);
  const {
    incoming,
    outgoing,
    isLoading: requestsLoading,
    mutate: mutateRequests,
  } = useFriendRequests(!!user);
  const { toast } = useToast();

  const [handle, setHandle] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [requestBusyId, setRequestBusyId] = useState<string | null>(null);
  const [statsDialog, setStatsDialog] = useState<{
    open: boolean;
    userId: string | null;
  }>({ open: false, userId: null });

  const refreshAll = async () => {
    await Promise.all([mutateFriends(), mutateRequests()]);
  };

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [user, isUserLoading, router]);

  const sortedFriends = [...friends].sort((a, b) =>
    a.codeforcesHandle.localeCompare(b.codeforcesHandle),
  );

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeCodeforcesHandleInput(handle);
    if (!normalized) return;
    if (!isValidCodeforcesHandleFormat(normalized)) {
      toast({
        title: "Invalid handle",
        description: "Use a normal Codeforces username (letters, digits, . or _).",
        variant: "destructive",
        durationMs: 5000,
      });
      return;
    }
    setAdding(true);
    try {
      const res = await apiClient.post<{
        message: string;
        matchedIncomingRequest?: boolean;
        pending?: boolean;
        friend?: FriendSummary;
        to?: FriendSummary;
      }>("/api/friends/requests", { codeforcesHandle: normalized });
      setHandle("");
      await refreshAll();

      if (res.matchedIncomingRequest && res.friend) {
        toast({
          title: "You’re friends now",
          description: `${res.friend.codeforcesHandle} accepted your request (matched).`,
          durationMs: 3500,
        });
      } else if (res.pending && res.to) {
        toast({
          title: "Request sent",
          description: `Waiting for ${res.to.codeforcesHandle} to respond.`,
          durationMs: 3500,
        });
      } else if (res.friend) {
        toast({
          title: res.message || "Done",
          description: `${res.friend.codeforcesHandle}`,
          durationMs: 3000,
        });
      } else {
        toast({
          title: res.message || "Done",
          durationMs: 3000,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Please try again.";
      const mapped = friendRequestErrorMessage(msg);
      toast({
        title: mapped.title,
        description: mapped.description ?? msg,
        variant: "destructive",
        durationMs: 6000,
      });
    } finally {
      setAdding(false);
    }
  };

  const acceptRequest = async (requestId: string) => {
    setRequestBusyId(requestId);
    try {
      await apiClient.post(`/api/friends/requests/${requestId}/accept`);
      await refreshAll();
      toast({ title: "Request accepted", durationMs: 3000 });
    } catch (err) {
      toast({
        title: "Could not accept",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
        durationMs: 5000,
      });
    } finally {
      setRequestBusyId(null);
    }
  };

  const declineRequest = async (requestId: string) => {
    setRequestBusyId(requestId);
    try {
      await apiClient.post(`/api/friends/requests/${requestId}/decline`);
      await refreshAll();
      toast({ title: "Request declined", durationMs: 3000 });
    } catch (err) {
      toast({
        title: "Could not decline",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
        durationMs: 5000,
      });
    } finally {
      setRequestBusyId(null);
    }
  };

  const cancelRequest = async (requestId: string) => {
    setRequestBusyId(requestId);
    try {
      await apiClient.delete(`/api/friends/requests/${requestId}`);
      await refreshAll();
      toast({ title: "Request cancelled", durationMs: 3000 });
    } catch (err) {
      toast({
        title: "Could not cancel",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
        durationMs: 5000,
      });
    } finally {
      setRequestBusyId(null);
    }
  };

  const handleRemove = async (f: FriendSummary) => {
    setRemovingId(f._id);
    try {
      await apiClient.delete(`/api/friends/${f._id}`);
      await refreshAll();
      if (statsDialog.userId === f._id) {
        setStatsDialog({ open: false, userId: null });
      }
      toast({
        title: "Removed",
        description: `${f.codeforcesHandle} was removed from your friends.`,
        durationMs: 3000,
      });
    } catch (err) {
      toast({
        title: "Could not remove friend",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
        durationMs: 5000,
      });
    } finally {
      setRemovingId(null);
    }
  };

  const openFriendStats = (friendUserId: string) => {
    setStatsDialog({ open: true, userId: friendUserId });
  };

  if (isUserLoading || !user) {
    return <Loader message="Loading..." />;
  }

  return (
    <div className="min-h-screen relative pb-20 font-mono text-emerald-400">
      <div className="absolute inset-0 -z-10 bg-[#040604]">
        <div className="absolute inset-0 bg-terminal-scanlines opacity-[0.04]" />
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 space-y-8 max-w-4xl">
        {/* Terminal Header */}
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40">
            <Users size={12} className="text-emerald-400" />
            <span>FRIENDS_DATABASE // SOCIAL_MATRIX</span>
            <span className="flex-1 border-b border-emerald-500/10" />
            <Cpu size={10} className="text-emerald-500/30" />
            <span>COMMUNITY: ONLINE</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-emerald-300 uppercase tracking-wider">
              Friend Directory Station
            </h1>
            <p className="text-[11px] text-emerald-500/40 max-w-lg">
              Send a connection request using Codeforces handle credentials. Accept incoming requests to sync stats.
            </p>
          </div>
        </m.div>

        {/* Input Form Panel */}
        <div className="p-5 border border-emerald-500/15 bg-emerald-950/5 relative overflow-hidden rounded-lg">
          <form onSubmit={handleSendRequest} className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 space-y-2">
              <label
                htmlFor="friend-handle"
                className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40"
              >
                Codeforces handle credentials
              </label>
              <Input
                id="friend-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="enter_handle..."
                className="h-10 rounded border border-emerald-500/20 bg-[#060a08] text-xs text-emerald-400 placeholder:text-emerald-500/30 focus:border-emerald-500/40 focus:ring-0 font-mono"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <Button
              type="submit"
              disabled={adding || !normalizeCodeforcesHandleInput(handle)}
              className="h-10 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[9px] shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:bg-emerald-400 transition-all font-mono sm:px-6 shrink-0"
            >
              {adding ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <UserPlus size={12} />
              )}
              [ SEND_REQUEST.EXE ]
            </Button>
          </form>
        </div>

        {/* Incoming requests */}
        {!requestsLoading && incoming.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40 border-b border-emerald-500/10 pb-1">
              <span>INCOMING_REQUEST_NODES // PENDING</span>
              <span className="tabular-nums">({incoming.length})</span>
            </div>
            <div className="divide-y divide-emerald-500/[0.07]">
              {incoming.map((row) => (
                <div
                  key={row._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 justify-between hover:bg-emerald-950/5 transition-all px-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative size-10 shrink-0 rounded border border-emerald-500/10 overflow-hidden bg-emerald-950/20">
                      <Image
                        src={row.from.avatar}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover opacity-80"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-emerald-300 truncate">
                        {row.from.codeforcesHandle}
                      </p>
                      <p className="text-[9px] text-emerald-500/30 tabular-nums">
                        {formatRequestTime(
                          row.createdAt != null ? String(row.createdAt) : undefined,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 rounded bg-emerald-500 text-emerald-950 font-bold uppercase tracking-widest text-[8px] hover:bg-emerald-400 transition-all font-mono"
                      onClick={() => acceptRequest(row._id)}
                      disabled={requestBusyId === row._id}
                    >
                      {requestBusyId === row._id ? (
                        <Loader2 className="size-3 animate-spin mr-1" />
                      ) : (
                        <Check size={10} className="mr-1" />
                      )}
                      [ ACCEPT.EXE ]
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded border border-emerald-500/20 bg-transparent text-emerald-500/60 font-bold uppercase tracking-widest text-[8px] hover:bg-emerald-500/10 hover:text-emerald-400 font-mono"
                      onClick={() => declineRequest(row._id)}
                      disabled={requestBusyId === row._id}
                    >
                      <X size={10} className="mr-1" />
                      [ DECLINE.SH ]
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outgoing requests */}
        {!requestsLoading && outgoing.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40 border-b border-emerald-500/10 pb-1">
              <span>OUTGOING_TRANSMISSIONS // PENDING</span>
              <span className="tabular-nums">({outgoing.length})</span>
            </div>
            <div className="divide-y divide-emerald-500/[0.07]">
              {outgoing.map((row) => (
                <div
                  key={row._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 justify-between hover:bg-emerald-950/5 transition-all px-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative size-10 shrink-0 rounded border border-emerald-500/10 overflow-hidden bg-emerald-950/20">
                      <Image
                        src={row.to.avatar}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover opacity-80"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-emerald-300 truncate">
                        {row.to.codeforcesHandle}
                      </p>
                      <p className="text-[9px] text-amber-500/60 uppercase tracking-widest">Pending</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded border border-red-500/20 bg-transparent text-red-400/60 font-bold uppercase tracking-widest text-[8px] hover:bg-red-500/10 hover:text-red-400 font-mono"
                    onClick={() => cancelRequest(row._id)}
                    disabled={requestBusyId === row._id}
                  >
                    {requestBusyId === row._id ? (
                      <Loader2 className="size-3 animate-spin mr-1" />
                    ) : (
                      <Ban size={10} className="mr-1" />
                    )}
                    [ CANCEL.SH ]
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends list */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[9px] font-bold tracking-wider text-emerald-500/40 border-b border-emerald-500/10 pb-1">
            <span>SYNCED_NODES // CURRENT_DIRECTORY</span>
            <span className="tabular-nums">({sortedFriends.length})</span>
          </div>

          {isLoading ? (
            <Loader message="Loading friends..." />
          ) : sortedFriends.length === 0 ? (
            <div className="py-12 text-center text-emerald-500/20 text-xs">
              [SYS.EMPTY // NO SYNCED FRIENDS FOUND]
            </div>
          ) : (
            <div className="divide-y divide-emerald-500/[0.07]">
              {sortedFriends.map((f) => (
                <m.div
                  key={f._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 justify-between hover:bg-emerald-950/5 transition-all px-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      onClick={() => openFriendStats(f._id)}
                      className="relative size-10 shrink-0 rounded border border-emerald-500/10 overflow-hidden bg-emerald-950/20 cursor-pointer hover:opacity-85 transition-opacity"
                    >
                      <Image
                        src={f.avatar}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover opacity-80"
                        unoptimized
                      />
                    </div>
                    <div
                      onClick={() => openFriendStats(f._id)}
                      className="min-w-0 cursor-pointer group/friend"
                    >
                      <p className="font-bold text-xs text-emerald-300 truncate group-hover/friend:text-emerald-200 transition-colors">
                        {f.codeforcesHandle}
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500/40">
                        {f.rank.toUpperCase()} · rating {f.rating}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded border border-emerald-500/25 bg-transparent text-emerald-400 font-bold uppercase tracking-widest text-[8px] hover:bg-emerald-500/10 hover:text-emerald-300 font-mono inline-flex items-center gap-1"
                      onClick={() => openFriendStats(f._id)}
                    >
                      <BarChart2 size={10} />
                      [ VIEW_STATS.EXE ]
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "size-8 rounded text-emerald-500/30 hover:text-red-400 hover:bg-red-500/10 transition-all",
                        removingId === f._id && "opacity-70",
                      )}
                      onClick={() => handleRemove(f)}
                      disabled={removingId === f._id}
                      aria-label={`Remove ${f.codeforcesHandle}`}
                    >
                      {removingId === f._id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                    </Button>
                  </div>
                </m.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <UserProfileDialog
        userId={statsDialog.userId}
        open={statsDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setStatsDialog({ open: false, userId: null });
          }
        }}
      />
    </div>
  );
}
