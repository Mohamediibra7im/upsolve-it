"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import {
  Users,
  UserPlus,
  BarChart2,
  Trash2,
  ArrowLeft,
  Loader2,
  Check,
  X,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {useUser} from "@/hooks/auth";
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
    <div className="container mx-auto px-4 py-12 space-y-10 max-w-4xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" asChild className="w-fit -ml-2 gap-2 font-black uppercase tracking-widest text-[10px]">
            <Link href="/dashboard">
              <ArrowLeft className="size-4" />
              Dashboard
            </Link>
          </Button>
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <Users className="size-3.5" />
            Community
          </m.div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
            Friends
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg">
            Send a friend request by Codeforces handle. When they accept, they appear below and you can view their training stats.
          </p>
        </div>
      </div>

      <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8">
        <form onSubmit={handleSendRequest} className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 space-y-2">
            <label
              htmlFor="friend-handle"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              Codeforces handle
            </label>
            <Input
              id="friend-handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="their_handle"
              className="h-12 rounded-xl border-border/40 bg-background/50"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <Button
            type="submit"
            disabled={adding || !normalizeCodeforcesHandleInput(handle)}
            className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 sm:px-8"
          >
            {adding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Send request
          </Button>
        </form>
      </Card>

      {requestsLoading ? (
        <p className="text-sm text-muted-foreground">Loading friend requests…</p>
      ) : (
        <>
          {incoming.length > 0 && (
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Incoming requests ({incoming.length})
              </h2>
              <ul className="space-y-3 list-none p-0 m-0">
                {incoming.map((row) => (
                  <li key={row._id}>
                    <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative size-12 shrink-0 rounded-xl overflow-hidden border border-border/40 bg-muted">
                          <Image
                            src={row.from.avatar}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black truncate text-foreground">
                            {row.from.codeforcesHandle}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatRequestTime(
                              row.createdAt != null
                                ? String(row.createdAt)
                                : undefined,
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-1.5"
                          onClick={() => acceptRequest(row._id)}
                          disabled={requestBusyId === row._id}
                        >
                          {requestBusyId === row._id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          Accept
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-1.5"
                          onClick={() => declineRequest(row._id)}
                          disabled={requestBusyId === row._id}
                        >
                          <X className="size-3.5" />
                          Decline
                        </Button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {outgoing.length > 0 && (
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
                Sent requests ({outgoing.length})
              </h2>
              <ul className="space-y-3 list-none p-0 m-0">
                {outgoing.map((row) => (
                  <li key={row._id}>
                    <Card className="border-border/40 bg-card/15 backdrop-blur-xl rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative size-12 shrink-0 rounded-xl overflow-hidden border border-border/40 bg-muted">
                          <Image
                            src={row.to.avatar}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black truncate text-foreground">
                            {row.to.codeforcesHandle}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Pending</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-1.5 text-muted-foreground"
                        onClick={() => cancelRequest(row._id)}
                        disabled={requestBusyId === row._id}
                      >
                        {requestBusyId === row._id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Ban className="size-3.5" />
                        )}
                        Cancel
                      </Button>
                    </Card>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <div>
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Your friends ({sortedFriends.length})
        </h2>
        {isLoading ? (
          <Loader message="Loading friends..." />
        ) : sortedFriends.length === 0 ? (
          <Card className="border-dashed border-border/50 bg-card/10 rounded-[2rem] p-12 text-center text-muted-foreground text-sm">
            No friends yet. Send a request or accept one when someone invites you.
          </Card>
        ) : (
          <ul className="space-y-3 list-none p-0 m-0">
            {sortedFriends.map((f) => (
              <li key={f._id}>
                <m.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div 
                      onClick={() => openFriendStats(f._id)}
                      className="relative size-12 shrink-0 rounded-xl overflow-hidden border border-border/40 bg-muted cursor-pointer hover:opacity-85 transition-opacity"
                    >
                      <Image
                        src={f.avatar}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div 
                      onClick={() => openFriendStats(f._id)}
                      className="min-w-0 cursor-pointer group/friend"
                    >
                      <p className="font-black truncate text-foreground group-hover/friend:text-primary transition-colors">
                        {f.codeforcesHandle}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {f.rank} · rating {f.rating}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-1.5"
                      onClick={() => openFriendStats(f._id)}
                    >
                      <BarChart2 className="size-3.5" />
                      View stats
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10",
                        removingId === f._id && "opacity-70",
                      )}
                      onClick={() => handleRemove(f)}
                      disabled={removingId === f._id}
                      aria-label={`Remove ${f.codeforcesHandle}`}
                    >
                      {removingId === f._id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                </Card>
                </m.div>
              </li>
            ))}
          </ul>
        )}
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
