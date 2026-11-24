import {
  BadRequestException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
  Logger,
  type OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import {
  RefreshToken,
  type RefreshTokenDocument,
} from './schemas/refresh-token.schema';
import {
  CODEFORCES_INDEX,
  LINK_KEYS,
  NAME_COLLATION,
  User,
  type LinkKey,
  type UserDocument,
} from './schemas/user.schema';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { Types } from 'mongoose';
import { getRankFromRating } from '../../common/utils/rating';
import { shouldSyncProfile } from '../../common/utils/profile';
import { validatePassword } from '../../common/utils/password';
import { fetchCodeforcesUserInfo } from '../../common/utils/codeforces-api';
import { TransactionsService } from '../../common/database/transactions.module';
import { mailConfigured, sendMail } from '../../common/utils/mail';
import { readAtcoderProfile } from '../../common/utils/atcoder-profile';
import { renderCodeEmail, type CodePurpose } from '../reminders/reminder-email';
import {
  PasswordResetChallenge,
  PasswordResetChallengeDocument,
} from './schemas/password-reset-challenge.schema';

const loginLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
  blockDuration: 180,
});

const refreshLimiter = new RateLimiterMemory({
  points: 10,
  duration: 300,
  blockDuration: 600,
});

// Per-user failed-login throttle — 5 wrong within window → temporary block
// (auto-clears after blockDuration). Not a permanent lock.
const loginUserLimiter = new RateLimiterMemory({
  points: 5,
  duration: 900,
  blockDuration: 900,
});

const RESET_LIFETIME_MS = 10 * 60 * 1000;

// Sign-ups from one address: each one sends an email to whoever was typed in.
const registerLimiter = new RateLimiterMemory({ points: 5, duration: 3600 });

// One confirmation email a minute per account.
const emailCodeLimiter = new RateLimiterMemory({ points: 1, duration: 60 });

const EMAIL_CODE_LIFETIME_MS = 10 * 60 * 1000;
/** A 6-digit code has a million values; this many guesses, then a new code. */
const EMAIL_CODE_TRIES = 5;

/** New usernames. Older accounts keep the Codeforces handle they signed up with. */
const USERNAME = /^[A-Za-z0-9_]{3,24}$/;

const isDuplicateKey = (err: unknown) =>
  typeof err === 'object' &&
  err !== null &&
  'code' in err &&
  err.code === 11000;

function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** What a user typed about themselves, with empty strings for anything unset. */
export function profileFields(user: {
  displayName?: string;
  bio?: string;
  links?: Partial<Record<LinkKey, string>>;
  glyphAvatar?: string;
}) {
  return {
    displayName: user.displayName || '',
    bio: user.bio || '',
    links: Object.fromEntries(
      LINK_KEYS.map((key) => [key, user.links?.[key] || '']),
    ) as Record<LinkKey, string>,
    glyphAvatar: user.glyphAvatar || '',
  };
}

