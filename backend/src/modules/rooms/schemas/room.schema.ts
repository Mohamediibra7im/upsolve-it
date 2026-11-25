import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, SchemaTypes, Types } from 'mongoose';
import type {
  CustomRatingsDto,
  TrainingProblemDto,
} from '../../trainings/dto/create-training.dto';
import type { TrainingMode } from '../../trainings/schemas/training.schema';

export const MAX_MEMBERS = 8;
export const ROOM_TTL_SECONDS = 48 * 60 * 60;

/** `ended` is never stored: a running room is ended once its time is up. */
export type RoomStatus = 'lobby' | 'running' | 'closed';

export type RoomMember = {
  user: Types.ObjectId;
  joinedAt: number;
  solved: string[];
  tried: string[];
  /** Problem id to the moment the server first saw it solved, in ms. */
  solvedAt?: Record<string, number>;
};

const MemberSchema = new MongooseSchema(
  {
    user: { type: SchemaTypes.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Number, required: true },
    solved: { type: [String], default: [] },
    tried: { type: [String], default: [] },
    solvedAt: { type: SchemaTypes.Mixed, default: {} },
  },
  { _id: false },
);

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Room {
  @Prop({ required: true, unique: true })
  code!: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  host!: Types.ObjectId;

  @Prop({ type: String, required: true })
  trainingMode!: TrainingMode;

  @Prop({ type: String, default: '' })
  level!: string;

  @Prop({ required: true })
  durationMinutes!: number;

  @Prop({ required: true })
  showRatings!: boolean;

  @Prop({ type: SchemaTypes.Mixed })
  customRatings?: CustomRatingsDto;

  /** As the host sent them. */
  @Prop({ type: [SchemaTypes.Mixed], required: true })
  problems!: TrainingProblemDto[];

  @Prop({
    type: String,
    enum: ['lobby', 'running', 'closed'],
    default: 'lobby',
  })
  status!: RoomStatus;

  @Prop({ type: Number, default: null })
  startTime!: number | null;

  @Prop({ type: Number, default: null })
  endTime!: number | null;

  @Prop({ type: [MemberSchema], default: [] })
  members!: RoomMember[];

  createdAt!: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

// Mongo removes a room 48 hours after it was made.
RoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: ROOM_TTL_SECONDS });
