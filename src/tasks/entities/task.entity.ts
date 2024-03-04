import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Users } from 'src/auth/entities';
import { TASK_STATUS } from '../types';

@Schema({ timestamps: true })
export class Task extends Document {
  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  workspaceId: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String, default: null })
  description: string;

  @Prop({ type: String, default: null })
  priority: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Users', default: null })
  assignedUser: Users;

  @Prop({
    type: String,
    enum: TASK_STATUS,
    default: TASK_STATUS.TODO,
  })
  status: TASK_STATUS;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Users', default: null })
  createdBy: Users;

  @Prop({ type: Date, default: null })
  dueDate: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
