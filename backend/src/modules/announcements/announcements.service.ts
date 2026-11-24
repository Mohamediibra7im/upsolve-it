import {
  Injectable,
  NotFoundException,
  type OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import type { UserDocument } from '../auth/schemas/user.schema';
import { SEEDED_ANNOUNCEMENTS } from './announcements.seed';
import type { AnnouncementDto } from './dto/announcement.dto';
import {
  Announcement,
  type AnnouncementDocument,
} from './schemas/announcement.schema';

type Admin = Pick<UserDocument, '_id' | 'codeforcesHandle'>;

/** Every stored field, with "not set" written as null so an update clears it. */
const fields = (dto: AnnouncementDto) => ({
  title: dto.title,
  message: dto.message,
  actionLabel: dto.actionLabel ?? null,
  actionUrl: dto.actionUrl ?? null,
  audience: dto.audience,
  startsAt: dto.startsAt ?? null,
  endsAt: dto.endsAt ?? null,
  published: dto.published,
});

@Injectable()
export class AnnouncementsService implements OnModuleInit {
  constructor(
    @InjectModel(Announcement.name)
    private readonly model: Model<AnnouncementDocument>,
    private readonly auditLogs: AuditLogsService,
  ) {}

  /**
   * Adds the announcements that ship with this release, once each, in the
   * name of the first admin. Safe on every start: one that exists is left
   * exactly as it is, so a visitor who closed it does not see it again.
   */
  async onModuleInit() {
    const admin = await this.model.db
      .collection('users')
      .findOne({ role: 'admin' }, { projection: { _id: 1 } });
    if (!admin) return;
    for (const [i, { _id, ...rest }] of SEEDED_ANNOUNCEMENTS.entries()) {
      const at = new Date(Date.now() + i);
      await this.model
        .updateOne(
          { _id },
          {
            $setOnInsert: {
              ...rest,
              createdBy: admin._id,
              createdAt: at,
              updatedAt: at,
            },
          },
          // Mongoose would otherwise move updatedAt on every start.
          { upsert: true, timestamps: false },
        )
        // Two machines starting together: the other one added it.
        .catch(() => undefined);
    }
  }

  /**
   * Every announcement a visitor should see now, newest first: published,
   * inside its window and meant for them. Only what the web app shows leaves
   * the server.
   */
  async current(member: boolean, now = new Date()) {
    // ponytail: reads the newest 50 published and filters in code, so the rule
    // is one plain predicate. Move the window into the query if an eligible
    // announcement could ever sit behind 50 newer scheduled or ended ones.
    const published = await this.model
      .find({ published: true })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    return published
      .filter(
        (a) =>
          (member || a.audience === 'everyone') &&
          (!a.startsAt || a.startsAt <= now) &&
          (!a.endsAt || a.endsAt > now),
      )
      .map((a) => ({
        id: String(a._id),
        title: a.title,
        message: a.message,
        actionLabel: a.actionLabel,
        actionUrl: a.actionUrl,
        updatedAt: a.updatedAt,
      }));
  }

  async list(limit: number, offset: number) {
    const [announcements, total] = await Promise.all([
      this.model
        .find()
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      this.model.countDocuments(),
    ]);
    return { announcements, total, limit, offset };
  }

  async create(dto: AnnouncementDto, admin: Admin) {
    const created = await this.model.create({
      ...fields(dto),
      createdBy: admin._id,
    });
    await this.log('CREATE_ANNOUNCEMENT', admin, created);
    if (created.published)
      await this.log('PUBLISH_ANNOUNCEMENT', admin, created);
    return created;
  }

  async update(id: Types.ObjectId, dto: AnnouncementDto, admin: Admin) {
    const announcement = await this.model.findById(id);
    if (!announcement) throw new NotFoundException('Announcement not found');

    const wasPublished = announcement.published;
    announcement.set(fields(dto));
    // An unchanged announcement keeps its updatedAt, so it is not shown again.
    await announcement.save();

    // Publishing and unpublishing are the entries worth finding in the log;
    // an edit that keeps the state is an update.
    await this.log(
      wasPublished === announcement.published
        ? 'UPDATE_ANNOUNCEMENT'
        : announcement.published
          ? 'PUBLISH_ANNOUNCEMENT'
          : 'UNPUBLISH_ANNOUNCEMENT',
      admin,
      announcement,
    );
    return announcement;
  }

  async remove(id: Types.ObjectId, admin: Admin) {
    const removed = await this.model.findByIdAndDelete(id).lean();
    if (!removed) throw new NotFoundException('Announcement not found');
    await this.log('DELETE_ANNOUNCEMENT', admin, removed);
    return { message: 'Announcement deleted' };
  }

  private log(
    action: string,
    admin: Admin,
    announcement: { _id: Types.ObjectId; title: string; audience: string },
  ) {
    return this.auditLogs.logAction(
      action,
      Announcement.name,
      admin._id,
      admin.codeforcesHandle,
      { title: announcement.title, audience: announcement.audience },
      announcement._id,
    );
  }
}
