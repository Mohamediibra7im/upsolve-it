import * as cheerio from 'cheerio';

export const JUDGES = ['codeforces', 'atcoder'] as const;
export type Judge = (typeof JUDGES)[number];

export type UpcomingContest = {
  judge: Judge;
  id: string;
  name: string;
  /** ISO 8601, UTC */
  startsAt: string;
  durationMinutes: number;
  url: string;
};

/** The rounds that have not started, from Codeforces `contest.list`. */
export function parseCodeforcesContests(data: any): UpcomingContest[] {
  if (data?.status !== 'OK' || !Array.isArray(data.result))
    throw new Error('unexpected answer');
  return (data.result as any[])
    .filter(
      // a round announced without a date has no start time yet
      (c) => c.phase === 'BEFORE' && Number.isFinite(c.startTimeSeconds),
    )
    .map((c) => ({
      judge: 'codeforces' as const,
      id: String(c.id),
      name: String(c.name),
      startsAt: new Date(c.startTimeSeconds * 1000).toISOString(),
      durationMinutes: Math.round(Number(c.durationSeconds) / 60),
      // the contest's own page turns visitors away until it starts
      url: `https://codeforces.com/contests/${c.id}`,
    }));
}

/**
 * The "Upcoming Contests" table of https://atcoder.jp/contests/. A row reads
 * `2026-11-28 21:00:00+0900`, a link to `/contests/abc486`, and `01:40`.
 */
export function parseAtcoderContests(page: string): UpcomingContest[] {
  const $ = cheerio.load(page);
  // AtCoder leaves the table out when nothing is scheduled. A page with none
  // of its contest tables is not the contests page any more.
  if (!$('[id^="contest-table-"]').length)
    throw new Error('no contest tables on the page');
  const rows = $('#contest-table-upcoming tbody tr').toArray();
  const contests = rows.flatMap((row): UpcomingContest[] => {
    const time = $(row)
      .find('time')
      .text()
      .trim()
      .match(/^(\d{4}-\d\d-\d\d) (\d\d:\d\d:\d\d)([+-]\d\d):?(\d\d)$/);
    const link = $(row).find('a[href^="/contests/"]').first();
    const id = link.attr('href')?.match(/^\/contests\/([\w-]+)$/)?.[1];
    const duration = $(row)
      .find('td')
      .eq(2)
      .text()
      .trim()
      .match(/^(\d+):(\d\d)$/);
    const startsAt = time
      ? new Date(`${time[1]}T${time[2]}${time[3]}:${time[4]}`)
      : null;
    if (!startsAt || Number.isNaN(startsAt.getTime()) || !id || !duration)
      return [];
    return [
      {
        judge: 'atcoder',
        id,
        name: link.text().trim(),
        startsAt: startsAt.toISOString(),
        durationMinutes: Number(duration[1]) * 60 + Number(duration[2]),
        url: `https://atcoder.jp/contests/${id}`,
      },
    ];
  });
  if (rows.length && !contests.length)
    throw new Error('the upcoming table could not be read');
  return contests;
}

/** Every judge's rounds that have not started at `nowMs`, soonest first. */
export function mergeUpcoming(
  lists: UpcomingContest[][],
  nowMs: number,
): UpcomingContest[] {
  return lists
    .flat()
    .filter((c) => Date.parse(c.startsAt) > nowMs)
    .sort(
      (a, b) =>
        Date.parse(a.startsAt) - Date.parse(b.startsAt) ||
        a.name.localeCompare(b.name),
    );
}
