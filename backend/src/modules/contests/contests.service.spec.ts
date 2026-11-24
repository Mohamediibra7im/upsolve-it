import { ConfigService } from '@nestjs/config';
import { readPage } from '../../common/utils/read-page';
import { ContestsService } from './contests.service';
import {
  mergeUpcoming,
  parseAtcoderContests,
  parseCodeforcesContests,
} from './upcoming-contests';

jest.mock('../../common/utils/read-page');

// Both samples are cut from what the judges answered on 24 November 2026.
const codeforcesList = {
  status: 'OK',
  result: [
    {
      id: 2291,
      name: 'ICPC 2026 Online Challenge 2 powered by Huawei',
      type: 'IOI',
      phase: 'BEFORE',
      frozen: false,
      durationSeconds: 1209600,
      startTimeSeconds: 1796727600,
      relativeTimeSeconds: -1248120,
    },
    {
      id: 2292,
      name: 'Codeforces Round (Div. 3)',
      type: 'ICPC',
      phase: 'BEFORE',
      frozen: false,
      durationSeconds: 8100,
      startTimeSeconds: 1795790100,
      relativeTimeSeconds: -310621,
    },
    // announced, no date yet
    { id: 2293, name: 'Codeforces Round', type: 'CF', phase: 'BEFORE' },
    {
      id: 2289,
      name: 'Codeforces Round 1137 (Div. 2)',
      type: 'CF',
      phase: 'FINISHED',
      frozen: false,
      durationSeconds: 7200,
      startTimeSeconds: 1795338300,
      relativeTimeSeconds: 141180,
    },
  ],
};

const atcoderRow = (time: string, id: string, name: string, length: string) =>
  `<tr>
    <td class="text-center"><a href='http://www.timeanddate.com/worldclock/fixedtime.html?iso=20261128T2100&p1=248' target='blank'><time class='fixtime fixtime-full'>${time}</time></a></td>
    <td ><span aria-hidden='true' data-toggle='tooltip' data-placement='top' title="Algorithm">Ⓐ</span><span class="user-blue">◉</span> <a href="/contests/${id}">${name}</a></td>
    <td class="text-center">${length}</td>
    <td class="text-center"> - 1999</td>
  </tr>`;
const atcoderTable = (id: string, title: string, rows: string) =>
  `<div id="contest-table-${id}"><h3>${title}</h3>
  <div class="panel panel-default"><div class="table-responsive"><table class="table">
    <thead><tr><th>Start Time<small> (local time)</small></th><th>Contest Name</th><th>Duration</th><th>Rated Range</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div></div></div>`;
const atcoderPage = `<html><body>
${atcoderTable(
  'upcoming',
  'Upcoming Contests',
  atcoderRow(
    '2026-11-28 21:00:00+0900',
    'abc486',
    'AtCoder Beginner Contest 486',
    '01:40',
  ) +
    atcoderRow(
      '2026-11-29 19:00:00+0900',
      'ahc075',
      'AtCoder Heuristic Contest 075',
      '240:00',
    ),
)}
${atcoderTable(
  'recent',
  'Recent Contests',
  atcoderRow(
    '2026-11-21 21:00:00+0900',
    'abc485',
    'AtCoder Beginner Contest 485',
    '01:40',
  ),
)}
</body></html>`;

const NOW = Date.parse('2026-11-24T00:00:00Z');
const MINUTE = 60 * 1000;

describe('upcoming contests', () => {
  it('keeps the Codeforces rounds that have a start ahead of them', () => {
    expect(parseCodeforcesContests(codeforcesList)).toEqual([
      {
        judge: 'codeforces',
        id: '2291',
        name: 'ICPC 2026 Online Challenge 2 powered by Huawei',
        startsAt: '2026-12-08T11:00:00.000Z',
        durationMinutes: 20160,
        url: 'https://codeforces.com/contests/2291',
      },
      {
        judge: 'codeforces',
        id: '2292',
        name: 'Codeforces Round (Div. 3)',
        startsAt: '2026-11-27T14:35:00.000Z',
        durationMinutes: 135,
        url: 'https://codeforces.com/contests/2292',
      },
    ]);
    expect(() => parseCodeforcesContests({ status: 'FAILED' })).toThrow();
  });

  it('reads the upcoming table of the AtCoder contests page, and only it', () => {
    expect(parseAtcoderContests(atcoderPage)).toEqual([
      {
        judge: 'atcoder',
        id: 'abc486',
        name: 'AtCoder Beginner Contest 486',
        startsAt: '2026-11-28T12:00:00.000Z',
        durationMinutes: 100,
        url: 'https://atcoder.jp/contests/abc486',
      },
      {
        judge: 'atcoder',
        id: 'ahc075',
        name: 'AtCoder Heuristic Contest 075',
        startsAt: '2026-11-29T10:00:00.000Z',
        durationMinutes: 14400,
        url: 'https://atcoder.jp/contests/ahc075',
      },
    ]);
    // nothing scheduled is an answer; a page without the tables is not
    expect(
      parseAtcoderContests(atcoderTable('recent', 'Recent Contests', '')),
    ).toEqual([]);
    expect(() => parseAtcoderContests('<html>Just a moment…</html>')).toThrow();
    expect(() =>
      parseAtcoderContests(
        atcoderTable('upcoming', 'Upcoming Contests', '<tr><td>?</td></tr>'),
      ),
    ).toThrow();
  });

  it('merges the judges soonest first and drops what has started', () => {
    const merged = mergeUpcoming(
      [
        parseCodeforcesContests(codeforcesList),
        parseAtcoderContests(atcoderPage),
      ],
      Date.parse('2026-11-28T00:00:00Z'),
    );
    expect(merged.map((c) => c.id)).toEqual(['abc486', 'ahc075', '2291']);
  });
});

describe('ContestsService', () => {
  const page = jest.mocked(readPage);
  const answer = (body: unknown) =>
    Promise.resolve({ json: () => Promise.resolve(body) } as Response);
  let api: jest.SpiedFunction<typeof fetch>;
  let service: ContestsService;

  beforeEach(() => {
    api = jest.spyOn(globalThis, 'fetch');
    page.mockReset();
    service = new ContestsService(new ConfigService({}));
  });
  afterEach(() => jest.restoreAllMocks());

  it('names a judge that could not be read and still lists the other', async () => {
    api.mockRejectedValue(new Error('down'));
    page.mockResolvedValue(atcoderPage);

    const first = await service.upcoming(NOW);
    expect(first.unavailable).toEqual(['codeforces']);
    expect(first.contests.map((c) => c.id)).toEqual(['abc486', 'ahc075']);

    // The failed judge is left alone for a few minutes, then asked again.
    await service.upcoming(NOW + MINUTE);
    expect(api).toHaveBeenCalledTimes(1);
    api.mockImplementation(() => answer(codeforcesList));
    const later = await service.upcoming(NOW + 6 * MINUTE);
    expect(later.unavailable).toEqual([]);
    expect(later.contests.map((c) => c.id)).toEqual([
      '2292',
      'abc486',
      'ahc075',
      '2291',
    ]);
    expect(page).toHaveBeenCalledTimes(1);
  });

  it('serves the last good copy when a refresh fails', async () => {
    api.mockImplementation(() => answer(codeforcesList));
    page.mockResolvedValue(atcoderPage);
    await service.upcoming(NOW);

    api.mockRejectedValue(new Error('down'));
    page.mockRejectedValue(new Error('answered 403'));
    const stale = await service.upcoming(NOW + 61 * MINUTE);
    expect(stale.unavailable).toEqual([]);
    expect(stale.contests).toHaveLength(4);
  });
});
