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
import { Badge } from "@/components/ui/badge";
import type { FriendSummary, UpsolveStanding } from "@/types/Friend";

const NO_STANDING: UpsolveStanding = { waiting: 0, oldestAt: null, streak: 0 };
const days = (n: number) => `${n} ${n === 1 ? "day" : "days"}`;
/** "12 days" since the oldest waiting problem was added; a dash with none. */
const oldest = (at: string | null) =>
  at
    ? days(Math.max(0, Math.floor((Date.now() - Date.parse(at)) / 86_400_000)))
    : "—";

function Person({ who }: { who: FriendSummary }) {
  return <UserAvatar {...who} size={32} />;
}

const FRIEND_PERKS = [
  [
    "Upsolve standings",
    "You and your friends ranked by upsolve streak, then by how little each of you has left waiting.",
  ],
  [
    "Shared problems",
    "Open a friend to see the problems you both still owe, and solve them together.",
  ],
  [
    "Their progress",
    "Sessions, solved problems and rating of each friend, on one profile.",
  ],
];

export default function FriendsPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const {
    friends,
    me,
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
  // The standings: you among your friends, longest live streak first, then
  // the shorter queue.
  const standings = [
    ...sortedFriends.map((who) => ({ who, isMe: false })),
    ...(user
      ? [{ who: { ...user, upsolve: me } as FriendSummary, isMe: true }]
      : []),
  ]
    .map((row) => ({ ...row, upsolve: row.who.upsolve ?? NO_STANDING }))
    .sort(
      (a, b) =>
        b.upsolve.streak - a.upsolve.streak ||
        a.upsolve.waiting - b.upsolve.waiting ||
        a.who.codeforcesHandle.localeCompare(b.who.codeforcesHandle),
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <EmptyState
            title="No friends yet."
            action={
              <Button
                variant="outline"
                onClick={() =>
                  document.getElementById("friend-handle")?.focus()
                }
              >
                Add a friend
              </Button>
            }
          >
            Send a request with a Codeforces handle. Once they accept, you can
            open their profile to see their sessions, solved problems and
            progress.
          </EmptyState>
          <div className="grid gap-6 sm:grid-cols-3">
            {FRIEND_PERKS.map(([title, text], i) => (
              <section
                key={title}
                className="u-panel grid content-start gap-3 p-6"
              >
                <span className="u-step" aria-hidden="true">
                  {i + 1}
                </span>
                <h2 className="t-h3">{title}</h2>
                <p className="t-muted">{text}</p>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <section className="u-panel" aria-labelledby="standings-title">
          <div className="u-panel__head">
            <h2 id="standings-title" className="t-h2">
              Upsolve standings
            </h2>
            <span className="t-sm t-muted">
              You and <span className="t-num">{sortedFriends.length}</span>{" "}
              {sortedFriends.length === 1 ? "friend" : "friends"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="u-table">
              <thead>
                <tr>
                  <th className="num">#</th>
                  <th>Handle</th>
                  <th className="num">Streak</th>
                  <th className="num">Waiting</th>
                  <th className="num">Oldest</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {standings.map(({ who, isMe, upsolve }, i) => (
                  <tr
                    key={who._id}
                    className={isMe ? "[&>td]:bg-accent-soft" : undefined}
                  >
                    <td className="num">{i + 1}</td>
                    <td>
                      <span className="flex items-center gap-3">
                        <Person who={who} />
                        <span className="grid min-w-0">
                          <b className="flex items-center gap-2 whitespace-nowrap">
                            {who.codeforcesHandle}
                            {isMe && <Badge variant="accent">You</Badge>}
                          </b>
                          <Rank
                            rating={who.rating}
                            showRating
                            className="t-sm"
                          />
                        </span>
                      </span>
                    </td>
                    <td className="num whitespace-nowrap">
                      {days(upsolve.streak)}
                    </td>
                    <td className="num">{upsolve.waiting}</td>
                    <td className="num whitespace-nowrap">
                      {oldest(upsolve.oldestAt)}
                    </td>
                    <td>
                      {!isMe && (
                        <span className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setProfileId(who._id)}
                          >
                            View progress
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="u-btn--sm"
                            aria-label={`Remove ${who.codeforcesHandle}`}
                            onClick={() => setRemoving(who)}
                          >
                            <Trash2 />
                          </Button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="u-panel__foot">
            Ranked by upsolve streak, then by the shorter queue. Open a friend
            to see the problems you are both stuck on.
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
