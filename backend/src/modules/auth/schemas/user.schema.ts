import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

/** The profile links a user may fill in. `website` is a URL; the rest are usernames. */
export const LINK_KEYS = [
  'github',
  'linkedin',
  'x',
  'website',
  'atcoder',
  'leetcode',
] as const;
export type LinkKey = (typeof LINK_KEYS)[number];

@Schema({ timestamps: true })
export class User {
  /**
   * What the account logs in with and is known by. An account made before
   * usernames existed has its Codeforces handle here, so it logs in as before.
   */
  @Prop()
  username!: string;

  /**
   * Connected in the last sign-up step. Absent on an account that proved
   * itself with AtCoder alone.
   * ponytail: still typed as always present, as every reader was written
   * when it was. Readers that an AtCoder-only account reaches guard it by
   * hand; make the type optional when the rest are done.
   */
  @Prop()
  codeforcesHandle!: string;

  /** Lower case. Private: only ever returned to the account itself. */
  @Prop({ type: String })
  email?: string;

  @Prop({ default: false })
  emailVerified!: boolean;

  /** The emailed 6-digit code, hashed, with when it stops working and how often it was tried. */
  @Prop({ type: String, default: null, select: false })
  emailCodeHash?: string | null;

  @Prop({ type: Number, default: null })
  emailCodeExpiry?: number | null;

  @Prop({ default: 0 })
  emailCodeTries!: number;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: 0 })
  rating!: number;

  /** The Codeforces photo. Empty until a handle is connected. */
  @Prop({ default: '' })
  avatar!: string;

  @Prop({ default: 'Unrated' })
  rank!: string;

  @Prop({ default: 0 })
  maxRating!: number;

  @Prop({ default: 'Unrated' })
  maxRank!: string;

  @Prop()
  organization?: string;

  @Prop({ default: 0 })
  lastSyncTime!: number;

  @Prop({ enum: ['user', 'admin'], default: 'user' })
  role!: 'user' | 'admin';

  /** The Codeforces handle was shown to be theirs. */
  @Prop({ default: false })
  isVerified!: boolean;

  /** The AtCoder handle in `links.atcoder` was shown to be theirs. */
  @Prop({ default: false })
  atcoderVerified!: boolean;

  @Prop({ type: String, default: null })
  verificationCode!: string | null;

  @Prop({ type: Number, default: null })
  verificationCodeExpiry!: number | null;

  @Prop({ default: false })
  locked!: boolean;

  @Prop({ default: 0 })
  authVersion!: number;

  /** The weekly upsolve reminder is on. It goes to the account's confirmed email. */
  @Prop({ default: false })
  weeklyReminder!: boolean;

  /**
   * The reminder's own address, from when it had one. Still used for an
   * account that subscribed then and has no confirmed email yet; nothing
   * writes it any more. Private: never selected by default.
   */
  @Prop({ type: String, default: null, select: false })
  reminderEmail?: string | null;

  @Prop({ default: false })
  reminderEmailVerified!: boolean;

  @Prop({ type: Date, default: null })
  lastReminderAt?: Date | null;

  /** Opt-in: only when true does GET /api/public-profile/:handle answer for this user. */
  @Prop({ default: false })
  publicProfile!: boolean;

  // Typed by the user and shown to other people. Written only through
  // PATCH /api/users/me/profile, which validates every value.
  @Prop({ default: '' })
  displayName!: string;

  @Prop({ default: '' })
  bio!: string;

  @Prop(
    raw(
      Object.fromEntries(
        LINK_KEYS.map((key) => [key, { type: String, default: '' }]),
      ),
    ),
  )
  links!: Record<LinkKey, string>;

  /** A glyph-avatar value ("v1:…"). Empty means: use the Codeforces photo. */
  @Prop({ default: '' })
  glyphAvatar!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

/** Names are compared without regard to case: "Tourist" and "tourist" are one account. */
export const NAME_COLLATION = { locale: 'en', strength: 2 } as const;

// Unique among the accounts that have one, so the index can be built before
// the accounts made earlier have been given theirs.
UserSchema.index(
  { username: 1 },
  {
    unique: true,
    collation: NAME_COLLATION,
    partialFilterExpression: { username: { $type: 'string' } },
  },
);

// One account per proven handle on each judge, whatever its letter case.
// A handle somebody only typed reserves nothing: the first account to prove
// it keeps it, so nobody can sit on a handle that is not theirs.
export const CODEFORCES_INDEX = { isVerified: true } as const;
UserSchema.index(
  { codeforcesHandle: 1 },
  {
    unique: true,
    collation: NAME_COLLATION,
    partialFilterExpression: CODEFORCES_INDEX,
  },
);
UserSchema.index(
  { 'links.atcoder': 1 },
  {
    unique: true,
    collation: NAME_COLLATION,
    partialFilterExpression: { atcoderVerified: true },
  },
);

// One account per confirmed address. An unconfirmed one reserves nothing,
// so nobody can block an address they do not own.
UserSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { emailVerified: true } },
);
