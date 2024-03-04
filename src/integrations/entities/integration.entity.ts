import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Integration extends Document {
  @Prop({ type: 'String', default: null })
  name: string | null;

  @Prop({ type: 'String', default: null })
  description: string | null;

  @Prop({ type: 'String', default: null })
  logo: string | null;
}

export const IntegrationSchema = SchemaFactory.createForClass(Integration);
