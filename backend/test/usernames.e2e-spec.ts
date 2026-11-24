import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import type { Model } from 'mongoose';
import { AuthService } from '../src/modules/auth/auth.service';
import { User, UserSchema } from '../src/modules/auth/schemas/user.schema';
import {
  RefreshToken,
  RefreshTokenSchema,
} from '../src/modules/auth/schemas/refresh-token.schema';
import {
  PasswordResetChallenge,
  PasswordResetChallengeSchema,
} from '../src/modules/auth/schemas/password-reset-challenge.schema';
import { AuditLogsService } from '../src/modules/audit-logs/audit-logs.service';
import { TransactionsService } from '../src/common/database/transactions.module';

jest.setTimeout(120_000);

/** What each AtCoder user has typed as their affiliation; a missing key is a missing user. */
const affiliations: Record<string, string> = { Mona_AC: '', rival_ac: '' };
jest.mock('../src/common/utils/read-page', () => ({
  readPage: jest.fn((url: string) => {
    const typed = /users\/([^?]+)/.exec(url)![1].toLowerCase();
    const handle = Object.keys(affiliations).find(
      (name) => name.toLowerCase() === typed,
    );
    return handle
      ? Promise.resolve(
          `<a href="/users/${handle}" class="username"><span>${handle}</span></a>
           <tr><th class="no-break">Affiliation</th><td class="break-all">${affiliations[handle]}</td></tr>`,
        )
      : Promise.reject(new Error('answered 404'));
  }),
}));

