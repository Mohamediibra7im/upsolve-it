"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { TrainingProblem } from "@/types/TrainingProblem";

// Only in the browser: the editor opens on the draft this device kept, which
// the server cannot know.
const Workspace = dynamic(
  () => import("@/components/features/solve/Workspace"),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        aria-label="Loading the workspace"
        className="h-[max(560px,calc(100dvh-172px))] animate-pulse rounded-lg bg-surface-sunk"
      />
    ),
  },
);

/**
 * The problems a visitor can try. Each `key` is one the API knows
 * (TRY_PROBLEMS in the backend's try.controller.ts): the server, not this
 * list, decides what can be read and run.
 */
const PROBLEMS: (TrainingProblem & { key: string; from: string })[] = [
  {
    key: "watermelon",
    from: "Codeforces 4A",
    contestId: 4,
    index: "A",
    name: "Watermelon",
    rating: 800,
    tags: ["brute force", "math"],
    url: "https://codeforces.com/problemset/problem/4/A",
  },
  {
    key: "long-words",
    from: "Codeforces 71A",
    contestId: 71,
    index: "A",
    name: "Way Too Long Words",
    rating: 800,
    tags: ["strings"],
    url: "https://codeforces.com/problemset/problem/71/A",
  },
  {
    key: "product",
    from: "AtCoder ABC086 A",
    judge: "atcoder" as const,
    contestId: "abc086",
    index: "A",
    name: "Product",
    rating: 0,
    tags: [],
    url: "https://atcoder.jp/contests/abc086/tasks/abc086_a",
  },
].map((p) => ({
  ...p,
  problemsetName: "",
  type: "PROGRAMMING",
  points: 0,
  solvedTime: null,
}));
const KEYS = PROBLEMS.map((p) => p.key);
const noop = () => {};

/** /try: the solve workspace on three fixed problems, for a visitor with no account. */
export default function TryClient() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="wrap pb-[72px] pt-10">
      <header className="grid items-end gap-x-12 gap-y-3 pb-6 lg:grid-cols-2">
        <div>
          <p className="t-eyebrow">Try it</p>
          <h1 className="t-h1 mt-2">Solve a problem here.</h1>
        </div>
        <p className="t-muted">
          Pick a problem, write your code and run it on the samples. No account
          needed.
        </p>
      </header>

      <div
        role="group"
        aria-label="Choose a problem"
        className="u-panel mb-3 grid divide-y divide-line overflow-hidden sm:grid-cols-3 sm:divide-x sm:divide-y-0"
      >
        {PROBLEMS.map((p, i) => (
          <button
            key={p.key}
            type="button"
            aria-pressed={i === selected}
            onClick={() => setSelected(i)}
            className="group flex min-w-0 items-center gap-3 px-4 py-3 text-left focus-visible:-outline-offset-2 aria-pressed:bg-surface-sunk"
          >
            <span
              className="u-prow__slot shrink-0 group-hover:shadow-[inset_0_0_0_1px_var(--line-strong)] group-aria-pressed:bg-ink group-aria-pressed:text-ground"
              aria-hidden="true"
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span className="grid min-w-0">
              <span className="u-prow__name">{p.name}</span>
              <span className="u-prow__meta">{p.from}</span>
            </span>
          </button>
        ))}
      </div>

      <Workspace
        title="Try it"
        problems={PROBLEMS}
        statuses={[]}
        hideDetails={false}
        onProblemOpen={noop}
        tryKeys={KEYS}
        selected={selected}
        onSelect={setSelected}
        session={
          <span className="t-sm t-muted min-[901px]:text-right">
            An account gets you full timed sets and a queue of what you miss.
          </span>
        }
      />
    </div>
  );
}
