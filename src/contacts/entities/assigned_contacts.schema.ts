import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AssignedContacts extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  contact: any[];
}

export const AssignedContactsSchema =
  SchemaFactory.createForClass(AssignedContacts);
