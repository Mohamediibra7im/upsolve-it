import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { TransactionsService } from '../../common/database/transactions.module';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuthService } from './auth.service';
import { GLYPH_AVATAR_PATTERN } from './dto/update-profile.dto';
import { ProfileController } from './profile.controller';
import { PasswordResetChallenge } from './schemas/password-reset-challenge.schema';
import { RefreshToken } from './schemas/refresh-token.schema';
import { User } from './schemas/user.schema';

const caller = {
  _id: '65a000000000000000000001',
  codeforcesHandle: 'Open_User',
  avatar: 'https://userpic.codeforces.org/1/avatar/a.jpg',
  rating: 1342,
  rank: 'pupil',
  maxRating: 1398,
  maxRank: 'specialist',
  role: 'user',
  isVerified: true,
  publicProfile: true,
  password: 'hashed-password',
  authVersion: 7,
};

const noLinks = {
  github: '',
  linkedin: '',
  x: '',
  website: '',
  atcoder: '',
  leetcode: '',
  codechef: '',
};

describe('PATCH /users/me/profile', () => {
  let app: INestApplication;
  let auth: AuthService;
  // Answers the way Mongo would: the stored user with $set applied.
  const findByIdAndUpdate = jest.fn(
    (_id: string, update: { $set: Record<string, string> }) => {
      const user: Record<string, unknown> = { ...caller, links: {} };
      for (const [path, value] of Object.entries(update.$set)) {
        const [key, sub] = path.split('.');
        if (sub) (user[key] as Record<string, string>)[sub] = value;
        else user[key] = value;
      }
      return Promise.resolve(user);
    },
  );
  const patch = (body: unknown) =>
    request(app.getHttpServer() as App)
      .patch('/users/me/profile')
      .send(body as object);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: { findByIdAndUpdate } },
        { provide: getModelToken(RefreshToken.name), useValue: {} },
        { provide: getModelToken(PasswordResetChallenge.name), useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: AuditLogsService, useValue: {} },
        { provide: TransactionsService, useValue: {} },
        { provide: ConfigService, useValue: { get: () => 'test-secret' } },
      ],
    }).compile();
    auth = moduleRef.get(AuthService);
    app = moduleRef.createNestApplication();
    // The same options configureHttpApplication sets for the real server.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    findByIdAndUpdate.mockClear();
    jest
      .spyOn(auth, 'getUserFromAuthHeader')
      .mockResolvedValue(caller as never);
  });

  afterAll(async () => {
    await app.close();
  });

  it('requires auth', async () => {
    jest.spyOn(auth, 'getUserFromAuthHeader').mockResolvedValue(null);
    await patch({ displayName: 'Someone' }).expect(401);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it.each([
    ['a javascript: website', { links: { website: 'javascript:alert(1)' } }],
    ['an http: website', { links: { website: 'http://your-site.com' } }],
    [
      'a data: website',
      { links: { website: 'data:text/html,<script>alert(1)</script>' } },
    ],
    [
      'a website with credentials',
      { links: { website: 'https://user:pass@your-site.com' } },
    ],
    [
      'a website with a line break in it',
      { links: { website: 'https://your-site.com/\njavascript:alert(1)' } },
    ],
    [
      'an overlong website',
      { links: { website: `https://your-site.com/${'a'.repeat(200)}` } },
    ],
    [
      'a URL in a username field',
      { links: { github: 'https://github.com/octocat' } },
    ],
    ['a path in a username field', { links: { linkedin: 'in/someone' } }],
    ['markup in a username field', { links: { x: '<b>me</b>' } }],
    ['an unknown platform', { links: { myspace: 'someone' } }],
    ['links that are not an object', { links: ['octocat'] }],
    ['a value that is not a string', { links: { github: { $ne: '' } } }],
    ['null instead of a string', { bio: null }],
    ['an overlong bio', { bio: 'a'.repeat(281) }],
    ['a control character in the bio', { bio: 'hello\u0007' }],
    ['an overlong name', { displayName: 'a'.repeat(61) }],
    ['a line break in the name', { displayName: 'First\nLast' }],
    ['a bidi override in the name', { displayName: 'abc‮def' }],
    ['an unknown field', { displayName: 'Someone', role: 'admin' }],
    ['markup in glyphAvatar', { glyphAvatar: 'v1:<svg onload=alert(1)>' }],
    ['an encoded seed in glyphAvatar', { glyphAvatar: 'v1:%3Csvg%3E' }],
    ['a glyphAvatar that is not a picker value', { glyphAvatar: 'tourist' }],
    ['an overlong glyphAvatar', { glyphAvatar: `v1:${'a'.repeat(33)}` }],
  ])('rejects %s and stores nothing', async (_name, body) => {
    await patch(body).expect(400);
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('trims and stores valid input for the caller, and returns the user as login does', async () => {
    const res = await patch({
      displayName: '  Mona Adel ',
      bio: '  Training for ICPC.\r\nUpsolving every round.  ',
      links: {
        github: ' octo-cat ',
        linkedin: 'mona-adel-1a2b3c',
        website: ' https://your-site.com/about ',
      },
      glyphAvatar: 'v1:xzl4n0g:mlda8xw:horizon',
    }).expect(200);

    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      caller._id,
      {
        $set: {
          displayName: 'Mona Adel',
          bio: 'Training for ICPC.\nUpsolving every round.',
          glyphAvatar: 'v1:xzl4n0g:mlda8xw:horizon',
          'links.github': 'octo-cat',
          'links.linkedin': 'mona-adel-1a2b3c',
          'links.website': 'https://your-site.com/about',
        },
      },
      { returnDocument: 'after' },
    );
    expect(res.body).toEqual({
      user: {
        _id: caller._id,
        codeforcesHandle: 'Open_User',
        rating: 1342,
        avatar: caller.avatar,
        rank: 'pupil',
        maxRating: 1398,
        maxRank: 'specialist',
        role: 'user',
        isVerified: true,
        publicProfile: true,
        displayName: 'Mona Adel',
        bio: 'Training for ICPC.\nUpsolving every round.',
        links: {
          ...noLinks,
          github: 'octo-cat',
          linkedin: 'mona-adel-1a2b3c',
          website: 'https://your-site.com/about',
        },
        glyphAvatar: 'v1:xzl4n0g:mlda8xw:horizon',
      },
    });
  });

  it('clears a field sent as an empty string and leaves the rest alone', async () => {
    const res = await patch({
      bio: '   ',
      links: { github: '', website: '' },
      glyphAvatar: '',
    }).expect(200);

    expect(findByIdAndUpdate.mock.calls[0][1]).toEqual({
      $set: {
        bio: '',
        glyphAvatar: '',
        'links.github': '',
        'links.website': '',
      },
    });
    expect(res.body.user).toMatchObject({
      displayName: '',
      bio: '',
      links: noLinks,
      glyphAvatar: '',
    });
  });

  // Every shape glyph-avatar 0.1.0's stringifySpec can produce.
  it.each([
    'v1:Open_User',
    'v1:k3j2h1a-3.-12',
    'v1:xzl4n0g:mlda8xw',
    'v1:xzl4n0g:mlda8xw:horizon',
    'v1:xzl4n0g::ring',
    'v1:xzl4n0g:::c',
    'v1:k3j2h1a-0.1:k3j2h1a-0.1:polka:c',
  ])('accepts the picker value %s', (value) => {
    expect(GLYPH_AVATAR_PATTERN.test(value)).toBe(true);
  });
});
