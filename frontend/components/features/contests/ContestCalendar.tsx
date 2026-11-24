"use client";

import {
  type MouseEvent,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import BrandIcon from "@/components/shared/BrandIcon";
import { EmptyState, Stat } from "@/components/ui/kit";
import { cn } from "@/lib/utils";
import {
  JUDGES,
  JUDGE_NAMES,
  type Judge,
  type UpcomingContest,
} from "@/types/Contest";

const JUDGE_SCHEDULES: Record<Judge, { site: string; href: string }> = {
  codeforces: {
    site: "codeforces.com",
    href: "https://codeforces.com/contests",
  },
  atcoder: { site: "atcoder.jp", href: "https://atcoder.jp/contests/" },
};

const AFTER = [
  {
    title: "Take the round",
    text: "Compete on the judge as usual. For AtCoder rounds, save your AtCoder username in Settings first.",
  },
  {
    title: "Sync",
    text: "Open your upsolve queue and sync. Upsolve It reads your submissions from the judge.",
  },
  {
    title: "Upsolve the misses",
    text: "Problems you tried in the round and did not solve land in your upsolve queue, and stay there until you solve them.",
  },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_MS = 24 * 60 * 60 * 1000;
// the calendar: five whole weeks, Monday first
const WEEKS_SHOWN = 5;
const MONDAY_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const pad = (n: number) => n.toString().padStart(2, "0");

/**
 * A moment as a calendar day ("2026-11-28") and a clock time ("21:00") in a
 * time zone. Only numbers are taken from Intl; the names are ours, so the
 * server and every browser write the same text.
 */
function clockIn(zone: string) {
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return (ms: number) => {
    const part: Record<string, string> = {};
    for (const { type, value } of format.formatToParts(ms)) part[type] = value;
    return {
      day: `${part.year}-${part.month}-${part.day}`,
      time: `${part.hour}:${part.minute}`,
    };
  };
}

/** The names of a calendar day written as "2026-11-28". */
function dayParts(day: string) {
  const date = new Date(`${day}T00:00:00Z`);
  return {
    weekday: WEEKDAYS[date.getUTCDay()],
    date: date.getUTCDate(),
    month: MONTHS[date.getUTCMonth()],
    year: date.getUTCFullYear(),
  };
}

function dayLabel(day: string, thisYear: number) {
  const { weekday, date, month, year } = dayParts(day);
  return `${weekday} ${date} ${month}${year === thisYear ? "" : ` ${year}`}`;
}

/** "Africa/Cairo (GMT+2)" */
function zoneLabel(zone: string, ms: number) {
  if (zone === "UTC") return "UTC";
  const offset = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    timeZoneName: "shortOffset",
  })
    .formatToParts(ms)
    .find((part) => part.type === "timeZoneName")?.value;
  return `${zone.replace(/_/g, " ")}${offset ? ` (${offset})` : ""}`;
}

/** A round's length: "1h 40m", "4h", "7 days". */
function lengthOf(minutes: number) {
  if (minutes >= 2 * 24 * 60) {
    const days = minutes / (24 * 60);
    return `${Number.isInteger(days) ? days : days.toFixed(1)} days`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h && `${h}h`, m && `${m}m`].filter(Boolean).join(" ") || "0m";
}

const split = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
};

/** The two largest units of a wait: "3d 14h", "5h 02m", "12m". */
function waitOf(ms: number) {
  const { d, h, m } = split(ms);
  return d ? `${d}d ${h}h` : h ? `${h}h ${pad(m)}m` : `${Math.max(1, m)}m`;
}

function Countdown({ ms }: { ms: number }) {
  const { d, h, m, s } = split(ms);
  return (
    <span
      role="timer"
      aria-live="off"
      aria-label={`${d} days, ${h} hours, ${m} minutes, ${s} seconds`}
      className="u-timer max-[400px]:text-[32px]"
    >
      {d > 0 && (
        <>
          {d}
          <small>d</small>
        </>
      )}
      {pad(h)}
      <small>h</small>
      {pad(m)}
      <small>m</small>
      {pad(s)}
      <small>s</small>
    </span>
  );
}

function JudgeName({ judge }: { judge: Judge }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <BrandIcon name={judge} className="size-3.5" />
      {JUDGE_NAMES[judge]}
    </span>
  );
}

