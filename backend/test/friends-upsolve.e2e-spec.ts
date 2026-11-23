import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { FriendsModule } from '../src/modules/friends/friends.module';
import { FriendsService } from '../src/modules/friends/friends.service';
import { toUtcDayKey } from '../src/modules/trainings/utils/date-key';

jest.setTimeout(120_000);

describe("friends' upsolve numbers", () => {
  let mongo: MongoMemoryReplSet;
  let db: Connection;
  let friends: FriendsService;
  const DAY = 86_400_000;

  const user = async (codeforcesHandle: string) =>
    String(
      (
        await db
          .model('User')
          .create({ codeforcesHandle, password: 'x', avatar: 'a' })
      )._id,
    );
  const owes = (
    userId: string,
    contestId: number,
    index: string,
    extra: Record<string, unknown> = {},
  ) =>
    db.model('UpsolvedProblem').create({
      user: userId,
      contestId,
      index,
      name: `P${contestId}${index}`,
      rating: 1400,
      tags: [],
      url: 'u',
      note: 'a private note',
      ...extra,
    });
  const befriend = (a: string, b: string) =>
    db
      .model('Friendship')
      .create(
        a < b
          ? { userLower: a, userHigher: b }
          : { userLower: b, userHigher: a },
      );

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
        MongooseModule.forRoot(mongo.getUri('friends_test')),
        FriendsModule,
      ],
    }).compile();
    db = module.get(getConnectionToken());
    friends = module.get(FriendsService);
  });
  afterAll(async () => {
    await db?.close();
    await mongo?.stop();
  });

  it('shows waiting, oldest and streak for friends, and shared problems to friends only', async () => {
    const [me, noor, ziad, stranger] = await Promise.all(
      ['me', 'noor_k', 'ziad_hx', 'stranger'].map(user),
    );
    await befriend(me, noor);
    await befriend(me, ziad);
    const old = new Date(Date.now() - 12 * DAY);
    await owes(me, 1986, 'D');
    await owes(me, 1996, 'E');
    await owes(me, 2000, 'A', { solvedTime: 5 });
    await owes(noor, 1986, 'D', { createdAt: old });
    await owes(noor, 1996, 'E', { solvedTime: 5 }); // noor solved it: not shared
    await owes(noor, 2008, 'F');
    await owes(stranger, 1986, 'D');
    await db.model('UserStats').create([
      {
        user: noor,
        upsolveStreak: 9,
        lastUpsolveActivityDate: toUtcDayKey(Date.now()),
      },
      // a streak that ended days ago counts as none
      {
        user: ziad,
        upsolveStreak: 4,
        lastUpsolveActivityDate: toUtcDayKey(Date.now() - 5 * DAY),
      },
    ]);

    const { friends: list, me: mine } = await friends.listFriends(me);
    const byHandle = Object.fromEntries(
      list.map((f: any) => [f.codeforcesHandle, f.upsolve]),
    );
    expect(mine).toMatchObject({ waiting: 2, streak: 0 });
    expect(byHandle.noor_k).toEqual({ waiting: 2, oldestAt: old, streak: 9 });
    // nothing waiting reads as nothing, not as an error
    expect(byHandle.ziad_hx).toEqual({ waiting: 0, oldestAt: null, streak: 0 });
    expect(JSON.stringify(list)).not.toContain('private note');
    expect(Object.keys(byHandle)).not.toContain('stranger');

    const shared = await friends.sharedUpsolves(me, noor);
    expect(shared.problems).toEqual([
      expect.objectContaining({ contestId: 1986, index: 'D', name: 'P1986D' }),
    ]);
    expect(JSON.stringify(shared)).not.toContain('private note');
    expect((await friends.sharedUpsolves(me, ziad)).problems).toEqual([]);

    for (const notAFriend of [stranger, 'not-an-id'])
      await expect(friends.sharedUpsolves(me, notAFriend)).rejects.toThrow(
        'only see shared problems with friends',
      );
  });
});
