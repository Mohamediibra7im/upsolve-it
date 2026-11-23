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
  'codechef',
] as const;
export type LinkKey = (typeof LINK_KEYS)[number];

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  codeforcesHandle!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: 0 })
  rating!: number;

  @Prop({ required: true })
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

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ type: String, default: null })
  verificationCode!: string | null;

  @Prop({ type: Number, default: null })
  verificationCodeExpiry!: number | null;

  @Prop({ default: false })
  locked!: boolean;

  @Prop({ default: 0 })
  authVersion!: number;

  /** Address for the weekly upsolve reminder. Private: never selected by default. */
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

// Enforce case-insensitive uniqueness on codeforcesHandle
UserSchema.index(
  { codeforcesHandle: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);
