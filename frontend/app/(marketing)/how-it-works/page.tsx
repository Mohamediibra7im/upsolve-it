import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, RotateCcw, X } from "lucide-react";
import {
  EXAMPLE_SET,
  QueueExample,
  SessionSheet,
} from "@/components/features/landing/examples";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/kit";
import { cn } from "@/lib/utils";
import { publicPageMetadata } from "@/lib/seo";
import { expectedTimeSecondsFromRating } from "@/services/training/expectedTime";

export const metadata = publicPageMetadata("/how-it-works");

const LOOP = [
  ["Train", "A timed set at your level."],
  ["Miss", "The ones you couldn’t crack."],
  ["Upsolve", "Kept for you until they’re solved."],
  ["Review", "Proof that it’s working."],
];

// The same example session as the sheet above it, read after the clock stopped.
const REVIEW = [
  {
    name: "A · Two pointers warm-up",
    note: "Ahead of the expected pace",
    solved: true,
    attempts: 1,
    minutes: 5,
  },
  {
    name: "B · Greedy with a twist",
    note: "An opportunity to build speed",
    solved: true,
    attempts: 1,
    minutes: 17,
  },
  {
    name: "C · Shortest path, one catch",
    note: "A good problem to revisit",
    solved: false,
    attempts: 2,
    minutes: null,
  },
];

// A fixed pseudo-random pattern for the example heatmap: 47 weeks of levels 0–4.
let seed = 23;
const HEAT = Array.from({ length: 47 * 7 }, () => {
  seed = (seed * 9301 + 49297) % 233280;
  const r = seed / 233280;
  return r < 0.42 ? 0 : r < 0.66 ? 1 : r < 0.84 ? 2 : r < 0.95 ? 3 : 4;
});

function Chapter({
  n,
  name,
  title,
  text,
  link,
  children,
}: {
  n: number;
  name: string;
  title: string;
  text: string;
  link?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="grid items-start gap-x-6 gap-y-8 border-t border-line py-14 lg:grid-cols-12 lg:py-[72px]">
      <div className="grid justify-items-start gap-4 lg:col-span-4 lg:pr-8">
        <span className="t-num rounded-sm bg-ink px-2 py-1.5 text-sm font-semibold leading-none text-ground">
          0{n} {name}
        </span>
        <h2 className="t-h1">{title}</h2>
        <p className="t-muted">{text}</p>
        {link}
      </div>
      <div className="min-w-0 lg:col-span-7 lg:col-start-6">{children}</div>
    </section>
  );
}

