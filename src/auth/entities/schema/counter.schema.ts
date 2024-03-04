import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Counter extends Document {
  @Prop({ type: Number, default: null })
  sequence_value: number;

  @Prop({ type: String, default: null })
  collection_name: string;
}
export const CounterSchema = SchemaFactory.createForClass(Counter);
