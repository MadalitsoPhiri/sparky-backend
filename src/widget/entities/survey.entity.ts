import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseWidgetConfigEntity } from './base.entity';

@Schema()
class Options extends Document {
  @Prop({ type: String, default: null })
  title: string;
}

export const OptionsSchema = SchemaFactory.createForClass(Options);

@Schema()
export class Survey extends BaseWidgetConfigEntity {
  @Prop({ type: String, default: null })
  headline: string;

  @Prop({ type: String, default: null })
  description: string;

  @Prop({ type: [OptionsSchema], default: [] })
  options: Options[];

  @Prop({ type: Boolean, default: false })
  is_active: boolean;
}

export const SurveySchema = SchemaFactory.createForClass(Survey);
