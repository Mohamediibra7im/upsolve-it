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
