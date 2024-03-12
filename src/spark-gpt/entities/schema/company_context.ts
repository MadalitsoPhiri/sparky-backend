import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { WorkSpaces } from 'src/auth/entities';

@Schema({ timestamps: true })
export class CompanyContext extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'WorkSpaces' })
  workspace: WorkSpaces | string;

  @Prop({ type: String })
  value: string;

  @Prop({ type: String, default: () => null })
  website_url: string;

  @Prop({ type: String, default: () => null })
  google_docs_url: string;
}

export const CompanyContextSchema =
  SchemaFactory.createForClass(CompanyContext);