/** Accounts made before usernames existed must keep logging in as they did. */
describe('usernames for existing accounts', () => {
  let mongo: MongoMemoryServer;
  let auth: AuthService;
  let users: Model<User>;
  let close: () => Promise<void>;

  /** An account as the old code stored it: no username at all. */
  const oldAccount = async (codeforcesHandle: string) => ({
    codeforcesHandle,
    password: await bcrypt.hash('Old-pass-1!', 4),
    avatar: 'https://userpic.codeforces.org/no-avatar.jpg',
    authVersion: 0,
    locked: false,
  });

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    // Production as it is today: accounts without a username, and the first
    // index on codeforcesHandle, which has no room for an account without one.
    const client = await MongoClient.connect(mongo.getUri());
    const before = client.db().collection('users');
    await before.insertMany([
      await oldAccount('Tourist'),
      await oldAccount('Petr'),
    ]);
    await before.createIndex(
      { codeforcesHandle: 1 },
      { unique: true, collation: { locale: 'en', strength: 2 } },
    );
    await client.close();

    global.fetch = jest.fn((url: string) =>
      Promise.resolve({
        json: () =>
          Promise.resolve(
            url.includes('handles=nobody')
              ? { status: 'FAILED', comment: 'handles: User nobody not found' }
              : {
                  status: 'OK',
                  result: [
                    {
                      handle: decodeURIComponent(url.split('handles=')[1]),
                      rating: 1342,
                      rank: 'pupil',
                      maxRating: 1398,
                      maxRank: 'pupil',
                      avatar: 'https://userpic.codeforces.org/a.jpg',
                    },
                  ],
                },
          ),
      }),
    ) as unknown as typeof fetch;

    const module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongo.getUri()),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: RefreshToken.name, schema: RefreshTokenSchema },
          {
            name: PasswordResetChallenge.name,
            schema: PasswordResetChallengeSchema,
          },
        ]),
      ],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: new JwtService({
            secret: 'test-access-secret-at-least-32-characters',
          }),
        },
        { provide: AuditLogsService, useValue: { logAction: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'JWT_REFRESH_SECRET'
                ? 'test-refresh-secret-at-least-32-characters'
                : undefined,
          },
        },
        {
          provide: TransactionsService,
          useValue: { run: (work: () => Promise<unknown>) => work() },
        },
      ],
    }).compile();
    close = () => module.close();
    auth = module.get(AuthService);
    users = module.get(getModelToken(User.name));

    await users.init().catch(() => undefined);
    await auth.onModuleInit();
  });

  afterAll(async () => {
    await close();
    await mongo.stop();
  });

  it('copies each Codeforces handle into the username', async () => {
    const all = await users.find().sort({ codeforcesHandle: 1 }).lean();
    expect(all.map((u) => u.username)).toEqual(['Petr', 'Tourist']);
  });

  it('logs an existing account in with the same handle and password', async () => {
    const { user } = await auth.login('tourist', 'Old-pass-1!', '10.0.0.1');
    expect(user).toMatchObject({
      username: 'Tourist',
      codeforcesHandle: 'Tourist',
    });
  });

  it('still logs in an account the start-up pass has not reached', async () => {
    await users.collection.insertOne(await oldAccount('Late_User'));

    const { user } = await auth.login('late_user', 'Old-pass-1!', '10.0.0.2');
    expect(user.username).toBe('Late_User');
  });

  it('refuses a second account with the same username in another case', async () => {
    await expect(
      users.create({
        username: 'TOURIST',
        codeforcesHandle: 'someone_else',
        password: 'x',
        avatar: 'x',
      }),
    ).rejects.toMatchObject({ code: 11000 });
  });

  describe('a new account', () => {
    /** The code is only ever mailed; without a mailbox it goes to the log. */
    const codeFor = (username: string) => {
      const line = warn.mock.calls
        .map(([message]) => String(message))
        .reverse()
        .find((message) => message.startsWith(`Email code for ${username}:`));
      return line!.split(': ')[1];
    };
    let warn: jest.SpyInstance;
    let userId: string;

    beforeAll(() => {
      warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    });
    afterAll(() => warn.mockRestore());

    it('signs up with a username and email, and no Codeforces handle', async () => {
      const { user } = await auth.register(
        'mona_adel',
        ' Mona@Example.com ',
        'New-pass-1!',
        '10.0.1.1',
      );
      userId = String(user._id);
      expect(user).toMatchObject({
        username: 'mona_adel',
        email: 'mona@example.com',
        emailVerified: false,
      });
      expect(user.codeforcesHandle).toBeUndefined();
    });

    it('holds a second account with no handle: the old index is replaced', async () => {
      await auth.register(
        'second_one',
        'two@example.com',
        'New-pass-1!',
        '10.0.1.2',
      );
      const indexes = await users.collection.indexes();
      expect(
        indexes.find((index) => index.name === 'codeforcesHandle_1'),
      ).toMatchObject({
        unique: true,
        partialFilterExpression: expect.anything(),
      });
    });

    it('refuses a taken username, in any letter case', async () => {
      await expect(
        auth.register('TOURIST', 'x@example.com', 'New-pass-1!', '10.0.1.3'),
      ).rejects.toThrow('That username is taken.');
    });

    it('does not log in by email until the address is confirmed', async () => {
      await expect(
        auth.login('mona@example.com', 'New-pass-1!', '10.0.2.1'),
      ).rejects.toThrow('Invalid credentials');
    });

    it('refuses a wrong code, then confirms with the mailed one', async () => {
      await expect(auth.confirmEmail(userId, '000000')).rejects.toThrow(
        'That code is not right.',
      );
      const { user } = await auth.confirmEmail(userId, codeFor('mona_adel'));
      expect(user.emailVerified).toBe(true);

      const again = await auth.login(
        'MONA@example.com',
        'New-pass-1!',
        '10.0.2.2',
      );
      expect(again.user.username).toBe('mona_adel');
    });

    it('stops after five wrong codes', async () => {
      const { user } = await auth.register(
        'guesser',
        'g@example.com',
        'New-pass-1!',
        '10.0.1.4',
      );
      const id = String(user._id);
      for (let i = 0; i < 5; i++) {
        await expect(auth.confirmEmail(id, '111111')).rejects.toThrow(
          'That code is not right.',
        );
      }
      await expect(auth.confirmEmail(id, codeFor('guesser'))).rejects.toThrow(
        'That code has expired.',
      );
    });

    it('keeps a confirmed address for its account', async () => {
      await expect(
        auth.register('copycat', 'mona@example.com', 'New-pass-1!', '10.0.1.5'),
      ).rejects.toThrow('That email already has an account.');
    });

    it('connects a Codeforces handle, which can be corrected until it is proven', async () => {
      const me = (await users.findById(userId))!;
      await expect(auth.connectCodeforces(me, 'nobody')).rejects.toThrow(
        'Invalid Codeforces handle',
      );
      await auth.connectCodeforces(me, 'typo_handle');
      const { user } = await auth.connectCodeforces(
        (await users.findById(userId))!,
        'mona_cf',
      );
      expect(user).toMatchObject({
        codeforcesHandle: 'mona_cf',
        rating: 1342,
        rank: 'pupil',
        isVerified: false,
      });
    });

    it('lets two accounts type one handle, and only the first to prove it keep it', async () => {
      const rival = await auth.register(
        'rival',
        'rival@example.com',
        'New-pass-1!',
        '10.0.1.6',
      );
      const rivalId = String(rival.user._id);
      await auth.connectCodeforces((await users.findById(rivalId))!, 'mona_cf');

      // mona_cf's first name on Codeforces is whatever the test says it is
      const firstName = (name: string) =>
        (global.fetch as jest.Mock).mockImplementation(() =>
          Promise.resolve({
            json: () =>
              Promise.resolve({
                status: 'OK',
                result: [{ handle: 'mona_cf', firstName: name, rating: 1342 }],
              }),
          }),
        );

      const { code } = await auth.generateVerificationCode(userId);
      firstName(code);
      const mine = await auth.verifyCodeforcesProfile(userId);
      expect(mine.user).toMatchObject({ isVerified: true });

      const theirs = await auth.generateVerificationCode(rivalId);
      firstName(theirs.code);
      await expect(auth.verifyCodeforcesProfile(rivalId)).rejects.toThrow(
        'That Codeforces handle is verified on another account.',
      );
      await expect(
        auth.connectCodeforces((await users.findById(rivalId))!, 'MONA_CF'),
      ).rejects.toThrow('verified on another account');
    });

    it('proves an AtCoder handle by a code in its affiliation', async () => {
      const { user } = await auth.register(
        'atcoder_only',
        'ac@example.com',
        'New-pass-1!',
        '10.0.1.7',
      );
      const id = String(user._id);
      const me = async () => (await users.findById(id))!;

      await expect(
        auth.connectAtcoder(await me(), 'ghost_user'),
      ).rejects.toThrow('No AtCoder user has that handle.');
      const connected = await auth.connectAtcoder(await me(), 'mona_ac');
      expect(connected.user).toMatchObject({
        links: expect.objectContaining({ atcoder: 'Mona_AC' }),
        atcoderVerified: false,
      });

      const { code } = await auth.generateVerificationCode(id);
      await expect(auth.verifyAtcoderProfile(id)).rejects.toThrow(
        'Verification code not found in your AtCoder affiliation.',
      );
      affiliations.Mona_AC = code;
      const verified = await auth.verifyAtcoderProfile(id);
      expect(verified.user).toMatchObject({ atcoderVerified: true });
      expect(verified.user.codeforcesHandle).toBeUndefined();

      // Another handle typed into the profile form is unproven again.
      const edited = await auth.updateProfile(id, {
        links: { atcoder: 'rival_ac' },
      });
      expect(edited.user.atcoderVerified).toBe(false);
    });

    it('lets an older account add an email in Settings, and log in with it once confirmed', async () => {
      const petr = (await users.findOne({ username: 'Petr' }))!;
      const added = await auth.setEmail(petr, 'Petr@Example.com');
      expect(added.user).toMatchObject({
        email: 'petr@example.com',
        emailVerified: false,
      });
      await expect(
        auth.login('petr@example.com', 'Old-pass-1!', '10.0.4.1'),
      ).rejects.toThrow('Invalid credentials');

      const { user } = await auth.confirmEmail(
        String(petr._id),
        codeFor('Petr'),
      );
      expect(user.emailVerified).toBe(true);
      const byEmail = await auth.login(
        'petr@example.com',
        'Old-pass-1!',
        '10.0.4.2',
      );
      expect(byEmail.user.username).toBe('Petr');

      // a confirmed address is not swapped without the password
      await expect(
        auth.setEmail((await users.findById(petr._id))!, 'other@example.com'),
      ).rejects.toThrow('Your email is already confirmed.');
    });

    describe('forgot password', () => {
      it('mails a code to an account with a confirmed email, and resets with it', async () => {
        const start = await auth.initiateReset('mona@example.com');
        expect(start).toMatchObject({
          method: 'email',
          sentTo: 'm•••@example.com',
          // its Codeforces handle is proven, so that way is open too
          canUseCodeforces: true,
        });
        expect(start).not.toHaveProperty('code');

        await expect(
          auth.verifyResetEmail(start.verificationToken, '000000'),
        ).rejects.toThrow('That code is not right.');
        await expect(
          auth.verifyResetProfile(start.verificationToken),
        ).rejects.toThrow('Invalid or expired recovery token');

        const { resetToken } = await auth.verifyResetEmail(
          start.verificationToken,
          codeFor('mona_adel'),
        );
        await auth.resetPassword(undefined, {
          resetToken,
          newPassword: 'Brand-new-2!',
        });
        await expect(
          auth.login('mona_adel', 'New-pass-1!', '10.0.3.1'),
        ).rejects.toThrow('Invalid credentials');
        const { user } = await auth.login(
          'mona_adel',
          'Brand-new-2!',
          '10.0.3.2',
        );
        expect(user.username).toBe('mona_adel');
      });

      it('offers the Codeforces way only for a proven handle', async () => {
        const proven = await auth.initiateReset('mona_adel', 'codeforces');
        expect(proven.method).toBe('codeforces');
      });

      it('keeps the Codeforces-profile proof for an account with no email', async () => {
        const start = await auth.initiateReset('tourist');
        expect(start.method).toBe('codeforces');
        expect(start).toHaveProperty(
          'code',
          expect.stringMatching(/^[a-f0-9]{32}$/),
        );
      });

      it('says so when an account has neither way yet', async () => {
        await expect(auth.initiateReset('second_one')).rejects.toThrow(
          'no confirmed email and no Codeforces handle',
        );
      });
    });
  });
});
