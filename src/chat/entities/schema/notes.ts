import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Users } from 'src/auth/entities';

@Schema({ timestamps: true })
export class Notes extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: Users.name })
  lead: Users | string;
  @Prop({ type: String })
  note: string;
  @Prop({ type: mongoose.Types.ObjectId, ref: Users.name })
  created_by: Users;
}

export const NotesSchema = SchemaFactory.createForClass(Notes);
