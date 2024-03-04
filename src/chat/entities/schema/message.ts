import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import { Users } from 'src/auth/entities';
import { ATTACHMENT_TYPE, MESSAGE_TYPE } from '../constants';
import { Conversations } from './conversations';

import { Tag } from '../../../tags/entities/tag.entity';

@Schema({ _id: false })
export class Attachments {
  @Prop({
    enum: [
      ATTACHMENT_TYPE.AUDIO,
      ATTACHMENT_TYPE.CODE_SNIPPET,
      ATTACHMENT_TYPE.FILE,
      ATTACHMENT_TYPE.IMAGE,
      ATTACHMENT_TYPE.STICKER,
      ATTACHMENT_TYPE.VIDEO,
    ],
    default: null,
  })
  type: string;
  @Prop({ type: String, default: null })
  attachment_name: string | null;
  @Prop({ type: String, default: null })
  attachment_url: string | null;
}

export const AttachmentsSchema = SchemaFactory.createForClass(Attachments);

@Schema({ _id: false })
export class Prompt extends Document {
  @Prop({ type: String, default: null })
  title: string;

  @Prop({ type: Boolean, default: false })
  submitted: boolean;

  @Prop({ type: String })
  value: string;
}
const PromptSchema = SchemaFactory.createForClass(Prompt);

@Schema({ _id: false })
export class Content extends Document {
  @Prop({ type: String })
  text: string;
  @Prop({ type: 'Mixed' })
  payload: any;
}

const ContentSchema = SchemaFactory.createForClass(Content);

@Schema({ timestamps: true })
export class Messages extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'Conversations' })
  conversation: Conversations | string;

  @Prop({ type: mongoose.Types.ObjectId, ref: Users.name })
  sender: Users | string | ObjectId;

  @Prop({
    enum: [
      MESSAGE_TYPE.ARTICLE,
      MESSAGE_TYPE.INFO,
      MESSAGE_TYPE.NOTE,
      MESSAGE_TYPE.TEXT,
      MESSAGE_TYPE.WARNING,
      MESSAGE_TYPE.PROMPT,
      MESSAGE_TYPE.SURVEY_ANSWER,
      MESSAGE_TYPE.REPLY,
      MESSAGE_TYPE.SWITCH_TO_AGENT,
      MESSAGE_TYPE.SWITCH_TO_BOT,
    ],
    default: MESSAGE_TYPE.TEXT,
  })
  type: string;

  @Prop({ type: ContentSchema, default: null })
  content: Content | null;

  @Prop({ type: [AttachmentsSchema], default: [] })
  attachments: Attachments[];

  @Prop({ type: PromptSchema, default: () => ({}) })
  prompt: Prompt;

  @Prop({ type: Boolean, default: false })
  seen: boolean;

  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: Tag.name }] })
  tags: Tag[] | string[];

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const MessagesSchema = SchemaFactory.createForClass(Messages).index({
  '$**': 'text',
});
