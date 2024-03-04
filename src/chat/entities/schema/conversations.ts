import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Users, WorkSpaces } from 'src/auth/entities';
import { Tag } from '../../../tags/entities/tag.entity';
import {
  CONVERSATION_CHANNEL,
  CONVERSATION_STATUS,
  CONVERSATION_TYPE,
} from '../constants';
import { Messages } from './message';

@Schema({ timestamps: true })
export class Conversations extends Document {
  _id?: string;
  id?: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: WorkSpaces.name })
  workspace: WorkSpaces | string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Users.name })
  root_account: Users | string;
  @Prop({
    enum: Object.values(CONVERSATION_TYPE),
    default: CONVERSATION_TYPE.SINGLE,
  })
  type: string;

  @Prop({
    enum: Object.values(CONVERSATION_CHANNEL),
    default: CONVERSATION_CHANNEL.CHAT,
  })
  channel: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Users.name })
  created_by: Users | string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Users.name }],
    default: [],
  })
  assigned_to: Users[] | string[] | null;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Users.name,
    default: null,
  })
  lead: Users | string | null;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Users.name }],
    default: [],
  })
  participants: [Users] | [string];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: Users.name }],
    default: [],
  })
  admins: [Users] | [string];

  @Prop({
    enum: Object.values(CONVERSATION_STATUS),
    default: CONVERSATION_STATUS.OPEN,
  })
  status: string;

  @Prop({ type: 'String', default: null })
  title: string | null;

  @Prop({ type: mongoose.Types.ObjectId, ref: Messages.name, default: null })
  last_message: Messages | null;

  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: Tag.name }] })
  tags: Tag[] | string[];

  updatedAt: string;
  messages?: Messages[];
}
export const ConversationsSchema = SchemaFactory.createForClass(Conversations);
