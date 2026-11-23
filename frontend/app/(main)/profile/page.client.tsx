"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Bar, Stat } from "@/components/ui/kit";
import { isEarned } from "@/components/features/profile/Achievements";
import { useProfileData } from "@/components/features/profile/useProfileData";

const days = (n = 0) => `${n} ${n === 1 ? "day" : "days"}`;

export default function ProfileOverviewPage() {
  const { user, training, upsolved, upsolvedProblems, streaks, achievements } =
    useProfileData();
  if (!user) return null;

  const earned = achievements.filter(isEarned).length;
  // The ones still open, closest to done first.
  const upNext = achievements
    .filter((a) => !isEarned(a))
    .sort((a, b) => b.value / b.target - a.value / a.target)
    .slice(0, 3);

  return (
    <>
      <div className="u-panel u-strip">
        <Stat
          label="Training sessions"
          value={training.sessions}
          sub={`${training.solveRate}% solve rate`}
        />
        <Stat
          label="Problems solved"
          value={training.solved}
          unit={`/ ${training.problems}`}
          sub="In training sessions"
        />
        <Stat
          label="Avg. performance"
          value={training.avgPerformance ?? "—"}
          sub={`Best ${training.bestPerformance ?? "—"}`}
        />
        <Stat
          label="Upsolved"
          value={upsolved}
          sub={`${upsolvedProblems.length - upsolved} waiting in your queue`}
        />
        <Stat
          label="Training streak"
          value={streaks?.trainingStreak ?? 0}
          unit={(streaks?.trainingStreak ?? 0) === 1 ? "day" : "days"}
          sub={`Longest ${days(streaks?.bestStreak)}`}
        />
        <Stat
          label="Consistency"
          value={streaks?.consistencyScore ?? 0}
          unit="%"
          sub="Active days, last 7"
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <section className="u-panel lg:col-span-8" aria-labelledby="next-title">
          <div className="u-panel__head">
            <h2 id="next-title" className="t-h2">
              Next achievements
            </h2>
            <span className="t-sm t-muted">
              <span className="t-num">
                {earned} of {achievements.length}
              </span>{" "}
              earned
            </span>
          </div>
          {upNext.length ? (
            upNext.map((a) => (
              <div key={a.name} className="u-kv flex-wrap items-center">
                <div className="min-w-0 basis-56">
                  <h3 className="t-h3">{a.name}</h3>
                  <p className="t-sm t-muted">{a.desc}</p>
                </div>
                <div className="grid w-full max-w-64 gap-2">
                  <span className="t-sm t-num text-right">
                    {a.value}
                    {a.unit} of {a.target}
                    {a.unit}
                  </span>
                  <Bar
                    value={(a.value / a.target) * 100}
                    label={`${a.name} progress`}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="u-panel__body flex items-center gap-3">
              <Badge variant="solved">
                <Check />
                All earned
              </Badge>
              <span>You have earned every achievement.</span>
            </div>
          )}
          <div className="u-panel__foot">
            <span>Closest to done first.</span>
            <Link href="/profile/achievements" className="u-btn u-btn--sm">
              All achievements
            </Link>
          </div>
        </section>

        <section
          className="u-panel lg:col-span-4"
          aria-labelledby="streaks-title"
        >
          <div className="u-panel__head">
            <h2 id="streaks-title" className="t-h2">
              Streaks
            </h2>
          </div>
          <div className="u-kv">
            <span>Training</span>
            <b>{days(streaks?.trainingStreak)}</b>
          </div>
          <div className="u-kv">
            <span>Upsolve</span>
            <b>{days(streaks?.upsolveStreak)}</b>
          </div>
          <div className="u-kv">
            <span>Longest</span>
            <b>{days(streaks?.bestStreak)}</b>
          </div>
          <div className="u-panel__foot">
            <span>
              Last synced with Codeforces{" "}
              <span className="t-num">
                {user.lastSyncTime
                  ? new Date(user.lastSyncTime).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "never"}
              </span>
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
