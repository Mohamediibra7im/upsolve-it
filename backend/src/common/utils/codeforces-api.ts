import { BadRequestException } from '@nestjs/common';

export async function fetchCodeforcesUserInfo(handles: string): Promise<any[]> {
  let data: any;
  try {
    const res = await fetch(
      `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handles)}`,
      { signal: AbortSignal.timeout(8000) },
    );
    data = await res.json();
  } catch {
    throw new BadRequestException(
      'Unable to reach Codeforces API. Please try again later.',
    );
  }

  if (data?.status !== 'OK' || !data.result) {
    const comment = data?.comment ?? '';
    if (comment.includes('not found') || comment.includes('handle')) {
      throw new BadRequestException('Invalid Codeforces handle');
    }
    throw new BadRequestException(
      'Codeforces API is currently unavailable. Please try again later.',
    );
  }
  return data.result;
}

/** Every submission of a handle, newest first (Codeforces `user.status`). */
export async function fetchCodeforcesSubmissions(
  handle: string,
): Promise<any[]> {
  let data: any;
  try {
    const res = await fetch(
      `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}`,
      { signal: AbortSignal.timeout(15000) },
    );
    data = await res.json();
  } catch {
    throw new BadRequestException(
      'Unable to reach Codeforces API. Please try again later.',
    );
  }
  if (data?.status !== 'OK' || !Array.isArray(data.result)) {
    throw new BadRequestException(
      'Codeforces API is currently unavailable. Please try again later.',
    );
  }
  return data.result;
}

/** A problem as Codeforces `problemset.problems` lists it. */
export type CfProblem = {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags?: string[];
};

const PROBLEMSET_TTL_MS = 12 * 60 * 60 * 1000;
let problemset: { at: number; byContest: Map<number, CfProblem[]> } | null =
  null;

/**
 * Every problemset problem, grouped by contest and in contest order.
 *
 * ponytail: one copy in memory per machine, refreshed every 12 hours. A problem
 * shared by two divisions is listed under one of the two contests only, so the
 * other division's list stops short. Asking per contest would fix that, but
 * `contest.standings` no longer accepts a row limit and returns every row.
 */
export async function fetchCodeforcesProblemset(
  nowMs: number = Date.now(),
): Promise<Map<number, CfProblem[]>> {
  if (problemset && nowMs - problemset.at < PROBLEMSET_TTL_MS)
    return problemset.byContest;
  try {
    const res = await fetch(
      'https://codeforces.com/api/problemset.problems?lang=en',
      { signal: AbortSignal.timeout(15000) },
    );
    const data: any = await res.json();
    if (data?.status !== 'OK' || !Array.isArray(data.result?.problems))
      throw new Error('unexpected answer');
    const byContest = new Map<number, CfProblem[]>();
    for (const p of data.result.problems as CfProblem[]) {
      if (typeof p.contestId !== 'number') continue;
      byContest.set(p.contestId, [...(byContest.get(p.contestId) ?? []), p]);
    }
    for (const list of byContest.values())
      list.sort((a, b) =>
        a.index.localeCompare(b.index, 'en', { numeric: true }),
      );
    problemset = { at: nowMs, byContest };
    return byContest;
  } catch {
    // An old copy is better than none: problems rarely change.
    if (problemset) return problemset.byContest;
    throw new BadRequestException(
      'Unable to reach Codeforces API. Please try again later.',
    );
  }
}