function toPublicUser(user: any) {
  return {
    _id: user._id,
    username: user.username ?? user.codeforcesHandle,
    email: user.email ?? null,
    emailVerified: user.emailVerified === true,
    codeforcesHandle: user.codeforcesHandle,
    rating: user.rating,
    avatar: user.avatar,
    rank: user.rank,
    maxRating: user.maxRating,
    maxRank: user.maxRank,
    organization: user.organization,
    lastSyncTime: user.lastSyncTime,
    role: user.role,
    isVerified: user.isVerified,
    atcoderVerified: user.atcoderVerified === true,
    publicProfile: user.publicProfile === true,
    ...profileFields(user as User),
  };
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  // Reset/verification tokens are signed with a DIFFERENT secret than access
  // tokens. This is what prevents a password-reset token from ever verifying
  // as a session token (account-takeover fix) — without needing a `type` claim,
  // so access tokens issued before this change keep working (no forced logout).
  private readonly resetSecret: string;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly jwt: JwtService,
    private readonly auditLogs: AuditLogsService,
    private readonly config: ConfigService,
    @InjectModel(PasswordResetChallenge.name)
    private readonly resetChallengeModel: Model<PasswordResetChallengeDocument>,
    private readonly transactions: TransactionsService,
  ) {
    const secret = this.config.get<string>('JWT_REFRESH_SECRET');
    if (!secret)
      throw new Error('JWT_REFRESH_SECRET must be set in environment');
    this.resetSecret = secret;
  }

  async verifyAccessToken(
    token: string,
  ): Promise<{ userId: string; authVersion?: number } | null> {
    try {
      // Verify against the access-token secret only. Reset/verification tokens
      // are signed with `resetSecret`, so they fail here and cannot be replayed
      // as a session. HS256 is pinned to prevent algorithm confusion.
      const decoded = await this.jwt.verifyAsync<{
        userId: string;
        type?: string;
        authVersion?: number;
      }>(token, {
        algorithms: ['HS256'],
      });
      if (
        !Types.ObjectId.isValid(decoded.userId) ||
        (decoded.type && decoded.type !== 'access')
      )
        return null;
      return decoded;
    } catch {
      return null;
    }
  }

  async getUserFromAuthHeader(authHeader?: string, accessTokenCookie?: string) {
    const token = authHeader?.split(' ')[1] ?? accessTokenCookie;
    if (!token) return null;
    const decoded = await this.verifyAccessToken(token);
    if (!decoded) return null;
    const user = await this.userModel.findById(decoded.userId);
    if (
      !user ||
      user.locked ||
      (user.authVersion ?? 0) !== (decoded.authVersion ?? 0)
    )
      return null;
    return user;
  }

  async rateLimit(identifier: string, limiter: RateLimiterMemory) {
    try {
      await limiter.consume(identifier);
      return { success: true as const };
    } catch (err) {
      const msBeforeNext =
        typeof err === 'object' && err && 'msBeforeNext' in err
          ? Number((err as { msBeforeNext: number }).msBeforeNext)
          : 1000;
      return {
        success: false as const,
        remainingSeconds: Math.max(1, Math.round(msBeforeNext / 1000)),
      };
    }
  }

  /**
   * Gives every account made before usernames existed its Codeforces handle
   * as its username. Safe to run on every start: it only touches accounts
   * that have none. A failure is logged, not fatal: `findByLogin` still finds
   * those accounts by their handle.
   */
  async onModuleInit() {
    try {
      const { modifiedCount } = await this.userModel.updateMany(
        { username: { $exists: false } },
        [{ $set: { username: '$codeforcesHandle' } }],
        { updatePipeline: true, timestamps: false },
      );
      if (modifiedCount)
        this.logger.log(`Gave ${modifiedCount} accounts their username`);
    } catch (err) {
      this.logger.error('Could not give older accounts a username', err);
    }
    try {
      // The first index on codeforcesHandle covered every account: one
      // without a handle counted as a duplicate of the next, and a handle
      // somebody only typed blocked its real owner. Replace it with the one
      // in the schema, which covers proven handles alone.
      const indexes = await this.userModel.collection.indexes();
      const old = indexes.find(
        (index) =>
          index.name === 'codeforcesHandle_1' &&
          JSON.stringify(index.partialFilterExpression) !==
            JSON.stringify(CODEFORCES_INDEX),
      );
      if (old) await this.userModel.collection.dropIndex('codeforcesHandle_1');
      await this.userModel.createIndexes();
    } catch (err) {
      this.logger.error('Could not update the account indexes', err);
    }
  }

  /** The account a typed login name belongs to, whatever its letter case. */
  private findByLogin(name: string) {
    return this.userModel
      .findOne({
        $or: [
          { username: name },
          { email: name.toLowerCase(), emailVerified: true },
          // An account the start-up pass has not reached has only its handle.
          { username: { $exists: false }, codeforcesHandle: name },
        ],
      })
      .collation(NAME_COLLATION);
  }

  /**
   * Makes the account and mails the code that confirms its address. A judge
   * handle is connected afterwards, in the last sign-up step.
   */
  async register(
    username: string,
    email: string,
    password: string,
    ip: string,
  ) {
    const limit = await this.rateLimit(ip, registerLimiter);
    if (!limit.success) {
      throw new HttpException(
        `Too many sign-ups from here. Try again in ${Math.ceil(limit.remainingSeconds / 60)} minutes.`,
        429,
      );
    }
    if (!USERNAME.test(username ?? '')) {
      throw new BadRequestException(
        'A username is 3 to 24 letters, digits or underscores.',
      );
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException(passwordValidation.errors.join('. '));
    }
    const address = email.trim().toLowerCase();

    const sameName = await this.userModel
      .findOne({ username })
      .collation(NAME_COLLATION);
    if (sameName) throw new BadRequestException('That username is taken.');
    await this.assertEmailFree(address);

    let user: UserDocument;
    try {
      user = await this.userModel.create({
        username,
        email: address,
        password: await bcrypt.hash(password, 10),
      });
    } catch (err) {
      if (isDuplicateKey(err))
        throw new BadRequestException('That username is taken.');
      throw err;
    }

    // The account exists either way: a code that did not go out can be
    // asked for again from the next step.
    await emailCodeLimiter.consume(String(user._id)).catch(() => undefined);
    await this.sendEmailCode(user).catch((err) =>
      this.logger.error(`No confirmation email for ${username}`, err),
    );

    await this.auditLogs.logAction(
      'REGISTER',
      'User',
      user._id,
      user.username,
      {},
      user._id,
    );

    return this.issueTokens(user);
  }

  private async assertEmailFree(address: string, exceptUserId?: string) {
    const owner = await this.userModel.findOne({
      email: address,
      emailVerified: true,
    });
    if (owner && String(owner._id) !== exceptUserId) {
      throw new BadRequestException(
        'That email already has an account. Log in instead.',
      );
    }
  }

  /** Stores a fresh 6-digit code for the account, hashed, and mails it. */
  private async sendEmailCode(user: UserDocument) {
    if (!user.email) throw new BadRequestException('Add an email first.');
    const code = String(crypto.randomInt(1_000_000)).padStart(6, '0');
    await this.userModel.updateOne(
      { _id: user._id },
      {
        $set: {
          emailCodeHash: hashRefreshToken(`${String(user._id)}:${code}`),
          emailCodeExpiry: Date.now() + EMAIL_CODE_LIFETIME_MS,
          emailCodeTries: 0,
        },
      },
    );
    // A member who has proven a judge is adding the address in Settings;
    // anyone else is still signing up.
    const member = user.isVerified || user.atcoderVerified;
    await this.mailCode(user, user.email, code, member ? 'settings' : 'signup');
  }

  private async mailCode(
    user: UserDocument,
    to: string,
    code: string,
    purpose: CodePurpose,
  ) {
    if (
      !mailConfigured(this.config) &&
      this.config.get<string>('NODE_ENV') !== 'production'
    ) {
      // A developer without a mailbox reads the code from the server log.
      this.logger.warn(`Email code for ${user.username}: ${code}`);
      return;
    }
    await sendMail(
      this.config,
      to,
      renderCodeEmail(
        user.username,
        code,
        this.config.get<string>('APP_URL') ?? '',
        purpose,
      ),
    );
  }

  /** `sendEmailCode` for a request: at most one a minute, and a readable failure. */
  private async requestEmailCode(user: UserDocument) {
    const limit = await this.rateLimit(String(user._id), emailCodeLimiter);
    if (!limit.success) {
      throw new HttpException(
        `Wait ${limit.remainingSeconds} seconds before asking for another code.`,
        429,
      );
    }
    try {
      await this.sendEmailCode(user);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`No confirmation email for ${user.username}`, err);
      throw new ServiceUnavailableException(
        'We could not send the email. Try again in a minute.',
      );
    }
  }

  async resendEmailCode(user: UserDocument) {
    if (user.emailVerified)
      throw new BadRequestException('Your email is already confirmed.');
    await this.requestEmailCode(user);
    return { user: toPublicUser(user) };
  }

  /**
   * Sets the address to confirm and mails its code.
   * ponytail: only while no address is confirmed. Changing a confirmed one
   * needs the password again, which comes with reset-by-email.
   */
  async setEmail(user: UserDocument, email: string) {
    if (user.emailVerified) {
      throw new BadRequestException('Your email is already confirmed.');
    }
    const address = email.trim().toLowerCase();
    await this.assertEmailFree(address, String(user._id));
    const updated = await this.userModel.findByIdAndUpdate(
      user._id,
      { $set: { email: address, emailVerified: false } },
      { returnDocument: 'after' },
    );
    if (!updated) throw new UnauthorizedException('Unauthorized');
    await this.requestEmailCode(updated);
    return { user: toPublicUser(updated) };
  }

  async confirmEmail(userId: string, code: string) {
    // Every attempt uses one of the tries, right or wrong, in one step, so
    // parallel guesses cannot get past the limit.
    const user = await this.userModel
      .findOneAndUpdate(
        {
          _id: userId,
          emailVerified: { $ne: true },
          emailCodeExpiry: { $gt: Date.now() },
          emailCodeTries: { $lt: EMAIL_CODE_TRIES },
        },
        { $inc: { emailCodeTries: 1 } },
      )
      .select('+emailCodeHash');
    if (!user?.emailCodeHash) {
      throw new BadRequestException(
        'That code has expired. Ask for a new one.',
      );
    }
    const given = Buffer.from(hashRefreshToken(`${userId}:${code}`));
    if (!crypto.timingSafeEqual(given, Buffer.from(user.emailCodeHash))) {
      throw new BadRequestException(
        'That code is not right. Check the email and try again.',
      );
    }
    try {
      const updated = await this.userModel.findByIdAndUpdate(
        userId,
        {
          $set: {
            emailVerified: true,
            emailCodeHash: null,
            emailCodeExpiry: null,
            emailCodeTries: 0,
          },
        },
        { returnDocument: 'after' },
      );
      return { user: toPublicUser(updated) };
    } catch (err) {
      if (isDuplicateKey(err)) {
        throw new BadRequestException(
          'That email already has an account. Log in instead.',
        );
      }
      throw err;
    }
  }

  /**
   * Sets the account's Codeforces handle, with its rating and photo. It can
   * be corrected until it is proven; after that it stays.
   */
  async connectCodeforces(user: UserDocument, handle: string) {
    if (user.codeforcesHandle && user.isVerified) {
      throw new BadRequestException(
        'This account already has a verified Codeforces handle.',
      );
    }
    const results = await fetchCodeforcesUserInfo(handle);
    if (!results || results.length === 0) {
      throw new BadRequestException('Invalid Codeforces handle');
    }
    const cfUser = results[0];
    // Codeforces answers with the handle in its own letter case.
    const codeforcesHandle: string = cfUser.handle ?? handle;
    const taken = 'That Codeforces handle is verified on another account.';
    const owner = await this.userModel
      .findOne({
        codeforcesHandle,
        isVerified: true,
        _id: { $ne: user._id },
      })
      .collation(NAME_COLLATION);
    if (owner) throw new BadRequestException(taken);

    const rating: number = Number(cfUser.rating) || 0;
    const maxRating: number = Number(cfUser.maxRating) || 0;
    try {
      const updated = await this.userModel.findByIdAndUpdate(
        user._id,
        {
          $set: {
            codeforcesHandle,
            rating,
            rank: cfUser.rank ?? getRankFromRating(rating),
            maxRating,
            maxRank:
              cfUser.maxRank ??
              (maxRating > 0 ? getRankFromRating(maxRating) : 'Unrated'),
            organization: cfUser.organization,
            avatar:
              cfUser.avatar ?? 'https://userpic.codeforces.org/no-avatar.jpg',
            lastSyncTime: Date.now(),
          },
        },
        { returnDocument: 'after' },
      );
      if (!updated) throw new UnauthorizedException('Unauthorized');
      return { user: toPublicUser(updated) };
    } catch (err) {
      if (isDuplicateKey(err)) throw new BadRequestException(taken);
      throw err;
    }
  }

  async login(codeforcesHandle: string, password: string, ip: string) {
    const rateLimitResult = await this.rateLimit(ip, loginLimiter);
    if (!rateLimitResult.success) {
      throw new UnauthorizedException(
        `Too many requests. Retry after ${rateLimitResult.remainingSeconds}s`,
      );
    }

    const user = await this.findByLogin(codeforcesHandle);

    // ponytail: check persistent DB lock before password check.
    if (user?.locked) {
      throw new HttpException('Account is locked', 423);
    }

    const ok = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !ok) {
      // Throttle repeated failures per-user with a TEMPORARY block (auto-clears
      // after blockDuration). We intentionally do NOT set a permanent DB lock
      // here: an attacker who knows a handle could otherwise lock any account
      // indefinitely (DoS). Permanent `locked` is reserved for admin action.
      if (user) {
        try {
          await loginUserLimiter.consume(String(user._id));
        } catch (err) {
          if (err instanceof RateLimiterRes) {
            throw new UnauthorizedException(
              'Too many failed attempts. Try again later.',
            );
          }
        }
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // ponytail: successful login — reset per-user fail counter.
    await loginUserLimiter.delete(String(user._id));

    await this.auditLogs.logAction(
      'LOGIN',
      'User',
      user._id,
      user.codeforcesHandle,
      { ip, role: user.role },
      user._id,
    );

    return this.issueTokens(user);
  }

  /**
   * Starts a password reset. An account with a confirmed email gets a 6-digit
   * code by mail; one without proves itself on its Codeforces profile, as
   * every account did before sign-up asked for an email.
   */
  async initiateReset(name: string, via?: 'codeforces') {
    if (!name) throw new BadRequestException('Enter your username or email.');
    const user = await this.findByLogin(name);
    if (!user || user.locked)
      throw new BadRequestException('Account unavailable');

    const hasEmail = Boolean(user.email && user.emailVerified);
    // A handle nobody has proven must not open an account that has an email:
    // whoever really owns that handle could take the account over.
    const canUseCodeforces = Boolean(
      user.codeforcesHandle && (user.isVerified || !hasEmail),
    );
    const byEmail = hasEmail && !(via === 'codeforces' && canUseCodeforces);
    if (!byEmail && !canUseCodeforces) {
      throw new BadRequestException(
        'This account has no confirmed email and no Codeforces handle to prove it with. Write to us and we will help.',
      );
    }
    if (byEmail) {
      const limit = await this.rateLimit(
        `reset:${String(user._id)}`,
        emailCodeLimiter,
      );
      if (!limit.success) {
        throw new HttpException(
          `Wait ${limit.remainingSeconds} seconds before asking for another code.`,
          429,
        );
      }
    }

    const code = byEmail
      ? String(crypto.randomInt(1_000_000)).padStart(6, '0')
      : crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_LIFETIME_MS);
    const challenge = await this.resetChallengeModel.create({
      userId: user._id,
      authVersion: user.authVersion ?? 0,
      codeHash: hashRefreshToken(code),
      expiresAt,
      cleanupAt: new Date(expiresAt.getTime() + RESET_LIFETIME_MS),
    });
    const verificationToken = await this.jwt.signAsync(
      {
        userId: String(user._id),
        challengeId: String(challenge._id),
        type: byEmail ? 'email-proof-v1' : 'profile-proof-v2',
      },
      { expiresIn: '10m', secret: this.resetSecret },
    );
    if (!byEmail)
      return {
        method: 'codeforces' as const,
        verificationToken,
        code,
        expiresAt,
      };

    try {
      await this.mailCode(user, user.email!, code, 'reset');
    } catch (err) {
      this.logger.error(`No reset email for ${user.username}`, err);
      throw new ServiceUnavailableException(
        'We could not send the email. Try again in a minute.',
      );
    }
    const [box, domain] = user.email!.split('@');
    return {
      method: 'email' as const,
      verificationToken,
      expiresAt,
      // Enough to recognise the address, not enough to learn it.
      sentTo: `${box[0]}•••@${domain}`,
      canUseCodeforces,
    };
  }

  private async decodeResetToken(token: string, purpose: string) {
    try {
      const decoded = await this.jwt.verifyAsync<{
        userId: string;
        challengeId: string;
        type: string;
      }>(token, {
        algorithms: ['HS256'],
        secret: this.resetSecret,
      });
      if (
        decoded.type !== purpose ||
        !Types.ObjectId.isValid(decoded.userId) ||
        !Types.ObjectId.isValid(decoded.challengeId)
      )
        throw new Error('Wrong purpose');
      return decoded;
    } catch {
      throw new BadRequestException(
        'Invalid or expired recovery token. Restart password recovery.',
      );
    }
  }

  async verifyResetProfile(verificationToken: string) {
    const decoded = await this.decodeResetToken(
      verificationToken,
      'profile-proof-v2',
    );
    const challenge = await this.resetChallengeModel.findOne({
      _id: decoded.challengeId,
      userId: decoded.userId,
    });
    const user = await this.userModel.findById(decoded.userId);
    if (
      !challenge ||
      !user ||
      user.locked ||
      challenge.consumedAt ||
      challenge.expiresAt.getTime() <= Date.now() ||
      challenge.authVersion !== (user.authVersion ?? 0)
    ) {
      throw new BadRequestException(
        'Invalid or expired profile challenge. Restart password recovery.',
      );
    }
    let matched = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      const info = await fetchCodeforcesUserInfo(user.codeforcesHandle);
      const firstName: unknown = info?.[0]?.firstName;
      if (
        typeof firstName === 'string' &&
        hashRefreshToken(firstName) === challenge.codeHash
      ) {
        matched = true;
        break;
      }
      if (attempt < 2)
        await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    if (!matched)
      throw new BadRequestException(
        'Set your Codeforces first name to the recovery code, save your profile, then try again.',
      );
    return this.grantReset(decoded);
  }

  /** The emailed 6-digit code, typed back. Five wrong guesses end the challenge. */
  async verifyResetEmail(verificationToken: string, code: string) {
    const decoded = await this.decodeResetToken(
      verificationToken,
      'email-proof-v1',
    );
    // Each attempt is counted before it is checked, in one step.
    const challenge = await this.resetChallengeModel.findOneAndUpdate(
      {
        _id: decoded.challengeId,
        userId: decoded.userId,
        consumedAt: null,
        resetExpiresAt: null,
        expiresAt: { $gt: new Date() },
        tries: { $lt: EMAIL_CODE_TRIES },
      },
      { $inc: { tries: 1 } },
    );
    const user = await this.userModel.findById(decoded.userId);
    if (
      !challenge ||
      !user ||
      user.locked ||
      challenge.authVersion !== (user.authVersion ?? 0)
    ) {
      throw new BadRequestException(
        'That code has expired. Restart password recovery.',
      );
    }
    const given = Buffer.from(hashRefreshToken(code));
    if (!crypto.timingSafeEqual(given, Buffer.from(challenge.codeHash))) {
      throw new BadRequestException(
        'That code is not right. Check the email and try again.',
      );
    }
    return this.grantReset(decoded);
  }

  /** A proven challenge becomes a short-lived token that may set one new password. */
  private async grantReset(decoded: { userId: string; challengeId: string }) {
    const verified = await this.resetChallengeModel.findOneAndUpdate(
      {
        _id: decoded.challengeId,
        consumedAt: null,
        expiresAt: { $gt: new Date() },
        resetExpiresAt: null,
      },
      { $set: { resetExpiresAt: new Date(Date.now() + RESET_LIFETIME_MS) } },
      { returnDocument: 'after' },
    );
    const current =
      verified ??
      (await this.resetChallengeModel.findById(decoded.challengeId));
    if (
      !current?.resetExpiresAt ||
      current.consumedAt ||
      current.resetExpiresAt.getTime() <= Date.now()
    )
      throw new BadRequestException('Recovery proof expired');
    const resetToken = await this.jwt.signAsync(
      {
        userId: decoded.userId,
        challengeId: decoded.challengeId,
        type: 'password-reset-v2',
        iat: Math.floor(Date.now() / 1000),
      },
      {
        secret: this.resetSecret,
        expiresIn:
          Math.floor(current.resetExpiresAt.getTime() / 1000) -
          Math.floor(Date.now() / 1000),
      },
    );
    return { success: true, resetToken, expiresAt: current.resetExpiresAt };
  }

  async resetPassword(
    userId: string | undefined,
    body: { resetToken?: string; newPassword?: string; oldPassword?: string },
  ) {
    if (
      !body.newPassword ||
      (body.resetToken !== undefined && body.oldPassword !== undefined)
    )
      throw new BadRequestException(
        'Provide a new password and either a recovery token or your current password.',
      );
    const validation = validatePassword(body.newPassword);
    if (!validation.isValid)
      throw new BadRequestException(validation.errors.join('. '));
    const decoded = body.resetToken
      ? await this.decodeResetToken(body.resetToken, 'password-reset-v2')
      : null;
    if (!decoded && (!userId || !body.oldPassword))
      throw new UnauthorizedException('Current password is required');
    const targetId = decoded?.userId ?? userId!;
    const user = await this.userModel.findById(targetId);
    if (!user || user.locked)
      throw new BadRequestException('Account unavailable');
    if (!decoded && !(await bcrypt.compare(body.oldPassword!, user.password)))
      throw new UnauthorizedException('Incorrect current password.');
    const password = await bcrypt.hash(body.newPassword, 10);
    await this.transactions.run(async () => {
      if (decoded) {
        const claimed = await this.resetChallengeModel.findOneAndUpdate(
          {
            _id: decoded.challengeId,
            userId: user._id,
            authVersion: user.authVersion ?? 0,
            consumedAt: null,
            resetExpiresAt: { $gt: new Date() },
          },
          { $set: { consumedAt: new Date() } },
        );
        if (!claimed)
          throw new BadRequestException('Invalid or expired reset token');
      }
      const updated = await this.userModel.updateOne(
        {
          _id: user._id,
          locked: { $ne: true },
          password: user.password,
          $or: [
            { authVersion: user.authVersion ?? 0 },
            ...((user.authVersion ?? 0) === 0
              ? [{ authVersion: { $exists: false } }]
              : []),
          ],
        },
        { $set: { password }, $inc: { authVersion: 1 } },
      );
      if (!updated.modifiedCount)
        throw new BadRequestException(
          'Account changed. Restart password recovery.',
        );
      await this.revokeRefreshSessions(user._id);
    });
    return { message: 'Password has been reset successfully.' };
  }

  private async revokeRefreshSessions(userId: Types.ObjectId) {
    await this.refreshTokenModel.updateMany(
      { userId, revoked: false },
      { $set: { revoked: true, revokedAt: new Date() } },
    );
  }

  async setAccountLocked(userId: string, locked: boolean) {
    await this.transactions.run(async () => {
      await this.userModel.updateOne(
        { _id: userId },
        { $set: { locked }, $inc: { authVersion: 1 } },
      );
      await this.revokeRefreshSessions(new Types.ObjectId(userId));
    });
  }

  async syncProfile(user: UserDocument) {
    if (!user.codeforcesHandle || !shouldSyncProfile(user.lastSyncTime)) {
      return {
        message: 'Profile is up to date',
        user: toPublicUser(user),
      };
    }

    const results = await fetchCodeforcesUserInfo(user.codeforcesHandle);
    if (!results || results.length === 0) {
      throw new BadRequestException('Invalid Codeforces handle');
    }
    const cfUser = results[0];

    const currentRating: number = Number(cfUser.rating) || 0;
    const currentRank = cfUser.rank ?? getRankFromRating(currentRating);
    const maxRating: number = Number(cfUser.maxRating) || 0;
    const maxRank = cfUser.maxRank ?? getRankFromRating(maxRating);

    const updatedUser = await this.userModel.findByIdAndUpdate(
      user._id,
      {
        rating: currentRating,
        rank: currentRank,
        maxRating,
        maxRank,
        organization: cfUser.organization,
        lastSyncTime: Date.now(),
        avatar: cfUser.avatar ?? user.avatar,
      },
      { returnDocument: 'after' },
    );

    return {
      message: 'Profile synced successfully',
      user: toPublicUser(updatedUser),
    };
  }

  /** Partial: only the fields sent are changed. The DTO has validated them. */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const set: Record<string, string> = {};
    for (const key of ['displayName', 'bio', 'glyphAvatar'] as const) {
      if (dto[key] !== undefined) set[key] = dto[key];
    }
    // Paths come from our own key list, never from the request.
    for (const key of LINK_KEYS) {
      const value = dto.links?.[key];
      if (value !== undefined) set[`links.${key}`] = value;
    }
    // A different AtCoder handle is one nobody has proven yet.
    const atcoder = dto.links?.atcoder;
    if (atcoder !== undefined) {
      const current = await this.userModel.findById(userId);
      const stored = current?.links?.atcoder ?? '';
      if (stored.toLowerCase() !== atcoder.toLowerCase())
        (set as Record<string, unknown>).atcoderVerified = false;
    }
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: set },
      { returnDocument: 'after' },
    );
    if (!user) throw new UnauthorizedException('Unauthorized');
    return { user: toPublicUser(user) };
  }

  private async issueTokens(user: UserDocument) {
    const accessToken = await this.jwt.signAsync({
      userId: user._id,
      type: 'access',
      authVersion: user.authVersion ?? 0,
    });

    const refreshTokenValue = generateRefreshToken();
    const hashedToken = hashRefreshToken(refreshTokenValue);
    const jti = crypto.randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.refreshTokenModel.create({
      jti,
      userId: user._id,
      token: hashedToken,
      expiresAt,
      revoked: false,
      authVersion: user.authVersion ?? 0,
    });

    return {
      user: toPublicUser(user),
      token: accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  async refresh(refreshTokenValue: string, ip: string, userAgent: string) {
    if (!refreshTokenValue) throw new UnauthorizedException('Missing refresh');

    const rateLimitResult = await this.rateLimit(ip, refreshLimiter);
    if (!rateLimitResult.success) {
      throw new UnauthorizedException(
        `Too many refresh attempts. Retry after ${rateLimitResult.remainingSeconds}s`,
      );
    }

    const hashed = hashRefreshToken(refreshTokenValue);
    const result = await this.transactions.run(async () => {
      const tokenDoc = await this.refreshTokenModel.findOne({ token: hashed });
      if (!tokenDoc || tokenDoc.expiresAt <= new Date()) return null;
      const user = await this.userModel.findById(tokenDoc.userId);
      if (
        !user ||
        user.locked ||
        (user.authVersion ?? 0) !== (tokenDoc.authVersion ?? 0)
      )
        return null;
      if (tokenDoc.revoked) {
        const revokedAgo = tokenDoc.revokedAt
          ? Date.now() - tokenDoc.revokedAt.getTime()
          : Infinity;
        if (revokedAgo > 60_000)
          await this.revokeRefreshSessions(tokenDoc.userId);
        return null; // Commit theft revocation before rejecting the request.
      }
      const claimed = await this.refreshTokenModel.updateOne(
        { _id: tokenDoc._id, revoked: false },
        { $set: { revoked: true, revokedAt: new Date() } },
      );
      if (!claimed.modifiedCount) return null;
      const newRefreshTokenValue = generateRefreshToken();
      await this.refreshTokenModel.create({
        jti: crypto.randomUUID(),
        userId: user._id,
        token: hashRefreshToken(newRefreshTokenValue),
        expiresAt: new Date(Date.now() + 30 * 86_400_000),
        deviceInfo: (userAgent || 'unknown').substring(0, 100),
        ipAddress: ip,
        revoked: false,
        authVersion: user.authVersion ?? 0,
      });
      const accessToken = await this.jwt.signAsync({
        userId: user._id,
        type: 'access',
        authVersion: user.authVersion ?? 0,
      });
      return {
        user: toPublicUser(user),
        token: accessToken,
        refreshToken: newRefreshTokenValue,
      };
    });
    if (!result) throw new UnauthorizedException('Invalid refresh');
    return result;
  }

  async generateVerificationCode(userId: string) {
    const code = crypto.randomBytes(4).toString('hex');
    // Long enough to open Codeforces, log in there, paste the code and save.
    // The sign-up step shows the code as soon as it opens.
    const expiresAt = Date.now() + 10 * 60 * 1000;

    await this.userModel.findByIdAndUpdate(userId, {
      verificationCode: code,
      verificationCodeExpiry: expiresAt,
    });

    return { code, expiresAt };
  }

  async verifyCodeforcesProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    if (user.isVerified) {
      return {
        message: 'Profile is already verified',
        user: toPublicUser(user),
      };
    }
    if (!user.codeforcesHandle) {
      throw new BadRequestException('Connect a Codeforces handle first.');
    }

    if (!user.verificationCode) {
      throw new BadRequestException(
        'No verification code found. Please generate one first.',
      );
    }

    if (
      user.verificationCodeExpiry &&
      Date.now() > user.verificationCodeExpiry
    ) {
      throw new BadRequestException(
        'Verification code has expired. Please generate a new one.',
      );
    }

    // Codeforces API may cache profile data for a few seconds after the user
    // saves. Retry up to 3 times with 1.5s gaps so a save-then-immediately-
    // verify flow succeeds without requiring a manual second attempt.
    const MAX_ATTEMPTS = 3;
    const RETRY_DELAY = 1500;
    let firstName = '';

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const results = await fetchCodeforcesUserInfo(user.codeforcesHandle);
      if (!results || results.length === 0) {
        throw new BadRequestException('Invalid Codeforces handle');
      }
      firstName = (results[0].firstName ?? '').trim();
      if (firstName === user.verificationCode) break;
      if (attempt < MAX_ATTEMPTS - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY));
      }
    }

    if (firstName !== user.verificationCode) {
      throw new BadRequestException(
        'Verification code not found in your Codeforces first name. Make sure you saved the changes on Codeforces, then try again.',
      );
    }

    await this.claimHandle('Codeforces', () =>
      this.userModel.updateOne(
        {
          _id: userId,
          isVerified: false,
          verificationCode: user.verificationCode,
        },
        // The code stays until it runs out: the same one proves AtCoder.
        { $set: { isVerified: true } },
      ),
    );
    return {
      message: 'Profile verified successfully',
      user: toPublicUser(await this.userModel.findById(userId)),
    };
  }

  /** A proven handle belongs to one account: the second to prove it is told so. */
  private async claimHandle(judge: string, write: () => Promise<unknown>) {
    try {
      await write();
    } catch (err) {
      if (isDuplicateKey(err)) {
        throw new BadRequestException(
          `That ${judge} handle is verified on another account.`,
        );
      }
      throw err;
    }
  }

  private atcoderClient() {
    const site = this.config.get<string>('APP_URL');
    return `UpsolveIt/1.0 (handle check${site ? `; +${site}` : ''})`;
  }

  /** Sets the account's AtCoder handle, once AtCoder confirms it exists. Unproven until verified. */
  async connectAtcoder(user: UserDocument, handle: string) {
    const profile = await readAtcoderProfile(handle, this.atcoderClient());
    if (!profile) {
      throw new BadRequestException('No AtCoder user has that handle.');
    }
    const updated = await this.userModel.findByIdAndUpdate(
      user._id,
      { $set: { 'links.atcoder': profile.handle, atcoderVerified: false } },
      { returnDocument: 'after' },
    );
    if (!updated) throw new UnauthorizedException('Unauthorized');
    return { user: toPublicUser(updated) };
  }

  /**
   * AtCoder profiles have no first name to borrow, so the code goes into the
   * Affiliation field, which the profile page shows to everyone.
   */
  async verifyAtcoderProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    if (user.atcoderVerified) return { user: toPublicUser(user) };
    const handle = user.links?.atcoder;
    if (!handle)
      throw new BadRequestException('Connect an AtCoder handle first.');
    if (!user.verificationCode) {
      throw new BadRequestException(
        'No verification code found. Please generate one first.',
      );
    }
    if (
      user.verificationCodeExpiry &&
      Date.now() > user.verificationCodeExpiry
    ) {
      throw new BadRequestException(
        'Verification code has expired. Please generate a new one.',
      );
    }
    const profile = await readAtcoderProfile(handle, this.atcoderClient());
    if (profile?.affiliation !== user.verificationCode) {
      throw new BadRequestException(
        'Verification code not found in your AtCoder affiliation. Make sure you saved the changes on AtCoder, then try again.',
      );
    }
    await this.claimHandle('AtCoder', () =>
      this.userModel.updateOne(
        { _id: userId, 'links.atcoder': handle },
        { $set: { atcoderVerified: true } },
      ),
    );
    return { user: toPublicUser(await this.userModel.findById(userId)) };
  }

  async logout(refreshTokenValue: string) {
    if (!refreshTokenValue) return;
    const hashed = hashRefreshToken(refreshTokenValue);
    await this.refreshTokenModel.updateMany(
      { token: hashed, revoked: false },
      { $set: { revoked: true, revokedAt: new Date() } },
    );
  }
}
