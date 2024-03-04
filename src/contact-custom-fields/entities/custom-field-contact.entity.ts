import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
})
export class CustomFieldContact extends Document {
  @Prop({ type: String, default: null })
  value: string | number | Date;

  @Prop({ type: String })
  contact_id: string;

  @Prop({ type: String })
  custom_field_id: string;
}

export const CustomFieldContactSchema =
  SchemaFactory.createForClass(CustomFieldContact);
