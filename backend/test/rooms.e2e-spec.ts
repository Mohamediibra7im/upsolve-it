import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import request from 'supertest';
import { configureHttpApplication } from '../src/common/http/configure-http';
import { RoomsModule } from '../src/modules/rooms/rooms.module';

jest.setTimeout(120_000);

const problem = (contestId: number, index: string, extra = {}) => ({
  contestId,
  index,
  name: `P${contestId}${index}`,
  rating: 1200,
  url: `https://codeforces.com/contest/${contestId}/problem/${index}`,
  ...extra,
});
const SET = {
  trainingMode: 'ladder',
  level: '12',
  durationMinutes: 60,
  showRatings: false,
  customRatings: { P1: 1200, P2: 1400 },
  // one names its own id, the others get `${contestId}_${index}`
  problems: [
    problem(1986, 'A'),
    problem(1986, 'B'),
    problem(7, 'C', { problemId: 'own-id' }),
  ],
};

// The real module, guard and validation on a real database. Only the clock
// is moved, to get past the start and the end.
describe('rooms: a timed set done together', () => {
  let mongo: MongoMemoryReplSet;
  let app: INestApplication;
  let db: Connection;
  let tokens: string[];
  let signIn: () => Promise<void>;
  let ahead = 0;
  const realNow = Date.now.bind(Date);

  const as = (who: number) => {
    const call = (method: 'get' | 'post') => (path: string, body?: object) =>
      request(app.getHttpServer())
        [method](`/api/rooms${path}`)
        .set('Authorization', `Bearer ${tokens[who]}`)
        .send(body);
    return { get: call('get'), post: call('post') };
  };
  const names = (view: { members: { name: string }[] }) =>
    view.members.map((m) => m.name);

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
        MongooseModule.forRoot(mongo.getUri('rooms_test')),
        RoomsModule,
      ],
    }).compile();
    app = module.createNestApplication();
    configureHttpApplication(app, app.get(ConfigService));
    await app.init();
    db = app.get(getConnectionToken());
    await db.model('Room').init();

    // u0 has a display name, u1 a username, the rest only a handle
    const users = await db.model('User').create(
      Array.from({ length: 10 }, (_, i) => ({
        codeforcesHandle: `cf${i}`,
        ...(i === 0 ? { displayName: 'Host Hana' } : {}),
        ...(i === 1 ? { username: 'omar' } : {}),
        password: 'x',
        rating: 1000 + i,
        avatar: `https://userpic.codeforces.org/${i}.jpg`,
      })),
    );
    const jwt = app.get(JwtService, { strict: false });
    signIn = async () => {
      tokens = await Promise.all(
        users.map((u) =>
          jwt.signAsync({ userId: String(u._id), type: 'access' }),
        ),
      );
    };
    await signIn();
    jest.spyOn(Date, 'now').mockImplementation(() => realNow() + ahead);
  });
  afterAll(async () => {
    jest.restoreAllMocks();
    await app?.close();
    await mongo?.stop();
  });

  let code: string;

  it('refuses a visitor, a bad set and an unknown room', async () => {
    await request(app.getHttpServer()).post('/api/rooms').send(SET).expect(401);
    const bad = (change: object) =>
      as(0)
        .post('', { ...SET, ...change })
        .expect(400);
    await bad({ problems: [] });
    await bad({ problems: Array.from({ length: 11 }, () => SET.problems[0]) });
    await bad({ durationMinutes: 601 });
    await bad({ trainingMode: 'duel' });
    await bad({ status: 'running' });
    // two problems with one id, an id that cannot be a key, a link that is not https
    await bad({ problems: [problem(1, 'A'), problem(1, 'A')] });
    await bad({ problems: [problem(1, 'A', { problemId: 'a.b' })] });
    await bad({
      problems: [{ ...problem(1, 'A'), url: 'javascript:alert(1)' }],
    });

    const missing = await as(0).get('/abcd1234').expect(404);
    expect(missing.body.message).toBe('Room not found');
    await as(0).get('/NOT-A-CODE').expect(404);
    await as(0).post('/abcd1234/join').expect(404);
  });

  it('creates a room and keeps the set secret in the lobby and from outsiders', async () => {
    const created = await as(0).post('', SET).expect(201);
    code = created.body.code;
    expect(code).toMatch(/^[a-z0-9]{8}$/);
    expect(created.body).toEqual({ code });

    const joined = await as(1).post(`/${code}/join`).expect(200);
    expect(joined.body).toMatchObject({
      code,
      status: 'lobby',
      isHost: false,
      isMember: true,
      hostName: 'Host Hana',
      trainingMode: 'ladder',
      level: '12',
      durationMinutes: 60,
      showRatings: false,
      problemCount: 3,
      startTime: null,
      endTime: null,
    });
    expect(Math.abs(joined.body.serverNow - Date.now())).toBeLessThan(5000);
    // joining twice changes nothing
    await as(1).post(`/${code}/join`).expect(200);
    const lobby = (await as(2).post(`/${code}/join`).expect(200)).body;
    expect(names(lobby)).toEqual(['Host Hana', 'omar', 'cf2']);
    expect(lobby.members[0]).toEqual({
      id: expect.stringMatching(/^[a-f0-9]{24}$/),
      name: 'Host Hana',
      codeforcesHandle: 'cf0',
      avatar: 'https://userpic.codeforces.org/0.jpg',
      glyphAvatar: '',
      rating: 1000,
      isHost: true,
      solved: [],
      tried: [],
      solvedAt: {},
      leftAt: null,
    });

    for (const who of [0, 1, 9]) {
      const seen = (await as(who).get(`/${code}`).expect(200)).body;
      expect(seen).not.toHaveProperty('problems');
      expect(seen).not.toHaveProperty('customRatings');
      expect(seen.isMember).toBe(who !== 9);
      expect(seen.isHost).toBe(who === 0);
    }
    // nothing is reported before the start
    await as(1)
      .post(`/${code}/progress`, { solved: ['1986_A'], tried: [] })
      .expect(409);
  });

  it('lets only the host start, ten seconds ahead, and then shows members the set', async () => {
    const refused = await as(1).post(`/${code}/start`).expect(403);
    expect(refused.body.message).toBe('Only the host can start the room.');

    const before = Date.now();
    const started = (await as(0).post(`/${code}/start`).expect(200)).body;
    expect(started.status).toBe('running');
    expect(started.startTime).toBeGreaterThanOrEqual(before + 10_000);
    expect(started.startTime).toBeLessThanOrEqual(Date.now() + 10_000);
    expect(started.endTime).toBe(started.startTime + 60 * 60_000);
    expect(started.problems).toEqual(SET.problems);
    expect(started.customRatings).toEqual(SET.customRatings);

    const member = (await as(1).get(`/${code}`).expect(200)).body;
    expect(member.problems).toHaveLength(3);
    const outsider = (await as(9).get(`/${code}`).expect(200)).body;
    expect(outsider.status).toBe('running');
    expect(outsider).not.toHaveProperty('problems');
    expect(outsider).not.toHaveProperty('customRatings');

    const again = await as(0).post(`/${code}/start`).expect(409);
    expect(again.body.message).toBe('This room has already started.');
    const late = await as(9).post(`/${code}/join`).expect(409);
    expect(late.body.message).toBe('This room has already started.');
    // a member asking to join again is simply shown the room
    await as(1).post(`/${code}/join`).expect(200);
  });

  it('keeps only the room’s ids, never forgets a solve, and orders the standings', async () => {
    const report = (who: number, solved: string[], tried: string[] = []) =>
      as(who).post(`/${code}/progress`, { solved, tried }).expect(200);
    const standings = async () => (await as(9).get(`/${code}`)).body.members;

    await as(9)
      .post(`/${code}/progress`, { solved: ['1986_A'], tried: [] })
      .expect(403);
    await as(1)
      .post(`/${code}/progress`, { solved: ['x'.repeat(65)], tried: [] })
      .expect(400);
    await as(1)
      .post(`/${code}/progress`, { solved: ['1986_A'] })
      .expect(400);

    const t1 = Date.now();
    expect(
      (await report(1, ['1986_A', '1986_A', 'nope'], ['1986_B', 'zzz'])).body,
    ).toEqual({ ok: true });
    let [first, second, third] = await standings();
    expect(first).toMatchObject({
      name: 'omar',
      solved: ['1986_A'],
      tried: ['1986_B'],
    });
    expect(Object.keys(first.solvedAt)).toEqual(['1986_A']);
    expect(first.solvedAt['1986_A']).toBeGreaterThanOrEqual(t1);
    expect(first.solvedAt['1986_A']).toBeLessThanOrEqual(Date.now());
    // nobody else has solved anything: they stay in the order they joined
    expect([second.name, third.name]).toEqual(['Host Hana', 'cf2']);
    const seenAt = first.solvedAt['1986_A'];

    // a later report without it takes nothing away, and the time stays
    ahead += 60_000;
    await report(1, [], []);
    [first] = await standings();
    expect(first).toMatchObject({
      name: 'omar',
      solved: ['1986_A'],
      tried: [],
    });
    expect(first.solvedAt).toEqual({ '1986_A': seenAt });

    // more solved goes first
    await report(0, ['1986_B', 'own-id']);
    expect((await standings()).map((m: any) => m.name)).toEqual([
      'Host Hana',
      'omar',
      'cf2',
    ]);

    // level on count: the one whose last solve came earlier goes first,
    // though cf2 joined after omar
    await report(2, ['1986_A', '1986_B']);
    ahead += 60_000;
    await report(1, ['1986_A', 'own-id']);
    [first, second, third] = await standings();
    expect([first.name, second.name, third.name]).toEqual([
      'Host Hana',
      'cf2',
      'omar',
    ]);
    expect(first.solved.sort()).toEqual(['1986_B', 'own-id']);
    expect(third.solved.sort()).toEqual(['1986_A', 'own-id']);
    expect(third.solvedAt['own-id']).toBeGreaterThan(second.solvedAt['1986_B']);
    expect(third.solvedAt['1986_A']).toBe(seenAt);

    // leaving after the start changes nothing
    expect((await as(2).post(`/${code}/leave`).expect(200)).body).toEqual({
      ok: true,
    });
    expect(await standings()).toHaveLength(3);
  });

  it('ends when the time is up: the standings stay, reports stop', async () => {
    ahead += 61 * 60_000;
    // the 15-minute sign-in has run out with the clock, so sign in again
    await signIn();

    const ended = (await as(1).get(`/${code}`).expect(200)).body;
    expect(ended.status).toBe('ended');
    expect(ended.serverNow).toBeGreaterThan(ended.endTime);
    expect(ended.problems).toHaveLength(3);
    expect(names(ended)).toEqual(['Host Hana', 'cf2', 'omar']);
    expect((await as(9).get(`/${code}`)).body).not.toHaveProperty('problems');

    const late = await as(1)
      .post(`/${code}/progress`, { solved: ['1986_B'], tried: [] })
      .expect(409);
    expect(late.body.message).toBe('This room is not running.');
    expect((await as(9).get(`/${code}`)).body.members[2].solved.sort()).toEqual(
      ['1986_A', 'own-id'],
    );
  });

  it('holds eight people, and closes when the host leaves the lobby', async () => {
    const full = (await as(0).post('', SET).expect(201)).body.code;
    expect(full).not.toBe(code);
    // seven more arrive at once
    await Promise.all(
      [1, 2, 3, 4, 5, 6, 7].map((who) =>
        as(who).post(`/${full}/join`).expect(200),
      ),
    );
    const ninth = await as(8).post(`/${full}/join`).expect(409);
    expect(ninth.body.message).toBe('This room is full.');
    expect((await as(8).get(`/${full}`)).body.members).toHaveLength(8);

    // a guest leaving frees the seat
    await as(3).post(`/${full}/leave`).expect(200);
    const seated = (await as(8).post(`/${full}/join`).expect(200)).body;
    expect(seated.members).toHaveLength(8);
    expect(names(seated)).not.toContain('cf3');
    expect(seated.status).toBe('lobby');

    await as(0).post(`/${full}/leave`).expect(200);
    const closed = (await as(1).get(`/${full}`).expect(200)).body;
    expect(closed.status).toBe('closed');
    expect(closed).not.toHaveProperty('problems');
    const refused = await as(3).post(`/${full}/join`).expect(409);
    expect(refused.body.message).toBe('This room is closed.');
    await as(0).post(`/${full}/start`).expect(409);
  });

  it('ends early only by a vote that everyone still in the room agrees to', async () => {
    const room = (await as(0).post('', SET).expect(201)).body.code;
    await as(1).post(`/${room}/join`).expect(200);
    await as(2).post(`/${room}/join`).expect(200);
    const vote = (who: number, agree: unknown = true) =>
      as(who).post(`/${room}/end-vote`, { agree });
    const read = async (who: number) => (await as(who).get(`/${room}`)).body;

    // not in the lobby, and not in the ten seconds before the clock runs
    await vote(0).expect(409);
    await as(0).post(`/${room}/start`).expect(200);
    expect((await vote(0).expect(409)).body.message).toBe(
      'This room is not running.',
    );
    ahead += 11_000;
    await vote(9).expect(403);
    await vote(0, 'yes').expect(400);

    // one voice is not enough
    const called = (await vote(0).expect(200)).body;
    const hostId = called.members.find((m: any) => m.isHost).id;
    expect(called.status).toBe('running');
    expect(called.endVote).toMatchObject({
      by: hostId,
      byName: 'Host Hana',
      yes: [hostId],
      needed: 3,
    });
    expect(called.endVote.endsAt - called.serverNow).toBeGreaterThan(55_000);
    expect(called.endVote.endsAt - called.serverNow).toBeLessThanOrEqual(
      60_000,
    );
    // the others see it and have no wait of their own; an outsider sees none
    const seen = await read(1);
    expect(seen.endVote.byName).toBe('Host Hana');
    expect(seen.voteAgainAt).toBeNull();
    expect((await read(9)).endVote).toBeNull();

    // one "keep going" stops it, and the caller then waits five minutes
    const kept = (await vote(2, false).expect(200)).body;
    expect(kept).toMatchObject({ status: 'running', endVote: null });
    expect((await vote(0).expect(409)).body.message).toBe(
      'You can call another vote in 5 min.',
    );
    expect((await read(0)).voteAgainAt).toBeGreaterThan(Date.now());

    // a vote nobody answers runs out
    expect((await vote(1).expect(200)).body.endVote.byName).toBe('omar');
    ahead += 61_000;
    expect(await read(1)).toMatchObject({ status: 'running', endVote: null });

    // whoever leaves stays in the standings with the line they had, and
    // counts in no vote
    const report = (who: number, solved: string[]) =>
      as(who).post(`/${room}/progress`, { solved, tried: [] }).expect(200);
    await report(2, ['1986_A']);
    await as(2).post(`/${room}/leave`).expect(200);
    await report(2, ['1986_A', '1986_B']);
    const gone = (await read(0)).members.find((m: any) => m.name === 'cf2');
    expect(gone.leftAt).toEqual(expect.any(Number));
    expect(gone.solved).toEqual(['1986_A']);
    await vote(2).expect(409);

    // the two still there agree: it ends for everyone, at once
    ahead += 5 * 60_000;
    await signIn();
    const first = (await vote(0).expect(200)).body;
    expect(first.status).toBe('running');
    expect(first.endVote.needed).toBe(2);
    const passed = (await vote(1).expect(200)).body;
    expect(passed).toMatchObject({
      status: 'ended',
      endedBy: 'vote',
      endVote: null,
    });
    expect(passed.endTime).toBeLessThan(passed.serverNow);
    expect(await read(2)).toMatchObject({ status: 'ended', endedBy: 'vote' });
    await vote(0).expect(409);
  });

  it('ends by itself when everyone still in it has solved everything, or left', async () => {
    const all = ['1986_A', '1986_B', 'own-id'];
    const room = (await as(3).post('', SET).expect(201)).body.code;
    await as(4).post(`/${room}/join`).expect(200);
    await as(3).post(`/${room}/start`).expect(200);
    ahead += 11_000;
    const report = (who: number, solved: string[]) =>
      as(who).post(`/${room}/progress`, { solved, tried: [] }).expect(200);

    await report(3, all);
    await report(4, all.slice(0, 2));
    expect((await as(4).get(`/${room}`)).body).toMatchObject({
      status: 'running',
      endedBy: null,
    });
    await report(4, all);
    expect((await as(3).get(`/${room}`)).body).toMatchObject({
      status: 'ended',
      endedBy: 'solved',
    });

    // a room its last person walks out of has nobody to wait for
    const alone = (await as(5).post('', SET).expect(201)).body.code;
    await as(5).post(`/${alone}/start`).expect(200);
    ahead += 11_000;
    await as(5).post(`/${alone}/leave`).expect(200);
    expect((await as(5).get(`/${alone}`)).body).toMatchObject({
      status: 'ended',
      endedBy: 'left',
    });
  });

  it('stores a unique code and lets Mongo remove a room after 48 hours', async () => {
    const indexes = await db.model('Room').collection.indexes();
    expect(indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: { code: 1 }, unique: true }),
        expect.objectContaining({
          key: { createdAt: 1 },
          expireAfterSeconds: 48 * 60 * 60,
        }),
      ]),
    );
    const stored = await db.model('Room').findOne({ code }).lean<any>();
    expect(stored.createdAt).toBeInstanceOf(Date);
    expect(stored.status).toBe('running');
  });
});
