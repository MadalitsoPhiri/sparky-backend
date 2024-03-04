import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class IntegrationCredential extends Document {
  @Prop({ type: 'String', default: null })
  type: string | null;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  credentials: any;

  @Prop({ type: 'String', default: null })
  workspaceId: string | null;
}

export const IntegrationCredentialSchema = SchemaFactory.createForClass(
  IntegrationCredential,
);
