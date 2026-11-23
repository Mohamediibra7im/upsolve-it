import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuthService } from '../auth/auth.service';
import {
  AdminAnnouncementsController,
  AnnouncementsController,
} from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from './schemas/announcement.schema';

type Row = Record<string, unknown> & {
  _id: Types.ObjectId;
  published: boolean;
  createdAt: Date;
};

const admin = {
  _id: new Types.ObjectId('65a000000000000000000001'),
  codeforcesHandle: 'Admin_User',
  role: 'admin',
};
const member = { ...admin, codeforcesHandle: 'Plain_User', role: 'user' };

const valid = {
  title: 'Ladder mode is here',
  message: 'Climb one rating step at a time.\nTry it today.',
  actionLabel: 'Open training',
  actionUrl: '/training',
  audience: 'everyone',
  startsAt: null,
  endsAt: null,
  published: false,
};

describe('announcements', () => {
  let app: INestApplication;
  let service: AnnouncementsService;
  let rows: Row[] = [];
  const getUserFromAuthHeader = jest.fn();
  const logAction = jest.fn().mockResolvedValue(undefined);

  // Answers the way Mongo would for the calls the service makes.
  const model = {
    find: (filter: { published?: boolean } = {}) => {
      let found = rows.filter(
        (row) =>
          filter.published === undefined || row.published === filter.published,
      );
      const query = {
        sort: (by: { createdAt: -1 }) => {
          found = [...found].sort(
            (a, b) =>
              by.createdAt * (a.createdAt.getTime() - b.createdAt.getTime()),
          );
          return query;
        },
        skip: (n: number) => ((found = found.slice(n)), query),
        limit: (n: number) => ((found = found.slice(0, n)), query),
        lean: () => Promise.resolve(found),
      };
      return query;
    },
    countDocuments: () => Promise.resolve(rows.length),
    create: (data: { published: boolean }) => {
      const now = new Date();
      const row: Row = {
        _id: new Types.ObjectId(),
        createdAt: now,
        updatedAt: now,
        ...data,
      };
      rows.push(row);
      return Promise.resolve(row);
    },
    findById: (id: Types.ObjectId) => {
      const row = rows.find((r) => r._id.equals(id));
      return Promise.resolve(
        row &&
          Object.assign(row, {
            set: (values: object) => Object.assign(row, values),
            save: () => Promise.resolve(row),
          }),
      );
    },
    findByIdAndDelete: (id: Types.ObjectId) => {
      const row = rows.find((r) => r._id.equals(id)) ?? null;
      rows = rows.filter((r) => r !== row);
      return { lean: () => Promise.resolve(row) };
    },
  };

  const server = () => app.getHttpServer() as App;
  const post = (body: object) =>
    request(server()).post('/admin/announcements').send(body);
  const logged = () => logAction.mock.calls.map((call: unknown[]) => call[0]);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AnnouncementsController, AdminAnnouncementsController],
      providers: [
        AnnouncementsService,
        { provide: getModelToken(Announcement.name), useValue: model },
        { provide: AuditLogsService, useValue: { logAction } },
        { provide: AuthService, useValue: { getUserFromAuthHeader } },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    // the same pipe as src/common/http/configure-http.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    service = moduleRef.get(AnnouncementsService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    rows = [];
    logAction.mockClear();
    getUserFromAuthHeader.mockResolvedValue(admin);
  });

  describe('validation', () => {
    it('stores a valid announcement trimmed, with the admin as its author', async () => {
      await post({
        ...valid,
        title: '  Ladder mode is here  ',
        message: 'One\r\nTwo\n',
      }).expect(201);

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        title: 'Ladder mode is here',
        message: 'One\nTwo',
        actionLabel: 'Open training',
        actionUrl: '/training',
        audience: 'everyone',
        startsAt: null,
        endsAt: null,
        published: false,
        createdBy: admin._id,
      });
    });

    it.each([
      'https://codeforces.com/contest/1',
      '/training/reviews?tab=1#top',
      '/',
    ])('accepts the link %s', async (actionUrl) => {
      await post({ ...valid, actionUrl }).expect(201);
    });

    it.each([
      'javascript:alert(1)',
      'JavaScript:alert(1)',
      'data:text/html,<b>x</b>',
      'http://example.com',
      '//example.com',
      '/\\example.com',
      'https://user:pass@example.com',
      'https://exa mple.com',
      'https:example.com',
      'example.com',
      'training',
      '/tra\tining',
    ])('rejects the link %s', async (actionUrl) => {
      await post({ ...valid, actionUrl }).expect(400);
      expect(rows).toHaveLength(0);
    });

    it.each([
      ['a title over 80 characters', { title: 'a'.repeat(81) }],
      ['an empty title', { title: '   ' }],
      ['a line break in the title', { title: 'One\nTwo' }],
      ['a message over 600 characters', { message: 'a'.repeat(601) }],
      ['an empty message', { message: '' }],
      ['a control character in the message', { message: 'One\u0007Two' }],
      ['a bidi override in the message', { message: 'One‮Two' }],
      ['a label over 30 characters', { actionLabel: 'a'.repeat(31) }],
      ['a label without a link', { actionUrl: '' }],
      ['a link without a label', { actionLabel: undefined }],
      ['an unknown audience', { audience: 'admins' }],
      ['a start that is not a date', { startsAt: 'soon' }],
      [
        'an end before the start',
        {
          startsAt: '2026-12-02T10:00:00.000Z',
          endsAt: '2026-12-01T10:00:00.000Z',
        },
      ],
      [
        'an end equal to the start',
        {
          startsAt: '2026-12-02T10:00:00.000Z',
          endsAt: '2026-12-02T10:00:00.000Z',
        },
      ],
      ['published that is not a boolean', { published: 'yes' }],
      ['a field that does not exist', { html: '<b>x</b>' }],
    ])('rejects %s', async (_name, change) => {
      await post({ ...valid, ...change }).expect(400);
      expect(rows).toHaveLength(0);
    });

    it('accepts no action at all, and a window that ends after it starts', async () => {
      await post({
        ...valid,
        actionLabel: '',
        actionUrl: '',
        startsAt: '2026-12-01T10:00:00.000Z',
        endsAt: '2026-12-02T10:00:00.000Z',
      }).expect(201);

      expect(rows[0]).toMatchObject({
        actionLabel: null,
        actionUrl: null,
        startsAt: new Date('2026-12-01T10:00:00.000Z'),
        endsAt: new Date('2026-12-02T10:00:00.000Z'),
      });
    });

    it('validates an update the same way, and answers 400 for a malformed id', async () => {
      await post(valid).expect(201);
      const url = `/admin/announcements/${String(rows[0]._id)}`;

      await request(server())
        .put(url)
        .send({ ...valid, actionUrl: 'javascript:alert(1)' })
        .expect(400);
      await request(server())
        .put('/admin/announcements/not-an-id')
        .send(valid)
        .expect(400);
      await request(server())
        .put(`/admin/announcements/${String(new Types.ObjectId())}`)
        .send(valid)
        .expect(404);
      expect(rows[0].actionUrl).toBe('/training');
    });
  });

  describe('admin-only access', () => {
    it.each([
      ['a signed-out visitor', null, 401],
      ['a regular user', member, 403],
    ])(
      'turns away %s from every admin endpoint',
      async (_who, user, status) => {
        await post(valid).expect(201);
        const url = `/admin/announcements/${String(rows[0]._id)}`;
        logAction.mockClear();
        getUserFromAuthHeader.mockResolvedValue(user);

        await request(server()).get('/admin/announcements').expect(status);
        await post(valid).expect(status);
        await request(server())
          .put(url)
          .send({ ...valid, title: 'Changed' })
          .expect(status);
        await request(server()).delete(url).expect(status);

        expect(rows).toHaveLength(1);
        expect(rows[0].title).toBe(valid.title);
        expect(logAction).not.toHaveBeenCalled();
      },
    );

    it('lists newest first for an admin, a page at a time', async () => {
      for (const [index, title] of ['First', 'Second', 'Third'].entries()) {
        await post({ ...valid, title }).expect(201);
        rows[index].createdAt = new Date(2026, 10, index + 1);
      }

      const res = await request(server())
        .get('/admin/announcements?limit=2&offset=1')
        .expect(200);

      expect(res.body).toMatchObject({ total: 3, limit: 2, offset: 1 });
      expect(
        (res.body as { announcements: { title: string }[] }).announcements.map(
          (a) => a.title,
        ),
      ).toEqual(['Second', 'First']);
    });
  });

  describe('audit log', () => {
    it('logs create, publish, update, unpublish and delete', async () => {
      await post(valid).expect(201);
      expect(logged()).toEqual(['CREATE_ANNOUNCEMENT']);
      const id = rows[0]._id;
      const url = `/admin/announcements/${String(id)}`;
      const put = (change: object) =>
        request(server())
          .put(url)
          .send({ ...valid, ...change })
          .expect(200);

      await put({ published: true });
      await put({ published: true, title: 'Edited' });
      await put({ published: false, title: 'Edited' });
      await request(server()).delete(url).expect(200);

      expect(logged()).toEqual([
        'CREATE_ANNOUNCEMENT',
        'PUBLISH_ANNOUNCEMENT',
        'UPDATE_ANNOUNCEMENT',
        'UNPUBLISH_ANNOUNCEMENT',
        'DELETE_ANNOUNCEMENT',
      ]);
      expect(logAction).toHaveBeenLastCalledWith(
        'DELETE_ANNOUNCEMENT',
        'Announcement',
        admin._id,
        'Admin_User',
        { title: 'Edited', audience: 'everyone' },
        id,
      );
      expect(rows).toHaveLength(0);
    });

    it('logs a publish as well when an announcement is created published', async () => {
      await post({ ...valid, published: true }).expect(201);
      expect(logged()).toEqual(['CREATE_ANNOUNCEMENT', 'PUBLISH_ANNOUNCEMENT']);
    });
  });

  describe('GET /announcements/current', () => {
    const now = new Date('2026-11-23T12:00:00.000Z');
    const hour = 3_600_000;
    const at = (hours: number) => new Date(now.getTime() + hours * hour);
    const store = (title: string, change: Partial<Row> = {}) => {
      const row: Row = {
        _id: new Types.ObjectId(),
        title,
        message: 'Message',
        actionLabel: null,
        actionUrl: null,
        audience: 'everyone',
        startsAt: null,
        endsAt: null,
        published: true,
        createdBy: admin._id,
        createdAt: at(-48),
        updatedAt: at(-24),
        ...change,
      };
      rows.push(row);
      return row;
    };
    const titlesFor = async (isMember: boolean) =>
      (await service.current(isMember, now)).map((a) => a.title);

    it('returns nothing when nothing is eligible', async () => {
      store('Draft', { published: false });
      store('Not yet started', { startsAt: at(1) });
      store('Ended', { endsAt: at(-1) });
      store('Ends this instant', { endsAt: now });
      store('Members only', { audience: 'members' });

      expect(await titlesFor(false)).toEqual([]);
    });

    it('shows a members-only announcement to a signed-in visitor only', async () => {
      store('For everyone', { createdAt: at(-72) });
      store('Members only', { audience: 'members' });

      expect(await titlesFor(false)).toEqual(['For everyone']);
      expect(await titlesFor(true)).toEqual(['Members only', 'For everyone']);
    });

    it('shows an announcement inside its window', async () => {
      store('Running', { startsAt: at(-1), endsAt: at(1) });
      expect(await titlesFor(false)).toEqual(['Running']);
    });

    it('returns every eligible one, newest first, skipping the rest', async () => {
      store('Old', { createdAt: at(-72) });
      store('Newest eligible', { createdAt: at(-10) });
      store('Newer draft', { createdAt: at(-5), published: false });
      store('Newer but scheduled', { createdAt: at(-4), startsAt: at(2) });
      store('Newer but ended', { createdAt: at(-3), endsAt: at(-2) });

      expect(await titlesFor(false)).toEqual(['Newest eligible', 'Old']);
    });

    it('returns only what the web app shows', async () => {
      const row = store('Ladder mode is here', {
        actionLabel: 'Open training',
        actionUrl: '/training',
      });

      expect(await service.current(false, now)).toEqual([
        {
          id: String(row._id),
          title: 'Ladder mode is here',
          message: 'Message',
          actionLabel: 'Open training',
          actionUrl: '/training',
          updatedAt: row.updatedAt,
        },
      ]);
    });

    it('needs no session, and reads the session when there is one', async () => {
      store('For everyone', { createdAt: at(-72) });
      store('Members only', { audience: 'members' });
      const current = async (query = '') =>
        (
          (
            await request(server())
              .get(`/announcements/current${query}`)
              .expect(200)
          ).body as { announcements: { title: string }[] }
        ).announcements.map((a) => a.title);

      getUserFromAuthHeader.mockResolvedValue(null);
      expect(await current()).toEqual(['For everyone']);
      // a browser that believes it is signed in gets a 401 to refresh on
      await request(server())
        .get('/announcements/current?member=1')
        .expect(401);

      getUserFromAuthHeader.mockResolvedValue(member);
      expect(await current()).toEqual(['Members only', 'For everyone']);
      expect(await current('?member=1')).toEqual([
        'Members only',
        'For everyone',
      ]);
    });

    it('answers with an empty list when there is nothing to show', async () => {
      getUserFromAuthHeader.mockResolvedValue(null);
      await request(server())
        .get('/announcements/current')
        .expect(200, { announcements: [] });
    });
  });
});
