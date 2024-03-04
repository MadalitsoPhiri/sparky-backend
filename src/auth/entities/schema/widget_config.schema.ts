import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { AVAILABILITY, AvailabilityDay } from '../types/availability';
import { WorkSpaces } from './workspaces.schema';

@Schema({ _id: false })
class Colors extends Document {
  @Prop({ type: 'String', default: '#602E9E' })
  header_bg_color: string;
  @Prop({ type: 'String', default: '#FFFFFF' })
  header_text_color: string;
  @Prop({ type: 'String', default: '#9f8bb8' })
  border_color: string;
  @Prop({ type: 'String', default: '#602E9E' })
  btn_color: string;
  @Prop({ type: 'String', default: '#FFFFFF' })
  btn_text_color: string;
}
@Schema({ _id: false })
class Header extends Document {
  @Prop({ type: 'String', default: 'Hi ✌️' })
  main: string;
  @Prop({
    type: 'String',
    default: 'Ask us anything, or share your feedback.',
  })
  description: string;
}

@Schema({ _id: false })
class ChatSuggestions extends Document {
  @Prop({ type: 'String', default: 'Just browsing!' })
  suggestion1: string;

  @Prop({
    type: 'String',
    default: " I'm new and want to start an application.",
  })
  suggestion2: string;

  @Prop({ type: 'String', default: 'Help me with my existing application' })
  suggestion3: string;
}
export const ChatSuggestionsSchema =
  SchemaFactory.createForClass(ChatSuggestions);

export const HeaderSchema = SchemaFactory.createForClass(Header);
@Schema({ _id: false })
class Greetings extends Document {
  @Prop({ type: HeaderSchema, default: () => ({}) })
  header: Header;
  @Prop({
    type: 'String',
    default: ' Hey hey! Welcome to our store.How can we help you today?',
  })
  chat_area_greeting_text: string;
}
export const GreetingsSchema = SchemaFactory.createForClass(Greetings);
@Schema({ _id: false })
class Images extends Document {
  @Prop({ type: String, default: null })
  brand_logo_url: string;
  @Prop({ type: 'String', default: null })
  user_image_url: string;
  @Prop({ type: 'String', default: null })
  widget_icon_url: string;
  @Prop({ type: 'String', default: null })
  action_btn_icon_url: string;
}

@Schema({
  timestamps: false,
})
class OfficeHour extends Document {
  @Prop({ enum: AvailabilityDay, default: AvailabilityDay.EVERYDAY })
  openDay: AvailabilityDay;

  @Prop({ type: String, default: null })
  openTime: string;

  @Prop({ type: String, default: null })
  closeTime: string;
}

export const OfficeHourSchema = SchemaFactory.createForClass(OfficeHour);

@Schema({ _id: false })
class Availability extends Document {
  @Prop({
    type: [OfficeHourSchema],
    default: [],
  })
  officeHours: OfficeHour[];

  @Prop({
    enum: [
      AVAILABILITY.HOURS,
      AVAILABILITY.MINUTES,
      AVAILABILITY.DAY,
      AVAILABILITY.DYNAMIC,
    ],
    default: AVAILABILITY.MINUTES,
  })
  reply_time: string;
}
export const AvailabilitySchema = SchemaFactory.createForClass(Availability);

export const ImagesSchema = SchemaFactory.createForClass(Images);

export const ColorsSchema = SchemaFactory.createForClass(Colors);
@Schema()
export class WidgetConfig extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: WorkSpaces.name,
    default: null,
  })
  workspace: WorkSpaces | string | null;
  @Prop({ type: ColorsSchema, default: () => ({}) })
  colors: Colors;
  @Prop({ type: GreetingsSchema, default: () => ({}) })
  greetings: Greetings;
  @Prop({ type: ImagesSchema, default: () => ({}) })
  images: Images;
  @Prop({ type: ChatSuggestionsSchema, default: () => ({}) })
  chat_suggestions: ChatSuggestions;
  @Prop({ type: 'String' })
  code_snippet: string;
  @Prop({ type: [String], default: [] })
  allowed_origins: string[];
  @Prop({ type: AvailabilitySchema, default: () => ({}) })
  availability: Availability;
}
export const WidgetConfigSchema = SchemaFactory.createForClass(WidgetConfig);
