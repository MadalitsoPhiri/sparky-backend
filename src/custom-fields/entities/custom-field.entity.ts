import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class CustomField extends Document {
  @Prop({ type: String, default: null })
  field: string;

  @Prop({ type: String, default: null })
  type: string;

  @Prop({ type: mongoose.Types.ArraySubdocument, default: null })
  metaData: any[];

  @Prop({ type: String, default: null })
  workspace_id: string;
}
export const CustomFieldSchema = SchemaFactory.createForClass(CustomField);
