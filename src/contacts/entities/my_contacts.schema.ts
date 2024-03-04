import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Users, WorkSpaces } from 'src/auth/entities';

@Schema({
  timestamps: true,
})
export class MyContact extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Users.name,
    default: null,
  })
  contact: Users;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Users.name,
  })
  ownedBy: Users;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: WorkSpaces.name,
    default: null,
  })
  workspace: WorkSpaces;
}

export const MyContactSchema = SchemaFactory.createForClass(MyContact);
