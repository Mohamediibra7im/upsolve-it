import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { fetchAtcoderCatalog } from '../../common/utils/atcoder-api';
import {
  fetchCodeforcesContestStarts,
  fetchCodeforcesProblemset,
  type CfProblem,
} from '../../common/utils/codeforces-api';
import type { AtcoderService } from '../atcoder/atcoder.service';
import { CatalogService, PAGE_SIZE } from './catalog.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';

// The judges are never asked in a test: all three lists are made up here.
jest.mock('../../common/utils/codeforces-api');
jest.mock('../../common/utils/atcoder-api');

const contest = (
  contestId: number,
  problems: Omit<CfProblem, 'contestId'>[],
): [number, CfProblem[]] => [
  contestId,
  problems.map((p) => ({ contestId, ...p })),
];
const codeforces = new Map([
  contest(1996, [
    { index: 'A', name: 'Legs', rating: 800, tags: ['math'] },
    { index: 'E', name: 'Decode', rating: 1600, tags: ['dp', 'math'] },
    { index: 'G', name: 'Penacony', tags: ['graphs'] }, // not rated yet
  ]),
  contest(100, [{ index: 'B', name: 'Old Sum', rating: 2400, tags: ['dp'] }]),
]);
const atcoder = [
  {
    contestId: 'abc300',
    index: 'E',
    name: 'Dice Product 3',
    rating: 1500,
    difficulty: 1000,
    url: 'https://atcoder.jp/contests/abc300/tasks/abc300_e',
  },
];

describe('CatalogService', () => {
  let service: CatalogService;
  const trainingProblems = jest.fn();
  const ids = async (query: CatalogQueryDto) =>
    (await service.search(query)).problems.map(
      (p) => `${p.contestId}${p.index}`,
    );

  beforeEach(() => {
    jest.mocked(fetchCodeforcesProblemset).mockResolvedValue(codeforces);
    jest
      .mocked(fetchCodeforcesContestStarts)
      .mockResolvedValue(new Map([[1996, 3000]]));
    jest.mocked(fetchAtcoderCatalog).mockResolvedValue({
      contests: new Map([['abc300', { start: 2000, duration: 6000 }]]),
      problems: new Map(),
    });
    trainingProblems.mockReset().mockResolvedValue(atcoder);
    service = new CatalogService({
      trainingProblems,
    } as unknown as AtcoderService);
  });

  it('lists both judges together, newest contest first', async () => {
    expect(await ids({})).toEqual([
      '1996A',
      '1996E',
      '1996G',
      'abc300E',
      '100B',
    ]);
    const { problems, total } = await service.search({ judge: 'atcoder' });
    expect(total).toBe(1);
    expect(problems[0]).toEqual({
      judge: 'atcoder',
      contestId: 'abc300',
      index: 'E',
      name: 'Dice Product 3',
      rating: 1500,
      tags: [],
      url: 'https://atcoder.jp/contests/abc300/tasks/abc300_e',
    });
  });

  it('narrows by tag, by name and by the start of an id', async () => {
    // AtCoder problems carry no tags, so a tag leaves them out
    expect(await ids({ tag: 'dp' })).toEqual(['1996E', '100B']);
    expect(await ids({ q: 'dEcO' })).toEqual(['1996E']);
    expect(await ids({ q: '1996e' })).toEqual(['1996E']);
    expect(await ids({ q: '1996' })).toEqual(['1996A', '1996E', '1996G']);
    expect(await ids({ q: 'abc300_e' })).toEqual(['abc300E']);
    // without a digit it is a name, not every "abc…" contest
    expect(await ids({ q: 'a' })).toEqual(['1996G']);
  });

  it('leaves unrated problems out of a rating range only', async () => {
    expect(await ids({ judge: 'codeforces' })).toContain('1996G');
    expect(await ids({ min: 1500, max: 1600 })).toEqual(['1996E', 'abc300E']);
    expect(await ids({ max: 900 })).toEqual(['1996A']);
    // the bands count what the other filters keep, whatever the range
    const { bands } = await service.search({ judge: 'codeforces', min: 3000 });
    expect(bands.map((b) => b.count)).toEqual([1, 0, 0, 1, 0, 0, 1]);
    expect(bands[0]).toMatchObject({ min: 800, max: 1199 });
    expect(bands[6]).toMatchObject({ min: 2400, max: 3500 });
  });

  it('answers a page past the end with the last page', async () => {
    const many = Array.from({ length: PAGE_SIZE + 1 }, (_, i) => ({
      index: `A${i}`,
      name: 'x',
    }));
    jest
      .mocked(fetchCodeforcesProblemset)
      .mockResolvedValue(new Map([contest(1, many)]));
    trainingProblems.mockResolvedValue([]);
    const last = await service.search({ page: 9 });
    expect(last).toMatchObject({ total: PAGE_SIZE + 1, page: 2 });
    expect(last.problems).toHaveLength(1);
  });

  it('counts every tag in all and per rating band', async () => {
    const { topics, problems, bands } = await service.topics();
    expect(problems).toEqual({ codeforces: 4, atcoder: 1 });
    expect(bands).toHaveLength(7);
    expect(topics).toEqual([
      { tag: 'dp', total: 2, counts: [0, 0, 0, 1, 0, 0, 1] },
      { tag: 'math', total: 2, counts: [1, 0, 0, 1, 0, 0, 0] },
      // unrated: in the total, in no band
      { tag: 'graphs', total: 1, counts: [0, 0, 0, 0, 0, 0, 0] },
    ]);
  });

  it('builds the list once per copy of the judges’ lists', async () => {
    await service.search({});
    await service.topics();
    expect(trainingProblems).toHaveBeenCalledTimes(1);
    jest.mocked(fetchCodeforcesProblemset).mockResolvedValue(new Map());
    expect((await service.search({})).total).toBe(1);
    expect(trainingProblems).toHaveBeenCalledTimes(2);
  });
});

describe('CatalogQueryDto', () => {
  const read = (query: object) => plainToInstance(CatalogQueryDto, query);

  it('reads numbers from text and treats "" as unset', async () => {
    const query = read({ judge: '', min: '1200', max: '', q: '', page: '3' });
    expect(await validate(query)).toHaveLength(0);
    expect(query).toEqual({ min: 1200, page: 3 });
  });

  it('refuses an unknown judge, a rating that is no number and page 0', async () => {
    expect(await validate(read({ judge: 'spoj' }))).toHaveLength(1);
    expect(await validate(read({ min: '12a' }))).toHaveLength(1);
    expect(await validate(read({ page: '0' }))).toHaveLength(1);
    expect(await validate(read({ tag: ['dp', 'math'] }))).toHaveLength(1);
  });
});
