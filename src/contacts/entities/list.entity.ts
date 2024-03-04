import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class List extends Document {
  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: Array, default: [] })
  contact_ids: string[];

  @Prop({ type: String, default: null })
  workspace_id: string;
}

export const ListSchema = SchemaFactory.createForClass(List);
