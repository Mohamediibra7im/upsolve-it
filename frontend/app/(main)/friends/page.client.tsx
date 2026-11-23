"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import UserAvatar from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState, PageHead, Rank } from "@/components/ui/kit";
import Loader from "@/components/shared/Loader";
import { UserProfileDialog } from "@/components/features/profile";
import MemberPageState from "@/components/features/profile/MemberPageState";
import { useToast } from "@/components/providers/Toast";
import { useUser } from "@/hooks/auth";
import { useFriendRequests, useFriends } from "@/hooks/social";
import { apiClient } from "@/lib/apiClient";
import {
  isValidCodeforcesHandleFormat,
  normalizeCodeforcesHandleInput,
} from "@/services/codeforces/handle";
import type { FriendSummary } from "@/types/Friend";

function Person({ who }: { who: FriendSummary }) {
  return <UserAvatar {...who} size={32} />;
}

export default function FriendsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const {
    friends,
    isLoading,
    isError: friendsError,
    mutate: mutateFriends,
  } = useFriends(!!user);
  const {
    incoming,
    outgoing,
    isError: requestsError,
    mutate: mutateRequests,
  } = useFriendRequests(!!user);
  const { toast } = useToast();

  const [handle, setHandle] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<FriendSummary | null>(null);

  const refreshAll = () => Promise.all([mutateFriends(), mutateRequests()]);

  useEffect(() => {
    if (!isUserLoading && !user) router.push("/login");
  }, [user, isUserLoading, router]);

  const sortedFriends = [...friends].sort((a, b) =>
    a.codeforcesHandle.localeCompare(b.codeforcesHandle),
  );

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeCodeforcesHandleInput(handle);
    if (!normalized) return;
    if (!isValidCodeforcesHandleFormat(normalized)) {
      toast({
        title: "That is not a Codeforces handle.",
        description: "Handles use letters, digits, . and _ only.",
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
      toast(
        res.matchedIncomingRequest && res.friend
          ? {
              title: "You’re friends now.",
              description: `${res.friend.codeforcesHandle} had already sent you a request.`,
              durationMs: 3500,
            }
          : res.pending && res.to
            ? {
                title: "Request sent.",
                description: `Waiting for ${res.to.codeforcesHandle} to answer.`,
                durationMs: 3500,
              }
            : {
                title: res.message || "Done.",
                description: res.friend?.codeforcesHandle,
                durationMs: 3000,
              },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const unknown =
        /nobody with that handle|registered on this app|no registered user/i.test(
          msg,
        );
      toast({
        title: unknown
          ? "No account with that handle."
          : "Your request was not sent.",
        description: unknown
          ? "They need to sign up on Upsolve It before you can add them."
          : msg || "Try again in a moment.",
        variant: "destructive",
        durationMs: 6000,
      });
    } finally {
      setAdding(false);
    }
  };

  /** Runs one request or friend action, then refreshes both lists. */
  const act = async (
    id: string,
    call: () => Promise<unknown>,
    done: string,
    failed: string,
  ) => {
    setBusyId(id);
    try {
      await call();
      await refreshAll();
      toast({ title: done, variant: "success", durationMs: 3000 });
    } catch (err) {
      toast({
        title: failed,
        description:
          err instanceof Error ? err.message : "Try again in a moment.",
        variant: "destructive",
        durationMs: 5000,
      });
    } finally {
      setBusyId(null);
    }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    await act(
      removing._id,
      () => apiClient.delete(`/api/friends/${removing._id}`),
      `${removing.codeforcesHandle} was removed from your friends.`,
      "Your friend was not removed.",
    );
    setRemoving(null);
  };

  if (isUserLoading || !user) return <Loader fullScreen={false} />;

  return (
    <>
      <PageHead eyebrow="Friends" title="Practice is better with company.">
        <form onSubmit={sendRequest} className="flex w-full gap-3 sm:w-auto">
          <label htmlFor="friend-handle" className="sr-only">
            Codeforces handle of the friend to add
          </label>
          <Input
            id="friend-handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="Codeforces handle, e.g. tourist"
            className="h-10 min-w-0 flex-1 sm:w-64"
            autoComplete="off"
            spellCheck={false}
          />
          <Button
            type="submit"
            disabled={adding || !normalizeCodeforcesHandleInput(handle)}
          >
            {adding ? <Loader2 className="animate-spin" /> : <UserPlus />}
            Send request
          </Button>
        </form>
      </PageHead>

      {requestsError && (
        <div
          role="alert"
          className="u-panel mb-6 flex flex-wrap items-center justify-between gap-3 px-5 py-4"
        >
          <p>Friend requests did not load. Try again in a moment.</p>
          <Button variant="outline" size="sm" onClick={() => mutateRequests()}>
            Try again
          </Button>
        </div>
      )}

      {(incoming.length > 0 || outgoing.length > 0) && (
        <div className="mb-6 grid items-start gap-6 lg:grid-flow-col lg:auto-cols-fr">
          {incoming.length > 0 && (
            <section className="u-panel">
              <div className="u-panel__head">
                <h2 className="t-h2">Requests for you</h2>
                <span className="u-count">{incoming.length}</span>
              </div>
              {incoming.map((row) => (
                <div key={row._id} className="u-prow">
                  <Person who={row.from} />
                  <div className="min-w-0">
                    <div className="u-prow__name">
                      {row.from.codeforcesHandle}
                    </div>
                    <div className="u-prow__meta flex flex-wrap gap-x-3">
                      <Rank rating={row.from.rating} showRating />
                      {row.createdAt && (
                        <span>
                          Sent{" "}
                          {new Date(row.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 max-sm:col-start-2 max-sm:col-end-[-1]">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === row._id}
                      onClick={() =>
                        act(
                          row._id,
                          () =>
                            apiClient.post(
                              `/api/friends/requests/${row._id}/accept`,
                            ),
                          `You and ${row.from.codeforcesHandle} are friends now.`,
                          "The request was not accepted.",
                        )
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busyId === row._id}
                      onClick={() =>
                        act(
                          row._id,
                          () =>
                            apiClient.post(
                              `/api/friends/requests/${row._id}/decline`,
                            ),
                          "Request declined.",
                          "The request was not declined.",
                        )
                      }
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {outgoing.length > 0 && (
            <section className="u-panel">
              <div className="u-panel__head">
                <h2 className="t-h3">Sent, waiting for an answer</h2>
                <span className="t-num t-muted">{outgoing.length}</span>
              </div>
              {outgoing.map((row) => (
                <div key={row._id} className="u-prow">
                  <Person who={row.to} />
                  <div className="u-prow__name">{row.to.codeforcesHandle}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busyId === row._id}
                    onClick={() =>
                      act(
                        row._id,
                        () =>
                          apiClient.delete(`/api/friends/requests/${row._id}`),
                        "Request cancelled.",
                        "The request was not cancelled.",
                      )
                    }
                  >
                    Cancel request
                  </Button>
                </div>
              ))}
            </section>
          )}
        </div>
      )}

      {isLoading ? (
        <Loader fullScreen={false} message="Loading your friends…" />
      ) : friendsError && sortedFriends.length === 0 ? (
        <MemberPageState
          kind="error"
          title="Your friends did not load."
          description="The server did not answer. Try again in a moment."
        >
          <Button variant="outline" onClick={() => mutateFriends()}>
            Try again
          </Button>
        </MemberPageState>
      ) : sortedFriends.length === 0 ? (
        <EmptyState
          title="No friends yet."
          action={
            <Button
              variant="outline"
              onClick={() => document.getElementById("friend-handle")?.focus()}
            >
              Add a friend
            </Button>
          }
        >
          Send a request with a Codeforces handle. Once they accept, you can
          open their profile to see their sessions, solved problems and
          progress.
        </EmptyState>
      ) : (
        <section className="u-panel">
          <div className="u-panel__head">
            <h2 className="t-h2">Your friends</h2>
            <span className="t-num t-muted">{sortedFriends.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="u-table">
              <thead>
                <tr>
                  <th>Handle</th>
                  <th>Rank</th>
                  <th className="num">Rating</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedFriends.map((f) => (
                  <tr key={f._id}>
                    <td>
                      <span className="flex items-center gap-3">
                        <Person who={f} />
                        <b>{f.codeforcesHandle}</b>
                      </span>
                    </td>
                    <td>
                      <Rank rating={f.rating} />
                    </td>
                    <td className="num">{f.rating || "—"}</td>
                    <td>
                      <span className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProfileId(f._id)}
                        >
                          View progress
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="u-btn--sm"
                          aria-label={`Remove ${f.codeforcesHandle}`}
                          onClick={() => setRemoving(f)}
                        >
                          <Trash2 />
                        </Button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="u-panel__foot">
            Open a friend’s progress to see their sessions, solved problems and
            achievements.
          </div>
        </section>
      )}

      <UserProfileDialog
        userId={profileId}
        open={!!profileId}
        onOpenChange={(open) => !open && setProfileId(null)}
      />

      <Dialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="t-h2">
              Remove {removing?.codeforcesHandle} from your friends?
            </DialogTitle>
            <DialogDescription className="t-muted">
              You will stop seeing each other’s progress. You can send a new
              request later.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={!!busyId}
              onClick={() => setRemoving(null)}
            >
              Keep friend
            </Button>
            <Button
              variant="destructive"
              disabled={!!busyId}
              onClick={confirmRemove}
            >
              <Trash2 />
              {busyId ? "Removing…" : "Remove friend"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
