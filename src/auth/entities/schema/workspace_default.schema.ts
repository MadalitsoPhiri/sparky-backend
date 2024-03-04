import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { WorkSpaces } from './workspaces.schema';

@Schema()
export class WorkSpaceDefaults extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: WorkSpaces.name })
  workspace: WorkSpaces | string | null;
}

export const WorkSpaceDefaultsSchema =
  SchemaFactory.createForClass(WorkSpaceDefaults);
