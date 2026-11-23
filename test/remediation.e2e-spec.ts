import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Connection, Types } from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { AuthModule } from '../src/modules/auth/auth.module';
import { AuthService } from '../src/modules/auth/auth.service';
import { TrainingsModule } from '../src/modules/trainings/trainings.module';
import { TrainingSessionsService } from '../src/modules/trainings/training-sessions.service';
import { UserStatsService } from '../src/modules/user-stats/user-stats.service';
import { AdminService } from '../src/modules/admin/admin.service';
import { APP_GUARD } from '@nestjs/core';
import { RateLimiterGuard } from '../src/common/guards/rate-limiter.guard';
import { configureHttpApplication } from '../src/common/http/configure-http';
import { ConfigService } from '@nestjs/config';
import * as codeforces from '../src/common/utils/codeforces-api';
import { FriendsModule } from '../src/modules/friends/friends.module';
import {
  inspectReferences,
  normalizeReferences,
} from '../src/common/database/reference-repair';

jest.setTimeout(120_000);

describe('backend regression contracts (disposable replica set)', () => {
  let mongo: MongoMemoryReplSet;
  let app: INestApplication;
  let db: Connection;
  let user: any;
  let token: string;
  let hash: string;
  let ip = 0;
  const model = (name: string) => db.model(name);
  const uid = () => String(user._id);
  const post = (path: string, body: object = {}) =>
    request(app.getHttpServer())
      .post(`/api/${path}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Forwarded-For', `192.0.2.${++ip}`)
      .send(body);
  const problem = {
    problemId: '4_A',
    contestId: 4,
    index: 'A',
    name: 'Watermelon',
    rating: 800,
    tags: [],
    url: 'https://codeforces.com/problemset/problem/4/A',
  };
  const training = () => ({
    startTime: Date.now() - 60_000,
    endTime: Date.now(),
    problems: [{ ...problem }],
  });
  async function resetProof() {
    const started = await post('auth/initiate-reset', {
      handle: user.codeforcesHandle,
    }).expect(201);
    expect(started.body.code).toMatch(/^[a-f0-9]{32}$/);
    expect(
      (await model('PasswordResetChallenge').findOne())?.toObject(),
    ).toMatchObject({ userId: user._id, authVersion: 0, consumedAt: null });
    jest
      .spyOn(codeforces, 'fetchCodeforcesUserInfo')
      .mockResolvedValue([
        { handle: user.codeforcesHandle, firstName: started.body.code },
      ] as any);
    const proof = await post('auth/verify-reset-profile', {
      verificationToken: started.body.verificationToken,
    });
    expect({ status: proof.status, error: proof.body.message }).toEqual({
      status: 201,
      error: undefined,
    });
    return { started: started.body, resetToken: proof.body.resetToken };
  }

  beforeAll(async () => {
    mongo = await MongoMemoryReplSet.create({
      replSet: { count: 1 },
      instanceOpts: [{ dbName: 'upsolve_test' }],
    });
    const uri = mongo.getUri('upsolve_test');
    if (
      !/^mongodb:\/\/127\.0\.0\.1:/.test(uri) ||
      !uri.includes('/upsolve_test')
    )
      throw new Error('Refusing non-disposable test database');
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
              MONGODB_URI: uri,
              MONGODB_URI_DEV: uri,
              MONGODB_URI_PROD: uri,
            }),
          ],
        }),
        MongooseModule.forRoot(uri),
        AuthModule,
        TrainingsModule,
        FriendsModule,
      ],
      providers: [{ provide: APP_GUARD, useClass: RateLimiterGuard }],
    }).compile();
    app = module.createNestApplication();
    configureHttpApplication(app, app.get(ConfigService));
    app.useLogger(false);
    db = app.get(getConnectionToken());
    await Promise.all(Object.values(db.models).map((m) => m.init()));
    await app.init();
    hash = await bcrypt.hash('OriginalP@ss1', 10);
  });
  afterAll(async () => {
    await app?.close();
    await mongo?.stop();
  });
  beforeEach(async () => {
    jest.restoreAllMocks();
    for (const collection of Object.values(db.collections))
      await collection.deleteMany({});
    user = await model('User').create({
      codeforcesHandle: 'tourist',
      password: hash,
      avatar: 'https://example.com/a.png',
      rating: 1500,
    });
    token = await app
      .get(JwtService)
      .signAsync({ userId: uid(), type: 'access', authVersion: 0 });
  });

  it('issues unique profile challenges instead of trusting public submissions', async () => {
    const a = await post('auth/initiate-reset', { handle: 'TOURIST' }).expect(
      201,
    );
    const b = await post('auth/initiate-reset', { handle: 'tourist' }).expect(
      201,
    );
    expect(a.body.code).toMatch(/^[a-f0-9]{32}$/);
    expect(b.body.code).not.toBe(a.body.code);
    expect(new Date(a.body.expiresAt).getTime()).toBeGreaterThan(
      Date.now() + 590_000,
    );
    const old = await app
      .get(JwtService)
      .signAsync(
        { userId: uid(), type: 'verify' },
        { secret: 'test-refresh-secret-at-least-32-characters' },
      );
    await post('auth/verify-submission', { verificationToken: old }).expect(
      410,
    );
  });

  it('rejects a JSON refresh cookie and still clears it during logout', async () => {
    const cookie = 'refreshToken=j:%7B%22unexpected%22%3Atrue%7D';
    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', cookie)
      .set('X-Forwarded-For', `198.51.100.${++ip}`)
      .expect(401);
    const logout = await request(app.getHttpServer())
      .post('/api/auth/logout')
      .set('Cookie', cookie)
      .set('X-Forwarded-For', `198.51.100.${++ip}`)
      .expect(201);
    expect(
      logout.headers['set-cookie'].some((value: string) =>
        value.startsWith('refreshToken=;'),
      ),
    ).toBe(true);
  });

  it('reports the configured quota consistently before and after consuming requests', async () => {
    const clientIp = `198.51.100.${++ip}`;
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await request(app.getHttpServer())
        .post('/api/friends/requests')
        .set('X-Forwarded-For', clientIp)
        .send({});
      expect(response.headers['x-ratelimit-limit']).toBe('10');
      expect(response.headers['x-ratelimit-remaining']).toBe(
        String(9 - attempt),
      );
    }
  });

  it('rejects a profile code from a different challenge', async () => {
    const a = await post('auth/initiate-reset', { handle: 'tourist' }).expect(
      201,
    );
    const b = await post('auth/initiate-reset', { handle: 'tourist' }).expect(
      201,
    );
    jest
      .spyOn(codeforces, 'fetchCodeforcesUserInfo')
      .mockResolvedValue([
        { handle: 'tourist', firstName: b.body.code },
      ] as any);
    await post('auth/verify-reset-profile', {
      verificationToken: a.body.verificationToken,
    }).expect(400);
    expect((await model('User').findById(user._id))?.isVerified).toBe(false);
  });

  it('consumes a recovery proof once and invalidates previously issued sessions', async () => {
    const { resetToken } = await resetProof();
    const responses = await Promise.all([
      post('auth/reset-password', {
        resetToken,
        newPassword: 'ReplacementP@ss2',
      }),
      post('auth/reset-password', {
        resetToken,
        newPassword: 'ReplacementP@ss2',
      }),
    ]);
    expect(responses.map((r) => r.status).sort()).toEqual([201, 400]);
    const saved = await model('User').findById(user._id);
    expect(await bcrypt.compare('ReplacementP@ss2', saved!.password)).toBe(
      true,
    );
    expect(
      await app.get(AuthService).getUserFromAuthHeader(`Bearer ${token}`),
    ).toBeNull();
    await post('auth/reset-pin', {
      resetToken,
      newPassword: 'ReplacementP@ss2',
    }).expect(404);
  });

  it('rejects expired database challenges and legacy reset tokens', async () => {
    const { started, resetToken } = await resetProof();
    await db
      .collection('password_reset_challenges')
      .updateMany(
        {},
        { $set: { expiresAt: new Date(0), resetExpiresAt: new Date(0) } },
      );
    await post('auth/verify-reset-profile', {
      verificationToken: started.verificationToken,
    }).expect(400);
    await post('auth/reset-password', {
      resetToken,
      newPassword: 'ReplacementP@ss2',
    }).expect(400);
    const old = await app
      .get(JwtService)
      .signAsync(
        { userId: uid(), type: 'reset' },
        { secret: 'test-refresh-secret-at-least-32-characters' },
      );
    await post('auth/reset-password', {
      resetToken: old,
      newPassword: 'ReplacementP@ss2',
    }).expect(400);
  });

  it('supports current-password changes on the password endpoint and rejects ambiguous input', async () => {
    await post('auth/reset-password', {
      oldPassword: 'OriginalP@ss1',
      newPassword: 'ReplacementP@ss2',
      resetToken: 'ambiguous',
    }).expect(400);
    await post('auth/reset-password', {
      oldPassword: 'OriginalP@ss1',
      newPassword: 'ReplacementP@ss2',
    }).expect(201);
    expect(
      await app.get(AuthService).getUserFromAuthHeader(`Bearer ${token}`),
    ).toBeNull();
  });

  it('blocks locked sessions and refresh, including after an unlock', async () => {
    const login = await app
      .get(AuthService)
      .login('tourist', 'OriginalP@ss1', `lock-${++ip}`);
    await app.get(AdminService).lockUser(uid(), uid());
    expect(
      await app.get(AuthService).getUserFromAuthHeader(`Bearer ${login.token}`),
    ).toBeNull();
    await expect(
      app
        .get(AuthService)
        .refresh(login.refreshToken, `locked-${++ip}`, 'test'),
    ).rejects.toThrow();
    await app.get(AdminService).unlockUser(uid(), uid());
    expect(
      await app.get(AuthService).getUserFromAuthHeader(`Bearer ${login.token}`),
    ).toBeNull();
  });

  it('rotates refresh tokens once under concurrent requests without revoking the winner', async () => {
    const auth = app.get(AuthService);
    const login = await auth.login(
      'tourist',
      'OriginalP@ss1',
      `rotate-${++ip}`,
    );
    const results = await Promise.allSettled([
      auth.refresh(login.refreshToken, `r1-${++ip}`, 'test'),
      auth.refresh(login.refreshToken, `r2-${++ip}`, 'test'),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const winner = results.find(
      (r) => r.status === 'fulfilled',
    ) as PromiseFulfilledResult<any>;
    expect(
      (await auth.refresh(winner.value.refreshToken, `r3-${++ip}`, 'test'))
        .token,
    ).toBeTruthy();
  });

  it('keeps version-zero legacy sessions usable until explicitly revoked', async () => {
    const legacy = await app.get(JwtService).signAsync({ userId: uid() });
    expect(
      String(
        (await app.get(AuthService).getUserFromAuthHeader(`Bearer ${legacy}`))
          ?._id,
      ),
    ).toBe(uid());
  });

  it('does not revive a legacy session when an account locked before this release is unlocked', async () => {
    await model('User').collection.updateOne(
      { _id: user._id },
      { $set: { locked: true }, $unset: { authVersion: '' } },
    );
    const legacy = await app.get(JwtService).signAsync({ userId: uid() });
    await app.get(AdminService).unlockUser(uid(), uid());
    expect(
      await app.get(AuthService).getUserFromAuthHeader(`Bearer ${legacy}`),
    ).toBeNull();
  });

  it('cannot revoke a fresh login by replaying a token invalidated by a password change', async () => {
    const auth = app.get(AuthService);
    const old = await auth.login('tourist', 'OriginalP@ss1', `old-${++ip}`);
    await auth.resetPassword(uid(), {
      oldPassword: 'OriginalP@ss1',
      newPassword: 'ReplacementP@ss2',
    });
    await model('RefreshToken').updateMany(
      { userId: user._id, revoked: true },
      { $set: { revokedAt: new Date(Date.now() - 61_000) } },
    );
    const fresh = await auth.login(
      'tourist',
      'ReplacementP@ss2',
      `new-${++ip}`,
    );
    await expect(
      auth.refresh(old.refreshToken, `replay-${++ip}`, 'test'),
    ).rejects.toThrow();
    expect(
      (await auth.refresh(fresh.refreshToken, `fresh-${++ip}`, 'test')).token,
    ).toBeTruthy();
  });

  it('preserves synced solved subdocuments when ending without updates', async () => {
    const created = await post('training-sessions', training()).expect(201);
    const id = created.body.sessionId;
    await post(`training-sessions/${id}/sync`, {
      problemUpdates: { '4_A': { isSolved: true, solvedAt: Date.now() } },
    }).expect(201);
    const ended = await post(`training-sessions/${id}/end`).expect(201);
    expect(ended.body.session.solvedCount).toBe(1);
    expect(ended.body.session.problems[0].isSolved).toBe(true);
    expect(await model('UpsolvedProblem').countDocuments()).toBe(0);
  });

  it('saves legacy training payloads with server-derived performance', async () => {
    const saved = await post('trainings', {
      ...training(),
      performance: 99999,
      solvedCount: 99,
    }).expect(201);
    expect(saved.body.training.performance).toBe(1500);
    expect(saved.body.training.solvedCount).toBe(0);
    await post('trainings', training()).expect(201);
  });

  it('accepts cached clients sending derived sync fields while calculating them on the server', async () => {
    const created = await post('training-sessions', training()).expect(201);
    const result = await post(
      `training-sessions/${created.body.sessionId}/end`,
      {
        problemUpdates: {
          '4_A': {
            isSolved: true,
            solvedAt: Date.now(),
            expectedTimeSeconds: 1,
            speedStatus: 'slow',
          },
        },
      },
    ).expect(201);
    expect(result.body.session.problems[0].expectedTimeSeconds).toBe(600);
    expect(result.body.session.problems[0].speedStatus).toBe('fast');
  });

  it('finishes duplicate queue entries and repeated/concurrent ends exactly once', async () => {
    const existing = await model('UpsolvedProblem').create({
      ...problem,
      user: user._id,
      solvedTime: 12345,
    });
    const created = await post('training-sessions', training()).expect(201);
    const url = `training-sessions/${created.body.sessionId}/end`;
    const responses = await Promise.all([post(url), post(url)]);
    expect(responses.map((r) => r.status)).toEqual([201, 201]);
    expect(
      (await model('UpsolvedProblem').find().lean()).map((p) => ({
        user: String(p.user),
        contestId: p.contestId,
        index: p.index,
      })),
    ).toEqual([{ user: uid(), contestId: 4, index: 'A' }]);
    expect(
      (await model('UpsolvedProblem').findById(existing._id))!.solvedTime,
    ).toBe(12345);
    const again = await post(url, { endTime: 1 }).expect(201);
    expect(again.body.session.endTime).toBe(responses[0].body.session.endTime);
  });

  it('rolls completion and queue writes back when statistics cannot be saved', async () => {
    const created = await post('training-sessions', training()).expect(201);
    jest
      .spyOn(app.get(UserStatsService), 'recordTrainingCompleted')
      .mockRejectedValue(new Error('database unavailable'));
    await expect(
      app
        .get(TrainingSessionsService)
        .endSession(uid(), created.body.sessionId, {}),
    ).rejects.toThrow('database unavailable');
    expect(
      (await model('Training').findById(created.body.sessionId))!.status,
    ).toBe('active');
    expect(await model('UpsolvedProblem').countDocuments()).toBe(0);
  });

  it('queues unsolved legacy saves atomically with their training history', async () => {
    await post('trainings', training()).expect(201);
    expect(
      await model('UpsolvedProblem').countDocuments({ user: user._id }),
    ).toBe(1);
  });

  it('reports legacy string references without modifying historical records', async () => {
    await model('Training').collection.insertOne({
      user: uid(),
      ...training(),
      performance: 1500,
    } as any);
    const report = await inspectReferences(db);
    expect(report).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collection: model('Training').collection.name,
          field: 'user',
          convertible: 1,
        }),
      ]),
    );
    expect(
      await model('Training').collection.countDocuments({ user: uid() } as any),
    ).toBe(1);
  });

  it('normalizes valid historical references so the owner can still read the training', async () => {
    await model('Training').collection.insertOne({
      user: uid(),
      ...training(),
      performance: 1500,
    } as any);
    await normalizeReferences(db);
    const response = await request(app.getHttpServer())
      .get('/api/trainings')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body).toHaveLength(1);
    expect(
      await model('Training').collection.countDocuments({ user: user._id }),
    ).toBe(1);
    await normalizeReferences(db);
    expect(await model('Training').countDocuments()).toBe(1);
  });

  it('refuses historical reference conversion when it would collide with an existing unique record', async () => {
    await model('UpsolvedProblem').collection.insertMany([
      { ...problem, user: uid() },
      { ...problem, user: user._id },
    ] as any);
    await expect(normalizeReferences(db)).rejects.toThrow(/collision/i);
    expect(await model('UpsolvedProblem').countDocuments()).toBe(2);
  });

  it('leaves historical records unchanged if the pre-migration backup cannot be saved', async () => {
    await model('Training').collection.insertOne({
      user: uid(),
      ...training(),
      performance: 1500,
    } as any);
    await expect(
      (normalizeReferences as any)(db, () => {
        throw new Error('backup failed');
      }),
    ).rejects.toThrow('backup failed');
    expect(
      await model('Training').collection.countDocuments({ user: uid() } as any),
    ).toBe(1);
  });
});
