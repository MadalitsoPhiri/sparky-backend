import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import { Users, WidgetConfig, WorkSpaces } from 'src/auth/entities';
import { ATTACHMENT_TYPE, MESSAGE_TYPE } from '../constants';
import { Conversations } from './conversations';

@Schema({ timestamps: true })
export class Faqs extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'WorkSpaces' })
  workspace: WorkSpaces | string;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'WidgetConfig' })
  widget_config: WidgetConfig | string;

  @Prop({ type: String })
  question: string;

  @Prop({ type: String })
  answer: string;
}

export const FaqSchema = SchemaFactory.createForClass(Faqs);
