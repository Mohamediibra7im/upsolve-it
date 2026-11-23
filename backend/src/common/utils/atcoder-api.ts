import { BadRequestException } from '@nestjs/common';

// AtCoder has no public API. These are the AtCoder Problems endpoints
// (kenkoooo.com), which ask clients to stay around one request a second.
const BASE = 'https://kenkoooo.com/atcoder';
const CATALOG_TTL_MS = 12 * 60 * 60 * 1000;
const PAGE_SIZE = 500;
const MAX_PAGES = 4;

export type AtcoderSubmission = {
  epoch_second: number;
  problem_id: string;
  contest_id: string;
  result: string;
};

export type AtcoderCatalog = {
  /** contest id → when it ran */
  contests: Map<string, { start: number; duration: number }>;
  /** task id ("abc300_a") → its letter and name */
  problems: Map<string, { index: string; name: string }>;
};

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
    const [contests, problems] = await Promise.all([
      getJson(`${BASE}/resources/contests.json`),
      getJson(`${BASE}/resources/problems.json`),
    ]);
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
        (problems as any[]).map((p) => [
          String(p.id),
          { index: String(p.problem_index), name: String(p.name) },
        ]),
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
 * ponytail: at most 2,000 (four pages); someone submitting more than that in
 * the import window loses the newest ones until the window moves on.
 */
export async function fetchAtcoderSubmissions(
  handle: string,
  fromSecond: number,
): Promise<AtcoderSubmission[]> {
  const all: AtcoderSubmission[] = [];
  try {
    let from = Math.floor(fromSecond);
    for (let page = 0; page < MAX_PAGES; page++) {
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
