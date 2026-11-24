import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { AnnouncementsModule } from '../src/modules/announcements/announcements.module';
import { SEEDED_ANNOUNCEMENTS } from '../src/modules/announcements/announcements.seed';
import { AnnouncementsService } from '../src/modules/announcements/announcements.service';

jest.setTimeout(120_000);

describe('announcements that ship with a release', () => {
  let mongo: MongoMemoryReplSet;
  let db: Connection;
  let service: AnnouncementsService;

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
        AnnouncementsModule,
      ],
    }).compile();
    db = module.get(getConnectionToken());
    service = module.get(AnnouncementsService);
  });
  afterAll(async () => {
    await db?.close();
    await mongo?.stop();
  });

  it('are added once, for members, and left alone on later starts', async () => {
    const announcements = db.model('Announcement');
    await service.onModuleInit();
    expect(await announcements.countDocuments()).toBe(0); // no admin yet

    await db.model('User').create({
      codeforcesHandle: 'boss',
      password: 'x',
      avatar: 'a',
      role: 'admin',
    });
    await service.onModuleInit();
    const first = await announcements.find().sort({ _id: 1 }).lean();
    expect(first).toHaveLength(SEEDED_ANNOUNCEMENTS.length);

    // An admin's edit survives a restart, and nothing is stamped again.
    await announcements.updateOne(
      { _id: first.at(-1)!._id },
      { title: 'Edited' },
    );
    const edited = await announcements.find().sort({ _id: 1 }).lean();
    await service.onModuleInit();
    expect(await announcements.find().sort({ _id: 1 }).lean()).toEqual(edited);

    const now = new Date('2026-11-25T00:00:00Z');
    expect(await service.current(false, now)).toHaveLength(0);
    const shown = await service.current(true, now);
    expect(shown[0].title).toBe('Solve without leaving the site');
    expect(shown).toHaveLength(SEEDED_ANNOUNCEMENTS.length);
    expect(
      await service.current(true, new Date('2026-12-23T00:00:00Z')),
    ).toHaveLength(0);
  });

  it('fit the limits the admin form enforces', () => {
    for (const a of SEEDED_ANNOUNCEMENTS) {
      expect(a.title.length).toBeLessThanOrEqual(80);
      expect(a.message.length).toBeLessThanOrEqual(600);
      expect(a.actionLabel.length).toBeLessThanOrEqual(30);
      expect(a.actionUrl.startsWith('/')).toBe(true);
    }
  });
});
