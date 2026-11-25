"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import BrandIcon from "@/components/shared/BrandIcon";
import { Picker } from "@/components/ui/select";
import {
  JUDGE_NAME,
  catalogHref,
  parseCatalogQuery,
  type CatalogQuery,
  type Topic,
} from "@/lib/catalog";

const JUDGES = ["", "codeforces", "atcoder"] as const;

/** The form's own copy of the filters: what is chosen or typed, applied or not. */
const draftOf = (query: CatalogQuery) => ({
  judge: query.judge as string,
  tag: query.tag,
  q: query.q,
  min: query.min === null ? "" : String(query.min),
  max: query.max === null ? "" : String(query.max),
});

/**
 * The catalogue's filters. They live in the page address: applying one
 * navigates, and the server sends the matching page. The judge and the topic
 * apply at once; typed fields apply with Enter or the button. Without
 * scripts it is still a form that submits to /problems.
 */
export default function CatalogFilters({
  query,
  topics,
}: {
  query: CatalogQuery;
  topics: Topic[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // The address can change from outside (a rating band, "Clear filters"):
  // the form then follows it.
  const href = catalogHref(query);
  const [seen, setSeen] = useState(href);
  const [draft, setDraft] = useState(() => draftOf(query));
  if (seen !== href) {
    setSeen(href);
    setDraft(draftOf(query));
  }

  const apply = (change: Partial<typeof draft> = {}) => {
    const chosen = { ...draft, ...change };
    setDraft(chosen);
    const next = catalogHref(parseCatalogQuery(chosen));
    if (next !== href)
      startTransition(() => router.push(next, { scroll: false }));
  };

  const tags = topics.map((t) => t.tag).sort((a, b) => a.localeCompare(b));
  const totals = new Map(topics.map((t) => [t.tag, t.total]));
  // a topic from the address stays selectable even if the list lacks it
  if (query.tag && !totals.has(query.tag)) tags.unshift(query.tag);

  return (
    <form
      action="/problems"
      method="get"
      role="search"
      aria-label="Filter problems"
      aria-busy={pending}
      data-pending={pending ? "" : undefined}
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      className="u-panel peer grid items-end gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-[minmax(0,1fr)_auto_13rem_minmax(0,17rem)_auto]"
    >
      <label className="u-field sm:col-span-2 xl:col-span-1">
        <span className="u-stat__label">Name or id</span>
        <span className="relative block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
          />
          <input
            name="q"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            maxLength={80}
            placeholder="Two Sum, 1996E, abc300"
            className="u-input h-10 pl-9"
            value={draft.q}
            onChange={(e) => setDraft({ ...draft, q: e.target.value })}
          />
        </span>
      </label>

      <div className="u-field">
        <span className="u-stat__label" id="catalog-judge">
          Judge
        </span>
        <input type="hidden" name="judge" value={draft.judge} />
        <div
          className="u-seg h-10 max-w-full justify-self-start overflow-x-auto"
          role="group"
          aria-labelledby="catalog-judge"
        >
          {JUDGES.map((judge) => (
            <button
              key={judge}
              type="button"
              aria-pressed={draft.judge === judge}
              onClick={() => apply({ judge })}
              className="inline-flex h-auto items-center gap-1.5"
            >
              {judge && <BrandIcon name={judge} className="size-3.5" />}
              {judge ? JUDGE_NAME[judge] : "All"}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="u-field">
        <legend className="u-stat__label mb-1.5">Rating</legend>
        <div className="flex items-center gap-2">
          <label htmlFor="catalog-min" className="sr-only">
            Lowest rating
          </label>
          <input
            id="catalog-min"
            name="min"
            className="u-input t-num h-10"
            type="number"
            inputMode="numeric"
            min={0}
            max={5000}
            step={100}
            placeholder="800"
            value={draft.min}
            onChange={(e) => setDraft({ ...draft, min: e.target.value })}
          />
          <span className="t-muted" aria-hidden="true">
            –
          </span>
          <label htmlFor="catalog-max" className="sr-only">
            Highest rating
          </label>
          <input
            id="catalog-max"
            name="max"
            className="u-input t-num h-10"
            type="number"
            inputMode="numeric"
            min={0}
            max={5000}
            step={100}
            placeholder="3500"
            value={draft.max}
            onChange={(e) => setDraft({ ...draft, max: e.target.value })}
          />
        </div>
      </fieldset>

      <div className="u-field">
        <label className="u-stat__label" htmlFor="catalog-tag">
          Topic
        </label>
        {/* the form still carries the topic when it is submitted as a form */}
        <input type="hidden" name="tag" value={draft.tag} />
        <Picker
          id="catalog-tag"
          className="h-10"
          value={draft.tag}
          onChange={(tag) => apply({ tag })}
          options={[
            { value: "", label: "Any topic" },
            ...tags.map((tag) => ({
              value: tag,
              label: (
                <>
                  {tag}
                  {totals.has(tag) && (
                    <span className="t-num t-muted ml-2">
                      {totals.get(tag)!.toLocaleString("en-US")}
                    </span>
                  )}
                </>
              ),
            })),
          ]}
        />
      </div>

      <button
        type="submit"
        className="u-btn justify-self-start"
        disabled={pending}
      >
        {pending ? "Loading…" : "Apply"}
      </button>
    </form>
  );
}
