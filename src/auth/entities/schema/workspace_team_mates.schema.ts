import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Users } from './user';
import { WorkSpaces } from './workspaces.schema';

@Schema()
export class WorkSpaceTeamMates extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: WorkSpaces.name })
  workspace: WorkSpaces;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Users.name })
  user: Users;
}

export const WorkSpaceTeamMatesSchema =
  SchemaFactory.createForClass(WorkSpaceTeamMates);
