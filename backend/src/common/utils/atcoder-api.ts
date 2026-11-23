import { BadRequestException } from '@nestjs/common';

// AtCoder has no public API. These are the AtCoder Problems endpoints
// (kenkoooo.com), which ask clients to stay around one request a second.
const BASE = 'https://kenkoooo.com/atcoder';
const CATALOG_TTL_MS = 12 * 60 * 60 * 1000;
const PAGE_SIZE = 500;
const MAX_PAGES = 4;

export type AtcoderSubmission = {
  id: number;
  epoch_second: number;
  problem_id: string;
  contest_id: string;
  result: string;
};

export type AtcoderCatalog = {
  /** contest id → when it ran */
  contests: Map<string, { start: number; duration: number }>;
  /**
   * task id ("abc300_a") → its name, the contest and letter it is known by
   * (see `homeContest`), plus the difficulty AtCoder Problems estimates for
   * it (on AtCoder's rating scale) when it has a settled one.
   */
  problems: Map<
    string,
    { index: string; name: string; contestId: string; difficulty?: number }
  >;
};

/**
 * The one contest and letter a task is known by. A task can be listed in
 * several contests under different letters: its own, a sister contest, and
 * the daily training re-runs ("adt_..."), which is often where the task list
 * itself points. Its own contest is the one its id starts with; failing
 * that, any contest that is not a re-run.
 */
export function homeContest(
  taskId: string,
  listed: { contestId: string; index: string }[],
) {
  const own = taskId.slice(0, taskId.lastIndexOf('_')).toLowerCase();
  return (
    listed.find((c) => c.contestId.toLowerCase() === own) ??
    listed.find((c) => !c.contestId.toLowerCase().startsWith('adt_')) ??
    listed[0]
  );
}

/**
 * AtCoder Problems' own display rule: estimates under 400 are squeezed
 * towards zero so that no problem shows a negative difficulty.
 */
export const clipDifficulty = (difficulty: number) =>
  Math.round(
    difficulty >= 400 ? difficulty : 400 / Math.exp(1 - difficulty / 400),
  );

async function getJson(url: string): Promise<any> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`AtCoder Problems answered ${res.status}`);
  return await res.json();
}

const unreachable = () =>
  new BadRequestException(
    'Unable to reach AtCoder Problems. Please try again later.',
  );

let catalog: { at: number; value: AtcoderCatalog } | null = null;

/** Every AtCoder contest and task. One copy in memory, refreshed every 12 hours. */
export async function fetchAtcoderCatalog(
  nowMs: number = Date.now(),
): Promise<AtcoderCatalog> {
  if (catalog && nowMs - catalog.at < CATALOG_TTL_MS) return catalog.value;
  try {
    const [contests, problems, pairs, models] = await Promise.all([
      getJson(`${BASE}/resources/contests.json`),
      getJson(`${BASE}/resources/problems.json`),
      // Without it a task keeps the one contest the task list names for it.
      getJson(`${BASE}/resources/contest-problem.json`).catch(() => []),
      // Without the estimates the catalog still serves names and letters.
      getJson(`${BASE}/resources/problem-models.json`).catch(() => ({})),
    ]);
    const listedIn = new Map<string, { contestId: string; index: string }[]>();
    for (const pair of pairs as any[]) {
      const id = String(pair.problem_id);
      listedIn.set(id, [
        ...(listedIn.get(id) ?? []),
        {
          contestId: String(pair.contest_id),
          index: String(pair.problem_index),
        },
      ]);
    }
    const value: AtcoderCatalog = {
      contests: new Map(
        (contests as any[]).map((c) => [
          String(c.id),
          {
            start: Number(c.start_epoch_second),
            duration: Number(c.duration_second),
          },
        ]),
      ),
      problems: new Map(
        (problems as any[]).map((p) => {
          const model = (models as Record<string, any>)[p.id];
          const settled =
            typeof model?.difficulty === 'number' && !model.is_experimental;
          const home = homeContest(String(p.id), [
            ...(listedIn.get(String(p.id)) ?? []),
            {
              contestId: String(p.contest_id),
              index: String(p.problem_index),
            },
          ]);
          return [
            String(p.id),
            {
              index: home.index,
              name: String(p.name),
              contestId: home.contestId,
              ...(settled
                ? { difficulty: clipDifficulty(Number(model.difficulty)) }
                : {}),
            },
          ];
        }),
      ),
    };
    catalog = { at: nowMs, value };
    return value;
  } catch {
    if (catalog) return catalog.value;
    throw unreachable();
  }
}

/**
 * A handle's submissions since `fromSecond`, oldest first.
 * ponytail: at most `maxPages` pages of 500; someone with more than that
 * since `fromSecond` loses the newest ones until the caller asks again from
 * where this answer ended.
 */
export async function fetchAtcoderSubmissions(
  handle: string,
  fromSecond: number,
  maxPages: number = MAX_PAGES,
): Promise<AtcoderSubmission[]> {
  const all: AtcoderSubmission[] = [];
  try {
    let from = Math.floor(fromSecond);
    for (let page = 0; page < maxPages; page++) {
      if (page > 0) await new Promise((r) => setTimeout(r, 1000));
      const batch = (await getJson(
        `${BASE}/atcoder-api/v3/user/submissions?user=${encodeURIComponent(handle)}&from_second=${from}`,
      )) as AtcoderSubmission[];
      if (!Array.isArray(batch)) throw new Error('unexpected answer');
      all.push(...batch);
      if (batch.length < PAGE_SIZE) break;
      from = batch[batch.length - 1].epoch_second + 1;
    }
  } catch {
    throw unreachable();
  }
  return all;
}
