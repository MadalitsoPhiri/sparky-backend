import { Prop, Schema } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { WidgetConfig, WorkSpaces } from 'src/auth/entities';

@Schema()
export class BaseWidgetConfigEntity extends Document {
  @Prop({ type: mongoose.Types.ObjectId, ref: WorkSpaces.name })
  workspace: WorkSpaces | string;

  @Prop({ type: mongoose.Types.ObjectId, ref: WidgetConfig.name })
  widget_config: WidgetConfig | string;
}
