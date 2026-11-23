import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { UpsolveModule } from '../src/modules/upsolve/upsolve.module';
import { UpsolveService } from '../src/modules/upsolve/upsolve.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpsolveNoteDto } from '../src/modules/upsolve/dto/upsolve-problem.dto';

jest.setTimeout(120_000);

describe('upsolve queue against a real database', () => {
  let mongo: MongoMemoryReplSet;
  let db: Connection;
  let upsolve: UpsolveService;
  const problem = (contestId: number | string, index: string) => ({
    contestId,
    index,
    name: `Problem ${contestId}${index}`,
    rating: 1400,
    tags: ['dp'],
    url: `https://example.com/${contestId}/${index}`,
  });
  const newUser = () => new Types.ObjectId().toString();

  beforeAll(async () => {
    mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          ignoreEnvVars: true,
          isGlobal: true,
          load: [
            () => ({
              NODE_ENV: 'test',
              JWT_SECRET: 'test-access-secret-at-least-32-characters',
              JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-characters',
            }),
          ],
        }),
        MongooseModule.forRoot(mongo.getUri('upsolve_test')),
        UpsolveModule,
      ],
    }).compile();
    db = module.get(getConnectionToken());
    upsolve = module.get(UpsolveService);
    await db.model('UpsolvedProblem').init();
    await db.model('DismissedUpsolve').init();
  });
  afterAll(async () => {
    await db?.close();
    await mongo?.stop();
  });

  it('adopts records from before problems carried a judge', async () => {
    const user = new Types.ObjectId();
    const raw = db.model('UpsolvedProblem').collection;
    await raw.insertOne({ user, ...problem(1996, 'D'), solvedTime: null });
    await raw.createIndex(
      { user: 1, contestId: 1, index: 1 },
      { unique: true },
    );

    await upsolve.onModuleInit();
    await upsolve.onModuleInit(); // a second start changes nothing

    const [legacy] = await upsolve.list(String(user));
    expect(legacy.judge).toBe('codeforces');
    const indexes = (await raw.indexes()).map((i) => i.name);
    expect(indexes).not.toContain('user_1_contestId_1_index_1');
    expect(indexes).toContain('user_1_judge_1_contestId_1_index_1');

    // The old record is the same problem a new request names, not a second one.
    await upsolve.insertMany(String(user), [problem(1996, 'D')]);
    expect(await upsolve.list(String(user))).toHaveLength(1);
  });

  it('keeps a note with its problem, for its owner only', async () => {
    const [owner, stranger] = [newUser(), newUser()];
    const ref = { contestId: 1986, index: 'D' };
    const noteOf = async (user: string) => (await upsolve.list(user))[0]?.note;
    await upsolve.insertMany(owner, [problem(1986, 'D')]);
    await upsolve.insertMany(stranger, [problem(1986, 'D')]);

    await upsolve.setNote(owner, ref, '  zero times anything is zero  ');
    expect(await noteOf(owner)).toBe('zero times anything is zero');
    expect(await noteOf(stranger)).toBe('');

    await upsolve.setNote(owner, ref, 'try every split');
    await upsolve.insertMany(owner, [problem(1986, 'D')]); // what a sync does
    expect(await noteOf(owner)).toBe('try every split');

    await upsolve.setNote(owner, ref, '');
    expect(await noteOf(owner)).toBe('');

    // Someone without the problem cannot write a note onto it.
    await expect(upsolve.setNote(newUser(), ref, 'not mine')).rejects.toThrow(
      'not in your upsolve list',
    );

    await upsolve.setNote(owner, ref, 'gone with the problem');
    await upsolve.deleteOne(owner, ref);
    await upsolve.insertMany(owner, [problem(1986, 'D')]);
    expect(await noteOf(owner)).toBe('');
  });

  it('refuses a note longer than 2,000 characters', async () => {
    const check = (note: string) =>
      validate(
        plainToInstance(UpsolveNoteDto, { contestId: 1, index: 'A', note }),
      );
    expect(await check('a'.repeat(2000))).toHaveLength(0);
    const [error] = await check('a'.repeat(2001));
    expect(Object.values(error.constraints!)[0]).toContain('2000 characters');
  });

  it('adds the problem a pasted link points to, with details it looked up', async () => {
    const user = newUser();
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({
        status: 'OK',
        result: {
          problems: [
            {
              contestId: 1986,
              index: 'D',
              name: 'Mathematical Problem',
              rating: 1400,
              tags: ['dp'],
            },
            { contestId: 1986, index: 'A', name: 'X Axis', tags: [] },
          ],
        },
      }),
    } as Response);

    const added = await upsolve.addByUrl(
      user,
      'codeforces.com/contest/1986/problem/D',
    );
    expect(added).toMatchObject({
      judge: 'codeforces',
      contestId: 1986,
      index: 'D',
      name: 'Mathematical Problem',
      rating: 1400,
      tags: ['dp'],
      url: 'https://codeforces.com/problemset/problem/1986/D',
      source: 'manual',
    });
    await expect(
      upsolve.addByUrl(
        user,
        'https://codeforces.com/problemset/problem/1986/D',
      ),
    ).rejects.toThrow('already in your upsolve list');
    expect(await upsolve.list(user)).toHaveLength(1);

    // no rating on Codeforces: still added, as unrated
    expect(
      await upsolve.addByUrl(
        user,
        'https://codeforces.com/contest/1986/problem/A',
      ),
    ).toMatchObject({ name: 'X Axis', rating: 0 });
    // not in the problemset: added without its details
    expect(
      await upsolve.addByUrl(
        user,
        'https://codeforces.com/contest/2019/problem/C',
      ),
    ).toMatchObject({ name: 'Problem 2019C', rating: 0, tags: [] });

    // a dismissed problem comes back, and is no longer dismissed
    await upsolve.deleteOne(user, { contestId: 1986, index: 'D' });
    expect(await upsolve.listDismissed(user)).toHaveLength(1);
    await upsolve.addByUrl(
      user,
      'https://codeforces.com/contest/1986/problem/D',
    );
    expect(await upsolve.listDismissed(user)).toHaveLength(0);
    expect(await upsolve.list(user)).toHaveLength(3);

    await expect(
      upsolve.addByUrl(user, 'https://codeforces.com/gym/104114/problem/A'),
    ).rejects.toThrow('Gym problems cannot be added');
    await expect(
      upsolve.addByUrl(user, 'https://leetcode.com/problems/two-sum'),
    ).rejects.toThrow('not a link to a Codeforces or AtCoder problem');
    fetchMock.mockRestore();
  });

  it('brings a solved problem back after 7 days and again after 30', async () => {
    const user = newUser();
    const ref = { contestId: 1991, index: 'C' };
    const DAY = 86_400_000;
    const t0 = Date.UTC(2026, 0, 1);
    const state = async () => {
      const [p] = await upsolve.list(user);
      return [p.resolveStage, p.resolveDueAt?.getTime() ?? null];
    };
    const syncWith = async (acceptedAt: number[], now: number) => {
      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
        json: async () => ({
          status: 'OK',
          result: acceptedAt.map((at) => ({
            creationTimeSeconds: at / 1000,
            verdict: 'OK',
            problem: { ...ref, name: 'Absolute Zero' },
            author: { participantType: 'PRACTICE' },
          })),
        }),
      } as Response);
      const clock = jest.spyOn(Date, 'now').mockReturnValue(now);
      try {
        return await upsolve.syncFromCodeforces(user, 'someone');
      } finally {
        clock.mockRestore();
        fetchMock.mockRestore();
      }
    };
    await upsolve.insertMany(user, [problem(1991, 'C')]);
    expect(await state()).toEqual([0, null]);

    await upsolve.bulkUpdateSolvedTime(user, [{ ...ref, solvedTime: t0 }], t0);
    expect(await state()).toEqual([1, t0 + 7 * DAY]);
    expect(await upsolve.countResolvesDue(user, t0 + 6 * DAY)).toBe(0);
    expect(await upsolve.countResolvesDue(user, t0 + 8 * DAY)).toBe(1);
    // marking it solved again does not restart the schedule
    await upsolve.bulkUpdateSolvedTime(
      user,
      [{ ...ref, solvedTime: t0 + DAY }],
      t0 + DAY,
    );
    expect(await state()).toEqual([1, t0 + 7 * DAY]);

    // the old accepted submission does not pass the re-solve; a new one does
    expect((await syncWith([t0], t0 + 8 * DAY)).resolved).toBe(0);
    expect((await syncWith([t0, t0 + 8 * DAY], t0 + 9 * DAY)).resolved).toBe(1);
    expect(await state()).toEqual([2, t0 + 38 * DAY]);

    // 30 days later: passing the last one ends the schedule
    expect(
      (await syncWith([t0, t0 + 8 * DAY, t0 + 40 * DAY], t0 + 41 * DAY))
        .resolved,
    ).toBe(1);
    expect(await state()).toEqual([0, null]);
    await expect(upsolve.skipResolve(user, ref)).rejects.toThrow(
      'no re-solve waiting',
    );
  });

  it('ends the schedule when a re-solve is skipped', async () => {
    const user = newUser();
    const ref = { contestId: 2000, index: 'E' };
    await upsolve.insertMany(user, [problem(2000, 'E')]);
    await upsolve.bulkUpdateSolvedTime(
      user,
      [{ ...ref, solvedTime: 1000 }],
      1000,
    );
    await upsolve.skipResolve(user, ref);
    const [p] = await upsolve.list(user);
    expect([p.resolveStage, p.resolveDueAt, p.solvedTime]).toEqual([
      0,
      null,
      1000,
    ]);
  });

  describe('AtCoder', () => {
    const now = Math.floor(Date.now() / 1000);
    const start = now - 5 * 86_400; // abc300 ran five days ago, for 100 minutes
    const task = (letter: string) => ({
      id: `abc300_${letter}`,
      contest_id: 'abc300',
      problem_index: letter.toUpperCase(),
      name: `Task ${letter.toUpperCase()}`,
    });
    const submission = (letter: string, result: string, at: number) => ({
      epoch_second: at,
      problem_id: `abc300_${letter}`,
      contest_id: 'abc300',
      result,
    });
    let submissions: ReturnType<typeof submission>[] | Error = [];
    let fetchMock: jest.SpyInstance;

    beforeEach(() => {
      // The answers of Codeforces and AtCoder Problems, as recorded shapes.
      fetchMock = jest.spyOn(global, 'fetch').mockImplementation((input) => {
        const url = String(input);
        const answer = (body: unknown) =>
          Promise.resolve({ ok: true, json: async () => body } as Response);
        if (url.includes('user.status'))
          return answer({ status: 'OK', result: [] });
        if (url.includes('problemset.problems'))
          return answer({ status: 'OK', result: { problems: [] } });
        if (url.endsWith('contests.json'))
          return answer([
            { id: 'abc300', start_epoch_second: start, duration_second: 6000 },
          ]);
        if (url.endsWith('problems.json'))
          return answer(['a', 'b', 'c', 'd', 'e'].map(task));
        if (url.includes('/user/submissions'))
          return submissions instanceof Error
            ? Promise.reject(submissions)
            : answer(submissions);
        return Promise.reject(new Error(`unexpected request to ${url}`));
      });
    });
    afterEach(() => fetchMock.mockRestore());

    it('imports contest failures, marks them solved and respects dismissals', async () => {
      const user = newUser();
      const handles = { codeforces: 'someone', atcoder: 'someone_ac' };
      const inContest = start + 600;
      submissions = [
        submission('a', 'AC', inContest),
        submission('b', 'WA', inContest),
        submission('e', 'TLE', inContest),
        submission('c', 'WA', now - 86_400), // practice after the contest
        submission('d', 'WA', inContest),
        submission('d', 'AC', now - 86_400), // failed, then solved since
        submission('a', 'WJ', inContest), // not judged yet: not an attempt
      ];

      expect(await upsolve.syncAll(user, handles)).toEqual({
        added: 2,
        solved: 0,
        resolved: 0,
        atcoderSkipped: false,
      });
      const added = await upsolve.list(user);
      expect(
        added.map((p) => `${p.judge}:${p.contestId}${p.index}`).sort(),
      ).toEqual(['atcoder:abc300B', 'atcoder:abc300E']);
      expect(added.find((p) => p.index === 'B')).toMatchObject({
        name: 'Task B',
        rating: 0,
        url: 'https://atcoder.jp/contests/abc300/tasks/abc300_b',
        solvedTime: null,
      });

      submissions = [...submissions, submission('b', 'AC', now - 3600)];
      expect(await upsolve.syncAll(user, handles)).toMatchObject({
        added: 0,
        solved: 1,
      });

      await upsolve.deleteOne(user, {
        judge: 'atcoder',
        contestId: 'abc300',
        index: 'E',
      });
      expect((await upsolve.syncAll(user, handles)).added).toBe(0);
      expect((await upsolve.list(user)).map((p) => p.index)).toEqual(['B']);

      // an AtCoder link can be pasted too
      expect(
        await upsolve.addByUrl(
          user,
          'https://atcoder.jp/contests/abc300/tasks/abc300_c',
        ),
      ).toMatchObject({
        judge: 'atcoder',
        contestId: 'abc300',
        index: 'C',
        name: 'Task C',
      });
    });

    it('still finishes the Codeforces sync when AtCoder cannot be reached', async () => {
      submissions = new Error('connection reset');
      expect(
        await upsolve.syncAll(newUser(), {
          codeforces: 'someone',
          atcoder: 'someone_ac',
        }),
      ).toEqual({ added: 0, solved: 0, resolved: 0, atcoderSkipped: true });
    });

    it('asks AtCoder nothing for a user without an AtCoder handle', async () => {
      const result = await upsolve.syncAll(newUser(), {
        codeforces: 'someone',
      });
      expect(result.atcoderSkipped).toBe(false);
      expect(
        fetchMock.mock.calls.some(([url]) => String(url).includes('kenkoooo')),
      ).toBe(false);
    });
  });

  it('keeps two judges apart even when they share an identifier', async () => {
    const user = newUser();
    await upsolve.insertMany(user, [
      problem(300, 'A'),
      { judge: 'atcoder' as const, ...problem('300', 'A') },
      { judge: 'atcoder' as const, ...problem('abc300', 'A') },
      problem(300, 'A'), // a repeat is not a second record
    ]);
    const list = await upsolve.list(user);
    expect(list.map((p) => `${p.judge}:${p.contestId}${p.index}`)).toEqual([
      'codeforces:300A',
      'atcoder:300A',
      'atcoder:abc300A',
    ]);

    await upsolve.deleteOne(user, { contestId: 300, index: 'A' });
    expect(await upsolve.list(user)).toHaveLength(2);
    expect(await upsolve.listDismissed(user)).toEqual([
      { judge: 'codeforces', contestId: 300, index: 'A' },
    ]);
  });
});
