import { parseProblemUrl } from './problem-url';

describe('parseProblemUrl', () => {
  it('reads both Codeforces link forms', () => {
    const expected = {
      judge: 'codeforces',
      contestId: 1986,
      index: 'D',
      url: 'https://codeforces.com/problemset/problem/1986/D',
    };
    for (const link of [
      'https://codeforces.com/contest/1986/problem/D',
      'https://codeforces.com/problemset/problem/1986/D',
      ' codeforces.com/contest/1986/problem/d/ ',
      'https://m.codeforces.com/contest/1986/problem/D?locale=en',
    ])
      expect(parseProblemUrl(link)).toEqual(expected);
    expect(
      parseProblemUrl('https://codeforces.com/contest/1942/problem/C2'),
    ).toMatchObject({ contestId: 1942, index: 'C2' });
  });

  it('reads an AtCoder task link', () => {
    expect(
      parseProblemUrl('https://atcoder.jp/contests/ABC300/tasks/abc300_a'),
    ).toEqual({
      judge: 'atcoder',
      contestId: 'abc300',
      index: 'A',
      url: 'https://atcoder.jp/contests/abc300/tasks/abc300_a',
    });
  });

  it('names gym links apart from links it does not know', () => {
    for (const gym of [
      'https://codeforces.com/gym/104114/problem/A',
      'https://codeforces.com/problemset/gymProblem/104114/A',
      'https://codeforces.com/contest/104114/problem/A',
    ])
      expect(parseProblemUrl(gym)).toEqual({ error: 'gym' });
    for (const other of [
      '',
      'not a link',
      'https://codeforces.com/contest/1986',
      'https://codeforces.com/blog/entry/130762',
      'https://evil.example/contest/1986/problem/D',
      'https://leetcode.com/problems/two-sum',
    ])
      expect(parseProblemUrl(other)).toEqual({ error: 'unknown' });
  });
});
