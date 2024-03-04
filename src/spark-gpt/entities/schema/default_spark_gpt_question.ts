import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class DefaultSparkGPTQuestion extends Document {
  @Prop({ type: String })
  title: string;
}

export const DefaultSparkGPTQuestionSchema = SchemaFactory.createForClass(
  DefaultSparkGPTQuestion,
);
