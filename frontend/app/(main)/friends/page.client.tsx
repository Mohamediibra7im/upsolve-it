"use client";

import MemberPageState from "@/components/features/profile/MemberPageState";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const { friends, isLoading, isError: friendsError, mutate: mutateFriends } = useFriends(!!user);
  const {
    incoming,
    outgoing,
    isLoading: requestsLoading,
    isError: requestsError,
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
    <div className="min-h-screen relative pb-20 font-sans text-foreground">

      <div className="mx-auto w-full py-8 sm:py-12 space-y-8 max-w-7xl">

        <m.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Users size={12} className="text-primary" />
            <span>Your community</span>
            <span className="flex-1 border-b border-border" />
            <span>Community</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-foreground font-heading text-3xl sm:text-4xl font-medium tracking-tight leading-tight">
              Better, together.
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Connect with fellow learners, compare your progress, and keep each other going.
            </p>
          </div>
        </m.div>

        <div className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24">
        {/* Add a connection */}
        <div className="p-5 border border-border bg-card relative overflow-hidden rounded-2xl">
          <h2 className="mb-2 font-heading text-xl font-medium tracking-tight text-foreground">Grow your circle</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">Add a friend with their Codeforces handle to follow their practice.</p>
          <form onSubmit={handleSendRequest} className="flex flex-col gap-4">
            <div className="flex-1 space-y-2">
              <label
                htmlFor="friend-handle"
                className="text-xs font-medium text-muted-foreground"
              >
                Codeforces handle
              </label>
              <Input
                id="friend-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Enter a Codeforces handle"
                className="h-10 rounded-lg border border-border bg-card text-xs text-primary placeholder:text-muted-foreground focus:border-border focus-visible:ring-2 focus-visible:ring-ring font-sans"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <Button
              type="submit"
              disabled={adding || !normalizeCodeforcesHandleInput(handle)}
              className="h-10 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:bg-primary transition-all font-sans sm:px-6 shrink-0"
            >
              {adding ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <UserPlus size={12} />
              )}
              Send request
            </Button>
          </form>
        </div>

        <p className="mt-4 px-2 text-sm leading-relaxed text-muted-foreground">Once you’re connected, open a friend’s profile to see their sessions, solved problems, and progress.</p>
        </aside>
        <div className="min-w-0 space-y-8">
        {requestsError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"><p className="text-sm text-muted-foreground">Friend requests are unavailable right now.</p><Button variant="outline" onClick={() => mutateRequests()}>Try again</Button></div>}
        {/* Incoming requests */}
        {!requestsLoading && incoming.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground pb-1">
              <span>Friend requests</span>
              <span className="tabular-nums">({incoming.length})</span>
            </div>
            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              {incoming.map((row) => (
                <div
                  key={row._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 py-5 justify-between transition-colors px-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative size-10 shrink-0 rounded-lg border border-border overflow-hidden bg-card">
                      <Avatar className="size-full rounded-lg"><AvatarImage src={row.from.avatar || undefined} alt="" /><AvatarFallback className="bg-primary/10 text-primary">{row.from.codeforcesHandle.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {row.from.codeforcesHandle}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
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
                      className="h-9 rounded-lg bg-primary text-primary-foreground font-medium text-xs hover:bg-primary transition-all font-sans"
                      onClick={() => acceptRequest(row._id)}
                      disabled={requestBusyId === row._id}
                    >
                      {requestBusyId === row._id ? (
                        <Loader2 className="size-3 animate-spin mr-1" />
                      ) : (
                        <Check size={10} className="mr-1" />
                      )}
                      Accept
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg border border-border bg-transparent text-muted-foreground font-medium text-xs hover:bg-primary/10 hover:text-primary font-sans"
                      onClick={() => declineRequest(row._id)}
                      disabled={requestBusyId === row._id}
                    >
                      <X size={10} className="mr-1" />
                      Decline
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
            <div className="flex items-center gap-2 text-sm font-medium text-foreground pb-1">
              <span>Sent requests</span>
              <span className="tabular-nums">({outgoing.length})</span>
            </div>
            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              {outgoing.map((row) => (
                <div
                  key={row._id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 py-5 justify-between transition-colors px-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative size-10 shrink-0 rounded-lg border border-border overflow-hidden bg-card">
                      <Avatar className="size-full rounded-lg"><AvatarImage src={row.to.avatar || undefined} alt="" /><AvatarFallback className="bg-primary/10 text-primary">{row.to.codeforcesHandle.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {row.to.codeforcesHandle}
                      </p>
                      <p className="text-xs text-amber-300">Pending</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg border border-red-500/20 bg-transparent text-red-300 font-medium text-xs hover:bg-red-500/10 hover:text-red-400 font-sans"
                    onClick={() => cancelRequest(row._id)}
                    disabled={requestBusyId === row._id}
                  >
                    {requestBusyId === row._id ? (
                      <Loader2 className="size-3 animate-spin mr-1" />
                    ) : (
                      <Ban size={10} className="mr-1" />
                    )}
                    Cancel request
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends list */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground pb-1">
            <span>Your friends</span>
            <span className="tabular-nums">({sortedFriends.length})</span>
          </div>

          {isLoading ? (
            <MemberPageState kind="loading" title="Gathering your circle" description="Loading your friends’ profiles." />
          ) : friendsError && sortedFriends.length === 0 ? (
            <MemberPageState kind="error" title="We couldn’t load your friends" description="Your connections will appear here when the data is available."><Button variant="outline" onClick={() => mutateFriends()}>Try again</Button></MemberPageState>
          ) : sortedFriends.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-muted-foreground text-sm">
              Your circle starts here. Send a friend request to connect.
            </div>
          ) : (
            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              {sortedFriends.map((f) => (
                <m.div
                  key={f._id}
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 py-5 justify-between transition-colors px-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      onClick={() => openFriendStats(f._id)}
                      className="relative size-10 shrink-0 rounded-lg border border-border overflow-hidden bg-card cursor-pointer hover:opacity-85 transition-opacity"
                    >
                      <Avatar className="size-full rounded-lg"><AvatarImage src={f.avatar || undefined} alt="" /><AvatarFallback className="bg-primary/10 text-primary">{f.codeforcesHandle.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                    </div>
                    <div
                      onClick={() => openFriendStats(f._id)}
                      className="min-w-0 cursor-pointer group/friend"
                    >
                      <p className="font-medium text-sm text-foreground truncate group-hover/friend:text-foreground transition-colors">
                        {f.codeforcesHandle}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {f.rank} · rating {f.rating}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-lg border border-border bg-transparent text-primary font-medium text-xs hover:bg-primary/10 hover:text-foreground font-sans inline-flex items-center gap-1"
                      onClick={() => openFriendStats(f._id)}
                    >
                      <BarChart2 size={10} />
                      View progress
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "size-8 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all",
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
