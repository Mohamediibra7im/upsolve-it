import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import nodemailer from 'nodemailer';
import { User, type UserDocument } from '../auth/schemas/user.schema';
import {
  UpsolvedProblem,
  type UpsolvedProblemDocument,
} from '../upsolve/schemas/upsolved-problem.schema';
import { UpsolveService } from '../upsolve/upsolve.service';
import { renderConfirmEmail, renderReminderEmail } from './reminder-email';

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
    return Boolean(
      this.config.get('SMTP_EMAIL') && this.config.get('SMTP_PASSWORD'),
    );
  }

  private async send(
    to: string,
    mail: { subject: string; text: string; html: string },
  ) {
    const from = this.config.get<string>('SMTP_EMAIL');
    const pass = this.config.get<string>('SMTP_PASSWORD');
    if (!from || !pass)
      throw new ServiceUnavailableException('Email is not configured.');
    await nodemailer
      .createTransport({ service: 'gmail', auth: { user: from, pass } })
      .sendMail({ from: `"Upsolve It" <${from}>`, to, ...mail });
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

  async status(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('+reminderEmail reminderEmailVerified');
    return {
      email: user?.reminderEmail ?? null,
      verified: Boolean(user?.reminderEmail && user.reminderEmailVerified),
    };
  }

  /** Saves the address unverified and mails a confirmation link to it. */
  async subscribe(user: UserDocument, email: string) {
    if (!this.mailConfigured())
      throw new ServiceUnavailableException('Email is not configured.');
    const address = email.trim().toLowerCase();
    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { reminderEmail: address, reminderEmailVerified: false } },
    );
    const token = await this.jwt.signAsync(
      {
        userId: String(user._id),
        purpose: 'confirm',
        email: address,
      } satisfies ReminderToken,
      { expiresIn: '24h' },
    );
    await this.send(
      address,
      renderConfirmEmail(
        user.codeforcesHandle,
        this.emailLink('confirm', token),
      ),
    );
    return { email: address, verified: false };
  }

  async unsubscribe(userId: string) {
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { reminderEmail: null, reminderEmailVerified: false } },
    );
    return { email: null, verified: false };
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
    // Only confirms the address the link was mailed to, if it is still current.
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
        reminderEmailVerified: true,
        reminderEmail: { $ne: null },
        locked: { $ne: true },
        $or: [{ lastReminderAt: null }, { lastReminderAt: { $lte: cutoff } }],
      };
      for (;;) {
        const user = await this.userModel
          .findOneAndUpdate(due, { $set: { lastReminderAt: new Date(nowMs) } })
          .select('+reminderEmail codeforcesHandle links');
        if (!user) break;
        try {
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
              user.reminderEmail!,
              renderReminderEmail(
                user.codeforcesHandle,
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
