import { planUpsolveSync, type CfSubmission } from './contest-sync';

const NOW = Date.UTC(2026, 10, 23);
const daysAgo = (d: number) => Math.floor(NOW / 1000) - d * 86400;
const sub = (
  contestId: number,
  index: string,
  verdict: string,
  participantType: string,
  when: number,
): CfSubmission => ({
  creationTimeSeconds: when,
  verdict,
  problem: { contestId, index, name: `P${contestId}${index}`, tags: ['dp'] },
  author: { participantType },
});

describe('planUpsolveSync', () => {
  it('imports contest attempts that were never solved, once each', () => {
    const { toAdd } = planUpsolveSync(
      [
        sub(2000, 'C', 'WRONG_ANSWER', 'CONTESTANT', daysAgo(3)),
        sub(2000, 'C', 'TIME_LIMIT_EXCEEDED', 'CONTESTANT', daysAgo(3)),
        sub(2000, 'A', 'OK', 'CONTESTANT', daysAgo(3)),
        sub(2001, 'B', 'WRONG_ANSWER', 'VIRTUAL', daysAgo(10)),
      ],
      [],
      [],
      NOW,
    );
    expect(toAdd.map((p) => `${p.contestId}${p.index}`)).toEqual([
      '2000C',
      '2001B',
    ]);
    expect(toAdd[0]).toMatchObject({
      rating: 0,
      tags: ['dp'],
      solvedTime: null,
      url: 'https://codeforces.com/problemset/problem/2000/C',
    });
  });

  it('skips practice, gym, old, upsolved-later, tracked and dismissed problems', () => {
    const { toAdd } = planUpsolveSync(
      [
        sub(2000, 'A', 'WRONG_ANSWER', 'PRACTICE', daysAgo(1)),
        sub(104000, 'A', 'WRONG_ANSWER', 'CONTESTANT', daysAgo(1)),
        sub(1500, 'A', 'WRONG_ANSWER', 'CONTESTANT', daysAgo(200)),
        sub(2000, 'B', 'WRONG_ANSWER', 'CONTESTANT', daysAgo(5)),
        sub(2000, 'B', 'OK', 'PRACTICE', daysAgo(4)),
        sub(2000, 'D', 'WRONG_ANSWER', 'CONTESTANT', daysAgo(5)),
        sub(2000, 'E', 'WRONG_ANSWER', 'CONTESTANT', daysAgo(5)),
      ],
      [{ contestId: 2000, index: 'D', solvedTime: null }],
      [{ contestId: 2000, index: 'E' }],
      NOW,
    );
    expect(toAdd).toEqual([]);
  });

  it('marks tracked problems solved at their first accepted submission', () => {
    const { solved } = planUpsolveSync(
      [
        sub(1900, 'C', 'OK', 'PRACTICE', daysAgo(1)),
        sub(1900, 'C', 'OK', 'PRACTICE', daysAgo(2)),
        sub(1900, 'D', 'OK', 'PRACTICE', daysAgo(2)),
      ],
      [
        { contestId: 1900, index: 'C', solvedTime: null },
        { contestId: 1900, index: 'D', solvedTime: 123 },
        { contestId: 1900, index: 'E', solvedTime: null },
      ],
      [],
      NOW,
    );
    expect(solved).toEqual([
      { contestId: 1900, index: 'C', solvedTime: daysAgo(2) * 1000 },
    ]);
  });
});
