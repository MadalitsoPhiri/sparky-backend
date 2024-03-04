import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class WaitingList extends Document {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  email: string;
}

export const WaitingListSchema = SchemaFactory.createForClass(WaitingList);
