import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ExternalLink extends Document {
  @Prop({ required: true })
  link: string;

  @Prop({ required: true })
  userId: string;
}

export const externalLinkSchema = SchemaFactory.createForClass(ExternalLink);
