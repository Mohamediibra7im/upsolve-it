import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes } from 'mongoose';
import { JUDGES, type ContestId, type Judge } from '../upsolve/schemas/judge';
import type { StatementSection } from './statement-parser';

export type ProblemStatementDocument = HydratedDocument<ProblemStatement>;

/**
 * A judge's problem statement, cleaned and kept so that the judge is asked
 * for each problem once, not once per reader.
 */
@Schema({ timestamps: false })
export class ProblemStatement {
  @Prop({ type: String, enum: JUDGES, required: true })
  judge!: Judge;

  @Prop({ type: SchemaTypes.Mixed, required: true })
  contestId!: ContestId;

  @Prop({ required: true })
  index!: string;

  @Prop({ default: '' })
  title!: string;

  @Prop({ default: '' })
  timeLimit!: string;

  @Prop({ default: '' })
  memoryLimit!: string;

  /** The statement in parts: story, input, output, note… as cleaned HTML. */
  @Prop({
    type: [{ kind: String, title: String, html: String, _id: false }],
    default: [],
  })
  sections!: StatementSection[];

  @Prop({
    type: [{ input: String, output: String, note: String, _id: false }],
    default: [],
  })
  samples!: { input: string; output: string; note?: string }[];

  /** The parser that made this copy; an older one is read again. */
  @Prop({ default: 0 })
  version!: number;

  /** The page it was read from, shown next to it as its source. */
  @Prop({ required: true })
  sourceUrl!: string;

  @Prop({ default: Date.now })
  fetchedAt!: Date;
}

export const ProblemStatementSchema =
  SchemaFactory.createForClass(ProblemStatement);
ProblemStatementSchema.index(
  { judge: 1, contestId: 1, index: 1 },
  { unique: true },
);
