import { Injectable } from '@nestjs/common';
import { fetchAtcoderCatalog } from '../../common/utils/atcoder-api';
import {
  fetchCodeforcesContestStarts,
  fetchCodeforcesProblemset,
} from '../../common/utils/codeforces-api';
import { AtcoderService } from '../atcoder/atcoder.service';
import type { ContestId, Judge } from '../upsolve/schemas/judge';
import type { CatalogQueryDto } from './dto/catalog-query.dto';

export const PAGE_SIZE = 50;

/**
 * Where each rating band starts: the Codeforces rank colours, so a band can be
 * drawn in its rank's colour. The last band runs to 3500.
 */
export const BAND_STARTS = [800, 1200, 1400, 1600, 1900, 2100, 2400];
const BANDS = BAND_STARTS.map((min, i) => ({
  min,
  max: (BAND_STARTS[i + 1] ?? 3501) - 1,
}));
const bandOf = (rating: number) =>
  Math.max(0, BAND_STARTS.filter((start) => rating >= start).length - 1);
const noCounts = () => BAND_STARTS.map(() => 0);

export type CatalogProblem = {
  judge: Judge;
  contestId: ContestId;
  index: string;
  name: string;
  /** On the Codeforces scale; an estimate for AtCoder. Null when unrated. */
  rating: number | null;
  tags: string[];
  url: string;
};
const natural = new Intl.Collator('en', { numeric: true });

/** Both judges' problems as one list, newest contest first. */
export function buildCatalog(
  codeforces: Map<
    number,
    { index: string; name: string; rating?: number; tags?: string[] }[]
  >,
  codeforcesStarts: Map<number, number>,
  atcoder: Awaited<ReturnType<AtcoderService['trainingProblems']>>,
  atcoderStarts: Map<string, { start: number }>,
): CatalogProblem[] {
  // `at` is when the problem's contest started: what the list is ordered by
  const all: { at: number; problem: CatalogProblem }[] = [];
  for (const [contestId, problems] of codeforces)
    for (const p of problems)
      all.push({
        at: codeforcesStarts.get(contestId) ?? 0,
        problem: {
          judge: 'codeforces',
          contestId,
          index: p.index,
          name: p.name,
          rating: p.rating ?? null,
          tags: p.tags ?? [],
          url: `https://codeforces.com/problemset/problem/${contestId}/${p.index}`,
        },
      });
  for (const p of atcoder)
    all.push({
      at: atcoderStarts.get(p.contestId)?.start ?? 0,
      problem: {
        judge: 'atcoder',
        contestId: p.contestId,
        index: p.index,
        name: p.name,
        rating: p.rating,
        tags: [],
        url: p.url,
      },
    });
  return all
    .sort(
      ({ at: a, problem: p }, { at: b, problem: q }) =>
        b - a ||
        natural.compare(String(q.contestId), String(p.contestId)) ||
        natural.compare(p.index, q.index),
    )
    .map(({ problem }) => problem);
}

/**
 * One page of the problems a query keeps, and how the ones it keeps before
 * the rating range spread over the bands. A rating range leaves unrated
 * problems out; a page past the end is the last page.
 */
export function searchCatalog(all: CatalogProblem[], query: CatalogQueryDto) {
  const text = query.q?.trim().toLowerCase() ?? '';
  // "1996 E", "1996/E" and "abc300_a" are the ids 1996e and abc300a
  const id = text.replace(/[\s_/-]+/g, '');
  const byId = /\d/.test(id);
  const ranged = query.min !== undefined || query.max !== undefined;
  const counts = noCounts();

  const kept = all.filter((p) => {
    if (query.judge && p.judge !== query.judge) return false;
    if (query.tag && !p.tags.includes(query.tag)) return false;
    if (
      text &&
      !p.name.toLowerCase().includes(text) &&
      !(byId && `${p.contestId}${p.index}`.toLowerCase().startsWith(id))
    )
      return false;
    if (p.rating) counts[bandOf(p.rating)]++;
    if (!ranged) return true;
    return (
      !!p.rating &&
      p.rating >= (query.min ?? 0) &&
      p.rating <= (query.max ?? Infinity)
    );
  });

  const pages = Math.max(1, Math.ceil(kept.length / PAGE_SIZE));
  const page = Math.min(query.page ?? 1, pages);
  return {
    problems: kept.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: kept.length,
    page,
    pageSize: PAGE_SIZE,
    bands: BANDS.map((band, i) => ({ ...band, count: counts[i] })),
  };
}

/**
 * Every Codeforces tag with how many problems carry it, in all and per rating
 * band (`counts` lines up with `bands`; unrated problems are in the total
 * only). AtCoder problems carry no tags: they are counted as a judge total.
 */
export function countTopics(all: CatalogProblem[]) {
  const byTag = new Map<string, { total: number; counts: number[] }>();
  const problems = { codeforces: 0, atcoder: 0 };
  for (const p of all) {
    problems[p.judge]++;
    for (const tag of p.tags) {
      let topic = byTag.get(tag);
      if (!topic) byTag.set(tag, (topic = { total: 0, counts: noCounts() }));
      topic.total++;
      if (p.rating) topic.counts[bandOf(p.rating)]++;
    }
  }
  return {
    bands: BANDS,
    problems,
    topics: [...byTag]
      .map(([tag, topic]) => ({ tag, ...topic }))
      .sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag)),
  };
}

@Injectable()
export class CatalogService {
  /** Built once per copy of the judges' lists: `from` is what it was built from. */
  private built: {
    from: unknown[];
    all: CatalogProblem[];
    topics: ReturnType<typeof countTopics>;
  } | null = null;

  constructor(private readonly atcoder: AtcoderService) {}

  /**
   * ponytail: all three lists must answer once before anything is served;
   * after that each falls back to its last copy. Requests that arrive while
   * the first copy is loading each ask the judges themselves.
   */
  private async load() {
    const [codeforces, starts, atcoder] = await Promise.all([
      fetchCodeforcesProblemset(),
      fetchCodeforcesContestStarts(),
      fetchAtcoderCatalog(),
    ]);
    const from = [codeforces, starts, atcoder];
    if (!this.built || from.some((list, i) => list !== this.built!.from[i])) {
      const all = buildCatalog(
        codeforces,
        starts,
        await this.atcoder.trainingProblems(),
        atcoder.contests,
      );
      this.built = { from, all, topics: countTopics(all) };
    }
    return this.built;
  }

  async search(query: CatalogQueryDto) {
    return searchCatalog((await this.load()).all, query);
  }

  async topics() {
    return (await this.load()).topics;
  }
}
