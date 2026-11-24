import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import nodemailer from 'nodemailer';
import { RemindersModule } from '../src/modules/reminders/reminders.module';
import { RemindersService } from '../src/modules/reminders/reminders.service';
import { UpsolveService } from '../src/modules/upsolve/upsolve.service';

jest.setTimeout(120_000);

describe('weekly upsolve reminders', () => {
  let mongo: MongoMemoryReplSet;
  let db: Connection;
  let reminders: RemindersService;
  const sendMail = jest.fn().mockResolvedValue({});
  const tokenFrom = (call: number) =>
    /token=([\w.-]+)/.exec(sendMail.mock.calls[call][0].text)![1];

  beforeAll(async () => {
    mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = mongo.getUri('upsolve_test');
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
              SMTP_EMAIL: 'bot@example.com',
              SMTP_PASSWORD: 'x',
              APP_URL: 'https://app.example',
            }),
          ],
        }),
        MongooseModule.forRoot(uri),
        RemindersModule,
      ],
    }).compile();
    db = module.get(getConnectionToken());
    reminders = module.get(RemindersService);
    jest.spyOn(module.get(UpsolveService), 'syncAll').mockResolvedValue({
      added: 0,
      solved: 0,
      resolved: 0,
      atcoderSkipped: false,
    });
    jest
      .spyOn(nodemailer, 'createTransport')
      .mockReturnValue({ sendMail } as any);
  });
  afterAll(async () => {
    await db?.close();
    await mongo?.stop();
  });

  it('mails only confirmed users with pending problems, once a week, until they unsubscribe', async () => {
    const user = await db.model('User').create({
      codeforcesHandle: 'tourist',
      password: 'x',
      avatar: 'a',
    });
    await db.model('UpsolvedProblem').create({
      user: user._id,
      contestId: 2000,
      index: 'C',
      name: 'Hard one',
      rating: 1900,
      tags: [],
      url: 'https://codeforces.com/problemset/problem/2000/C',
    });

    // Nothing to send to yet: the switch needs a confirmed account email.
    expect(await reminders.status(String(user._id))).toEqual({
      on: false,
      email: null,
      canTurnOn: false,
    });
    await expect(reminders.subscribe(user)).rejects.toThrow(
      'Add and confirm your account email first',
    );
    await db
      .model('User')
      .updateOne({ _id: user._id }, { email: 'me@example.com' });
    await expect(
      reminders.subscribe((await db.model('User').findById(user._id))!),
    ).rejects.toThrow('Add and confirm your account email first');
    expect(await reminders.sendDueReminders()).toBe(0);

    await db
      .model('User')
      .updateOne({ _id: user._id }, { emailVerified: true });
    const member = (await db.model('User').findById(user._id))!;
    expect(await reminders.status(String(user._id))).toMatchObject({
      on: false,
      canTurnOn: true,
    });
    expect(await reminders.sendDueReminders()).toBe(0); // not switched on
    expect(await reminders.subscribe(member)).toEqual({
      on: true,
      email: 'me@example.com',
      canTurnOn: true,
    });
    await expect(reminders.redeem('garbage')).rejects.toThrow('invalid');

    expect(await reminders.sendDueReminders()).toBe(1);
    expect(sendMail.mock.calls[0][0].to).toBe('me@example.com');
    expect(sendMail.mock.calls[0][0].subject).toContain('You owe 1 problem');
    expect(await reminders.sendDueReminders()).toBe(0); // already sent this week
    const nextWeek = Date.now() + 8 * 86_400_000;
    expect(await reminders.sendDueReminders(nextWeek)).toBe(1);

    // Nothing waiting, but a re-solve has come due: the email still goes out.
    await db
      .model('UpsolvedProblem')
      .updateMany(
        { user: user._id },
        { $set: { solvedTime: 1, resolveStage: 1, resolveDueAt: new Date(0) } },
      );
    const later = nextWeek + 8 * 86_400_000;
    expect(await reminders.sendDueReminders(later)).toBe(1);
    expect(sendMail.mock.calls[2][0].subject).toBe(
      '1 re-solve due in your upsolve queue',
    );

    await reminders.redeem(tokenFrom(2)); // unsubscribe link from the reminder
    expect(await reminders.sendDueReminders(later + 8 * 86_400_000)).toBe(0);
    expect(await reminders.status(String(user._id))).toMatchObject({
      on: false,
      email: null,
    });
  });

  it('keeps mailing someone who subscribed with an address of their own, until an account email takes over', async () => {
    sendMail.mockClear();
    const user = await db.model('User').create({
      codeforcesHandle: 'early_subscriber',
      password: 'x',
      reminderEmail: 'old@example.com',
      reminderEmailVerified: true,
    });
    await db.model('UpsolvedProblem').create({
      user: user._id,
      contestId: 2001,
      index: 'A',
      name: 'Still owed',
      rating: 1200,
      tags: [],
      url: 'https://codeforces.com/problemset/problem/2001/A',
    });
    expect(await reminders.status(String(user._id))).toEqual({
      on: true,
      email: 'old@example.com',
      canTurnOn: false,
    });
    const far = Date.now() + 60 * 86_400_000;
    expect(await reminders.sendDueReminders(far)).toBe(1);
    expect(sendMail.mock.calls[0][0].to).toBe('old@example.com');

    // They add and confirm an account email: the reminder follows it.
    await db
      .model('User')
      .updateOne(
        { _id: user._id },
        { email: 'new@example.com', emailVerified: true },
      );
    expect((await reminders.status(String(user._id))).email).toBe(
      'new@example.com',
    );
    expect(await reminders.sendDueReminders(far + 8 * 86_400_000)).toBe(1);
    expect(sendMail.mock.calls[1][0].to).toBe('new@example.com');
  });

  it("makes an earlier subscriber's confirmed address their account email, once, and never for two accounts", async () => {
    const users = db.model('User');
    const make = (codeforcesHandle: string, fields: object) =>
      users.create({ codeforcesHandle, password: 'x', ...fields });
    const subscribed = {
      reminderEmail: 'shared@example.com',
      reminderEmailVerified: true,
    };
    const first = await make('first_sub', subscribed);
    const second = await make('second_sub', subscribed);
    const unconfirmed = await make('never_clicked', {
      reminderEmail: 'maybe@example.com',
      reminderEmailVerified: false,
    });
    const chose = await make('chose_another', {
      reminderEmail: 'reminder@example.com',
      reminderEmailVerified: true,
      email: 'account@example.com',
    });
    await users.init();

    expect(await reminders.adoptReminderAddresses()).toBe(1);
    expect(await reminders.adoptReminderAddresses()).toBe(0);

    const read = async (id: unknown) =>
      (await users
        .findById(id)
        .select('+reminderEmail email emailVerified weeklyReminder')
        .lean()) as Record<string, unknown>;
    expect(await read(first._id)).toMatchObject({
      email: 'shared@example.com',
      emailVerified: true,
      weeklyReminder: true,
      reminderEmail: null,
    });
    expect(await reminders.status(String(first._id))).toEqual({
      on: true,
      email: 'shared@example.com',
      canTurnOn: true,
    });
    // the same address cannot be a second account's: it stays a reminder only
    expect(await read(second._id)).toMatchObject({
      reminderEmail: 'shared@example.com',
      emailVerified: false,
    });
    expect((await reminders.status(String(second._id))).on).toBe(true);
    // an address nobody confirmed, and an account that typed its own email
    expect((await read(unconfirmed._id)).email).toBeUndefined();
    expect(await read(chose._id)).toMatchObject({
      email: 'account@example.com',
      emailVerified: false,
      reminderEmail: 'reminder@example.com',
    });
  });
});
