import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { mailConfigured, sendMail, type Mail } from '../../common/utils/mail';
import { User, type UserDocument } from '../auth/schemas/user.schema';
import {
  UpsolvedProblem,
  type UpsolvedProblemDocument,
} from '../upsolve/schemas/upsolved-problem.schema';
import { UpsolveService } from '../upsolve/upsolve.service';
import { renderReminderEmail } from './reminder-email';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CHECK_EVERY_MS = 60 * 60 * 1000;
/** Codeforces asks for at most one API call every two seconds. */
const CODEFORCES_PAUSE_MS = 2000;

type ReminderToken = {
  userId: string;
  purpose: 'confirm' | 'unsubscribe';
  email?: string;
};

@Injectable()
export class RemindersService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RemindersService.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly upsolve: UpsolveService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UpsolvedProblem.name)
    private readonly upsolveModel: Model<UpsolvedProblemDocument>,
  ) {}

  onModuleInit() {
    void this.adoptReminderAddresses().catch((err) =>
      this.logger.error('Could not move reminder addresses', err),
    );
    // ponytail: in-process hourly timer, needs one always-on machine (Fly).
    // Move to a scheduled job if the API ever runs serverless-only.
    if (this.config.get('NODE_ENV') === 'test' || !this.mailConfigured())
      return;
    this.timer = setInterval(
      () => void this.sendDueReminders(),
      CHECK_EVERY_MS,
    );
    this.timer.unref();
  }

  onModuleDestroy() {
    clearInterval(this.timer);
  }

  private mailConfigured() {
    return mailConfigured(this.config);
  }

  private send(to: string, mail: Mail) {
    return sendMail(this.config, to, mail);
  }

  private appUrl(path: string) {
    const base =
      this.config.get<string>('APP_URL') ??
      this.config.get<string>('FRONTEND_ORIGIN') ??
      '';
    return `${base.replace(/\/$/, '')}${path}`;
  }

  private emailLink(purpose: ReminderToken['purpose'], token: string) {
    return this.appUrl(`/email?action=${purpose}&token=${token}`);
  }

  /**
   * An address someone confirmed for the reminder, back when it took one of
   * its own, becomes their account email: already confirmed, with the
   * reminder switched on. Only for an account that has no email of its own.
   * Safe to run on every start: an account it has moved no longer matches.
   *
   * Two accounts that confirmed the same address cannot both have it as
   * their account email. The first keeps it; the other is left as it was and
   * goes on being reminded at that address.
   */
  async adoptReminderAddresses() {
    const waiting = {
      reminderEmailVerified: true,
      reminderEmail: { $type: 'string' as const },
      email: null,
    };
    const subscribers = await this.userModel
      .find(waiting)
      .select('+reminderEmail')
      .sort({ _id: 1 });
    let moved = 0;
    for (const user of subscribers) {
      try {
        const { modifiedCount } = await this.userModel.updateOne(
          { _id: user._id, ...waiting },
          {
            $set: {
              email: user.reminderEmail!.trim().toLowerCase(),
              emailVerified: true,
              weeklyReminder: true,
              reminderEmail: null,
              reminderEmailVerified: false,
            },
          },
        );
        moved += modifiedCount;
      } catch (err) {
        // the address is already another account's confirmed email
        if ((err as { code?: number }).code !== 11000) throw err;
      }
    }
    if (moved) this.logger.log(`Moved ${moved} reminder addresses`);
    return moved;
  }

  /**
   * Where a user's reminder goes, if anywhere: their confirmed account
   * email, or failing that the address they gave the reminder when it still
   * took one of its own.
   */
  private recipient(user: {
    email?: string;
    emailVerified?: boolean;
    reminderEmail?: string | null;
    reminderEmailVerified?: boolean;
  }) {
    if (user.email && user.emailVerified) return user.email;
    return user.reminderEmail && user.reminderEmailVerified
      ? user.reminderEmail
      : null;
  }

  async status(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select(
        '+reminderEmail reminderEmailVerified weeklyReminder email emailVerified',
      );
    const hasEmail = Boolean(user?.email && user.emailVerified);
    const subscribed = Boolean(
      user &&
      (user.weeklyReminder ||
        (user.reminderEmail && user.reminderEmailVerified)),
    );
    const email = user && subscribed ? this.recipient(user) : null;
    return {
      on: Boolean(email),
      /** Where it is sent while it is on. */
      email,
      /** Turning it on needs a confirmed account email to send to. */
      canTurnOn: hasEmail,
    };
  }

  /** Turns the reminder on, to the account's confirmed email. */
  async subscribe(user: UserDocument) {
    if (!user.email || !user.emailVerified) {
      throw new BadRequestException(
        'Add and confirm your account email first: the reminder is sent to it.',
      );
    }
    await this.userModel.updateOne(
      { _id: user._id },
      {
        $set: {
          weeklyReminder: true,
          // the account email takes over from an address the reminder had
          reminderEmail: null,
          reminderEmailVerified: false,
        },
      },
    );
    return this.status(String(user._id));
  }

  async unsubscribe(userId: string) {
    await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          weeklyReminder: false,
          reminderEmail: null,
          reminderEmailVerified: false,
        },
      },
    );
    return this.status(userId);
  }

  /** Handles the links in confirmation and reminder emails. */
  async redeem(token: string) {
    let payload: ReminderToken;
    try {
      payload = await this.jwt.verifyAsync<ReminderToken>(token, {
        algorithms: ['HS256'],
      });
    } catch {
      throw new BadRequestException('This link is invalid or has expired.');
    }
    if (payload.purpose === 'unsubscribe') {
      await this.unsubscribe(payload.userId);
      return { action: 'unsubscribe' as const };
    }
    // A "confirm this address" link, mailed when the reminder still took an
    // address of its own. Such a link lasts a day; it is honoured until then.
    const res = await this.userModel.updateOne(
      { _id: payload.userId, reminderEmail: payload.email },
      { $set: { reminderEmailVerified: true } },
    );
    if (!res.matchedCount)
      throw new BadRequestException('This link is invalid or has expired.');
    return { action: 'confirm' as const };
  }

  /**
   * Mails every confirmed user whose last reminder is a week old and who still
   * has unsolved problems or re-solves due. Each user is claimed atomically first, so two
   * machines running this at once cannot send the same reminder twice.
   */
  async sendDueReminders(nowMs: number = Date.now()) {
    if (this.running) return 0;
    this.running = true;
    let sent = 0;
    try {
      const cutoff = new Date(nowMs - WEEK_MS);
      const due = {
        locked: { $ne: true },
        $and: [
          {
            $or: [
              // switched on, with a confirmed account email to send to
              { weeklyReminder: true, emailVerified: true },
              // subscribed with an address of its own, before the switch
              { reminderEmailVerified: true, reminderEmail: { $ne: null } },
            ],
          },
          {
            $or: [
              { lastReminderAt: null },
              { lastReminderAt: { $lte: cutoff } },
            ],
          },
        ],
      };
      for (;;) {
        const user = await this.userModel
          .findOneAndUpdate(due, { $set: { lastReminderAt: new Date(nowMs) } })
          .select(
            '+reminderEmail reminderEmailVerified email emailVerified username codeforcesHandle links',
          );
        if (!user) break;
        try {
          const to = this.recipient(user);
          if (!to) continue;
          // Refresh from the judges first so solved problems are not nagged about.
          await this.upsolve
            .syncAll(String(user._id), {
              codeforces: user.codeforcesHandle,
              atcoder: user.links?.atcoder,
            })
            .catch(() => undefined);
          const pending = await this.upsolveModel
            .find({ user: user._id, solvedTime: null })
            .sort({ createdAt: 1 })
            .limit(500)
            .lean();
          const resolveDue = await this.upsolve.countResolvesDue(
            String(user._id),
            nowMs,
          );
          if (pending.length || resolveDue) {
            const token = await this.jwt.signAsync(
              {
                userId: String(user._id),
                purpose: 'unsubscribe',
              } satisfies ReminderToken,
              { expiresIn: '365d' },
            );
            await this.send(
              to,
              renderReminderEmail(
                user.username ?? user.codeforcesHandle,
                pending,
                {
                  upsolve: this.appUrl('/upsolve'),
                  unsubscribe: this.emailLink('unsubscribe', token),
                },
                nowMs,
                resolveDue,
              ),
            );
            sent++;
          }
        } catch (err) {
          this.logger.warn(
            `Reminder failed for user ${String(user._id)}: ${(err as Error).message}`,
          );
        }
        await new Promise((r) => setTimeout(r, CODEFORCES_PAUSE_MS));
      }
    } finally {
      this.running = false;
    }
    return sent;
  }
}
