import type { Judge } from '../schemas/judge';

export type ParsedProblemUrl =
  | { judge: Judge; contestId: number | string; index: string; url: string }
  | { error: 'gym' | 'unknown' };

/** Gym contests use ids from 100000 and have no public problemset page. */
const GYM_CONTEST_ID_START = 100000;

/**
 * Reads a pasted problem link. Understands the Codeforces contest and
 * problemset forms and AtCoder task pages; everything else is `unknown`.
 */
export function parseProblemUrl(input: string): ParsedProblemUrl {
  let url: URL;
  try {
    const text = input.trim();
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return { error: 'unknown' };
  }
  const host = url.hostname.toLowerCase().replace(/^(www|m)\./, '');
  const path = url.pathname.replace(/\/+$/, '');

  if (host === 'codeforces.com') {
    if (/^\/(gym|problemset\/gymProblem)\//.test(path)) return { error: 'gym' };
    const m =
      /^\/(?:contest|problemset\/problem)\/(\d+)\/(?:problem\/)?([A-Za-z]\d?)$/.exec(
        path,
      );
    if (!m) return { error: 'unknown' };
    const contestId = Number(m[1]);
    if (contestId >= GYM_CONTEST_ID_START) return { error: 'gym' };
    const index = m[2].toUpperCase();
    return {
      judge: 'codeforces',
      contestId,
      index,
      url: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
    };
  }

  if (host === 'atcoder.jp') {
    const m =
      /^\/contests\/([A-Za-z0-9_-]{1,40})\/tasks\/([A-Za-z0-9_]{1,60})$/.exec(
        path,
      );
    if (!m) return { error: 'unknown' };
    const [, contestId, task] = m;
    return {
      judge: 'atcoder',
      contestId: contestId.toLowerCase(),
      // "abc300_a" → "A"; the real index comes from the problem list when known
      index: task.slice(task.lastIndexOf('_') + 1).toUpperCase(),
      url: `https://atcoder.jp/contests/${contestId.toLowerCase()}/tasks/${task.toLowerCase()}`,
    };
  }

  return { error: 'unknown' };
}