export default function Page() {
  return (
    <>
      <div className="wrap">
        <section className="pt-16 lg:pt-[88px]">
          <p className="t-eyebrow">How it works</p>
          <h1 className="t-d1 mt-5 max-w-[1180px]">
            Most of your rating is earned <em className="hl">after</em> the
            timer stops.
          </h1>
          <div className="mb-14 mt-10 grid items-center gap-6 lg:mb-[72px] lg:grid-cols-2">
            <p className="t-lg t-muted">
              Upsolve It gives your practice a shape: train on a set built for
              you, keep what you missed, come back and solve it, and see the
              difference over time.
            </p>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link href="/signup" className="u-btn u-btn--primary u-btn--lg">
                Start practicing for free <ArrowUpRight aria-hidden="true" />
              </Link>
              <Link href="/login" className="u-btn u-btn--lg">
                Log in
              </Link>
            </div>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
            {LOOP.map(([name, text], i) => {
              const on = name === "Upsolve";
              return (
                <li
                  key={name}
                  className={cn(
                    "relative grid gap-1.5 border-t-2 border-ink px-6 pb-9 pt-7",
                    on && "bg-primary text-primary-foreground",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="absolute -top-[9px] left-6 size-4 rounded-sm bg-ink"
                  />
                  <span
                    className={cn("t-eyebrow", on && "text-primary-foreground")}
                  >
                    0{i + 1}
                  </span>
                  <h2 className="t-h2">{name}</h2>
                  <p className={on ? undefined : "t-muted"}>{text}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <Chapter
          n={1}
          name="Train"
          title="Give it a real attempt."
          text="Choose a mode, a level and the topics you want. You get a set of problems and a clock, and your verdicts come straight from Codeforces while you work."
          link={
            <Link href="/modes" className="u-btn u-btn--sm">
              See the five modes
            </Link>
          }
        >
          <SessionSheet />
        </Chapter>

        <Chapter
          n={2}
          name="Miss"
          title="A miss is the useful part."
          text="After every session each problem gets a plain reading: how long it took against the expected time, how many tries, and what to do about it."
        >
          <div className="u-panel">
            <div className="u-panel__head">
              <b>Problem breakdown</b>
              <Badge variant="line">Example review</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="u-table min-w-[600px]">
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Result</th>
                    <th className="num">Attempts</th>
                    <th className="num">Time / expected</th>
                    <th>Next</th>
                  </tr>
                </thead>
                <tbody>
                  {REVIEW.map((p, i) => (
                    <tr key={p.name}>
                      <td>
                        <b className="whitespace-nowrap">{p.name}</b>
                        <br />
                        <span className="t-sm t-muted">{p.note}</span>
                      </td>
                      <td>
                        {p.solved ? (
                          <Badge variant="solved">
                            <Check aria-hidden="true" />
                            Accepted
                          </Badge>
                        ) : (
                          <Badge variant="failed">
                            <X aria-hidden="true" />
                            Unsolved
                          </Badge>
                        )}
                      </td>
                      <td className="num">{p.attempts}</td>
                      <td className="num whitespace-nowrap">
                        {p.minutes === null ? "—" : `${p.minutes}m`} /{" "}
                        {expectedTimeSecondsFromRating(EXAMPLE_SET[i]) / 60}m
                      </td>
                      <td>
                        {!p.solved && (
                          <Badge variant="pending">
                            <RotateCcw aria-hidden="true" />
                            In your upsolve queue
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Chapter>

        <Chapter
          n={3}
          name="Upsolve"
          title="Nothing you missed gets lost."
          text="Unsolved problems from your sessions and from your recent Codeforces contests land in one queue. If you like, one email a week lists what is still waiting."
          link={
            <Link href="/faq#upsolve-queue" className="u-btn u-btn--sm">
              How the queue is built
            </Link>
          }
        >
          <QueueExample />
        </Chapter>

        <Chapter
          n={4}
          name="Review"
          title="See the practice paying off."
          text="Streaks, a seven-day consistency score and a year of activity. Your effort deserves more than a forgotten browser tab."
        >
          <div className="u-panel">
            <div className="u-panel__head">
              <b>Practice activity</b>
              <Badge variant="line">Example activity</Badge>
            </div>
            <div className="u-panel__body overflow-x-auto">
              <div
                className="u-heat"
                role="img"
                aria-label="Example heatmap of practice activity by day"
              >
                {HEAT.map((level, i) => (
                  <i key={i} data-l={level} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 border-t border-line p-6 md:grid-cols-4">
              <Stat label="Training streak" value="6" unit="days" />
              <Stat label="Upsolve streak" value="3" unit="days" />
              <Stat label="Longest streak" value="21" unit="days" />
              <Stat label="Consistency" value="71" unit="%" />
            </div>
          </div>
        </Chapter>

        <section className="mb-20 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-y border-line-strong py-7">
          <h2 className="t-h2">Made by people who love a good problem.</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/about" className="u-btn u-btn--sm">
              Meet HNU - FCSIT ICPC
            </Link>
            <a
              href="https://github.com/Mohamediibra7im/upsolve-it"
              target="_blank"
              rel="noopener noreferrer"
              className="u-btn u-btn--sm"
            >
              Built in the open on GitHub
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
