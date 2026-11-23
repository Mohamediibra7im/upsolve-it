import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AdminService } from '../admin/admin.service';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/schemas/user.schema';
import { UserStatsService } from '../user-stats/user-stats.service';
import { PublicProfileController } from './public-profile.controller';
import { PublicProfileService } from './public-profile.service';

// Stored users carry everything the public endpoint must never return.
const storedUser = (handle: string, publicProfile: boolean) => ({
  _id: new Types.ObjectId('65a000000000000000000001'), // created 2024-01
  codeforcesHandle: handle,
  avatar: 'https://userpic.codeforces.org/1/avatar/a.jpg',
  rating: 1342,
  maxRating: 1398,
  rank: 'pupil',
  maxRank: 'specialist',
  organization: 'HNU',
  publicProfile,
  displayName: 'Mona Adel',
  bio: 'Training for ICPC.',
  // stored before the links existed in full: the rest come back empty
  links: { github: 'octo-cat', website: 'https://your-site.com' },
  glyphAvatar: 'v1:xzl4n0g:mlda8xw:horizon',
  password: 'hashed-password',
  role: 'admin',
  reminderEmail: 'private@example.com',
  reminderEmailVerified: true,
  verificationCode: 'secret-code',
  authVersion: 7,
});

const optedIn = storedUser('Open_User', true);
const optedOut = storedUser('closed_user', false);

describe('public profile endpoints', () => {
  let app: INestApplication;
  const updateOne = jest.fn().mockResolvedValue({});
  const getUserFromAuthHeader = jest.fn();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PublicProfileController],
      providers: [
        PublicProfileService,
        {
          provide: getModelToken(User.name),
          useValue: {
            // Answers the way Mongo would for the service's filter.
            findOne: (filter: {
              codeforcesHandle: RegExp;
              publicProfile: boolean;
            }) => {
              const found =
                [optedIn, optedOut].find(
                  (u) =>
                    filter.codeforcesHandle.test(u.codeforcesHandle) &&
                    u.publicProfile === filter.publicProfile,
                ) ?? null;
              const query = { select: () => query, lean: () => found };
              return query;
            },
            updateOne,
          },
        },
        {
          provide: AdminService,
          useValue: {
            userStats: jest.fn().mockResolvedValue({
              user: { codeforcesHandle: 'Open_User', maxRank: 'specialist' },
              stats: {
                totalSessions: 58,
                totalProblems: 500,
                solvedProblems: 412,
                upsolvedCount: 46,
                upsolvedSolvedCount: 37,
                averagePerformance: 1410,
              },
              trainings: [{ id: 'session-id', performance: 1410 }],
            }),
          },
        },
        {
          provide: UserStatsService,
          useValue: {
            getPublicActivity: jest.fn().mockResolvedValue({
              currentStreak: 6,
              longestStreak: 21,
              activity: { '2026-11-20': 3 },
            }),
          },
        },
        { provide: AuthService, useValue: { getUserFromAuthHeader } },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('answers unknown, opted-out and malformed handles with the same 404', async () => {
    const server = app.getHttpServer() as App;
    const unknown = await request(server).get('/public-profile/nobody_here');
    const closed = await request(server).get('/public-profile/closed_user');
    const malformed = await request(server).get('/public-profile/a$b');

    expect(unknown.status).toBe(404);
    expect(closed.status).toBe(404);
    expect(malformed.status).toBe(404);
    expect(closed.body).toEqual(unknown.body);
    expect(malformed.body).toEqual(unknown.body);
  });

  it('returns only the allowed fields for an opted-in handle, without auth and in any case', async () => {
    const res = await request(app.getHttpServer() as App)
      .get('/public-profile/open_user')
      .expect(200);

    expect(res.body).toEqual({
      handle: 'Open_User',
      avatar: optedIn.avatar,
      displayName: 'Mona Adel',
      bio: 'Training for ICPC.',
      links: {
        github: 'octo-cat',
        linkedin: '',
        x: '',
        website: 'https://your-site.com',
        atcoder: '',
        leetcode: '',
        codechef: '',
      },
      glyphAvatar: 'v1:xzl4n0g:mlda8xw:horizon',
      rating: 1342,
      maxRating: 1398,
      rank: 'pupil',
      organization: 'HNU',
      joined: '2024-01',
      stats: {
        sessions: 58,
        solved: 412,
        upsolved: 37,
        upsolveTotal: 46,
        waiting: 9,
        currentStreak: 6,
        longestStreak: 21,
      },
      activity: { '2026-11-20': 3 },
    });

    const raw = JSON.stringify(res.body);
    for (const forbidden of [
      String(optedIn._id),
      'hashed-password',
      'admin',
      'private@example.com',
      'secret-code',
      'session-id',
      '_id',
      'role',
      'trainings',
      'reminder',
    ]) {
      expect(raw).not.toContain(forbidden);
    }
  });

  it('requires auth for the setting and changes only the caller', async () => {
    const server = app.getHttpServer() as App;

    getUserFromAuthHeader.mockResolvedValue(null);
    await request(server)
      .put('/public-profile')
      .send({ publicProfile: true })
      .expect(401);
    await request(server).get('/public-profile').expect(401);
    expect(updateOne).not.toHaveBeenCalled();

    getUserFromAuthHeader.mockResolvedValue(optedOut);
    await request(server)
      .get('/public-profile')
      .expect(200, { publicProfile: false });
    await request(server)
      .put('/public-profile')
      .send({ publicProfile: 'yes' })
      .expect(400);
    await request(server)
      .put('/public-profile')
      .send({ publicProfile: true })
      .expect(200, { publicProfile: true });
    expect(updateOne).toHaveBeenCalledTimes(1);
    expect(updateOne).toHaveBeenCalledWith(
      { _id: String(optedOut._id) },
      { $set: { publicProfile: true } },
    );
  });
});

describe('UserStatsService.getPublicActivity', () => {
  const now = Date.UTC(2026, 10, 23, 12);
  const day = 86_400_000;
  const lean = <T>(data: T) => {
    const query = { select: () => query, lean: () => Promise.resolve(data) };
    return query;
  };

  it('counts solves per UTC day and drops streaks that have lapsed', async () => {
    const save = jest.fn();
    const service = new UserStatsService(
      {
        findOne: () =>
          lean({
            trainingStreak: 6,
            lastTrainingActivityDate: '2026-11-22',
            upsolveStreak: 9,
            lastUpsolveActivityDate: '2026-11-01',
            bestTrainingStreak: 12,
            bestUpsolveStreak: 21,
            save,
          }),
      } as never,
      {
        find: () =>
          lean([
            {
              endTime: now - day,
              problems: [
                { isSolved: true, solvedAt: now - day },
                { isSolved: true, solvedAt: null, solvedTime: null },
                { isSolved: false, solvedAt: null, solvedTime: null },
              ],
            },
          ]),
      } as never,
      { find: () => lean([{ solvedTime: now }, { solvedTime: now }]) } as never,
    );

    await expect(
      service.getPublicActivity(String(optedIn._id), now),
    ).resolves.toEqual({
      currentStreak: 6,
      longestStreak: 21,
      activity: { '2026-11-22': 2, '2026-11-23': 2 },
    });
    expect(save).not.toHaveBeenCalled();
  });
});
