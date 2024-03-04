import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Users, WorkSpaces } from 'src/auth/entities';

export enum ActivityLogType {
  CALL = 'Call',
  EMAIL = 'Email',
  TASK = 'Task',
  NOTE = 'Note',
  CHAT = 'Chat',
  TAG = 'Tag',
}

export enum ActivityLogAction {
  CREATED = 'Created',
  UPDATED = 'Updated',
  DELETED = 'Deleted',
  ASSIGNED = 'Assigned',
  UNASSIGNED = 'Unassigned',
  ARCHIVED = 'Archived',
  SENT = 'Sent',
}

@Schema({
  timestamps: true,
})
export class ActivityLog extends Document {
  @Prop({
    required: true,
    enum: ActivityLogType,
    default: ActivityLogType.CHAT,
  })
  type: ActivityLogType;

  @Prop({
    required: true,
    enum: ActivityLogAction,
    default: ActivityLogAction.CREATED,
  })
  action: ActivityLogAction;

  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: Users.name })
  contact: Users;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: Users.name })
  created_by: Users;

  @Prop({ type: mongoose.Types.ObjectId, ref: WorkSpaces.name })
  workspace: WorkSpaces | string;
}

export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);
