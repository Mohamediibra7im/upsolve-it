import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export const AUDIENCES = ['everyone', 'members'] as const;
export type Audience = (typeof AUDIENCES)[number];

export type AnnouncementDocument = HydratedDocument<Announcement>;

@Schema({ timestamps: true })
export class Announcement {
  @Prop({ required: true })
  title!: string;

  /** Plain text with line breaks. Never rendered as HTML. */
  @Prop({ required: true })
  message!: string;

  @Prop({ type: String, default: null })
  actionLabel!: string | null;

  /** An internal path or an https:// address: see isActionUrl. */
  @Prop({ type: String, default: null })
  actionUrl!: string | null;

  /** `members` is shown to signed-in visitors only. */
  @Prop({ type: String, enum: AUDIENCES, default: 'everyone' })
  audience!: Audience;

  @Prop({ type: Date, default: null })
  startsAt!: Date | null;

  @Prop({ type: Date, default: null })
  endsAt!: Date | null;

  @Prop({ default: false })
  published!: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);

AnnouncementSchema.index({ published: 1, createdAt: -1 });
