import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Users } from 'src/auth/entities';

@Schema({ timestamps: true })
export class Tag extends Document {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String, default: null })
  user_id: string;

  @Prop({
    type: mongoose.Types.ObjectId,
    ref: Users.name,
  })
  created_by: Users;
}

export const TagsSchema = SchemaFactory.createForClass(Tag);
