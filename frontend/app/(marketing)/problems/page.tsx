import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import CatalogFilters from "@/components/features/catalog/CatalogFilters";
import BrandIcon from "@/components/shared/BrandIcon";
import { EmptyState, Stat } from "@/components/ui/kit";
import {
  JUDGE_NAME,
  NO_QUERY,
  catalogHref,
  fetchCatalog,
  fetchTopics,
  parseCatalogQuery,
  type CatalogPage,
  type CatalogProblem,
  type CatalogQuery,
} from "@/lib/catalog";
import { publicPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { rankKey, rankName } from "@/utils/rank";

export const metadata = publicPageMetadata("/problems");

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const n = (value: number) => value.toLocaleString("en-US");

// id · name · topics · rating, from 1024px; stacked below that
const COLUMNS =
  "lg:grid-cols-[11rem_minmax(0,5fr)_minmax(0,6fr)_4.5rem] lg:gap-x-6";

/** "1996E" on Codeforces; "ABC300 E" on AtCoder, whose contests have names. */
const problemId = (p: CatalogProblem) =>
  p.judge === "atcoder"
    ? `${String(p.contestId).toUpperCase()} ${p.index}`
    : `${p.contestId}${p.index}`;

/**
 * The rating spread of what the other filters keep, one column per rank
 * colour. A column is also a filter: it sets the range to its band, and the
 * chosen one clears it again.
 */
function Bands({ page, query }: { page: CatalogPage; query: CatalogQuery }) {
  const most = Math.max(1, ...page.bands.map((band) => band.count));
  return (
    <nav
      aria-label="Rating bands"
      className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3"
    >
      {page.bands.map((band, i) => {
        const chosen = query.min === band.min && query.max === band.max;
        const inRange =
          (query.min ?? 0) <= band.max && (query.max ?? Infinity) >= band.min;
        const range =
          i === page.bands.length - 1
            ? `${band.min}+`
            : `${band.min}–${band.max}`;
        return (
          <Link
            key={band.min}
            href={catalogHref({
              ...query,
              page: 1,
              min: chosen ? null : band.min,
              max: chosen ? null : band.max,
            })}
            scroll={false}
            data-rank={rankKey(band.min)}
            aria-current={chosen ? "true" : undefined}
            aria-label={`${rankName(band.min)}, ${range}: ${n(band.count)} problems${chosen ? ". Chosen: clears the rating range" : ""}`}
            className={cn(
              "group grid min-w-0 gap-1.5 transition-opacity",
              !inRange && "opacity-40 hover:opacity-100",
            )}
          >
            <span className="flex h-14 items-end rounded-sm bg-surface-sunk lg:h-[72px]">
              <i
                className="block w-full rounded-sm bg-[var(--rank)]"
                style={{
                  height: `${band.count ? Math.max(4, (band.count / most) * 100) : 0}%`,
                }}
              />
            </span>
            <span
              className={cn(
                "t-num border-t-2 pt-1.5 text-[11px] leading-4 sm:text-[13px]",
                chosen
                  ? "border-ink"
                  : "border-transparent group-hover:border-line-strong",
              )}
            >
              <span className="block truncate font-semibold">
                <span className="md:hidden">{band.min}</span>
                <span className="max-md:hidden">{range}</span>
              </span>
              <span className="block truncate text-ink-muted">
                {n(band.count)}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function Row({ p, query }: { p: CatalogProblem; query: CatalogQuery }) {
  return (
    <li
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 border-b border-line px-4 py-3 last:border-b-0 sm:px-5",
        COLUMNS,
      )}
    >
      <span className="t-num t-sm flex min-w-0 items-center gap-2 text-ink-muted">
        <BrandIcon name={p.judge} className="text-ink" />
        <span className="sr-only">{JUDGE_NAME[p.judge]}</span>
        <span className="truncate">{problemId(p)}</span>
      </span>
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex min-w-0 items-center gap-1.5 font-semibold max-lg:col-span-2"
      >
        <span className="truncate underline-offset-4 group-hover:underline">
          {p.name}
        </span>
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 shrink-0 text-ink-faint group-hover:text-ink"
        />
        <span className="sr-only">
          (opens on {JUDGE_NAME[p.judge]} in a new tab)
        </span>
      </a>
      <span
        className={cn(
          "flex min-w-0 flex-wrap gap-1.5 max-lg:col-span-2",
          p.tags.length === 0 && "max-lg:hidden",
        )}
      >
        {p.tags.map((tag) => (
          <Link
            key={tag}
            href={`${catalogHref({ ...query, page: 1, tag })}#results`}
            aria-current={query.tag === tag ? "true" : undefined}
            className={cn(
              "u-badge hover:text-ink",
              query.tag === tag && "u-badge--line",
            )}
          >
            {tag}
          </Link>
        ))}
      </span>
      <span className="t-num justify-self-end max-lg:col-start-2 max-lg:row-start-1">
        {p.rating ? (
          <span className="u-rank" data-rank={rankKey(p.rating)}>
            {p.rating}
            <span className="sr-only">, {rankName(p.rating)}</span>
          </span>
        ) : (
          <span className="text-ink-faint">
            <span aria-hidden="true">—</span>
            <span className="sr-only">Unrated</span>
          </span>
        )}
      </span>
    </li>
  );
}

function Pager({ page, query }: { page: CatalogPage; query: CatalogQuery }) {
  const pages = Math.max(1, Math.ceil(page.total / page.pageSize));
  if (pages === 1) return null;
  const first = (page.page - 1) * page.pageSize + 1;
  const step = (to: number, label: string, icon: "left" | "right") => {
    const body = (
      <>
        {icon === "left" && <ArrowLeft aria-hidden="true" />}
        {label}
        {icon === "right" && <ArrowRight aria-hidden="true" />}
      </>
    );
    return to < 1 || to > pages ? (
      <span className="u-btn u-btn--sm" aria-disabled="true">
        {body}
      </span>
    ) : (
      <Link
        href={`${catalogHref({ ...query, page: to })}#results`}
        className="u-btn u-btn--sm"
        rel={icon === "left" ? "prev" : "next"}
      >
        {body}
      </Link>
    );
  };
  return (
    <nav
      aria-label="Pages"
      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-5"
    >
      <p className="t-num t-sm t-muted">
        {n(first)}–{n(first + page.problems.length - 1)} of {n(page.total)} ·
        page {n(page.page)} of {n(pages)}
      </p>
      <div className="flex gap-2">
        {step(page.page - 1, "Previous", "left")}
        {step(page.page + 1, "Next", "right")}
      </div>
    </nav>
  );
}

export default async function Page({ searchParams }: Props) {
  const query = parseCatalogQuery(await searchParams);
  const [page, topicList] = await Promise.all([
    fetchCatalog(query),
    fetchTopics(),
  ]);
  const filtered = catalogHref({ ...query, page: 1 }) !== "/problems";

  return (
    <>
      <div className="wrap pb-[88px]">
        <header className="grid items-end gap-x-12 gap-y-8 pb-10 pt-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:pt-[72px]">
          <div>
            <p className="t-eyebrow">Problems</p>
            <h1 className="t-d2 mt-4">Find a problem.</h1>
            <p className="t-lg t-muted mt-5 max-w-[680px]">
              Problems from Codeforces and AtCoder in one list, newest first.
              Narrow it by rating,{" "}
              <Link href="/topics" className="t-link">
                topic
              </Link>{" "}
              or name. Every problem opens on its own judge.
            </p>
          </div>
          {topicList && (
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              {(["codeforces", "atcoder"] as const).map((judge) => (
                <Stat
                  key={judge}
                  label={
                    <span className="inline-flex items-center gap-1.5">
                      <BrandIcon name={judge} className="size-3" />
                      {JUDGE_NAME[judge]}
                    </span>
                  }
                  value={n(topicList.problems[judge])}
                  sub="problems"
                />
              ))}
              <Stat
                label="Topics"
                value={topicList.topics.length}
                sub="Codeforces tags"
              />
            </div>
          )}
        </header>

        <CatalogFilters query={query} topics={topicList?.topics ?? []} />

        <div className="transition-opacity peer-data-[pending]:opacity-50">
          {!page ? (
            <EmptyState
              className="mt-6"
              title="The problems did not load."
              action={
                <a href={catalogHref(query)} className="u-btn u-btn--sm">
                  Try again
                </a>
              }
            >
              The list is built from the judges’ own problem lists, and they did
              not answer just now. It usually works again within a minute.
            </EmptyState>
          ) : (
            <>
              <section aria-label="Problems by rating" className="pt-8">
                <Bands page={page} query={query} />
                <p className="t-sm t-muted mt-3">
                  Pick a band to set the rating range. A rating range leaves
                  unrated problems out. AtCoder ratings are estimates on the
                  Codeforces scale.
                </p>
              </section>

              <div
                id="results"
                className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pb-4 pt-10"
              >
                <h2 className="t-h2">
                  <span className="t-num">{n(page.total)}</span>{" "}
                  {page.total === 1 ? "problem" : "problems"}
                  {query.tag && (
                    <span className="text-ink-muted"> in {query.tag}</span>
                  )}
                </h2>
                {filtered && page.total > 0 && (
                  <Link
                    href="/problems"
                    scroll={false}
                    className="u-btn u-btn--sm"
                  >
                    Clear filters
                  </Link>
                )}
              </div>
              {query.tag && (
                <p className="t-sm t-muted -mt-2 pb-4">
                  Topics are Codeforces tags. AtCoder problems carry none, so a
                  topic leaves them out.
                </p>
              )}

              {page.total === 0 ? (
                <EmptyState
                  title="No problem matches."
                  action={
                    <Link
                      href={catalogHref(NO_QUERY)}
                      scroll={false}
                      className="u-btn u-btn--sm"
                    >
                      Clear filters
                    </Link>
                  }
                >
                  {query.tag && query.judge === "atcoder"
                    ? "AtCoder problems carry no topics. Choose any topic, or switch the judge."
                    : "Widen the rating range, pick another topic, or check the spelling of the name or id."}
                </EmptyState>
              ) : (
                <div className="u-panel">
                  <div
                    aria-hidden="true"
                    className={cn(
                      "u-stat__label hidden border-b border-line-strong px-5 py-2.5 lg:grid",
                      COLUMNS,
                    )}
                  >
                    <span>Id</span>
                    <span>Name</span>
                    <span>Topics</span>
                    <span className="justify-self-end">Rating</span>
                  </div>
                  <ul>
                    {page.problems.map((p) => (
                      <Row
                        key={`${p.judge}:${p.contestId}:${p.index}`}
                        p={p}
                        query={query}
                      />
                    ))}
                  </ul>
                </div>
              )}
              <Pager page={page} query={query} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