const hrefOf = (judge: Judge | null) =>
  judge ? `/contests?judge=${judge}` : "/contests";

/**
 * The filter is a real link, so it can be copied or opened in a new tab. A
 * plain click only rewrites the address: the rounds are already on the page,
 * and useSearchParams follows the address.
 */
function pick(event: MouseEvent<HTMLAnchorElement>, judge: Judge | null) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  window.history.replaceState(null, "", hrefOf(judge));
}

const noStore = () => () => {};
const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const serverZone = () => "UTC";

/**
 * The calendar: the next round with its countdown, five weeks as a month
 * grid, and whatever lies further ahead by day (on phones, every round by day). The server writes it in UTC as of `renderedAt`; the
 * browser then moves it to the visitor's own time zone and keeps the clock.
 */
export default function ContestCalendar({
  contests,
  unavailable,
  renderedAt,
}: {
  /** Every judge's rounds, soonest first. */
  contests: UpcomingContest[];
  unavailable: Judge[];
  renderedAt: number;
}) {
  // ?judge= names one judge; anything else is all of them
  const asked = useSearchParams().get("judge");
  const judge = JUDGES.find((j) => j === asked) ?? null;
  const zone = useSyncExternalStore(noStore, browserZone, serverZone);
  const [now, setNow] = useState(renderedAt);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const at = useMemo(() => clockIn(zone), [zone]);

  const upcoming = contests
    .map((contest) => {
      const start = Date.parse(contest.startsAt);
      return { ...contest, start, ...at(start) };
    })
    .filter((contest) => contest.start > now);
  const shown = judge ? upcoming.filter((c) => c.judge === judge) : upcoming;
  const [next, ...rest] = shown;
  const end = next && at(next.start + next.durationMinutes * 60 * 1000);
  const missing = unavailable.filter((j) => !judge || j === judge);

  const today = at(now).day;
  const thisYear = dayParts(today).year;
  const byDay = (list: typeof shown) => {
    const days = new Map<string, typeof shown>();
    for (const contest of list)
      days.set(contest.day, [...(days.get(contest.day) ?? []), contest]);
    return days;
  };
  const shownByDay = byDay(shown);
  const restByDay = byDay(rest);
  const todayMs = Date.parse(`${today}T00:00:00Z`);
  const monday = todayMs - ((new Date(todayMs).getUTCDay() + 6) % 7) * DAY_MS;
  const month = Array.from({ length: WEEKS_SHOWN * 7 }, (_, i) =>
    new Date(monday + i * DAY_MS).toISOString().slice(0, 10),
  );
  const lastShown = month[month.length - 1];
  const further = rest.filter((contest) => contest.day > lastShown).length;

  return (
    <>
      <nav aria-label="Judge" className="u-tabs">
        {[null, ...JUDGES].map((option) => (
          <a
            key={option ?? "all"}
            href={hrefOf(option)}
            onClick={(event) => pick(event, option)}
            aria-current={judge === option ? "page" : undefined}
          >
            {option ? JUDGE_NAMES[option] : "All"}{" "}
            <span className="t-num font-normal text-ink-faint">
              {option
                ? upcoming.filter((c) => c.judge === option).length
                : upcoming.length}
            </span>
          </a>
        ))}
      </nav>
      <div className="t-sm t-muted mt-3 grid gap-1">
        <p>
          Times are in your time zone:{" "}
          <span className="text-ink">{zoneLabel(zone, now)}</span>.
        </p>
        {missing.map((j) => (
          <p key={j} role="status">
            The {JUDGE_NAMES[j]} schedule could not be read just now, so its
            rounds are missing here. They are listed on{" "}
            <a
              href={JUDGE_SCHEDULES[j].href}
              target="_blank"
              rel="noopener noreferrer"
              className="t-link"
            >
              {JUDGE_SCHEDULES[j].site}
            </a>
            .
          </p>
        ))}
      </div>

      {next ? (
        <>
          <section
            id="next-round"
            aria-labelledby="next-round-name"
            className="mt-8 grid scroll-mt-32 overflow-hidden rounded-lg border border-line-strong lg:grid-cols-12"
          >
            <div className="grid content-between gap-8 bg-surface p-6 sm:p-8 lg:col-span-8 xl:p-10">
              <div className="grid gap-5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-semibold">
                  <span className="t-num rounded-sm bg-ink px-2 py-1.5 text-sm leading-none text-ground">
                    Next round
                  </span>
                  <JudgeName judge={next.judge} />
                </div>
                <h2
                  id="next-round-name"
                  className={cn(
                    "break-words",
                    next.name.length > 40 ? "t-h1" : "t-d2",
                  )}
                >
                  {next.name}
                </h2>
              </div>
              <div className="flex flex-wrap gap-x-12 gap-y-6">
                <Stat
                  label="Starts"
                  value={<time dateTime={next.startsAt}>{next.time}</time>}
                  sub={dayLabel(next.day, thisYear)}
                />
                {end && (
                  <Stat
                    label="Ends"
                    value={end.time}
                    sub={dayLabel(end.day, thisYear)}
                  />
                )}
                <Stat label="Length" value={lengthOf(next.durationMinutes)} />
              </div>
            </div>
            {/* the page's one volt block: the wait */}
            <div className="u-inverse grid content-between gap-8 p-6 sm:p-8 lg:col-span-4 xl:p-10">
              <div className="grid gap-3">
                <span className="t-eyebrow">Starts in</span>
                <Countdown ms={next.start - now} />
              </div>
              <a
                href={next.url}
                target="_blank"
                rel="noopener noreferrer"
                className="u-btn u-btn--primary justify-self-start"
              >
                Open on {JUDGE_NAMES[next.judge]}{" "}
                <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </section>

          {/* tablets and up: the weeks as a calendar */}
          <section aria-labelledby="five-weeks" className="mt-10 max-md:hidden">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
              <h2 id="five-weeks" className="t-h2">
                The next five weeks
              </h2>
              <p className="t-sm t-muted flex items-center gap-5">
                {JUDGES.map((j) => (
                  <JudgeName key={j} judge={j} />
                ))}
              </p>
            </div>
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-line bg-line">
              {MONDAY_FIRST.map((weekday) => (
                <span
                  key={weekday}
                  className="t-eyebrow bg-surface px-3 py-2.5"
                  aria-hidden="true"
                >
                  {weekday}
                </span>
              ))}
              {month.map((day, i) => {
                const rounds = shownByDay.get(day) ?? [];
                const { date, month: name } = dayParts(day);
                return (
                  <div
                    key={day}
                    className="grid min-h-[132px] content-start gap-2 bg-ground p-2.5"
                  >
                    <span className="flex items-center gap-2">
                      <b
                        className={cn(
                          "t-num grid size-7 place-items-center rounded-sm text-sm",
                          day === today
                            ? "bg-ink text-ground"
                            : !rounds.length && "text-ink-faint",
                        )}
                      >
                        {date}
                      </b>
                      {day === today ? (
                        <span className="t-eyebrow">Today</span>
                      ) : (
                        // the month is named where it starts
                        (i === 0 || date === 1) && (
                          <span className="t-eyebrow">{name}</span>
                        )
                      )}
                    </span>
                    {rounds.map((contest) => (
                      <a
                        key={`${contest.judge}-${contest.id}`}
                        href={contest.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${dayLabel(day, thisYear)}, ${contest.time}: ${contest.name} on ${JUDGE_NAMES[contest.judge]}`}
                        title={contest.name}
                        className={cn(
                          "grid gap-1 rounded-sm border bg-surface p-2 text-[13px] leading-[17px] hover:bg-surface-sunk",
                          contest === next ? "border-ink" : "border-line",
                        )}
                      >
                        <span className="t-num flex items-center gap-1.5 text-xs text-ink-muted">
                          <BrandIcon name={contest.judge} className="size-3" />
                          {contest.time} · {lengthOf(contest.durationMinutes)}
                        </span>
                        <span className="line-clamp-2 font-semibold">
                          {contest.name}
                        </span>
                      </a>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>

          {/* phones: every round by day. Wider: only what the calendar
              does not reach. */}
          <section
            aria-labelledby="later-rounds"
            className={cn("u-panel mt-8", further === 0 && "md:hidden")}
          >
            <div className="u-panel__head">
              <h2 id="later-rounds" className="t-h3">
                <span className="md:hidden">After that</span>
                <span className="max-md:hidden">Further ahead</span>
              </h2>
              <span className="t-sm t-muted">
                <span className="md:hidden">
                  {rest.length} {rest.length === 1 ? "round" : "rounds"}
                </span>
                <span className="max-md:hidden">
                  {further} {further === 1 ? "round" : "rounds"}
                </span>
              </span>
            </div>
            {rest.length === 0 && (
              <p className="t-muted p-6">Nothing else is scheduled yet.</p>
            )}
            {[...restByDay].map(([day, rounds]) => {
              const { weekday, date, month: name, year } = dayParts(day);
              return (
                <div
                  key={day}
                  id={`day-${day}`}
                  className={cn(
                    "grid scroll-mt-32 gap-x-6 gap-y-4 border-b border-line p-5 last:border-b-0 sm:grid-cols-[140px_minmax(0,1fr)] sm:px-6 sm:py-4",
                    day <= lastShown && "md:hidden",
                  )}
                >
                  <h3 className="flex items-baseline gap-2">
                    <span className="t-eyebrow">{weekday}</span>
                    <span className="t-num-lg">{date}</span>
                    <span className="t-eyebrow">
                      {name}
                      {year !== thisYear && ` ${year}`}
                    </span>
                  </h3>
                  <ul className="grid content-center gap-4">
                    {rounds.map((contest) => (
                      <li
                        key={`${contest.judge}-${contest.id}`}
                        className="grid grid-cols-[52px_minmax(0,1fr)] items-start gap-x-4 gap-y-3 sm:grid-cols-[52px_minmax(0,1fr)_auto] sm:items-center lg:grid-cols-[52px_minmax(0,1fr)_116px_84px_84px_auto]"
                      >
                        <time
                          dateTime={contest.startsAt}
                          className="t-num font-semibold"
                        >
                          {contest.time}
                        </time>
                        {/* on wide screens the facts under the name become
                            columns of their own */}
                        <div className="grid min-w-0 gap-1 lg:contents">
                          <p className="min-w-0 break-words font-semibold">
                            {contest.name}
                          </p>
                          <p className="t-sm t-muted flex flex-wrap items-center gap-x-4 gap-y-1 lg:contents">
                            <JudgeName judge={contest.judge} />
                            <span>{lengthOf(contest.durationMinutes)}</span>
                            <span className="t-num">
                              in {waitOf(contest.start - now)}
                            </span>
                          </p>
                        </div>
                        <a
                          href={contest.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${contest.name} on ${JUDGE_NAMES[contest.judge]}`}
                          className="u-btn u-btn--sm col-start-2 justify-self-start sm:col-start-3 lg:col-start-6"
                        >
                          Open <ArrowUpRight aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        </>
      ) : (
        <EmptyState
          className="mt-8"
          title="No rounds to show"
          action={
            judge && (
              <a
                href={hrefOf(null)}
                onClick={(event) => pick(event, null)}
                className="u-btn u-btn--sm"
              >
                Show every judge
              </a>
            )
          }
        >
          {missing.length
            ? "The schedule could not be read just now. Try again in a few minutes."
            : judge
              ? `${JUDGE_NAMES[judge]} has no upcoming round listed.`
              : "Neither judge has an upcoming round listed."}
        </EmptyState>
      )}

      <section
        aria-labelledby="after-the-round"
        className="mt-12 grid gap-6 lg:grid-cols-12"
      >
        <div className="grid content-start gap-3 lg:col-span-3">
          <h2 id="after-the-round" className="t-h2">
            After the round
          </h2>
          <p className="t-muted">
            What you could not solve in the round is where the next rating
            points are.
          </p>
          <Link
            href="/how-it-works"
            className="u-btn u-btn--sm mt-2 justify-self-start"
          >
            How it works
          </Link>
        </div>
        <ol className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 lg:col-span-9">
          {AFTER.map((step, i) => (
            <li
              key={step.title}
              className="grid content-start gap-3 bg-surface p-6"
            >
              <span className="u-step" aria-hidden="true">
                {i + 1}
              </span>
              <b>{step.title}</b>
              <span className="t-muted">{step.text}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
