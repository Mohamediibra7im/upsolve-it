import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, SchemaTypes } from 'mongoose';
import { JUDGES, type ContestId, type Judge } from './judge';

export const NOTE_MAX_LENGTH = 2000;

export const UPSOLVE_SOURCES = ['failed', 'unattempted', 'manual'] as const;
export type UpsolveSource = (typeof UPSOLVE_SOURCES)[number];

export type UpsolvedProblemDocument = HydratedDocument<UpsolvedProblem>;

@Schema({ timestamps: false })
export class UpsolvedProblem {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user!: Types.ObjectId;

  @Prop({ type: String, enum: JUDGES, default: 'codeforces' })
  judge!: Judge;

  /** A number on Codeforces, a name such as "abc300" on AtCoder. */
  @Prop({ type: SchemaTypes.Mixed, required: true })
  contestId!: ContestId;

  @Prop({ required: true })
  index!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  rating!: number;

  @Prop({ type: [String], required: true })
  tags!: string[];

  @Prop({ required: true })
  url!: string;

  @Prop({ type: Number, default: null })
  solvedTime!: number | null;

  /** How it got here: tried and failed, pasted as a link, or next in a contest. */
  @Prop({ type: String, enum: UPSOLVE_SOURCES, default: 'failed' })
  source!: UpsolveSource;

  /** The user's own words about the problem: why it failed, the key idea. */
  @Prop({ type: String, default: '', maxlength: NOTE_MAX_LENGTH })
  note!: string;

  /**
   * When the solved problem comes back to be solved again; null when nothing
   * is scheduled. Set on solving, moved on by a passed re-solve.
   */
  @Prop({ type: Date, default: null })
  resolveDueAt!: Date | null;

  /** 1 while the 7-day re-solve is ahead, 2 for the 30-day one, 0 for none. */
  @Prop({ type: Number, default: 0 })
  resolveStage!: number;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const UpsolvedProblemSchema =
  SchemaFactory.createForClass(UpsolvedProblem);
UpsolvedProblemSchema.index(
  { user: 1, judge: 1, contestId: 1, index: 1 },
  { unique: true },
);
