import Link from "next/link";
import { connection } from "next/server";
import { ArrowUpRight } from "lucide-react";
import { EmptyState, Rank, Stat } from "@/components/ui/kit";
import {
  NO_QUERY,
  catalogHref,
  fetchTopics,
  type RatingBand,
  type Topic,
} from "@/lib/catalog";
import { publicPageMetadata } from "@/lib/seo";
import { rankKey, rankName } from "@/utils/rank";

export const metadata = publicPageMetadata("/topics");

const n = (value: number) => value.toLocaleString("en-US");
const rangeOf = (band: RatingBand, last: boolean) =>
  last ? `${band.min}+` : `${band.min}–${band.max}`;

/**
 * One topic: its name and count, then its rated problems as one bar cut at
 * the rating bands. Every bar is the full width, so two topics compare by
 * shape: where the colour sits is how hard the topic runs.
 */
function TopicRow({ topic, bands }: { topic: Topic; bands: RatingBand[] }) {
  const rated = topic.counts.reduce((sum, count) => sum + count, 0);
  const peak = topic.counts.indexOf(Math.max(...topic.counts));
  return (
    <li className="break-inside-avoid border-b border-line">
      <Link
        href={catalogHref({ ...NO_QUERY, tag: topic.tag })}
        className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-2.5 py-4 sm:grid-cols-[minmax(0,17rem)_4.5rem_minmax(0,1fr)] sm:items-center sm:gap-x-6"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate font-heading text-xl font-bold uppercase leading-7 tracking-[0.005em] underline-offset-4 group-hover:underline">
            {topic.tag}
          </span>
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 shrink-0 text-ink-faint group-hover:text-ink"
          />
        </span>
        <span className="t-num text-right font-semibold">
          {n(topic.total)}
          <span className="sr-only"> problems</span>
        </span>
        <span className="grid gap-1.5 max-sm:col-span-2">
          <span
            role="img"
            aria-label={
              rated
                ? `By rating: ${bands
                    .map(
                      (band, i) =>
                        `${rangeOf(band, i === bands.length - 1)}: ${topic.counts[i]}`,
                    )
                    .join(", ")}`
                : "No rated problems"
            }
            className="flex h-3 gap-0.5 overflow-hidden rounded-sm bg-surface-sunk"
          >
            {bands.map(
              (band, i) =>
                topic.counts[i] > 0 && (
                  <i
                    key={band.min}
                    data-rank={rankKey(band.min)}
                    title={`${rangeOf(band, i === bands.length - 1)}: ${n(topic.counts[i])}`}
                    className="block min-w-0.5 bg-[var(--rank)]"
                    style={{ flex: topic.counts[i] }}
                  />
                ),
            )}
          </span>
          <span className="t-sm t-muted">
            {rated
              ? `Most at ${rangeOf(bands[peak], peak === bands.length - 1)}`
              : "No rated problems yet"}
          </span>
        </span>
      </Link>
    </li>
  );
}

export default async function Page() {
  // Read when the page is asked for, not when the site is built: the API is
  // not there at build time, and an error must not be kept as the page.
  await connection();
  const list = await fetchTopics();

  return (
    <>
      <div className="wrap pb-[88px]">
        <header className="grid items-end gap-x-12 gap-y-8 pb-10 pt-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:pt-[72px]">
          <div>
            <p className="t-eyebrow">Topics</p>
            <h1 className="t-d2 mt-4">
              {list ? `${list.topics.length} topics.` : "Topics."} By rating.
            </h1>
            <p className="t-lg t-muted mt-5 max-w-[680px]">
              Topics are the tags Codeforces puts on its problems. AtCoder
              problems carry none, so they are not counted here; they are still
              in{" "}
              <Link href="/problems?judge=atcoder" className="t-link">
                Problems
              </Link>
              .
            </p>
          </div>
          {list && (
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              <Stat
                label="Codeforces"
                value={n(list.problems.codeforces)}
                sub="problems"
              />
              <Stat
                label="AtCoder"
                value={n(list.problems.atcoder)}
                sub="problems, no topics"
              />
            </div>
          )}
        </header>

        {!list ? (
          <EmptyState
            title="The topics did not load."
            action={
              <a href="/topics" className="u-btn u-btn--sm">
                Try again
              </a>
            }
          >
            They are counted from the Codeforces problem list, and it did not
            answer just now. It usually works again within a minute.
          </EmptyState>
        ) : list.topics.length === 0 ? (
          <EmptyState title="No topics yet.">
            The Codeforces problem list came back without a single tag.
          </EmptyState>
        ) : (
          <>
            <div className="grid gap-x-12 gap-y-3 border-y border-line-strong py-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center">
              <p className="t-sm t-muted max-w-[52ch]">
                Each bar is a topic’s rated problems, cut at the rating bands.
                Open a topic to see its problems.
              </p>
              <ul className="t-sm flex flex-wrap gap-x-5 gap-y-1 lg:justify-end">
                {list.bands.map((band, i) => (
                  <li key={band.min}>
                    <Rank
                      rating={band.min}
                      name={`${rangeOf(band, i === list.bands.length - 1)} ${rankName(band.min)}`}
                      className="t-num whitespace-nowrap [&>span]:normal-case"
                    />
                  </li>
                ))}
              </ul>
            </div>
            <ul className="gap-x-16 2xl:columns-2">
              {list.topics.map((topic) => (
                <TopicRow key={topic.tag} topic={topic} bands={list.bands} />
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
