import type { ReactNode } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Training } from "@/types/Training";

import type { UpsolveProblem } from "@/types/UpsolveProblem";

export type { UpsolveProblem };

const problemKey = (p: { contestId: number | string; index: string }) =>
  `${p.contestId}${p.index}`;

/** Every problem that appeared in one of your training sessions. */
export const sessionProblemKeys = (history: Training[]) =>
  new Set(history.flatMap((t) => (t.problems ?? []).map(problemKey)));

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "3 days ago" from an ISO date, or a unix time in seconds or milliseconds. */
function ago(time: string | number) {
  const ms =
    typeof time === "number" && time < 1e10
      ? time * 1000
      : new Date(time).getTime();
  const days = Math.round((Date.now() - ms) / 86_400_000);
  if (!Number.isFinite(days)) return null;
  return days < 60
    ? relative.format(-days, "day")
    : relative.format(-Math.round(days / 30), "month");
}

/** One problem of the upsolve queue. `children` are the row's actions. */
export default function UpsolveRow({
  problem,
  slot,
  sessionKeys,
  children,
}: {
  problem: UpsolveProblem;
  slot: number;
  sessionKeys: Set<string>;
  children?: ReactNode;
}) {
  const solved = !!problem.solvedTime;
  const when = solved
    ? ago(problem.solvedTime!)
    : problem.createdAt && ago(problem.createdAt);
  // ponytail: the API stores no source, so it is read from your sessions; a
  // problem whose session you deleted reads as a contest. Store `source` on
  // the upsolve record if that ever matters.
  const source = sessionKeys.has(problemKey(problem))
    ? "From a training session"
    : "From a Codeforces contest";

  return (
    <div className="u-prow" data-state={solved ? "solved" : "open"}>
      <span className="u-prow__slot">
        {solved ? <Check aria-hidden="true" /> : slot}
      </span>
      <div className="min-w-0">
        <a
          className="u-prow__name block"
          href={problem.url}
          target="_blank"
          rel="noreferrer"
        >
          {problem.name}
        </a>
        <p className="u-prow__meta">
          <span className="t-num">{problemKey(problem)}</span> · {source}
          {when && ` · ${solved ? "solved" : "added"} ${when}`}
        </p>
      </div>
      <span className="u-prow__rating">{problem.rating || "—"}</span>
      <div className="flex items-center gap-1">
        <Badge variant={solved ? "solved" : "pending"} className="mr-1">
          {solved ? (
            <Check aria-hidden="true" />
          ) : (
            <RotateCcw aria-hidden="true" />
          )}
          {solved ? "Solved" : "Pending"}
        </Badge>
        {children}
      </div>
    </div>
  );
}
