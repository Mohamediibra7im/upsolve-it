import { AtcoderService, codeforcesRating } from './atcoder.service';

const answer = (body: unknown) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body),
  } as Response);
const submission = (id: number, task: string, result: string, at: number) => ({
  id,
  epoch_second: at,
  problem_id: task,
  contest_id: 'abc300',
  result,
});

describe('codeforcesRating', () => {
  it('stretches AtCoder difficulty onto the Codeforces scale, in hundreds', () => {
    expect([650, 900, 1150, 1400, 2800].map(codeforcesRating)).toEqual([
      1200, 1400, 1600, 1800, 2900,
    ]);
  });

  it('stays between 800 and 3500', () => {
    expect(codeforcesRating(5)).toBe(800);
    expect(codeforcesRating(4383)).toBe(3500);
  });
});

describe('AtcoderService', () => {
  let service: AtcoderService;
  let submissions: ReturnType<typeof submission>[] | Error;
  let asked: string[];
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    service = new AtcoderService();
    submissions = [];
    asked = [];
    fetchMock = jest.spyOn(global, 'fetch').mockImplementation((input) => {
      const url = input as string;
      if (url.endsWith('contests.json'))
        return answer([
          { id: 'abc300', start_epoch_second: 1000, duration_second: 6000 },
        ]);
      if (url.endsWith('problems.json'))
        return answer(
          ['a', 'b', 'c'].map((l) => ({
            id: `abc300_${l}`,
            contest_id: 'abc300',
            problem_index: l.toUpperCase(),
            name: `Task ${l.toUpperCase()}`,
          })),
        );
      if (url.endsWith('problem-models.json'))
        return answer({
          abc300_a: { difficulty: -1147, is_experimental: false },
          abc300_b: { difficulty: 900, is_experimental: false },
          abc300_c: { difficulty: 1500, is_experimental: true },
        });
      if (url.includes('/user/submissions')) {
        asked.push(url.slice(url.indexOf('?')));
        return submissions instanceof Error
          ? Promise.reject(submissions)
          : answer(submissions);
      }
      return Promise.reject(new Error(`unexpected request to ${url}`));
    });
  });
  afterEach(() => fetchMock.mockRestore());

  it('lists tasks with a settled difficulty, rated for a training set', async () => {
    expect(await service.trainingProblems()).toEqual([
      {
        contestId: 'abc300',
        index: 'A',
        name: 'Task A',
        // -1147 is squeezed to a small positive number first, as AtCoder Problems shows it
        difficulty: 8,
        rating: 800,
        url: 'https://atcoder.jp/contests/abc300/tasks/abc300_a',
      },
      {
        contestId: 'abc300',
        index: 'B',
        name: 'Task B',
        difficulty: 900,
        rating: 1400,
        url: 'https://atcoder.jp/contests/abc300/tasks/abc300_b',
      },
    ]);
  });

  it('reads the history once, then only what is new, and not too often', async () => {
    submissions = [
      submission(1, 'abc300_a', 'WA', 100),
      submission(2, 'abc300_a', 'AC', 200),
    ];
    const t0 = 1_000_000;
    expect(await service.submissionsOf('Someone', t0)).toEqual([
      {
        creationTimeSeconds: 100,
        verdict: 'WRONG_ANSWER',
        problem: { contestId: 'abc300', index: 'A' },
      },
      {
        creationTimeSeconds: 200,
        verdict: 'OK',
        problem: { contestId: 'abc300', index: 'A' },
      },
    ]);
    expect(asked).toEqual(['?user=someone&from_second=0']);

    // inside the gap: answered from memory
    submissions = [submission(3, 'abc300_b', 'WJ', 300)];
    expect(await service.submissionsOf('someone', t0 + 5_000)).toHaveLength(2);
    expect(asked).toHaveLength(1);

    // after it: asked from the last known second, without repeating that one
    submissions = [
      submission(2, 'abc300_a', 'AC', 200),
      submission(3, 'abc300_b', 'WJ', 300),
    ];
    const later = await service.submissionsOf('someone', t0 + 20_000);
    expect(asked[1]).toBe('?user=someone&from_second=200');
    expect(later.map((s) => s.verdict)).toEqual([
      'WRONG_ANSWER',
      'OK',
      'TESTING',
    ]);
  });

  it('keeps what it knows when AtCoder Problems stops answering', async () => {
    submissions = [submission(1, 'abc300_a', 'AC', 100)];
    await service.submissionsOf('someone', 0);
    submissions = new Error('connection reset');
    expect(await service.submissionsOf('someone', 60_000)).toHaveLength(1);
    // with nothing known there is nothing to fall back on
    await expect(service.submissionsOf('nobody', 60_000)).rejects.toThrow(
      'Unable to reach AtCoder Problems',
    );
  });
});
