import { Check, RotateCcw, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Bar } from "@/components/ui/kit";
import { cn } from "@/lib/utils";
import { ladderRatingsFromPerformance } from "@/services/training/modeRatings";

/** Sample panels for the public pages. Names, topics, times and verdicts are
 *  made up, and every panel says "Example". The ratings are the real set for a
 *  ladder level with a 1300 target (level 14). */
export const EXAMPLE_TARGET = 1300;
export const EXAMPLE_SET = Object.values(
  ladderRatingsFromPerformance(EXAMPLE_TARGET),
);

const SESSION = [
  {
    name: "Two pointers warm-up",
    topics: "Implementation · two pointers",
    state: "solved",
    verdict: "Accepted · 5 min",
  },
  {
    name: "Greedy with a twist",
    topics: "Greedy · sortings",
    state: "solved",
    verdict: "Accepted · 22 min",
  },
  {
    name: "Shortest path, one catch",
    topics: "Graphs · shortest paths",
    state: "failed",
    verdict: "Wrong answer · 2 tries",
  },
  {
    name: "DP on prefixes",
    topics: "Dynamic programming",
    state: "open",
    verdict: null,
  },
] as const;

export function SessionSheet({ className }: { className?: string }) {
  return (
    <div className={cn("u-panel", className)}>
      <div className="u-panel__head">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="line">Example session</Badge>
          <b>Ladder · level 14</b>
        </div>
        <span className="u-timer u-timer--sm">
          01<small>h</small>12<small>m</small>48<small>s</small>
        </span>
      </div>
      {SESSION.map((p, i) => (
        <div key={p.name} className="u-prow" data-state={p.state}>
          <span className="u-prow__slot">{"ABCD"[i]}</span>
          <div className="min-w-0">
            <div className="u-prow__name">{p.name}</div>
            <div className="u-prow__meta">{p.topics}</div>
          </div>
          <span className="u-prow__rating">{EXAMPLE_SET[i]}</span>
          {p.state === "open" ? (
            <span className="t-sm t-muted">Not opened</span>
          ) : (
            <Badge variant={p.state}>
              {p.state === "solved" ? (
                <Check aria-hidden="true" />
              ) : (
                <X aria-hidden="true" />
              )}
              {p.verdict}
            </Badge>
          )}
        </div>
      ))}
      <div className="u-panel__foot">
        <span>2 of 4 solved</span>
        <Bar
          value={50}
          label="2 of 4 problems solved"
          className="max-w-[220px] flex-1"
        />
        <span>Unsolved problems move to your upsolve queue</span>
      </div>
    </div>
  );
}

const QUEUE = [
  {
    name: "Shortest path, one catch",
    meta: "Graphs · shortest paths · waiting 3 days",
    rating: 1300,
    solved: false,
  },
  {
    name: "Intervals on a circle",
    meta: "Greedy · sortings · waiting 9 days",
    rating: 1500,
    solved: false,
  },
  {
    name: "Count the inversions",
    meta: "Data structures · solved today",
    rating: 1200,
    solved: true,
  },
  {
    name: "Tree with two colours",
    meta: "Trees · DFS · waiting 20 days",
    rating: 1600,
    solved: false,
  },
];

export function QueueExample() {
  return (
    <div className="u-panel">
      <div className="u-panel__head">
        <b>Your upsolve queue</b>
        <Badge variant="line">Example problems and ratings</Badge>
      </div>
      {QUEUE.map((p, i) => (
        <div
          key={p.name}
          className="u-prow"
          data-state={p.solved ? "solved" : "open"}
        >
          <span className="u-prow__slot">
            {p.solved ? <Check aria-hidden="true" /> : i + 1}
          </span>
          <div className="min-w-0">
            <div className="u-prow__name">{p.name}</div>
            <div className="u-prow__meta">{p.meta}</div>
          </div>
          <span className="u-prow__rating">{p.rating}</span>
          {p.solved ? (
            <Badge variant="solved">
              <Check aria-hidden="true" />
              Solved
            </Badge>
          ) : (
            <Badge variant="pending">
              <RotateCcw aria-hidden="true" />
              Pending
            </Badge>
          )}
        </div>
      ))}
      <div className="u-panel__foot">
        <span>
          Queue synced · 2 added from recent contests, 1 marked solved.
        </span>
      </div>
    </div>
  );
}
