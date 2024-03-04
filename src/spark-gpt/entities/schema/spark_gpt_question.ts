import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { WorkSpaces } from 'src/auth/entities';

export interface BasicSparkGPTQuestion {
  title: string;
  answer: string;
}

@Schema({ timestamps: true })
export class SparkGPTQuestion extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'WorkSpaces' })
  workspace: WorkSpaces | string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  answer: string;

  @Prop({ type: Boolean })
  is_deletable: boolean;
}

export const SparkGPTQuestionSchema =
  SchemaFactory.createForClass(SparkGPTQuestion);
