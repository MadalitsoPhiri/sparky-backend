import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import {
  Integration,
  IntegrationSchema,
} from 'src/integrations/entities/integration.entity';
import { COMPANY_SIZE } from '../constants';
import { Users } from './user';

@Schema()
export class WorkSpaces extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  created_by: Users;
  @Prop({
    enum: [
      COMPANY_SIZE.XXS,
      COMPANY_SIZE.XS,
      COMPANY_SIZE.SM,
      COMPANY_SIZE.MD,
      COMPANY_SIZE.LG,
      COMPANY_SIZE.XL,
      COMPANY_SIZE.XXL,
    ],
    default: COMPANY_SIZE.XXS,
  })
  company_size: string;

  @Prop({ type: String })
  company_name: string;

  @Prop({ type: String, default: null })
  timezone: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users' })
  spark_gpt_agent: Users;

  @Prop({
    type: [IntegrationSchema],
    default: [],
  })
  integrations: Types.Array<Integration>;
}

export const WorkSpacesSchema = SchemaFactory.createForClass(WorkSpaces);
