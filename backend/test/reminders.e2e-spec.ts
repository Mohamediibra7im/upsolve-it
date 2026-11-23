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

    await reminders.subscribe(user, ' Me@Example.com ');
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0].to).toBe('me@example.com');
    expect(await reminders.sendDueReminders()).toBe(0); // not confirmed yet

    await expect(reminders.redeem('garbage')).rejects.toThrow('invalid');
    await reminders.redeem(tokenFrom(0));
    expect(await reminders.status(String(user._id))).toEqual({
      email: 'me@example.com',
      verified: true,
    });

    expect(await reminders.sendDueReminders()).toBe(1);
    expect(sendMail.mock.calls[1][0].subject).toContain('You owe 1 problem');
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
    expect(sendMail.mock.calls[3][0].subject).toBe(
      '1 re-solve due in your upsolve queue',
    );

    await reminders.redeem(tokenFrom(3)); // unsubscribe link from the reminder
    expect(await reminders.sendDueReminders(later + 8 * 86_400_000)).toBe(0);
    expect((await reminders.status(String(user._id))).email).toBeNull();
  });
});
